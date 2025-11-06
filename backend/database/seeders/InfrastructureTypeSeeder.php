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
            'Voirie',
            'Eclairage public',
            'Eau potable',
            'Assainissement',
            'Etablissement scolaire',
            'Marché',
            'Mosquée',
            'Église',
            'Poste de police',
            'Centre de santé',
            'Hôpital de zone',
            'École maternelle',
            'EPP',
            'École technique',
            'Centre-puits',
            'Forage',
            'Puits moderne',
            'Contre-puits',
        ];

        foreach ($items as $name) {
            $slug = Str::slug($name);
            InfrastructureType::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => null,
                ]
            );
        }
    }
}
