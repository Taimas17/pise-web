<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Zone;

class ZonePolicy
{
    public function before(?User $user, string $ability)
    {
        if ($user && $user->role === 'admin') return true;
        return null;
    }

    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Zone $zone): bool { return true; }

    public function create(User $user): bool { return false; }
    public function update(User $user, Zone $zone): bool { return false; }
    public function delete(User $user, Zone $zone): bool { return false; }

    public function import(User $user): bool { return false; }
}
