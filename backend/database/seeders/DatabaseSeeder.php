<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            InfrastructureTypeSeeder::class,
            ZoneSeeder::class,
            UserSeeder::class,
            ReportSeeder::class,
            ChantierSeeder::class,
        ]);
    }
}
