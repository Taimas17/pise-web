<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeAction($request);
        $q = trim((string)$request->input('q'));
        $role = $request->input('role');
        $users = User::query()
            ->when($role, fn($qq) => $qq->where('role',$role))
            ->when($q, fn($qq) => $qq->where(function($w) use ($q){ $like = '%'.str_replace(['%','_'],['\\%','\\_'],$q).'%'; $w->where('name','like',$like)->orWhere('email','like',$like); }))
            ->orderBy('id','desc')
            ->paginate(20);
        return $users;
    }

    public function updateRole(Request $request, User $user)
    {
        $this->authorizeAction($request);
        $data = $request->validate(['role' => ['required','in:admin,moderator,agent,citizen']]);
        $old = $user->role;
        $user->role = $data['role'];
        $user->save();
        AuditLog::create([
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'action' => 'role_change',
            'changes' => ['from' => $old, 'to' => $user->role],
            'user_id' => optional($request->user())->id,
        ]);
        return $user;
    }

    private function authorizeAction(Request $request): void
    {
        if (!$request->user() || $request->user()->role !== 'admin') abort(403);
    }
}
