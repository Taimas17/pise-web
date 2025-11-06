<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    public function run(): void
    {
        $commune = Zone::firstOrCreate([
            'name' => 'Commune de Kalalé',
            'level' => 'commune',
            'parent_id' => null,
        ]);

        $arrondissements = [
            'Kalalé' => ['Centre', 'Zongo', 'Marché'],
            'Dunkassa' => ['Centre', 'Zongo', 'Marché'],
            'Derassi' => ['Centre', 'Zongo', 'Marché'],
            'Doguè' => ['Centre', 'Zongo', 'Marché'],
            'Basso' => ['Centre', 'Zongo', 'Marché'],
        ];

        foreach ($arrondissements as $arrName => $quartiers) {
            $arr = Zone::firstOrCreate([
                'name' => $arrName,
                'level' => 'arrondissement',
                'parent_id' => $commune->id,
            ]);

            foreach ($quartiers as $qName) {
                Zone::firstOrCreate([
                    'name' => $qName,
                    'level' => 'quartier',
                    'parent_id' => $arr->id,
                ]);
            }
        }
    }
}
