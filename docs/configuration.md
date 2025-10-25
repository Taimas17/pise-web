# Configuration (.env)

Racine
- API_URL: URL de l’API (ex: http://api.pise.local)
- APP_URL: URL de l’app PWA (ex: http://app.pise.local)

Backend (`/backend/.env`)
- APP_URL=http://api.pise.local
- APP_LOCALE=fr, APP_FALLBACK_LOCALE=fr
- SESSION_DOMAIN=.pise.local
- SANCTUM_STATEFUL_DOMAINS=app.pise.local
- DB_* (MySQL 8.0)
- FILESYSTEM_DISK=public
- REPORT_MAX_PHOTOS=5
- REPORT_MAX_PHOTO_MB=5
- REPORTS_RATE_LIMIT_PER_MIN=20
- REPORTS_RATE_LIMIT_PER_HOUR=200
- COLUMN_ENCRYPTION_KEY=base64:… (clé AES 256)
- KOBO_BASE_URL, KOBO_TOKEN, KOBO_FORM_IDS
- ATTACHMENTS_MAX_MB (optionnel, défaut 10) — taille max d’upload des pièces jointes
- ATTACHMENTS_ALLOWED_MIME (optionnel) — liste CSV des types MIME permis
- ATTACHMENTS_CATEGORIES=contrat,OS,PV_reception,photo,autre

Frontend (`/web/.env`)
- VITE_API_URL=http://api.pise.local
