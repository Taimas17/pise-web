<?php

return [
    'review_hours' => [
        'faible' => env('SLA_REVIEW_HOURS_FAIBLE', 24),
        'moyenne' => env('SLA_REVIEW_HOURS_MOYENNE', 12),
        'haute' => env('SLA_REVIEW_HOURS_HAUTE', 4),
    ],
    'assign_hours' => [
        'faible' => env('SLA_ASSIGN_HOURS_FAIBLE', 48),
        'moyenne' => env('SLA_ASSIGN_HOURS_MOYENNE', 24),
        'haute' => env('SLA_ASSIGN_HOURS_HAUTE', 8),
    ],
    'resolve_hours' => [
        'faible' => env('SLA_RESOLVE_HOURS_FAIBLE', 168),
        'moyenne' => env('SLA_RESOLVE_HOURS_MOYENNE', 72),
        'haute' => env('SLA_RESOLVE_HOURS_HAUTE', 24),
    ],
];
