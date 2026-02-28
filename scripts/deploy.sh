#!/usr/bin/env bash
# =============================================================================
# PISE — Script de déploiement Linux/VPS
# Usage : bash scripts/deploy.sh [--skip-build] [--skip-migrate]
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
WEB_DIR="$ROOT_DIR/web"

GREEN="\033[0;32m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; NC="\033[0m"
info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

SKIP_BUILD=false
SKIP_MIGRATE=false
for arg in "$@"; do
  case $arg in
    --skip-build)   SKIP_BUILD=true ;;
    --skip-migrate) SKIP_MIGRATE=true ;;
  esac
done

# ─── Pré-requis ────────────────────────────────────────────────────────────
info "Vérification des pré-requis..."
command -v php    >/dev/null 2>&1 || error "PHP introuvable"
command -v composer >/dev/null 2>&1 || error "Composer introuvable"
command -v node   >/dev/null 2>&1 || error "Node.js introuvable"
command -v npm    >/dev/null 2>&1 || error "npm introuvable"
PHP_VER=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
if [[ $(echo "$PHP_VER < 8.2" | bc 2>/dev/null) == "1" ]]; then
  error "PHP >= 8.2 requis (actuel: $PHP_VER)"
fi
info "PHP $PHP_VER — OK"

# ─── Backend .env ──────────────────────────────────────────────────────────
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  if [[ -f "$BACKEND_DIR/.env.production.example" ]]; then
    warn ".env backend manquant — copie depuis .env.production.example"
    cp "$BACKEND_DIR/.env.production.example" "$BACKEND_DIR/.env"
    warn "IMPORTANT: Éditez $BACKEND_DIR/.env avant de continuer !"
    error "Interrompu — configurez le .env et relancez le script"
  else
    error ".env backend introuvable. Créez $BACKEND_DIR/.env"
  fi
fi

# ─── Vérifications .env ────────────────────────────────────────────────────
check_env_var() {
  local val; val=$(grep -Po "(?<=^$1=).*" "$BACKEND_DIR/.env" 2>/dev/null || true)
  [[ -z "$val" ]] && error ".env: $1 est vide — requis en production"
}
check_env_var "APP_KEY"
check_env_var "DB_PASSWORD"
check_env_var "COLUMN_ENCRYPTION_KEY"

APP_DEBUG=$(grep -Po "(?<=^APP_DEBUG=).*" "$BACKEND_DIR/.env" 2>/dev/null || echo "")
[[ "$APP_DEBUG" == "true" ]] && warn "APP_DEBUG=true en production — risque de sécurité!"

# ─── Backend — dépendances ─────────────────────────────────────────────────
info "Installation des dépendances PHP (no-dev)..."
composer install --no-dev --optimize-autoloader --no-interaction --working-dir="$BACKEND_DIR"

# ─── Backend — migrations ──────────────────────────────────────────────────
if [[ "$SKIP_MIGRATE" == false ]]; then
  info "Migration base de données..."
  php "$BACKEND_DIR/artisan" migrate --force
fi

# ─── Backend — storage symlink ─────────────────────────────────────────────
info "Lien symbolique storage:link..."
php "$BACKEND_DIR/artisan" storage:link 2>/dev/null || warn "storage:link déjà existant"

# ─── Backend — dossiers storage ────────────────────────────────────────────
mkdir -p "$BACKEND_DIR/storage/framework/"{views,cache/data,sessions}
mkdir -p "$BACKEND_DIR/storage/logs"
chmod -R 775 "$BACKEND_DIR/storage" "$BACKEND_DIR/bootstrap/cache" 2>/dev/null || true

# ─── Backend — caches production ───────────────────────────────────────────
info "Génération des caches Laravel..."
php "$BACKEND_DIR/artisan" config:cache
php "$BACKEND_DIR/artisan" route:cache
php "$BACKEND_DIR/artisan" view:cache
php "$BACKEND_DIR/artisan" event:cache

# ─── Frontend — build ─────────────────────────────────────────────────────
if [[ "$SKIP_BUILD" == false ]]; then
  if [[ ! -f "$WEB_DIR/.env" ]]; then
    if [[ -f "$WEB_DIR/.env.production.example" ]]; then
      warn ".env frontend manquant — copie depuis .env.production.example"
      cp "$WEB_DIR/.env.production.example" "$WEB_DIR/.env"
      warn "Vérifiez VITE_API_URL dans $WEB_DIR/.env"
    fi
  fi
  info "Installation dépendances frontend..."
  npm ci --prefix "$WEB_DIR"
  info "Build production frontend..."
  npm run build --prefix "$WEB_DIR"
  info "Build terminé → $WEB_DIR/dist/"
fi

# ─── Résumé ────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Déploiement terminé !${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "  Backend  → Servez le répertoire : $BACKEND_DIR/public"
echo "  Frontend → Servez le répertoire : $WEB_DIR/dist"
echo ""
echo "  Configuration Apache / Nginx:"
echo "    • Backend  : document root = backend/public/"
echo "    • Frontend : document root = web/dist/ + règle rewrite → index.html"
echo ""
echo "  Post-déploiement:"
echo "    • Vérifiez les permissions : storage/ bootstrap/cache/ (775)"
echo "    • Redémarrez PHP-FPM si nécessaire"
echo "    • Testez : curl https://api.paperlabbj.com/api/health"
