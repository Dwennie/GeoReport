<?php

use App\Http\Middleware\EnsureUserRole;
use App\Models\User;
use Illuminate\Http\Request;
use Tests\TestCase;

uses(TestCase::class);

test('user homeRoute resolves the dedicated portal for each role', function () {
    $citizen = new User(['role' => 'citizen']);
    $staff = new User(['role' => 'staff']);
    $admin = new User(['role' => 'administrator']);

    expect($citizen->homeRoute())->toBe('/citizen/dashboard');
    expect($staff->homeRoute())->toBe('/staff/dashboard');
    expect($admin->homeRoute())->toBe('/admin/dashboard');
});

test('EnsureUserRole allows matching role and redirects unauthorized roles to their own workspace', function () {
    $middleware = new EnsureUserRole;

    $citizen = new User(['role' => 'citizen']);
    $request = Request::create('/admin/dashboard', 'GET');
    $request->setUserResolver(fn () => $citizen);

    $redirectResponse = $middleware->handle($request, fn () => response('ok'), 'administrator');
    expect($redirectResponse->getStatusCode())->toBe(302);
    expect($redirectResponse->headers->get('Location'))->toEndWith('/citizen/dashboard');

    $admin = new User(['role' => 'administrator']);
    $adminRequest = Request::create('/admin/dashboard', 'GET');
    $adminRequest->setUserResolver(fn () => $admin);

    $allowedResponse = $middleware->handle($adminRequest, fn () => response('ok'), 'administrator');
    expect($allowedResponse->getStatusCode())->toBe(200);
    expect($allowedResponse->getContent())->toBe('ok');
});
