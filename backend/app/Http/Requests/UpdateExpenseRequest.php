<?php

namespace App\Http\Requests;

use App\Models\Expense;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $expense = $this->route('expense');
        return $this->user() && $expense && $this->user()->can('update', $expense);
    }

    public function rules(): array
    {
        return [
            'lot_id' => ['sometimes','nullable','integer','exists:lots,id'],
            'label' => ['sometimes','string','max:255'],
            'amount' => ['sometimes','numeric','min:0'],
            'incurred_at' => ['sometimes','date'],
            'note' => ['sometimes','nullable','string'],
        ];
    }
}
