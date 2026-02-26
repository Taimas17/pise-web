<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\InfrastructureType;
use App\Models\Report;
use App\Models\AuditLog;
use App\Models\Zone;
use App\Models\ReportPhoto;
use App\Models\StatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Laravel\Facades\Image;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::query()->with(['type','zone','photos']);
        if (optional($request->user())->role === 'citizen') {
            $query->where('reported_by_user_id', $request->user()->id);
        }
        if ($type = $request->input('type_id')) $query->where('infrastructure_type_id', $type);
        if ($status = $request->input('status')) $query->where('status', $status);
        if ($crit = $request->input('criticality')) $query->where('criticality', $crit);
        if ($zone = $request->input('zone_id')) $query->where('zone_id', $zone);
        if ($reporter = $request->input('reporter_id')) $query->where('reported_by_user_id', $reporter);
        if ($from = $request->input('from')) $query->whereDate('created_at', '>=', $from);
        if ($to = $request->input('to')) $query->whereDate('created_at', '<=', $to);
        if ($q = trim((string)$request->input('q'))) {
            $query->where(function($qq) use ($q) {
                $like = '%'.str_replace(['%','_'], ['\\%','\\_'], $q).'%';
                $qq->where('title','like',$like)->orWhere('description','like',$like)->orWhere('closed_reason','like',$like);
            });
        }
        if ($commune = $request->input('commune_id')) {
            $ids = $this->collectZoneAndChildrenIds((int)$commune);
            $query->whereIn('zone_id', $ids);
        }
        if ($arr = $request->input('arrondissement_id')) {
            $ids = $this->collectZoneAndChildrenIds((int)$arr);
            $query->whereIn('zone_id', $ids);
        }
        if ($quartier = $request->input('quartier_id')) {
            $query->where('zone_id', $quartier);
        }
        return $query->orderByDesc('id')->paginate(20);
    }

    public function show(Report $report)
    {
        $report->load(['type','zone','photos','statusHistories','assignments']);
        return $report;
    }

    public function store(Request $request)
    {
        $maxPhotos = (int) env('REPORT_MAX_PHOTOS', 5);
        $maxMb = (int) env('REPORT_MAX_PHOTO_MB', 5);

        $data = $request->validate([
            'infrastructure_type_id' => ['required','exists:infrastructure_types,id'],
            'zone_id' => ['nullable','exists:zones,id'],
            'criticality' => ['required','in:faible,moyenne,haute'],
            'title' => ['nullable','string','max:200'],
            'description' => ['nullable','string','max:5000'],
            'lat' => ['required','numeric','between:-90,90'],
            'lng' => ['required','numeric','between:-180,180'],
            'public_location' => ['boolean'],
            'citizen_email' => ['nullable','email','max:255'],
            'citizen_phone' => ['nullable','string','max:255'],
            'submitted_at' => ['nullable','date'],
            'photos.*' => ["nullable","file","mimetypes:image/jpeg,image/png","max:".($maxMb*1024)],
        ]);

    $lat = round((float)$data['lat'], 6);
    $lng = round((float)$data['lng'], 6);
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            throw ValidationException::withMessages([
                'lat' => 'Coordonnées invalides',
                'lng' => 'Coordonnées invalides',
            ]);
        }

        $report = new Report();
        $report->fill([
            'infrastructure_type_id' => $data['infrastructure_type_id'],
            'zone_id' => $data['zone_id'] ?? null,
            'criticality' => $data['criticality'],
            'status' => 'pending_review',
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'public_location' => (bool)($data['public_location'] ?? false),
            // masked coordinates are provided via accessors on the model (derived from geometry)
            'citizen_email_enc' => $data['citizen_email'] ?? null,
            'citizen_phone_enc' => $data['citizen_phone'] ?? null,
            'submitted_at' => $data['submitted_at'] ?? now(),
            'reported_by_user_id' => optional($request->user())->id,
        ]);
        
        // Store precise coordinates encrypted
    $report->location_precise_enc = json_encode(['lat' => $lat, 'lng' => $lng]);
        // Set the geometry location using masked (public) or precise coordinates depending on settings
        // Use precise masked coordinates when public_location is true, otherwise store rounded for privacy
        $useLat = $report->public_location ? $lat : round($lat, 3);
        $useLng = $report->public_location ? $lng : round($lng, 3);
    $report->setLocationFromLatLng($useLat, $useLng);
        $this->applySla($report);
        $report->save();

        if ($request->hasFile('photos')) {
            $this->handlePhotos($request, $report, $maxPhotos, $maxMb);
        }

        StatusHistory::create([
            'report_id' => $report->id,
            'from_status' => null,
            'to_status' => 'pending_review',
            'comment' => 'Création du signalement',
            'user_id' => optional($request->user())->id,
        ]);
        AuditLog::create([
            'entity_type' => 'report',
            'entity_id' => $report->id,
            'action' => 'created',
            'changes' => ['status' => 'pending_review'],
            'user_id' => optional($request->user())->id,
        ]);

        return response()->json($report->load('photos'), 201);
    }

    public function uploadPhotos(Request $request, Report $report)
    {
        $this->authorize('update', $report);
        $maxPhotos = (int) env('REPORT_MAX_PHOTOS', 5);
        $maxMb = (int) env('REPORT_MAX_PHOTO_MB', 5);
        $request->validate([
            'photos.*' => ["required","file","mimetypes:image/jpeg,image/png","max:".($maxMb*1024)],
        ]);
        $this->handlePhotos($request, $report, $maxPhotos, $maxMb);
        return $report->load('photos');
    }

    public function update(Request $request, Report $report)
    {
        $this->authorize('update', $report);
        $data = $request->validate([
            'status' => ['nullable','in:draft,pending_review,assigned,resolved,rejected'],
            'zone_id' => ['nullable','exists:zones,id'],
            'criticality' => ['nullable','in:faible,moyenne,haute'],
            'comment' => ['nullable','string','max:2000'],
            'closed_reason' => ['nullable','string','max:1000'],
            'closed_category' => ['nullable','in:maintenance_corrective,maintenance_preventive,fausse_alerte,autre'],
        ]);
        $from = $report->status;
        $report->fill($data);
        $this->applySla($report);
        $report->save();
        if (isset($data['status']) && $data['status'] !== $from) {
            StatusHistory::create([
                'report_id' => $report->id,
                'from_status' => $from,
                'to_status' => $report->status,
                'comment' => $data['comment'] ?? null,
                'user_id' => optional($request->user())->id,
            ]);
            AuditLog::create([
                'entity_type' => 'report',
                'entity_id' => $report->id,
                'action' => 'status_change',
                'changes' => ['from' => $from, 'to' => $report->status],
                'user_id' => optional($request->user())->id,
            ]);
            if ($report->status === 'resolved') {
                $report->resolved_at = now();
                $report->save();
            }
        }
        return $report->fresh();
    }

    public function review(Request $request, Report $report)
    {
        $this->authorize('review', $report);
        $data = $request->validate([
            'action' => ['required','in:approve,reject'],
            'comment' => ['nullable','string','max:2000'],
        ]);
        $from = $report->status;
        if ($data['action'] === 'approve') {
            $report->status = 'assigned'; // will be assigned next
            $report->reviewed_at = now();
        } else {
            $report->status = 'rejected';
        }
        $this->applySla($report);
        $report->save();
        StatusHistory::create([
            'report_id' => $report->id,
            'from_status' => $from,
            'to_status' => $report->status,
            'comment' => $data['comment'] ?? null,
            'user_id' => optional($request->user())->id,
        ]);
        AuditLog::create([
            'entity_type' => 'report',
            'entity_id' => $report->id,
            'action' => 'review',
            'changes' => ['from' => $from, 'to' => $report->status],
            'user_id' => optional($request->user())->id,
        ]);
        return $report;
    }

    public function assign(Request $request, Report $report)
    {
        $this->authorize('assign', $report);
        $data = $request->validate([
            'agent_id' => ['required','exists:users,id'],
        ]);
        $assignment = Assignment::create([
            'report_id' => $report->id,
            'assigned_to_user_id' => $data['agent_id'],
            'assigned_by_user_id' => optional($request->user())->id,
            'assigned_at' => now(),
        ]);
        $from = $report->status;
        $report->status = 'assigned';
        $report->assigned_at = now();
        $this->applySla($report);
        $report->save();
        StatusHistory::create([
            'report_id' => $report->id,
            'from_status' => $from,
            'to_status' => 'assigned',
            'comment' => 'Assignation à un agent',
            'user_id' => optional($request->user())->id,
        ]);
        AuditLog::create([
            'entity_type' => 'report',
            'entity_id' => $report->id,
            'action' => 'assign',
            'changes' => ['assigned_to_user_id' => $data['agent_id']],
            'user_id' => optional($request->user())->id,
        ]);
        return $report->load('assignments');
    }

    public function audit(Report $report)
    {
        $history = $report->statusHistories()->with('user:id,name')->orderBy('created_at','asc')->get();
        $logs = \App\Models\AuditLog::where('entity_type','report')->where('entity_id',$report->id)->orderBy('created_at','asc')->get();
        return response()->json(['status_history' => $history, 'audit_logs' => $logs]);
    }

    private function applySla(Report $report): void
    {
        $h = $this->slaHours($report->criticality);
        $base = $report->submitted_at ?: now();
        $report->sla_due_at = (clone $base)->addHours($h['resolution']);
        $report->sla_review_due_at = (clone $base)->addHours($h['review']);
    }

    private function slaHours(string $criticality): array
    {
        if ($criticality === 'haute') return ['resolution' => 24, 'review' => 2];
        if ($criticality === 'moyenne') return ['resolution' => 48, 'review' => 4];
        return ['resolution' => 72, 'review' => 8];
    }

    private function collectZoneAndChildrenIds(int $zoneId): array
    {
        $ids = [$zoneId];
        $level1 = Zone::where('parent_id',$zoneId)->pluck('id')->all();
        $ids = array_merge($ids, $level1);
        if ($level1) {
            $level2 = Zone::whereIn('parent_id',$level1)->pluck('id')->all();
            $ids = array_merge($ids, $level2);
        }
        return array_values(array_unique($ids));
    }

    private function handlePhotos(Request $request, Report $report, int $maxPhotos, int $maxMb): void
    {
        $existing = $report->photos()->count();
        $files = $request->file('photos', []);
        if (count($files) + $existing > $maxPhotos) {
            abort(422, 'Nombre maximal de photos dépassé');
        }

        foreach ($files as $file) {
            $path = $file->store('report-photos', 'public');
            $thumb = null;
            try {
                $img = Image::read($file->getRealPath())->scaleDown(800, 800);
                $thumbPath = 'report-photos/thumbs/'.basename($path);
                Storage::disk('public')->put($thumbPath, (string)$img->toJpeg(80));
                $thumb = $thumbPath;
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Thumbnail generation failed', [
                    'report_id' => $report->id,
                    'path' => $path,
                    'error' => $e->getMessage(),
                ]);
            }

            $report->photos()->create([
                'path' => $path,
                'thumbnail_path' => $thumb,
                'size_kb' => (int) round(($file->getSize() / 1024)),
            ]);
        }
    }
}
