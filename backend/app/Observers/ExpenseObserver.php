<?php

namespace App\Observers;

use App\Models\Expense;
use Illuminate\Support\Facades\DB;

class ExpenseObserver
{
    public function saved(Expense $expense): void { $this->recalc($expense->chantier_id); }
    public function deleted(Expense $expense): void { $this->recalc($expense->chantier_id); }

    protected function recalc(int $chantierId): void
    {
        $sum = DB::table('expenses')->where('chantier_id', $chantierId)->sum('amount');
        DB::table('chantiers')->where('id', $chantierId)->update(['budget_actual' => $sum]);
    }
}
