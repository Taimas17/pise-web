<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function logs(Request $request)
    {
        if (!$request->user() || !in_array($request->user()->role, ['admin','moderator'], true)) abort(403);
        $q = AuditLog::query();
        if ($et = $request->input('entity_type')) $q->where('entity_type',$et);
        if ($uid = $request->input('user_id')) $q->where('user_id',$uid);
        if ($from = $request->input('from')) $q->whereDate('created_at','>=',$from);
        if ($to = $request->input('to')) $q->whereDate('created_at','<=',$to);
        return $q->orderBy('created_at','desc')->paginate(50);
    }
}
