<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
    }

    /**
     * Configure named rate limiters used across the GeoReport workspaces.
     *
     * Each limit in a list uses a unique key prefix so the counters never collide.
     */
    protected function configureRateLimiting(): void
    {
        // Baseline guard for every web request (page visits, Inertia reloads, form posts).
        RateLimiter::for('web', function (Request $request) {
            $user = $request->user();

            return $user
                ? Limit::perMinute(240)->by('web-user:'.$user->id)
                : Limit::perMinute(300)->by('web-ip:'.$request->ip());
        });

        // Fortify endpoints that do not ship with their own limiter.
        RateLimiter::for('fortify', function (Request $request) {
            $ip = (string) $request->ip();
            $actor = (string) ($request->user()->id ?? $ip);

            return match ($request->route()?->getName()) {
                'register.store' => [
                    Limit::perMinute(5)->by('register-minute:'.$ip),
                    Limit::perHour(20)->by('register-hour:'.$ip),
                ],
                'password.email' => [
                    Limit::perMinute(3)->by('reset-link-ip:'.$ip),
                    Limit::perHour(5)->by('reset-link-email:'.Str::lower((string) $request->input('email'))),
                ],
                'password.update', 'password.confirm.store' => Limit::perMinute(6)->by('password-form:'.$actor),
                'two-factor.enable',
                'two-factor.confirm',
                'two-factor.disable',
                'two-factor.regenerate-recovery-codes' => Limit::perMinute(10)->by('two-factor-manage:'.$actor),
                default => Limit::none(),
            };
        });

        // Citizen report submissions (including photo uploads).
        RateLimiter::for('report-submissions', function (Request $request) {
            $actor = (string) ($request->user()->id ?? $request->ip());

            return [
                Limit::perMinute(5)->by('reports-minute:'.$actor),
                Limit::perHour(30)->by('reports-hour:'.$actor),
            ];
        });

        // State-changing actions inside role workspaces (status updates, notes, uploads, admin edits).
        RateLimiter::for('workspace-actions', function (Request $request) {
            if ($request->isMethodSafe()) {
                return Limit::none();
            }

            $user = $request->user();
            $actor = (string) ($user->id ?? $request->ip());

            return $user !== null && $user->isAdministrator()
                ? Limit::perMinute(90)->by('actions:'.$actor)
                : Limit::perMinute(30)->by('actions:'.$actor);
        });

        // Public Loon barangay GeoJSON dataset (browser-cached for a day).
        RateLimiter::for('geojson', function (Request $request) {
            return Limit::perMinute(60)->by('geojson:'.$request->ip());
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
