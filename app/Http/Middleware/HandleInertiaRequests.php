<?php

namespace App\Http\Middleware;

use App\Models\Barangay;
use App\Models\Category;
use App\Support\GeoCatalog;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'taxonomy' => fn () => $this->loadTaxonomy(),
        ];
    }

    /**
     * Load shared categories and barangays from the database, auto-seeding baseline Loon records if empty.
     *
     * @return array{categories: list<array<string, mixed>>, barangays: list<array<string, mixed>>}
     */
    protected function loadTaxonomy(): array
    {
        try {
            GeoCatalog::ensureSeeded();

            $categories = array_values(
                Category::orderBy('name')
                    ->get(['id', 'name', 'slug', 'color', 'is_active'])
                    ->map(fn (Category $c) => [
                        'id' => $c->id,
                        'name' => $c->name,
                        'slug' => $c->slug,
                        'color' => $c->color,
                        'isActive' => (bool) $c->is_active,
                    ])
                    ->all(),
            );

            $barangays = array_values(
                Barangay::orderBy('name')
                    ->get(['id', 'name', 'district'])
                    ->map(fn (Barangay $b) => [
                        'id' => $b->id,
                        'name' => $b->name,
                        'district' => $b->district,
                    ])
                    ->all(),
            );

            return [
                'categories' => $categories,
                'barangays' => $barangays,
            ];
        } catch (\Throwable) {
            return [
                'categories' => [],
                'barangays' => [],
            ];
        }
    }
}
