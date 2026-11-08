<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Restrict route access to authenticated users matching at least one allowed role.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        foreach ($roles as $role) {
            if ($role === 'administrator' && $user->isAdministrator()) {
                return $next($request);
            }

            if ($role === 'staff' && $user->isStaff()) {
                return $next($request);
            }

            if ($role === 'citizen' && $user->isCitizen()) {
                return $next($request);
            }
        }

        Inertia::flash('toast', [
            'type' => 'error',
            'message' => 'Access denied for your current account role.',
        ]);

        return redirect()->to($user->homeRoute());
    }
}
