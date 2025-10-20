<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    public function run(): void
    {
        // Placeholders
        $commune = Zone::firstOrCreate(['name' => 'Commune A', 'level' => 'commune']);
        $arr = Zone::firstOrCreate(['name' => 'Arrondissement 1', 'level' => 'arrondissement', 'parent_id' => $commune->id]);
        Zone::firstOrCreate(['name' => 'Quartier Centre', 'level' => 'quartier', 'parent_id' => $arr->id]);
    }
}
