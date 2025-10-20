<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    protected $fillable = ['attachable_type','attachable_id','path','type','size_kb'];

    public function attachable() { return $this->morphTo(); }
}
