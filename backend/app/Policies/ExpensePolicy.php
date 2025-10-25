<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;

class ExpensePolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if ($user->role === 'admin') return true;
        return null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['moderator','agent','admin']);
    }

    public function view(User $user, Expense $expense): bool
    {
        return in_array($user->role, ['moderator','agent','admin']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['moderator','admin']);
    }

    public function update(User $user, Expense $expense): bool
    {
        return in_array($user->role, ['moderator','admin']);
    }

    public function delete(User $user, Expense $expense): bool
    {
        return in_array($user->role, ['moderator','admin']);
    }
}
