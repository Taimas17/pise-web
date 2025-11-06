<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Seuls les admins peuvent voir la liste des utilisateurs
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Les utilisateurs peuvent voir leur propre profil, les admins peuvent voir tous les profils
     */
    public function view(User $authUser, User $targetUser): bool
    {
        return $authUser->id === $targetUser->id || $authUser->role === 'admin';
    }

    /**
     * Seuls les admins peuvent créer des utilisateurs
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Les utilisateurs peuvent modifier leur propre profil, les admins peuvent modifier tous les profils
     */
    public function update(User $authUser, User $targetUser): bool
    {
        if ($authUser->id === $targetUser->id && request()->has('role')) {
            return false;
        }
        return $authUser->id === $targetUser->id || $authUser->role === 'admin';
    }

    /**
     * Seuls les admins peuvent supprimer des utilisateurs et pas eux-mêmes
     */
    public function delete(User $authUser, User $targetUser): bool
    {
        return $authUser->role === 'admin' && $authUser->id !== $targetUser->id;
    }
}
