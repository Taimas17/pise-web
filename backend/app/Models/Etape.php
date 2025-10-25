<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etape extends Model
{
    use HasFactory;

    protected $fillable = [
        'chantier_id','lot_id','name','description','planned_start_at','planned_end_at','actual_start_at','actual_end_at','status','progress_pct','order_index'
    ];

    protected $casts = [
        'planned_start_at' => 'datetime',
        'planned_end_at' => 'datetime',
        'actual_start_at' => 'datetime',
        'actual_end_at' => 'datetime',
        'progress_pct' => 'decimal:2',
    ];

    public function chantier()
    {
        return $this->belongsTo(Chantier::class);
    }

    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }
}
