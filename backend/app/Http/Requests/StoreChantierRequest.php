<?php

namespace App\Http\Requests;

use App\Models\Chantier;
use Illuminate\Foundation\Http\FormRequest;

class StoreChantierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('create', Chantier::class);
    }

    public function rules(): array
    {
        return [
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'infrastructure_type_id' => ['required','integer','exists:infrastructure_types,id'],
            'zone_id' => ['required','integer','exists:zones,id'],
            'status' => ['required','in:planned,in_progress,on_hold,completed,cancelled'],
            'planned_start_at' => ['required','date'],
            'planned_end_at' => ['required','date','after_or_equal:planned_start_at'],
            'actual_start_at' => ['nullable','date'],
            'actual_end_at' => ['nullable','date','after_or_equal:actual_start_at'],
            'progress_pct' => ['nullable','numeric','min:0','max:100'],
            'budget_planned' => ['required','numeric','min:0'],
            'budget_committed' => ['nullable','numeric','min:0'],
            'budget_actual' => ['nullable','numeric','min:0'],
            'manager_user_id' => ['nullable','integer','exists:users,id'],
            'external_ref' => ['nullable','string','max:255'],
            'geometry' => ['nullable','array'],
            'geometry.type' => ['required_with:geometry','in:Point,Polygon,LineString'],
            'geometry.coordinates' => ['required_with:geometry'],
        ];
    }
}
