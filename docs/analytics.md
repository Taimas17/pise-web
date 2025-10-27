# Analytics & SLA

Ce document décrit les métriques calculées et la signification des SLA exposés par l'API.

Métriques principales
- Totaux: created, in_progress, resolved, rejected, backlog.
- Résolution: avg_hours, median_hours, p90_hours (soumis → résolu).
- Temps moyens: time_to_first_review_hours_avg, time_to_assignment_hours_avg.
- Backlog aging: lt_24h, d1_3, d3_7, gt_7d.

SLA
- review_hours: délai cible entre submitted_at et reviewed_at.
- assign_hours: délai cible entre reviewed_at (ou submitted_at) et assigned_at.
- resolve_hours: délai cible entre submitted_at et resolved_at.

Conformité
- on_time_pct: pourcentage des éléments respectant la cible.
- breaches: nombre de dépassements.
- avg_lateness_hours: moyenne du retard pour les éléments en dépassement.

Regroupements
- Breakdown par type, zone, agent.
- Trends par intervalle daily/weekly/monthly avec séries created, resolved, backlog et taux de conformité à la résolution.

Filtres
- from, to, zone_id, type_id, agent_id, criticality, status.

Cache
- Toutes les réponses d'analytics/SLA sont mises en cache 5 minutes et invalidées lors de la création/mise à jour d'un Report.
