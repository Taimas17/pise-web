<?php

namespace App\Policies;

use App\Models\InfrastructureType;
use App\Models\User;

class InfrastructureTypePolicy
{
    public function before(?User $user, string $ability)
    {
        if ($user && $user->role === 'admin') return true;
        return null;
    }

    public function viewAny(User $user): bool { return true; }
    public function view(User $user, InfrastructureType $type): bool { return true; }

    public function create(User $user): bool { return in_array($user->role, ['moderator'], true); }
    public function update(User $user, InfrastructureType $type): bool { return in_array($user->role, ['moderator'], true); }
    public function delete(User $user, InfrastructureType $type): bool { return in_array($user->role, ['moderator'], true); }
}
