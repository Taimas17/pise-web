<?php

namespace App\Models;

use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Chantier extends Model
{
    use HasFactory, Filterable;

    protected $fillable = [
        'title','description','infrastructure_type_id','zone_id','status',
        'planned_start_at','planned_end_at','actual_start_at','actual_end_at',
        'progress_pct','budget_planned','budget_committed','budget_actual',
        'manager_user_id','external_ref'
    ];

    protected $casts = [
        'planned_start_at' => 'datetime',
        'planned_end_at' => 'datetime',
        'actual_start_at' => 'datetime',
        'actual_end_at' => 'datetime',
        'progress_pct' => 'decimal:2',
        'budget_planned' => 'decimal:2',
        'budget_committed' => 'decimal:2',
        'budget_actual' => 'decimal:2',
    ];

    public function type()
    {
        return $this->belongsTo(InfrastructureType::class, 'infrastructure_type_id');
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_user_id');
    }

    public function lots()
    {
        return $this->hasMany(Lot::class);
    }

    public function etapes()
    {
        return $this->hasMany(Etape::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function reports()
    {
        return $this->belongsToMany(Report::class, 'chantier_report')
            ->withPivot(['linked_at','note']);
    }

    public function setGeometryFromGeoJson(?array $geometry): void
    {
        if (!$geometry) return;
        $type = strtoupper($geometry['type'] ?? '');
        $coords = $geometry['coordinates'] ?? null;
        if (!$type || !$coords) return;
        $wkt = null;
        if ($type === 'POINT') {
            [$lng,$lat] = $coords;
            $wkt = sprintf('POINT(%F %F)', $lng, $lat);
        } elseif ($type === 'LINESTRING') {
            $pairs = array_map(fn($c) => sprintf('%F %F', $c[0], $c[1]), $coords);
            $wkt = 'LINESTRING(' . implode(',', $pairs) . ')';
        } elseif ($type === 'POLYGON') {
            $rings = array_map(function($ring){
                return '(' . implode(',', array_map(fn($c)=>sprintf('%F %F',$c[0],$c[1]), $ring)) . ')';
            }, $coords);
            $wkt = 'POLYGON' . implode('', $rings);
        }
        if ($wkt) {
            $this->attributes['geometry'] = DB::raw("ST_SRID(ST_GeomFromText('$wkt'), 4326)");
        }
    }

    protected function getFilterMap(): array
    {
        return [
            'infrastructure_type_id' => 'infrastructure_type_id',
            'zone_id' => 'zone_id',
            'status' => 'status',
            'manager_user_id' => 'manager_user_id',
        ];
    }

    protected function getSearchableColumns(): array
    {
        return ['title','description','external_ref'];
    }
}
