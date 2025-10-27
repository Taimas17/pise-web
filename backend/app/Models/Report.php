<?php

namespace App\Models;

use App\Casts\Encrypted;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'infrastructure_type_id','zone_id','criticality','status','title','description',
        'public_location','lat_masked','lng_masked','citizen_email_enc','citizen_phone_enc',
        'submitted_at','reviewed_at','assigned_at','resolved_at','reported_by_user_id','location'
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
    ];

    protected static function booted(): void
    {
        static::saving(function (self $report) {
            if ($report->lat_masked !== null && $report->lng_masked !== null) {
                $lat = (float) $report->lat_masked;
                $lng = (float) $report->lng_masked;
                $report->setLocationFromLatLng($lat, $lng);
            }
        });
        static::created(function(){ Cache::increment('analytics_version'); });
        static::updated(function(){ Cache::increment('analytics_version'); });
    }

    public function setLocationFromLatLng(float $lat, float $lng): void
    {
        $this->attributes['location'] = DB::raw("ST_SRID(Point($lng, $lat), 4326)");
    }

    public function type() { return $this->belongsTo(InfrastructureType::class, 'infrastructure_type_id'); }
    public function zone() { return $this->belongsTo(Zone::class); }
    public function photos() { return $this->hasMany(ReportPhoto::class); }
    public function statusHistories() { return $this->hasMany(StatusHistory::class); }
    public function assignments() { return $this->hasMany(Assignment::class); }
    public function reporter() { return $this->belongsTo(User::class, 'reported_by_user_id'); }
}
