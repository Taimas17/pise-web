<?php

namespace App\Http\Requests;

use App\Models\Chantier;
use Illuminate\Foundation\Http\FormRequest;

class StoreEtapeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $chantierId = (int) $this->route('id');
        $chantier = Chantier::find($chantierId);
        return $this->user() && $chantier && $this->user()->can('update', $chantier);
    }

    public function rules(): array
    {
        return [
            'lot_id' => ['nullable','integer','exists:lots,id'],
            'name' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'planned_start_at' => ['required','date'],
            'planned_end_at' => ['required','date','after_or_equal:planned_start_at'],
            'actual_start_at' => ['nullable','date'],
            'actual_end_at' => ['nullable','date','after_or_equal:actual_start_at'],
            'status' => ['required','in:planned,in_progress,done,blocked,cancelled'],
            'progress_pct' => ['nullable','numeric','min:0','max:100'],
            'order_index' => ['required','integer','min:0'],
        ];
    }
}
