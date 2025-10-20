<?php

namespace App\Http\Controllers;

use App\Models\InfrastructureType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InfrastructureTypeController extends Controller
{
    public function index() { return InfrastructureType::orderBy('name')->get(); }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'description' => ['nullable','string'],
        ]);
        $type = InfrastructureType::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'description' => $data['description'] ?? null,
        ]);
        return response()->json($type, 201);
    }

    public function show(InfrastructureType $infrastructure_type) { return $infrastructure_type; }

    public function update(Request $request, InfrastructureType $infrastructure_type)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'description' => ['nullable','string'],
        ]);
        $infrastructure_type->update([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'description' => $data['description'] ?? null,
        ]);
        return $infrastructure_type;
    }

    public function destroy(InfrastructureType $infrastructure_type)
    {
        $infrastructure_type->delete();
        return response()->noContent();
    }
}
