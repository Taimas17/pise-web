# ADR 001 — Structure monorepo PISE

Décision: un monorepo unique contient deux apps: `/backend` (API Laravel 11, PHP 8.2+) et `/web` (PWA React + TypeScript). Les documents sont sous `/docs`.

Motivation: simplifier le démarrage local, centraliser CI/CD, partager des conventions et des variables d’environnement.

Conséquences: versions couplées, commits atomiques, PRs couvrant les deux couches possible.
