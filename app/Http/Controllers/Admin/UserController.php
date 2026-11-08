<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\GeoCatalog;
use App\Support\GeoTransformer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(): Response
    {
        GeoCatalog::ensureSeeded();

        $users = User::latest()
            ->get()
            ->map(fn (User $u) => GeoTransformer::toUser($u))
            ->values()
            ->all();

        return Inertia::render('admin/Users', [
            'usersList' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', 'string', Password::defaults()],
            'role' => 'required|in:citizen,staff,administrator',
            'barangay' => 'nullable|string|max:120',
            'status' => 'nullable|in:active,inactive',
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => $validated['email'],
            'password' => $validated['password'],
            'barangay' => filled($validated['barangay'] ?? null)
                ? trim((string) $validated['barangay'])
                : 'Moto Sur (Pob.)',
            'role' => $validated['role'],
            'status' => $validated['status'] ?? 'active',
            'email_verified_at' => now(),
        ]);

        $this->syncSpatieRole($user, $validated['role']);

        $roleLabel = $this->formatRoleLabel($user->role);
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Created {$roleLabel} account for {$user->name}.",
        ]);

        return back();
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:citizen,staff,administrator',
            'status' => 'sometimes|in:active,inactive',
            'barangay' => 'nullable|string|max:120',
        ]);

        $currentUser = $request->user();

        if ($currentUser && $currentUser->id === $user->id) {
            if ($validated['role'] !== 'administrator') {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'You cannot downgrade your own administrator role.',
                ]);

                return back();
            }

            if (($validated['status'] ?? $user->status) === 'inactive') {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'You cannot deactivate your own account.',
                ]);

                return back();
            }
        }

        $user->role = $validated['role'];

        if (array_key_exists('status', $validated)) {
            $user->status = $validated['status'];
        }

        if (array_key_exists('barangay', $validated) && filled($validated['barangay'])) {
            $user->barangay = trim((string) $validated['barangay']);
        }

        $user->save();

        $this->syncSpatieRole($user, $user->role);

        $roleLabel = $this->formatRoleLabel($user->role);
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$user->name} is now assigned the {$roleLabel} role.",
        ]);

        return back();
    }

    private function syncSpatieRole(User $user, string $roleName): void
    {
        try {
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ]);
            $user->syncRoles([$role]);
        } catch (\Throwable) {
            // Keep column role authoritative if permission tables are unavailable
        }
    }

    private function formatRoleLabel(string $role): string
    {
        return match ($role) {
            'administrator' => 'Administrator',
            'staff' => 'Field Staff',
            default => 'Citizen',
        };
    }
}
