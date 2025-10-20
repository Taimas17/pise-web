<?php

namespace Database\Seeders;

use App\Models\InfrastructureType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InfrastructureTypeSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            'Voirie', 'Eclairage public', 'Eau potable', 'Assainissement', 'Etablissement scolaire'
        ];
        foreach ($items as $name) {
            InfrastructureType::firstOrCreate(['slug' => Str::slug($name)], [
                'name' => $name,
            ]);
        }
    }
}
