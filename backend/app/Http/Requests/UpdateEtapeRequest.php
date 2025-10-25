<?php

namespace App\Http\Requests;

use App\Models\Etape;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEtapeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $etape = $this->route('etape');
        return $this->user() && $etape && $this->user()->can('update', $etape);
    }

    public function rules(): array
    {
        return [
            'lot_id' => ['sometimes','nullable','integer','exists:lots,id'],
            'name' => ['sometimes','string','max:255'],
            'description' => ['sometimes','nullable','string'],
            'planned_start_at' => ['sometimes','date'],
            'planned_end_at' => ['sometimes','date'],
            'actual_start_at' => ['sometimes','nullable','date'],
            'actual_end_at' => ['sometimes','nullable','date'],
            'status' => ['sometimes','in:planned,in_progress,done,blocked,cancelled'],
            'progress_pct' => ['sometimes','numeric','min:0','max:100'],
            'order_index' => ['sometimes','integer','min:0'],
        ];
    }
}
