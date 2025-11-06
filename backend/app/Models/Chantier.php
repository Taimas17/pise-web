<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Services\GeometryService;

class Chantier extends Model
{
    use HasFactory;

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
        if (!in_array($type, ['POINT','LINESTRING','POLYGON'], true)) {
            throw new \InvalidArgumentException("Type de géométrie non supporté: $type");
        }
        if ($coords === null) return;

        $validated = $this->validateAndSanitizeCoordinates($coords, $type);
        $geo = app(GeometryService::class)->createGeometry($type, $validated);
        $this->attributes['geometry'] = DB::raw(DB::getPdo()->quote($geo));
    }

    private function validateAndSanitizeCoordinates($coords, string $type): array
    {
        if ($type === 'POINT') {
            if (!is_array($coords) || count($coords) !== 2) {
                throw new \InvalidArgumentException('POINT doit être [lng, lat]');
            }
            $lng = $this->toFloat($coords[0]);
            $lat = $this->toFloat($coords[1]);
            $this->assertBounds($lng, $lat);
            return [$lng, $lat];
        }

        if ($type === 'LINESTRING') {
            if (!is_array($coords) || empty($coords)) {
                throw new \InvalidArgumentException('LINESTRING doit être une liste de paires [lng, lat]');
            }
            $out = [];
            foreach ($coords as $pair) {
                if (!is_array($pair) || count($pair) !== 2) {
                    throw new \InvalidArgumentException('Chaque point doit être une paire [lng, lat]');
                }
                $lng = $this->toFloat($pair[0]);
                $lat = $this->toFloat($pair[1]);
                $this->assertBounds($lng, $lat);
                $out[] = [$lng, $lat];
            }
            return $out;
        }

        // POLYGON
        if (!is_array($coords) || empty($coords)) {
            throw new \InvalidArgumentException('POLYGON doit contenir au moins un anneau');
        }
        $poly = [];
        foreach ($coords as $ring) {
            if (!is_array($ring) || count($ring) < 4) {
                throw new \InvalidArgumentException('Chaque anneau doit contenir au moins 4 points');
            }
            $ringOut = [];
            foreach ($ring as $pair) {
                if (!is_array($pair) || count($pair) !== 2) {
                    throw new \InvalidArgumentException('Chaque point doit être une paire [lng, lat]');
                }
                $lng = $this->toFloat($pair[0]);
                $lat = $this->toFloat($pair[1]);
                $this->assertBounds($lng, $lat);
                $ringOut[] = [$lng, $lat];
            }
            if ($ringOut[0] !== end($ringOut)) {
                $ringOut[] = $ringOut[0];
            }
            $poly[] = $ringOut;
        }
        return $poly;
    }

    private function toFloat($v): float
    {
        if (!is_numeric($v)) {
            throw new \InvalidArgumentException('La coordonnée doit être numérique');
        }
        return round((float)$v, 6);
    }

    private function assertBounds(float $lng, float $lat): void
    {
        if ($lat < -90 || $lat > 90) {
            throw new \InvalidArgumentException('Latitude invalide');
        }
        if ($lng < -180 || $lng > 180) {
            throw new \InvalidArgumentException('Longitude invalide');
        }
    }
}
