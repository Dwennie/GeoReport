<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int<0, max> $id
 * @property string $name
 * @property string $email
 * @property string|null $phone_number
 * @property string|null $barangay
 * @property string $role
 * @property string $status
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'barangay',
        'role',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Reports submitted by this citizen.
     *
     * @return HasMany<Report, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'user_id');
    }

    /**
     * Reports assigned to this staff member.
     *
     * @return HasMany<Report, $this>
     */
    public function assignedReports(): HasMany
    {
        return $this->hasMany(Report::class, 'assigned_to');
    }

    /**
     * Comments and notes left by this user.
     *
     * @return HasMany<ReportComment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(ReportComment::class, 'user_id');
    }

    /**
     * Quick role check helpers (using the authoritative role column with Spatie fallback).
     */
    public function isAdministrator(): bool
    {
        if (filled($this->role)) {
            return $this->role === 'administrator';
        }

        return $this->exists && $this->hasRole('administrator');
    }

    public function isStaff(): bool
    {
        if (filled($this->role)) {
            return $this->role === 'staff';
        }

        return $this->exists && $this->hasRole('staff');
    }

    public function isCitizen(): bool
    {
        if (filled($this->role)) {
            return $this->role === 'citizen';
        }

        return ! $this->exists || $this->hasRole('citizen');
    }

    /**
     * Resolve the default dashboard URL for this user's role.
     */
    public function homeRoute(): string
    {
        if ($this->isAdministrator()) {
            return route('admin.dashboard', absolute: false);
        }

        if ($this->isStaff()) {
            return route('staff.dashboard', absolute: false);
        }

        return route('citizen.dashboard', absolute: false);
    }
}
