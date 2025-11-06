# Security Guidelines

## Authentication & Authorization

### Policies
All resource authorization uses Laravel Policies located in `backend/app/Policies/`.

Example usage in controllers:
```php
$this->authorize('update', $resource);
```

### Middleware
- `auth:sanctum` - Requires authentication
- `role:admin` - Requires admin role
- `role:admin,agent` - Requires admin OR agent role

### Role Hierarchy
1. admin - Full access
2. moderator - Elevated management on some resources
3. agent - Manage reports and chantiers
4. citizen - Submit reports, view own submissions

## CORS Configuration
CORS origins must be explicitly whitelisted in `.env`:
```env
CORS_ALLOWED_ORIGINS=https://app.example.com,https://app-staging.example.com
```

Never use wildcard `*` in production.

## Rate Limiting
- Reports creation: 20/min, 200/hour per IP
- API general: 60/min per user

## Encryption
Sensitive fields use column-level encryption:
- `citizen_email_enc`
- `citizen_phone_enc`
- `location_precise_enc`

Set `COLUMN_ENCRYPTION_KEY` separately from `APP_KEY`.
