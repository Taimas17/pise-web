# Mapping Kobo (Draft)

Objectif: préparer l’import (pull) de soumissions KoboToolbox vers `reports`.

Paramètres `.env`:
- `KOBO_BASE_URL` — URL instance Kobo
- `KOBO_TOKEN` — token API
- `KOBO_FORM_IDS` — liste d’IDs de formulaires séparés par des virgules

Étapes:
1. Récupérer les soumissions via l’API Kobo
2. Mapper champs: type d’infrastructure, description, photos, coordonnées
3. Créer `Report` avec `status=pending_review` et `ReportPhoto`
4. Gérer idempotence (external_id) — à ajouter lors de l’implémentation

Remarque: la logique est en stubs (`KoboSyncService`, `ImportKoboSubmissions` et commande `kobo:sync`).
