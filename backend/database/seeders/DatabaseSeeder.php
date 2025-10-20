<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            InfrastructureTypeSeeder::class,
            ZoneSeeder::class,
        ]);

        User::updateOrCreate(
            ['email' => 'admin@pise.local'],
            ['name' => 'Admin', 'password' => Hash::make('password'), 'role' => 'admin']
        );
    }
}
