<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ZoneController extends Controller
{
    public function index(Request $request)
    {
        $query = Zone::query();
        if ($level = $request->input('level')) $query->where('level', $level);
        if ($parent = $request->input('parent_id')) $query->where('parent_id', $parent);
        return $query->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'level' => ['required','in:commune,arrondissement,quartier'],
            'parent_id' => ['nullable','exists:zones,id'],
            'properties' => ['nullable','array'],
        ]);
        $zone = Zone::create($data);
        return response()->json($zone, 201);
    }

    public function importGeoJson(Request $request)
    {
        $request->validate(['file' => ['required','file','mimetypes:application/json,application/geo+json']]);
        $content = json_decode(file_get_contents($request->file('file')->getRealPath()), true);
        $features = $content['features'] ?? [];
        DB::transaction(function () use ($features) {
            foreach ($features as $f) {
                $props = $f['properties'] ?? [];
                Zone::updateOrCreate(
                    ['name' => $props['name'] ?? $props['nom'] ?? 'Sans nom', 'level' => $props['level'] ?? 'quartier'],
                    ['properties' => $props]
                );
            }
        });
        return response()->json(['message' => 'Import effectué'], 201);
    }
}
