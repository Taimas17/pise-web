# Guide de déploiement — PISE

## Architecture de production (monodomaine)

```
Internet
  │
  └── paperlabbj.com
        │
        ├── /          →  Nginx → web/dist/                (React SPA)
        ├── /api/*     →  Nginx → backend/public/index.php (Laravel API)
        ├── /sanctum/* →  Nginx → backend/public/index.php (CSRF Sanctum)
        └── /storage/* →  Nginx → backend/storage/app/public/
                                          │
                                     PHP 8.2-FPM
                                          │
                                       MySQL 8+
```

> **Avantage monodomaine :** frontend et backend partagent la même origine
> → zéro problème CORS, gestion des cookies session simplifiée.

---

## Prérequis serveur

| Composant    | Version minimale |
|--------------|-----------------|
| PHP          | 8.2             |
| Composer     | 2.x             |
| MySQL        | 8.0             |
| Node.js      | 20 LTS          |
| Nginx        | 1.18+           |
| Certbot      | (Let's Encrypt) |

Extensions PHP requises : `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `gd` ou `imagick`, `zip`, `bcmath`

---

## Déploiement rapide (Linux/VPS)

### 1. Cloner le dépôt

```bash
git clone https://github.com/Taimas17/pise-web.git /var/www/pise-web
cd /var/www/pise-web
```

### 2. Configurer les variables d'environnement

**Backend :**
```bash
cp backend/.env.production.example backend/.env
nano backend/.env
```

Variables **obligatoires** à renseigner (les 3 clés à générer) :

```bash
# 1. Clé d'application Laravel
php artisan key:generate --show
# → coller la valeur dans APP_KEY=

# 2. Clé de chiffrement des colonnes
php -r "echo 'base64:'.base64_encode(random_bytes(32));"
# → coller dans COLUMN_ENCRYPTION_KEY=

# 3. Mot de passe base de données
# → choisir un mot de passe fort (≥ 16 caractères) pour DB_PASSWORD=
```

Variables **pré-configurées** pour `paperlabbj.com` (vérifier si correct) :
- `APP_URL=https://paperlabbj.com`
- `SESSION_DOMAIN=paperlabbj.com`
- `SANCTUM_STATEFUL_DOMAINS=paperlabbj.com`
- `CORS_ALLOWED_ORIGINS=https://paperlabbj.com`

**Frontend :**
```bash
cp web/.env.production.example web/.env
# VITE_API_URL=https://paperlabbj.com  ← déjà configuré
```

### 3. Déployer en une commande

```bash
chmod +x scripts/deploy.sh
bash scripts/deploy.sh
```

Le script effectue automatiquement :
- ✅ Vérification des pré-requis
- ✅ Validation des variables critiques (APP_KEY, DB_PASSWORD, COLUMN_ENCRYPTION_KEY)
- ✅ `composer install --no-dev --optimize-autoloader`
- ✅ `php artisan migrate --force`
- ✅ `php artisan storage:link`
- ✅ Caches Laravel (config, routes, vues, events)
- ✅ `npm ci && npm run build`

### 4. Configurer Nginx

```bash
# Copier la config (domaine déjà configuré : paperlabbj.com)
cp scripts/nginx.conf.example /etc/nginx/sites-available/pise

ln -s /etc/nginx/sites-available/pise /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 5. Certificat TLS (Let's Encrypt)

```bash
# Un seul certificat pour le domaine racine
certbot --nginx -d paperlabbj.com
```

### 6. Permissions fichiers

```bash
chown -R www-data:www-data /var/www/pise-web/backend/storage
chown -R www-data:www-data /var/www/pise-web/backend/bootstrap/cache
chmod -R 775 /var/www/pise-web/backend/storage
chmod -R 775 /var/www/pise-web/backend/bootstrap/cache
```

---

## MySQL — Création base de données

```sql
CREATE DATABASE pise_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pise_user'@'localhost' IDENTIFIED BY 'MOT_DE_PASSE_FORT';
GRANT ALL PRIVILEGES ON pise_prod.* TO 'pise_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Checklist sécurité avant mise en production

- [ ] `APP_DEBUG=false` dans backend `.env`
- [ ] `APP_ENV=production` dans backend `.env`
- [ ] `APP_KEY` non vide (généré)
- [ ] `COLUMN_ENCRYPTION_KEY` non vide (généré)
- [ ] `DB_PASSWORD` fort (≥ 16 caractères aléatoires)
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `SESSION_DOMAIN=paperlabbj.com`
- [ ] `CORS_ALLOWED_ORIGINS=https://paperlabbj.com`
- [ ] HTTPS activé sur `paperlabbj.com` (certbot)
- [ ] `LOG_LEVEL=error` (pas `debug`)
- [ ] `.env` non accessible (Nginx bloque `/\.env`)
- [ ] `storage/` accessible en écriture pour `www-data`
- [ ] MySQL : utilisateur `pise_user` dédié (pas `root`)

---

## Commandes de maintenance

```bash
# Vider tous les caches
php artisan optimize:clear

# Reconstruire les caches après modification de config
php artisan optimize

# Nouvelle migration
php artisan migrate

# Voir les logs
tail -f backend/storage/logs/laravel.log

# Test de santé API
curl https://paperlabbj.com/api/health
# Réponse attendue: {"status":"ok","timestamp":"...","environment":"production"}
```

---

## Mise à jour (déploiement continu)

```bash
cd /var/www/pise-web
git pull origin main
bash scripts/deploy.sh --skip-migrate   # Sans migration
# OU
bash scripts/deploy.sh                  # Avec migration
```

---

## Dépannage fréquent

| Problème | Solution |
|----------|----------|
| 403 sur `/storage/` | Vérifier l'alias Nginx et `php artisan storage:link` |
| 500 sur `/api/*` | Vérifier `storage/logs/laravel.log` |
| Cookie session non envoyé | Vérifier `SESSION_DOMAIN=paperlabbj.com` et `SESSION_SECURE_COOKIE=true` |
| Page blanche React | Vérifier `VITE_API_URL` dans `web/.env` avant build |
| Refresh page → 404 | Vérifier la règle `try_files $uri $uri/ /index.html` dans Nginx |
| Upload photo échoue | Vérifier `client_max_body_size 25M` dans Nginx et permissions `storage/` |
