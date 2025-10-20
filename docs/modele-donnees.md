# Modèle de données (MVP)

Entités principales:
- User: `role` (admin, moderator, agent, citizen), `phone_enc` (chiffré), email/password.
- InfrastructureType: types de structures suivies.
- Zone: hiérarchie commune/arrondissement/quartier.
- Report: signalement avec `status`, `criticality`, `location` (POINT SRID 4326, masqué si non public), `location_precise_enc` (chiffré), PII chiffrées.
- ReportPhoto: chemins stockage local + thumbnail.
- StatusHistory: audit trail.
- Assignment: assignations aux agents.
- Attachment: pièces générales.
- FeatureFlag: activation/désactivation de modules.
