# Guide de déploiement — PISE

## Architecture de production

```
Internet
  │
  ├── app.votredomaine.com   →  Nginx → web/dist/         (React SPA)
  └── api.votredomaine.com   →  Nginx → backend/public/   (Laravel API)
                                          │
                                     PHP 8.2-FPM
                                          │
                                       MySQL 8+
```

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
git clone https://github.com/VOTRE_COMPTE/pise-web.git /var/www/pise-web
cd /var/www/pise-web
```

### 2. Configurer les variables d'environnement

**Backend :**
```bash
cp backend/.env.production.example backend/.env
# Éditez avec vos vraies valeurs :
nano backend/.env
```

Variables **obligatoires** à modifier :
- `APP_KEY` — générer : `php artisan key:generate --show`
- `DB_PASSWORD` — mot de passe MySQL fort
- `COLUMN_ENCRYPTION_KEY` — générer : `php -r "echo 'base64:'.base64_encode(random_bytes(32));"`
- `APP_URL` — `https://api.votredomaine.com`
- `SESSION_DOMAIN` — `.votredomaine.com`
- `SANCTUM_STATEFUL_DOMAINS` — `app.votredomaine.com`
- `CORS_ALLOWED_ORIGINS` — `https://app.votredomaine.com`

**Frontend :**
```bash
cp web/.env.production.example web/.env
# Éditez VITE_API_URL :
nano web/.env
# VITE_API_URL=https://api.votredomaine.com
```

### 3. Déployer

```bash
chmod +x scripts/deploy.sh
bash scripts/deploy.sh
```

Le script effectue automatiquement :
- ✅ Vérification des pré-requis
- ✅ Validation des variables d'environnement critiques
- ✅ `composer install --no-dev --optimize-autoloader`
- ✅ `php artisan migrate --force`
- ✅ `php artisan storage:link`
- ✅ Caches Laravel (config, routes, vues, events)
- ✅ `npm ci && npm run build`

### 4. Configurer Nginx

```bash
# Copiez l'exemple et adaptez votre domaine
cp scripts/nginx.conf.example /etc/nginx/sites-available/pise
# Remplacez "votredomaine.com" dans le fichier
sed -i 's/votredomaine.com/VOTRE_DOMAINE/g' /etc/nginx/sites-available/pise

ln -s /etc/nginx/sites-available/pise /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 5. Certificats TLS (Let's Encrypt)

```bash
certbot --nginx -d app.votredomaine.com -d api.votredomaine.com
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
- [ ] `SESSION_DOMAIN` configuré sur votre domaine
- [ ] `CORS_ALLOWED_ORIGINS` restreint à votre frontend uniquement
- [ ] HTTPS activé sur les deux sous-domaines
- [ ] `LOG_LEVEL=error` (pas `debug`)
- [ ] Fichier `.env` non accessible publiquement (Nginx : `location ~ /\.env { deny all; }`)
- [ ] `storage/` protégé en écriture pour le webuser uniquement
- [ ] Pas de `vendor/` exposé publiquement
- [ ] MySQL : utilisateur dédié (pas `root`)

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

# Test de santé
curl https://api.votredomaine.com/api/health
# Réponse attendue: {"status":"ok","timestamp":"...","environment":"production"}
```

---

## Mise à jour (déploiement continu)

```bash
cd /var/www/pise-web
git pull origin main
bash scripts/deploy.sh --skip-migrate   # Si pas de nouvelle migration
# OU
bash scripts/deploy.sh                  # Avec migration
```

---

## Dépannage fréquent

| Problème | Solution |
|----------|----------|
| 403 sur `/storage/` | `php artisan storage:link` |
| 500 sur toutes les pages | Vérifier `storage/logs/laravel.log` |
| CORS bloqué | Vérifier `CORS_ALLOWED_ORIGINS` et `SANCTUM_STATEFUL_DOMAINS` |
| Cookie session perdu | Vérifier `SESSION_DOMAIN` et `SESSION_SECURE_COOKIE` |
| Page blanche React | Vérifier `VITE_API_URL` dans `web/.env` avant build |
| Refresh page → 404 | Vérifier la règle `try_files` Nginx ou `.htaccess` Apache |
