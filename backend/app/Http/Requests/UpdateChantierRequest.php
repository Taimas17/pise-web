<?php

namespace App\Http\Requests;

use App\Models\Chantier;
use Illuminate\Foundation\Http\FormRequest;

class UpdateChantierRequest extends FormRequest
{
    public function authorize(): bool
    {
        $chantier = $this->route('chantier');
        return $this->user() && $this->user()->can('update', $chantier ?: Chantier::class);
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes','string','max:255'],
            'description' => ['sometimes','nullable','string'],
            'infrastructure_type_id' => ['sometimes','integer','exists:infrastructure_types,id'],
            'zone_id' => ['sometimes','integer','exists:zones,id'],
            'status' => ['sometimes','in:planned,in_progress,on_hold,completed,cancelled'],
            'planned_start_at' => ['sometimes','date'],
            'planned_end_at' => ['sometimes','date'],
            'actual_start_at' => ['sometimes','nullable','date'],
            'actual_end_at' => ['sometimes','nullable','date'],
            'progress_pct' => ['sometimes','numeric','min:0','max:100'],
            'budget_planned' => ['sometimes','numeric','min:0'],
            'budget_committed' => ['sometimes','numeric','min:0'],
            'budget_actual' => ['sometimes','numeric','min:0'],
            'manager_user_id' => ['sometimes','nullable','integer','exists:users,id'],
            'external_ref' => ['sometimes','nullable','string','max:255'],
            'geometry' => ['sometimes','nullable','array'],
            'geometry.type' => ['required_with:geometry','in:Point,Polygon,LineString'],
            'geometry.coordinates' => ['required_with:geometry'],
        ];
    }
}
