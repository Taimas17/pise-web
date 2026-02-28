#!/usr/bin/env bash
# =============================================================================
# PISE — Déploiement hébergement mutualisé (Hostinger / cPanel)
# Usage : bash ~/pise-web/scripts/deploy-shared-hosting.sh
#
# Structure attendue sur le serveur :
#   ~/pise-web/                          ← ce repo (git clone ici)
#   ~/domains/paperlabbj.com/public_html/ ← web accessible (paperlabbj.com)
# =============================================================================
set -euo pipefail

REPO_DIR="$HOME/pise-web"
BACKEND_DIR="$REPO_DIR/backend"
WEB_DIST="$REPO_DIR/web/dist"
PUBLIC_HTML="$HOME/domains/paperlabbj.com/public_html"

GREEN="\033[0;32m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; NC="\033[0m"
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

[[ -d "$REPO_DIR" ]]   || error "Repo introuvable : $REPO_DIR  → git clone d'abord"
[[ -d "$PUBLIC_HTML" ]] || error "public_html introuvable : $PUBLIC_HTML"

# ── 1. Dépendances PHP ───────────────────────────────────────────────────────
info "Installation des dépendances PHP (composer)..."
composer install --no-dev --optimize-autoloader --no-interaction \
  --working-dir="$BACKEND_DIR"

# ── 2. Configuration .env backend ───────────────────────────────────────────
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  cp "$BACKEND_DIR/.env.production.example" "$BACKEND_DIR/.env"
  echo ""
  warn "FICHIER .env CRÉÉ — vous devez renseigner les valeurs manquantes :"
  warn "  APP_KEY            → php artisan key:generate --show"
  warn "  DB_PASSWORD        → mot de passe fort"
  warn "  COLUMN_ENCRYPTION_KEY → php -r \"echo 'base64:'.base64_encode(random_bytes(32));\""
  warn ""
  warn "Éditez le fichier : nano $BACKEND_DIR/.env"
  warn "Puis relancez ce script."
  exit 1
fi

# Vérifier les variables critiques
check_env() {
  local val; val=$(grep -Po "(?<=^$1=).*" "$BACKEND_DIR/.env" 2>/dev/null || true)
  [[ -z "$val" ]] && error "$BACKEND_DIR/.env : $1 est vide — requis en production"
}
check_env "APP_KEY"
check_env "DB_PASSWORD"
check_env "COLUMN_ENCRYPTION_KEY"

# ── 3. Migrations base de données ───────────────────────────────────────────
info "Migration base de données..."
php "$BACKEND_DIR/artisan" migrate --force

# ── 4. Dossiers storage & caches Laravel ────────────────────────────────────
info "Création des dossiers storage..."
mkdir -p "$BACKEND_DIR/storage/framework/"{views,cache/data,sessions}
mkdir -p "$BACKEND_DIR/storage/logs"
chmod -R 775 "$BACKEND_DIR/storage" "$BACKEND_DIR/bootstrap/cache" 2>/dev/null || true

info "Génération des caches Laravel..."
php "$BACKEND_DIR/artisan" optimize

# ── 5. Déploiement du frontend (React SPA) ──────────────────────────────────
[[ -d "$WEB_DIST" ]] || error "web/dist/ introuvable. Buildez le frontend et committez web/dist/."

info "Copie du frontend vers public_html..."
# Sync le contenu de dist/ dans public_html/ (sans supprimer laravel_entry.php etc.)
rsync -a "$WEB_DIST/" "$PUBLIC_HTML/"

# ── 6. Point d'entrée Laravel dans public_html ──────────────────────────────
info "Installation de laravel_entry.php et .htaccess..."
cp "$REPO_DIR/scripts/shared-hosting/laravel_entry.php" "$PUBLIC_HTML/laravel_entry.php"
cp "$REPO_DIR/scripts/shared-hosting/.htaccess"          "$PUBLIC_HTML/.htaccess"

# ── 7. Symlink storage (fichiers uploadés accessibles via /storage/) ─────────
info "Lien symbolique /storage/ → backend/storage/app/public/..."
STORAGE_TARGET="$BACKEND_DIR/storage/app/public"
STORAGE_LINK="$PUBLIC_HTML/storage"
mkdir -p "$STORAGE_TARGET"
# Supprimer l'ancien lien s'il existe
[[ -L "$STORAGE_LINK" ]] && rm "$STORAGE_LINK"
[[ -d "$STORAGE_LINK" ]] && warn "/storage/ existe déjà en dossier, vérifiez manuellement"
ln -sfn "$STORAGE_TARGET" "$STORAGE_LINK" && info "Lien storage créé"

# ── Résumé ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Déploiement terminé !${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "  Site   : https://paperlabbj.com"
echo "  API    : https://paperlabbj.com/api/health"
echo "  Logs   : tail -f $BACKEND_DIR/storage/logs/laravel.log"
echo ""
echo "  Si le site affiche une erreur 500 :"
echo "    → Vérifiez $BACKEND_DIR/.env (APP_KEY, DB_PASSWORD)"
echo "    → tail -f $BACKEND_DIR/storage/logs/laravel.log"
