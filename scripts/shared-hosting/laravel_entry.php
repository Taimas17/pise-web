<?php
/**
 * PISE — Point d'entrée Laravel pour hébergement mutualisé
 *
 * Ce fichier est placé dans public_html/ et est appelé par .htaccess
 * pour toutes les requêtes /api/* et /sanctum/*
 *
 * Structure attendue :
 *   ~/pise-web/backend/   ← Laravel (hors public_html)
 *   ~/public_html/        ← Ce fichier + React SPA
 *
 * Le chemin est calculé automatiquement à partir de __DIR__ :
 *   __DIR__/../../../pise-web/backend
 *   = /home/USER/domains/paperlabbj.com/public_html/../../../pise-web/backend
 *   = /home/USER/pise-web/backend
 */

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Chemin vers l'installation Laravel (3 niveaux au-dessus de public_html)
$basePath = dirname(__DIR__, 3) . '/pise-web/backend';

// Mode maintenance
if (file_exists($maintenance = $basePath . '/storage/framework/down')) {
    require $maintenance;
}

require $basePath . '/vendor/autoload.php';

(require_once $basePath . '/bootstrap/app.php')
    ->handleRequest(Request::capture());
