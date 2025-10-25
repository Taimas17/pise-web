<?php

namespace App\Policies;

use App\Models\Chantier;
use App\Models\User;

class ChantierPolicy
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

    public function view(User $user, Chantier $chantier): bool
    {
        return in_array($user->role, ['moderator','agent','admin']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['moderator','admin']);
    }

    public function update(User $user, Chantier $chantier): bool
    {
        return in_array($user->role, ['moderator','admin']);
    }

    public function delete(User $user, Chantier $chantier): bool
    {
        return $user->role === 'admin';
    }

    public function manageBudget(User $user, Chantier $chantier): bool
    {
        return in_array($user->role, ['moderator','admin']);
    }

    public function manageAssignments(User $user, Chantier $chantier): bool
    {
        return in_array($user->role, ['moderator','admin']);
    }

    public function attachReport(User $user, Chantier $chantier): bool
    {
        return in_array($user->role, ['agent','moderator','admin']);
    }
}
