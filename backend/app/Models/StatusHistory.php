<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StatusHistory extends Model
{
    use HasFactory;

    protected $fillable = ['report_id','from_status','to_status','comment','user_id'];

    public function report() { return $this->belongsTo(Report::class); }
    public function user() { return $this->belongsTo(User::class); }
}
