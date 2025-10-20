<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = ['report_id','assigned_to_user_id','assigned_by_user_id','assigned_at'];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    public function report() { return $this->belongsTo(Report::class); }
    public function assignee() { return $this->belongsTo(User::class, 'assigned_to_user_id'); }
    public function assigner() { return $this->belongsTo(User::class, 'assigned_by_user_id'); }
}
