<?php

namespace App\Http\Requests;

use App\Models\Chantier;
use Illuminate\Foundation\Http\FormRequest;

class StoreLotRequest extends FormRequest
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
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'budget_planned' => ['required','numeric','min:0'],
            'order_index' => ['required','integer','min:0'],
        ];
    }
}
