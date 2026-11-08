<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\GeoCatalog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with roles, the municipal administrator account,
     * Loon's 67 official PSA barangays, and official municipal complaint categories.
     */
    public function run(): void
    {
        // 1. Seed Spatie Roles
        $adminRole = Role::firstOrCreate(['name' => 'administrator', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'citizen', 'guard_name' => 'web']);

        // 2. Seed Municipal Administrator Account
        $admin = User::firstOrCreate(
            ['email' => 'admin@georeport.test'],
            [
                'name' => 'Loon Municipal Administrator',
                'phone_number' => '+63 920 888 1234',
                'barangay' => 'Moto Sur (Pob.)',
                'role' => 'administrator',
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );
        $admin->assignRole($adminRole);

        // 3. Seed all 67 official PSGC Barangays of Loon, Bohol
        GeoCatalog::syncOfficialBarangays(true);

        // 4. Seed Official Municipal Complaint Categories
        GeoCatalog::syncDefaultCategories();
    }
}
