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
- Renseigner DB MySQL 8.0 et domaines locaux: `APP_URL=http://api.pise.local`, `SESSION_DOMAIN=.pise.local`, `SANCTUM_STATEFUL_DOMAINS=app.pise.local`
- Générer la clé: `php artisan key:generate`
- Installer: `composer install`
- Migrer/seeder: `php artisan migrate --seed`
- Lier le stockage: `php artisan storage:link`
- Lancer: `php artisan serve --host=api.pise.local --port=8000` (ou via votre serveur local)

2) Frontend (PWA)
- Copier `web/.env.example` vers `web/.env` et ajuster `VITE_API_URL`
- Installer: `bun install` (ou `npm i`)
- Lancer: `bun dev` (ou `npm run dev`) et ouvrir `http://app.pise.local:5173`

Notes:
- Sanctum (SPA) utilise les cookies: configurer les domaines `app.pise.local` (frontend) et `api.pise.local` (backend)
- Stockage médias: local `/storage/app/public` exposé via `storage:link`
- RGPD: colonnes PII chiffrées (email/téléphone), latitude/longitude précises chiffrées, position publique masquée par arrondi si non-public

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
