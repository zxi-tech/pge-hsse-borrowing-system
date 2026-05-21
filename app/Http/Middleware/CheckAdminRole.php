<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var \App\Models\User|null $user */
        $user = $request->user();

        if ($user && $user->role !== 'admin') {

            return redirect()->route('borrow.create')->with('error', 'Akses ditolak. Anda tidak memiliki hak akses Admin HSSE.');
        }

        return $next($request);
    }
}
