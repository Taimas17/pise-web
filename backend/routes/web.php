<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Provide a named 'login' route to avoid RouteNotFoundException when
// authentication middleware attempts to redirect unauthenticated requests.
Route::get('/login', function () {
    // Minimal login route used only to satisfy redirects from the
    // authentication middleware. Return a 401 JSON payload so API
    // clients (and the redirect flow) receive a safe response.
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');
