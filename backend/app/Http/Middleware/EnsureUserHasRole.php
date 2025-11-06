<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            abort(401, 'Unauthenticated');
        }

        if (!in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden - Insufficient permissions');
        }

        return $next($request);
    }
}
