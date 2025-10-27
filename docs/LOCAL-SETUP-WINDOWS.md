# Windows (native) local setup — PISE

This guide is for running the project on Windows natively without WSL or Docker, using localhost ports.

## Prerequisites
- PHP 8.2+
- Composer
- MySQL 8.0 (make sure a database named `pise` exists and is accessible with user `root` and no password by default)
- Bun (https://bun.sh)

## One-time setup
Run from the repository root in PowerShell:

```
.\scripts\windows\setup.ps1
```

What it does:
- Creates `backend/.env` and `web/.env` from their examples if missing
- Writes sane localhost values into `backend/.env`
- Generates `APP_KEY` and a random `COLUMN_ENCRYPTION_KEY` if empty
- Installs Composer dependencies if needed
- Runs database migrations and seeders, and `storage:link`

## Start services
- API (Laravel):
```
.\scripts\windows\start-backend.ps1
```
This serves the API at http://localhost:8000

- Frontend (Vite + Bun):
```
.\scripts\windows\start-frontend.ps1
```
This serves the web app at http://localhost:5173

Optional: start the queue listener in a separate window while running the API:
```
.\scripts\windows\start-backend.ps1 -WithQueue
```

## Default login (from seed)
- Email: admin@pise.local
- Password: password

## Sanctum and CORS on localhost
Use these values on localhost. The setup script writes them for you in `backend/.env` and you can use them as reference:

```
APP_URL=http://localhost:8000
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
VITE_API_URL=http://localhost:8000
```

For reference examples without modifying existing templates, see:
- `backend/.env.localhost.example`
- `web/.env.localhost.example`

## Troubleshooting on Windows
- Symlink for storage
  - If `php artisan storage:link` fails, run PowerShell as Administrator or enable Windows Developer Mode (Settings → Privacy & Security → For Developers → Developer Mode).
- MySQL connectivity
  - Ensure the MySQL service is running and listening on 127.0.0.1:3306, and that the `pise` database exists.
  - Update `DB_USERNAME`/`DB_PASSWORD` in `backend/.env` if your local credentials differ.
- Clear caches
  - If you change env or config and something seems off:
    ```
    cd backend
    php artisan config:clear
    php artisan route:clear
    ```
- Ports in use
  - If 8000 or 5173 are already taken, stop the other process or adjust the port in the start scripts and corresponding env values.

No hosts file entries are required. Always use http://localhost:8000 for the API and http://localhost:5173 for the frontend.
