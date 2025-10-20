<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function before(?User $user, string $ability)
    {
        if ($user && $user->role === 'admin') {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['moderator','agent','citizen','admin'], true);
    }

    public function view(User $user, Report $report): bool
    {
        if (in_array($user->role, ['moderator','agent','admin'], true)) return true;
        return $user->role === 'citizen' && $report->reported_by_user_id === $user->id;
    }

    public function create(?User $user = null): bool
    {
        return true; // création publique autorisée (citoyen non authentifié)
    }

    public function update(User $user, Report $report): bool
    {
        return in_array($user->role, ['moderator','agent','admin'], true);
    }

    public function review(User $user, Report $report): bool
    {
        return in_array($user->role, ['moderator','admin'], true);
    }

    public function assign(User $user, Report $report): bool
    {
        return in_array($user->role, ['moderator','admin'], true);
    }

    public function stats(User $user): bool
    {
        return in_array($user->role, ['moderator','agent','admin'], true);
    }

    public function export(User $user): bool
    {
        return in_array($user->role, ['moderator','agent','admin'], true);
    }
}
