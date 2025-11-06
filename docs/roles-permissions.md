# Rôles et autorisations (MVP)

Rôles: admin, moderator, agent, citizen

Rapports (Report)
- Créer: public (non authentifié ou authentifié)
- Lister (viewAny):
  - admin/moderator/agent: tous
  - citizen: uniquement ses propres rapports (filtrage côté API)
- Voir (view):
  - admin/moderator/agent: tous
  - citizen: si `reported_by_user_id == user.id`
- Mettre à jour (update): admin, moderator, agent
- Review (approve/reject): admin, moderator
- Assigner (assign): admin, moderator
- Stats (stats): admin, moderator, agent
- Exports (export): admin, moderator, agent

Types d’infrastructure (InfrastructureType)
- Lister/Voir: tous les utilisateurs authentifiés
- Créer/Modifier/Supprimer: moderator, admin

Zones (Zone)
- Lister/Voir: tous les utilisateurs authentifiés
- Créer/Modifier/Supprimer/Import GeoJSON: admin

Notes
- Les PII (email, téléphone) et coordonnées précises sont chiffrées et non exposées dans les payloads.
- Les endpoints sensibles utilisent des Policies Laravel et le middleware `can:` pour une protection fine.

Utilisateurs (User)
- Lister (viewAny): admin
- Voir (view): soi-même ou admin
- Créer (create): admin
- Modifier (update): soi-même (sauf champ `role`) ou admin
- Supprimer (delete): admin (sauf soi-même)

