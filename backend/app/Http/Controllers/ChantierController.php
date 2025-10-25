<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChantierRequest;
use App\Http\Requests\StoreEtapeRequest;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\StoreLotRequest;
use App\Http\Requests\UpdateChantierRequest;
use App\Http\Requests\UpdateEtapeRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Http\Requests\UpdateLotRequest;
use App\Models\Attachment;
use App\Models\Chantier;
use App\Models\Etape;
use App\Models\Expense;
use App\Models\Lot;
use App\Models\Report;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class ChantierController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Chantier::class);
        $q = Chantier::query();

        if ($v = $request->integer('infrastructure_type_id')) $q->where('infrastructure_type_id', $v);
        if ($v = $request->integer('zone_id')) $q->where('zone_id', $v);
        if ($v = $request->get('status')) $q->where('status', $v);
        if ($v = $request->integer('manager_user_id')) $q->where('manager_user_id', $v);
        if ($v = $request->date('from')) $q->whereDate('created_at', '>=', $v);
        if ($v = $request->date('to')) $q->whereDate('created_at', '<=', $v);
        if ($v = trim((string)$request->get('q', ''))) {
            $v = addcslashes($v, '%_');
            $q->where(function($qq) use ($v) {
                $qq->where('title', 'like', "%$v%")
                   ->orWhere('description', 'like', "%$v%")
                   ->orWhere('external_ref', 'like', "%$v%");
            });
        }

        $sort = (string) $request->get('sort', '-created_at');
        if ($sort === '-created_at') $q->orderByDesc('created_at');
        elseif ($sort === 'planned_end_at') $q->orderBy('planned_end_at');
        elseif ($sort === 'progress_pct') $q->orderByDesc('progress_pct');
        else $q->orderByDesc('created_at');

        $q->with(['type:id,name','zone:id,name,level,parent_id','manager:id,name']);

        return $q->paginate(20);
    }

    public function store(StoreChantierRequest $request)
    {
        $this->authorize('create', Chantier::class);
        $data = $request->validated();
        $chantier = new Chantier($data);
        if (isset($data['geometry'])) $chantier->setGeometryFromGeoJson($data['geometry']);
        $chantier->save();
        AuditLog::create(['entity_type' => 'chantier','entity_id' => $chantier->id,'action' => 'create','changes' => $data,'user_id' => optional($request->user())->id]);
        return response()->json($chantier->load(['type','zone','manager']), 201);
    }

    public function show(Request $request, Chantier $chantier)
    {
        $this->authorize('view', $chantier);
        $includes = collect(explode(',', (string)$request->get('include')))->filter()->values();
        $relations = ['type','zone','manager'];
        if ($includes->contains('lots')) $relations[] = 'lots';
        if ($includes->contains('etapes')) $relations[] = 'etapes';
        if ($includes->contains('expenses')) $relations[] = 'expenses';
        if ($includes->contains('attachments')) $relations[] = 'attachments';
        if ($includes->contains('reports')) $relations[] = 'reports';

        $chantier->load($relations);
        $geo = DB::selectOne('SELECT ST_AsGeoJSON(geometry) as g FROM chantiers WHERE id = ?', [$chantier->id]);
        if ($geo && $geo->g) { $chantier->geometry = json_decode($geo->g, true); }
        return $chantier;
    }

    public function update(UpdateChantierRequest $request, Chantier $chantier)
    {
        $this->authorize('update', $chantier);
        $data = $request->validated();
        if (array_key_exists('geometry', $data)) {
            $chantier->setGeometryFromGeoJson($data['geometry']);
            unset($data['geometry']);
        }
        $before = $chantier->getOriginal();
        $chantier->fill($data)->save();
        AuditLog::create(['entity_type' => 'chantier','entity_id' => $chantier->id,'action' => 'update','changes' => ['before'=>$before,'after'=>$chantier->getAttributes()], 'user_id' => optional($request->user())->id]);
        return $chantier->fresh()->load(['type','zone','manager']);
    }

    public function destroy(Request $request, Chantier $chantier)
    {
        $this->authorize('delete', $chantier);
        $hasDeps = $chantier->lots()->exists() || $chantier->etapes()->exists() || $chantier->expenses()->exists();
        if ($hasDeps) return response()->json(['message' => 'Suppression interdite: dépendances existantes'], 422);
        $id = $chantier->id;
        $chantier->delete();
        AuditLog::create(['entity_type' => 'chantier','entity_id' => $id,'action' => 'delete','changes' => null,'user_id' => optional($request->user())->id]);
        return response()->noContent();
    }

    public function updateProgress(Request $request, Chantier $chantier)
    {
        $this->authorize('update', $chantier);
        $validated = $request->validate(['progress_pct' => ['required','numeric','min:0','max:100']]);
        $chantier->progress_pct = $validated['progress_pct'];
        $chantier->save();
        AuditLog::create(['entity_type' => 'chantier','entity_id' => $chantier->id,'action' => 'progress_update','changes' => ['progress_pct'=>$validated['progress_pct']], 'user_id' => optional($request->user())->id]);
        return $chantier->fresh(['type','zone','manager']);
    }

    public function lotsIndex(Request $request, $id)
    {
        $chantier = Chantier::findOrFail($id);
        $this->authorize('view', $chantier);
        return $chantier->lots()->orderBy('order_index')->paginate(50);
    }

    public function lotsStore(StoreLotRequest $request, $id)
    {
        $chantier = Chantier::findOrFail($id);
        $this->authorize('update', $chantier);
        $lot = $chantier->lots()->create($request->validated());
        $this->recalcChantierFromLotsEtapes($chantier->id);
        return response()->json($lot, 201);
    }

    public function lotUpdate(UpdateLotRequest $request, Lot $lot)
    {
        $this->authorize('update', $lot);
        $lot->update($request->validated());
        $this->recalcChantierFromLotsEtapes($lot->chantier_id);
        return $lot->fresh();
    }

    public function lotDelete(Request $request, Lot $lot)
    {
        $this->authorize('delete', $lot);
        $chantierId = $lot->chantier_id;
        $lot->delete();
        $this->recalcChantierFromLotsEtapes($chantierId);
        return response()->noContent();
    }

    public function etapesIndex(Request $request, $id)
    {
        $chantier = Chantier::findOrFail($id);
        $this->authorize('view', $chantier);
        return $chantier->etapes()->orderBy('order_index')->paginate(100);
    }

    public function etapesStore(StoreEtapeRequest $request, $id)
    {
        $chantier = Chantier::findOrFail($id);
        $this->authorize('update', $chantier);
        $etape = $chantier->etapes()->create($request->validated());
        $this->recalcChantierFromLotsEtapes($chantier->id);
        return response()->json($etape, 201);
    }

    public function etapeUpdate(UpdateEtapeRequest $request, Etape $etape)
    {
        $this->authorize('update', $etape);
        $etape->update($request->validated());
        $this->recalcChantierFromLotsEtapes($etape->chantier_id);
        return $etape->fresh();
    }

    public function etapeDelete(Request $request, Etape $etape)
    {
        $this->authorize('delete', $etape);
        $chantierId = $etape->chantier_id;
        $etape->delete();
        $this->recalcChantierFromLotsEtapes($chantierId);
        return response()->noContent();
    }

    public function expensesIndex(Request $request, $id)
    {
        $chantier = Chantier::findOrFail($id);
        $this->authorize('view', $chantier);
        return $chantier->expenses()->orderByDesc('incurred_at')->paginate(50);
    }

    public function expensesStore(StoreExpenseRequest $request, $id)
    {
        $chantier = Chantier::findOrFail($id);
        $this->authorize('manageBudget', $chantier);
        $expense = $chantier->expenses()->create($request->validated());
        $this->recalcBudget($chantier->id);
        return response()->json($expense, 201);
    }

    public function expenseUpdate(UpdateExpenseRequest $request, Expense $expense)
    {
        $this->authorize('update', $expense);
        $expense->update($request->validated());
        $this->recalcBudget($expense->chantier_id);
        return $expense->fresh();
    }

    public function expenseDelete(Request $request, Expense $expense)
    {
        $this->authorize('delete', $expense);
        $chantierId = $expense->chantier_id;
        $expense->delete();
        $this->recalcBudget($chantierId);
        return response()->noContent();
    }

    public function attachmentsStore(Request $request, $id)
    {
        $chantier = Chantier::findOrFail($id);
        $this->authorize('update', $chantier);
        $request->validate([
            'file' => ['required','file','max:10240'],
            'type' => ['nullable','string','max:50'],
            'category' => ['nullable','in:contrat,OS,PV_reception,photo,autre'],
            'metadata' => ['nullable','array'],
        ]);
        $file = $request->file('file');
        $path = $file->store('chantier-docs', 'public');
        $sizeKb = (int) round($file->getSize() / 1024);
        $mime = $file->getMimeType();
        if (str_starts_with($mime, 'image/')) {
            try {
                $img = Image::read($file->getRealPath());
                $thumbPath = 'chantier-docs/thumbs/'.basename($path);
                Storage::disk('public')->put($thumbPath, $img->scaleDown(800,800)->toJpeg(80));
            } catch (\Throwable $e) { }
        }
        $att = new Attachment([
            'path' => $path,
            'type' => $mime,
            'category' => $request->string('category')->toString() ?: null,
            'size_kb' => $sizeKb,
            'metadata' => $request->input('metadata'),
        ]);
        $chantier->attachments()->save($att);
        return response()->json($att, 201);
    }

    public function attachmentDelete(Request $request, Attachment $attachment)
    {
        $attachable = $attachment->attachable;
        if ($attachable instanceof Chantier) {
            $this->authorize('update', $attachable);
        }
        Storage::disk('public')->delete($attachment->path);
        $attachment->delete();
        return response()->noContent();
    }

    public function reportsIndex(Request $request, $id)
    {
        $chantier = Chantier::findOrFail($id);
        $this->authorize('view', $chantier);
        return $chantier->reports()->with(['type:id,name','zone:id,name'])->paginate(20);
    }

    public function reportsLink(Request $request, $id)
    {
        $chantier = Chantier::findOrFail($id);
        $this->authorize('attachReport', $chantier);
        $validated = $request->validate(['report_id' => ['required','integer','exists:reports,id'], 'note' => ['nullable','string']]);
        $chantier->reports()->syncWithoutDetaching([$validated['report_id'] => ['linked_at' => now(), 'note' => $validated['note'] ?? null]]);
        AuditLog::create(['entity_type' => 'chantier','entity_id' => $chantier->id,'action' => 'attach_report','changes' => ['report_id'=>$validated['report_id']], 'user_id' => optional($request->user())->id]);
        return response()->json(['ok' => true]);
    }

    public function reportsUnlink(Request $request, $id, $reportId)
    {
        $chantier = Chantier::findOrFail($id);
        $this->authorize('attachReport', $chantier);
        $chantier->reports()->detach($reportId);
        AuditLog::create(['entity_type' => 'chantier','entity_id' => $chantier->id,'action' => 'detach_report','changes' => ['report_id'=>$reportId], 'user_id' => optional($request->user())->id]);
        return response()->noContent();
    }

    protected function recalcChantierFromLotsEtapes(int $chantierId): void
    {
        $progress = DB::table('lots')->where('chantier_id', $chantierId)->avg('progress_pct');
        if ($progress === null) {
            $progress = DB::table('etapes')->where('chantier_id', $chantierId)->avg('progress_pct');
        }
        DB::table('chantiers')->where('id', $chantierId)->update(['progress_pct' => round((float)$progress, 2)]);
    }

    protected function recalcBudget(int $chantierId): void
    {
        $sum = DB::table('expenses')->where('chantier_id', $chantierId)->sum('amount');
        DB::table('chantiers')->where('id', $chantierId)->update(['budget_actual' => $sum]);
    }
}
