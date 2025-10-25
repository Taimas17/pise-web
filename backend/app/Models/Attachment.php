<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    protected $fillable = ['attachable_type','attachable_id','path','type','category','size_kb','metadata'];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function attachable() { return $this->morphTo(); }
}
