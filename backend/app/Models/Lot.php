<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lot extends Model
{
    use HasFactory;

    protected $fillable = [
        'chantier_id','title','description','budget_planned','budget_actual','progress_pct','order_index'
    ];

    protected $casts = [
        'budget_planned' => 'decimal:2',
        'budget_actual' => 'decimal:2',
        'progress_pct' => 'decimal:2',
    ];

    public function chantier()
    {
        return $this->belongsTo(Chantier::class);
    }

    public function etapes()
    {
        return $this->hasMany(Etape::class);
    }
}
