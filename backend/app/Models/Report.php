<?php

namespace App\Models;

use App\Casts\Encrypted;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Services\GeometryService;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'infrastructure_type_id','zone_id','criticality','status','title','description',
        'public_location','citizen_email_enc','citizen_phone_enc',
        'submitted_at','reviewed_at','assigned_at','resolved_at','reported_by_user_id',
        'latitude','longitude','lat_masked','lng_masked',
        'sla_due_at','sla_review_due_at','escalation_level','escalated_at','closed_reason','closed_category'
    ];

    protected $hidden = ['citizen_email_enc','citizen_phone_enc','location_precise_enc'];

    protected $casts = [
        'citizen_email_enc' => Encrypted::class,
        'citizen_phone_enc' => Encrypted::class,
        'location_precise_enc' => Encrypted::class,
        'public_location' => 'boolean',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'assigned_at' => 'datetime',
        'resolved_at' => 'datetime',
        'sla_due_at' => 'datetime',
        'sla_review_due_at' => 'datetime',
        'escalated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // Location is set explicitly by controllers/seeders using setLocationFromLatLng()
    }

    /**
     * Replace geometry storage with decimal columns.
     * Controllers/seeders call setLocationFromLatLng($lat, $lng) — we keep the method
     * name but store decimals in `latitude`/`longitude` and masked copies.
     */
    public function setLocationFromLatLng(float $lat, float $lng): void
    {
        $lat = round((float)$lat, 6);
        $lng = round((float)$lng, 6);
        $this->attributes['latitude'] = $lat;
        $this->attributes['longitude'] = $lng;
        // For masked values we store the provided values; callers usually pass masked
        // values when privacy is required. Ensure stored masked columns are rounded.
        $this->attributes['lat_masked'] = $lat;
        $this->attributes['lng_masked'] = $lng;
    }

    // Accessor helpers to provide compatibility with previous `lat_masked`/`lng_masked` columns.
    public function getLatMaskedAttribute()
    {
        if (array_key_exists('lat_masked', $this->attributes) && $this->attributes['lat_masked'] !== null) {
            return round((float)$this->attributes['lat_masked'], 6);
        }
        if (array_key_exists('latitude', $this->attributes) && $this->attributes['latitude'] !== null) {
            return round((float)$this->attributes['latitude'], 6);
        }
        return null;
    }

    public function getLngMaskedAttribute()
    {
        if (array_key_exists('lng_masked', $this->attributes) && $this->attributes['lng_masked'] !== null) {
            return round((float)$this->attributes['lng_masked'], 6);
        }
        if (array_key_exists('longitude', $this->attributes) && $this->attributes['longitude'] !== null) {
            return round((float)$this->attributes['longitude'], 6);
        }
        return null;
    }

    public function type() { return $this->belongsTo(InfrastructureType::class, 'infrastructure_type_id'); }
    public function zone() { return $this->belongsTo(Zone::class); }
    public function photos() { return $this->hasMany(ReportPhoto::class); }
    public function statusHistories() { return $this->hasMany(StatusHistory::class); }
    public function assignments() { return $this->hasMany(Assignment::class); }
    public function reporter() { return $this->belongsTo(User::class, 'reported_by_user_id'); }
}
