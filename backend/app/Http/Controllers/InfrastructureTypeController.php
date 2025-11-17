<?php

namespace App\Http\Controllers;

use App\Models\InfrastructureType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InfrastructureTypeController extends Controller
{
    public function index()
    {
        // Allow public listing for the signalement form while keeping other actions protected by policies.
        if (auth()->check()) {
            $this->authorize('viewAny', InfrastructureType::class);
        }
        return InfrastructureType::orderBy('name')->get();
    }

    public function store(Request $request)
    { $this->authorize('create', InfrastructureType::class);
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

    public function show(InfrastructureType $infrastructure_type) { $this->authorize('view', $infrastructure_type); return $infrastructure_type; }

    public function update(Request $request, InfrastructureType $infrastructure_type)
    { $this->authorize('update', $infrastructure_type);
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
    { $this->authorize('delete', $infrastructure_type);
        $infrastructure_type->delete();
        return response()->noContent();
    }
}
