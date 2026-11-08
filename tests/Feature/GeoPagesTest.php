<?php

use App\Models\Category;
use App\Models\Report;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login from every workspace', function (string $path) {
    $this->get($path)->assertRedirect(route('login'));
})->with([
    ['/citizen/dashboard'],
    ['/staff/dashboard'],
    ['/admin/dashboard'],
]);

test('citizens see citizen pages and are redirected away from staff or admin workspaces', function (string $routeName, string $component) {
    $user = User::factory()->create(['role' => 'citizen']);
    $this->actingAs($user);

    $this->get(route($routeName))->assertInertia(
        fn (Assert $page) => $page->component($component),
    );
})->with([
    ['citizen.dashboard', 'citizen/Dashboard'],
    ['citizen.complaints.index', 'citizen/complaints/Index'],
    ['citizen.complaints.create', 'citizen/complaints/Create'],
    ['citizen.map', 'citizen/Map'],
    ['citizen.notifications', 'citizen/Notifications'],
]);

test('citizens cannot access admin or staff routes', function (string $path) {
    $user = User::factory()->create(['role' => 'citizen']);
    $this->actingAs($user);

    $this->get($path)->assertRedirect(route('citizen.dashboard', absolute: false));
})->with([
    ['/admin/dashboard'],
    ['/staff/dashboard'],
]);

test('staff members see the staff pages', function (string $routeName, string $component) {
    $user = User::factory()->create(['role' => 'staff']);
    $this->actingAs($user);

    $this->get(route($routeName))->assertInertia(
        fn (Assert $page) => $page->component($component),
    );
})->with([
    ['staff.dashboard', 'staff/Dashboard'],
    ['staff.complaints.index', 'staff/complaints/Index'],
    ['staff.map', 'staff/Map'],
    ['staff.history', 'staff/History'],
]);

test('administrators see the administrator pages', function (string $routeName, string $component) {
    $user = User::factory()->create(['role' => 'administrator']);
    $this->actingAs($user);

    $this->get(route($routeName))->assertInertia(
        fn (Assert $page) => $page->component($component),
    );
})->with([
    ['admin.dashboard', 'admin/Dashboard'],
    ['admin.complaints.index', 'admin/complaints/Index'],
    ['admin.map', 'admin/Map'],
    ['admin.assignments', 'admin/Assignments'],
    ['admin.categories', 'admin/Categories'],
    ['admin.barangays', 'admin/Barangays'],
    ['admin.users', 'admin/Users'],
    ['admin.analytics', 'admin/Analytics'],
    ['admin.settings', 'admin/Settings'],
]);

test('complaint detail routes load live database records for each authorized role', function () {
    $citizen = User::factory()->create(['role' => 'citizen']);
    $staff = User::factory()->create(['role' => 'staff']);
    $admin = User::factory()->create(['role' => 'administrator']);

    $category = Category::create([
        'name' => 'Roads & Infrastructure',
        'slug' => 'roads-infrastructure',
        'color' => '#EA580C',
        'is_active' => true,
    ]);

    $report = Report::create([
        'user_id' => $citizen->id,
        'assigned_to' => $staff->id,
        'category_id' => $category->id,
        'title' => 'Damaged culvert in Moto Sur',
        'barangay' => 'Moto Sur (Pob.)',
        'address' => 'National Highway, Moto Sur',
        'description' => 'Concrete culvert cover collapsed along the roadside shoulder.',
        'latitude' => 9.7997,
        'longitude' => 123.7925,
        'priority' => 'high',
        'status' => 'assigned',
        'is_public' => true,
        'incident_date' => now(),
    ]);

    $this->actingAs($citizen)
        ->get("/citizen/complaints/{$report->id}")
        ->assertInertia(fn (Assert $page) => $page
            ->component('citizen/complaints/Show')
            ->where('complaintId', $report->id));

    $this->actingAs($staff)
        ->get("/staff/complaints/{$report->id}")
        ->assertInertia(fn (Assert $page) => $page
            ->component('staff/complaints/Show')
            ->where('complaintId', $report->id));

    $this->actingAs($admin)
        ->get("/admin/complaints/{$report->id}")
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/complaints/Show')
            ->where('complaintId', $report->id));
});
