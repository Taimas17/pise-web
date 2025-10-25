<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'chantier_id','lot_id','label','amount','incurred_at','note'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'incurred_at' => 'date',
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
