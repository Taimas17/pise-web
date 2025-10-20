# Plan de sauvegardes (MVP local)

- Base de données MySQL: dump quotidien (`mysqldump`) avec rétention 7/14/30 jours (à confirmer)
- Médias: archive compressée de `/backend/storage/app/public` quotidienne
- Stockage hors dépôt, chiffré (clé KMS/coffre à définir ultérieurement)

Tâches CRON (exemple):
- 02:00 — dump DB (avec timestamp)
- 02:15 — archive médias
- 02:30 — purge des sauvegardes anciennes selon la rétention
