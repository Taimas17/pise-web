<?php

namespace App\Http\Requests;

use App\Models\Chantier;
use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $chantierId = (int) $this->route('id');
        $chantier = Chantier::find($chantierId);
        return $this->user() && $chantier && $this->user()->can('manageBudget', $chantier);
    }

    public function rules(): array
    {
        return [
            'lot_id' => ['nullable','integer','exists:lots,id'],
            'label' => ['required','string','max:255'],
            'amount' => ['required','numeric','min:0'],
            'incurred_at' => ['required','date'],
            'note' => ['nullable','string'],
        ];
    }
}
