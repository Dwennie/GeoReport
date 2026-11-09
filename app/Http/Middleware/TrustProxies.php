<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;

class TrustProxies extends Middleware
{
    /**
     * Trust reverse proxies configured via TRUSTED_PROXIES (e.g. "*" behind Caddy or a PaaS router).
     *
     * Leaving it empty trusts no proxy, so X-Forwarded-For cannot be spoofed to dodge rate limits.
     *
     * @return array<int, string>|string|null
     */
    protected function proxies()
    {
        $configured = config('app.trusted_proxies');

        if (! is_string($configured) || trim($configured) === '') {
            return parent::proxies();
        }

        if (trim($configured) === '*') {
            return '*';
        }

        return array_values(array_filter(array_map('trim', explode(',', $configured))));
    }
}
