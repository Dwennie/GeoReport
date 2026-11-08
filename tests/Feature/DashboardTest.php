<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users are redirected from dashboard to their role workspace', function (string $role, string $expectedRoute) {
    $user = User::factory()->create(['role' => $role]);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route($expectedRoute, absolute: false));
})->with([
    ['citizen', 'citizen.dashboard'],
    ['staff', 'staff.dashboard'],
    ['administrator', 'admin.dashboard'],
]);
