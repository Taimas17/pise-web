# PISE — Pilote (Monorepo)

Monorepo pour le pilote PISE (inclusion sociale et économique)

- backend/ — API Laravel 11 (PHP ≥ 8.2)
- web/ — PWA React (Vite + TypeScript)
- docs/ — OpenAPI, ADRs, schéma de données, etc.

## Windows (native) quickstart

For a localhost setup on Windows without WSL or Docker, see `docs/LOCAL-SETUP-WINDOWS.md`.

## Démarrage local (résumé)

1) Backend (API)
- Copier `backend/.env.example` vers `backend/.env`
- Générer la clé: `php artisan key:generate`
- Installer: `composer install`
- Migrer/seeder: `php artisan migrate --seed`
- Lier le stockage: `php artisan storage:link`
- Lancer: `php artisan serve --host=localhost --port=8000`

2) Frontend (PWA)
- Copier `web/.env.example` vers `web/.env` et ajuster `VITE_API_URL`
- Installer: `bun install` (ou `npm i`)
- Lancer: `bun dev` (ou `npm run dev`) et ouvrir `http://localhost:5173`

Notes:
- Sanctum (SPA) utilise les cookies: configurer correctement les domaines et CORS selon l'environnement
- Stockage médias: local `/storage/app/public` exposé via `storage:link`
- RGPD: colonnes PII chiffrées (email/téléphone), latitude/longitude précises chiffrées, position publique masquée par arrondi si non-public

## Configuration

### Backend (.env)

Variables critiques pour l'authentification et les cookies:

- `CORS_ALLOWED_ORIGINS`: Origines autorisées séparées par virgule
  - Localhost: `http://localhost:5173` (ajouter d'autres UIs locales si besoin)
  - Production: `https://app.pise.example.com`

- `SANCTUM_STATEFUL_DOMAINS`: Domaines pour sessions stateful
  - Localhost: `localhost:5173`
  - Production: `app.pise.example.com`

- `SESSION_DOMAIN`: Domaine du cookie de session
  - Localhost: `localhost`
  - Production: `.pise.example.com`

- `APP_URL`: URL publique de l'API
  - Localhost: `http://localhost:8000`
  - Production: `https://api.pise.example.com`

### Frontend (.env)

- `VITE_API_URL`: URL du backend API
  - Localhost: `http://localhost:8000`
  - Production: `https://api.pise.example.com`

- `VITE_APP_TITLE` (optionnel): Titre de l'application, ex: `PISE`
- `VITE_ENV`: `local` | `staging` | `production`

### Vérification de la configuration

Pour tester si l'authentification fonctionne :

1. Démarrer le backend : `cd backend && php artisan serve`
2. Démarrer le frontend : `cd web && bun dev`
3. Ouvrir http://localhost:5173
4. Aller sur /compte et essayer de se connecter avec `admin@pise.local` / `password` (ou un compte existant)

## Exports
- PDF: GET `/api/exports/reports.pdf`
- Excel: GET `/api/exports/reports.xlsx`

## OpenAPI
- Voir `docs/openapi.yaml`

## Rôles & autorisations
- Voir `docs/roles-permissions.md` (Policies Laravel appliquées aux endpoints)

## Intégrations
- KoboToolbox: stubs (`KoboSyncService`, job `ImportKoboSubmissions`, commande `kobo:sync`) — renseigner `.env`

## Feature flags
- Table `feature_flags` pour activer/désactiver des modules
