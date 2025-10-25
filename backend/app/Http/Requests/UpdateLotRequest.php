<?php

namespace App\Http\Requests;

use App\Models\Lot;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLotRequest extends FormRequest
{
    public function authorize(): bool
    {
        $lot = $this->route('lot');
        return $this->user() && $lot && $this->user()->can('update', $lot);
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes','string','max:255'],
            'description' => ['sometimes','nullable','string'],
            'budget_planned' => ['sometimes','numeric','min:0'],
            'budget_actual' => ['sometimes','numeric','min:0'],
            'progress_pct' => ['sometimes','numeric','min:0','max:100'],
            'order_index' => ['sometimes','integer','min:0'],
        ];
    }
}
