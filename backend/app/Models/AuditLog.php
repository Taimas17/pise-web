<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = ['entity_type','entity_id','action','changes','user_id'];

    protected $casts = [
        'changes' => 'array',
    ];

    public function user() { return $this->belongsTo(User::class); }
}
