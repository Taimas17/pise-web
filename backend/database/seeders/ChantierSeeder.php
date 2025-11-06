<?php

namespace Database\Seeders;

use App\Models\Chantier;
use App\Models\Etape;
use App\Models\Expense;
use App\Models\InfrastructureType;
use App\Models\Lot;
use App\Models\Report;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ChantierSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('fr_FR');

        $types = InfrastructureType::all();
        $zones = Zone::where('level', 'quartier')->get();
        $managers = User::whereIn('role', ['moderator','agent'])->get();
        if ($types->isEmpty() || $zones->isEmpty() || $managers->isEmpty()) {
            return;
        }

        $statusOptions = ['planned','in_progress','on_hold','completed','cancelled'];

        $count = rand(5, 10);
        for ($i = 0; $i < $count; $i++) {
            $type = $types->random();
            $zone = $zones->random();
            $status = $faker->randomElement($statusOptions);
            $title = $this->makeTitle($type->name, $zone->name);

            $plannedStart = $faker->dateTimeBetween('-2 months', '+1 month');
            $plannedEnd = (clone $plannedStart)->modify('+' . rand(20, 120) . ' days');
            $actualStart = in_array($status, ['in_progress','on_hold','completed']) ? $faker->dateTimeBetween($plannedStart, $plannedEnd) : null;
            $actualEnd = $status === 'completed' ? $faker->dateTimeBetween($actualStart ?? $plannedStart, $plannedEnd->modify('+30 days')) : null;

            $budgetPlanned = $faker->numberBetween(10_000_000, 800_000_000);
            $budgetCommitted = $faker->numberBetween((int)($budgetPlanned * 0.2), $budgetPlanned);
            $budgetActual = in_array($status, ['in_progress','completed','on_hold']) ? $faker->numberBetween((int)($budgetCommitted * 0.3), $budgetCommitted) : 0;

            $progress = match ($status) {
                'planned' => $faker->randomFloat(2, 0, 10),
                'in_progress' => $faker->randomFloat(2, 10, 90),
                'on_hold' => $faker->randomFloat(2, 15, 60),
                'completed' => 100.0,
                'cancelled' => $faker->randomFloat(2, 0, 30),
                default => 0,
            };

            $chantier = Chantier::create([
                'title' => $title,
                'description' => $faker->paragraphs(rand(1, 3), true),
                'infrastructure_type_id' => $type->id,
                'zone_id' => $zone->id,
                'status' => $status,
                'planned_start_at' => $plannedStart,
                'planned_end_at' => $plannedEnd,
                'actual_start_at' => $actualStart,
                'actual_end_at' => $actualEnd,
                'progress_pct' => $progress,
                'budget_planned' => $budgetPlanned,
                'budget_committed' => $budgetCommitted,
                'budget_actual' => $budgetActual,
                'manager_user_id' => $managers->random()->id,
                'external_ref' => $faker->boolean(40) ? strtoupper($faker->bothify('CH-##-????')) : null,
            ]);

            $this->seedLotsEtapesExpenses($faker, $chantier);
            $this->linkReports($chantier, $type->id, $zone->id);
        }
    }

    private function seedLotsEtapesExpenses($faker, Chantier $chantier): void
    {
        $lotCount = rand(2, 4);
        $remaining = $chantier->budget_planned;
        for ($l = 1; $l <= $lotCount; $l++) {
            $isLast = $l === $lotCount;
            $allocated = $isLast
                ? $remaining
                : (int) max(1_000_000, ($remaining * $faker->randomFloat(2, 0.15, 0.4)));
            $remaining -= $allocated;

            $lot = Lot::create([
                'chantier_id' => $chantier->id,
                'title' => 'Lot ' . $l,
                'description' => $faker->sentence(),
                'budget_planned' => $allocated,
                'budget_actual' => $faker->boolean(70) ? $faker->numberBetween(0, $allocated) : 0,
                'progress_pct' => $faker->randomFloat(2, 0, 100),
                'order_index' => $l,
            ]);

            $etapeCount = rand(3, 6);
            for ($e = 1; $e <= $etapeCount; $e++) {
                $eStatus = $faker->randomElement(['planned','in_progress','done','blocked','cancelled']);
                $pStart = $faker->dateTimeBetween($chantier->planned_start_at, $chantier->planned_end_at);
                $pEnd = (clone $pStart)->modify('+' . rand(5, 30) . ' days');
                $aStart = in_array($eStatus, ['in_progress','done','blocked']) ? $faker->dateTimeBetween($pStart, $pEnd) : null;
                $aEnd = $eStatus === 'done' ? $faker->dateTimeBetween($aStart ?? $pStart, $pEnd->modify('+10 days')) : null;

                Etape::create([
                    'chantier_id' => $chantier->id,
                    'lot_id' => $lot->id,
                    'name' => 'Étape ' . $l . '.' . $e,
                    'description' => $faker->sentence(),
                    'planned_start_at' => $pStart,
                    'planned_end_at' => $pEnd,
                    'actual_start_at' => $aStart,
                    'actual_end_at' => $aEnd,
                    'status' => $eStatus,
                    'progress_pct' => $faker->randomFloat(2, 0, 100),
                    'order_index' => $e,
                ]);
            }

            $expenseCount = rand(2, 5);
            for ($x = 0; $x < $expenseCount; $x++) {
                $amount = $faker->numberBetween(100_000, (int) max(200_000, $lot->budget_planned / 3));
                Expense::create([
                    'chantier_id' => $chantier->id,
                    'lot_id' => $lot->id,
                    'label' => $faker->words(3, true),
                    'amount' => $amount,
                    'incurred_at' => $faker->dateTimeBetween($chantier->planned_start_at, $chantier->planned_end_at)->format('Y-m-d'),
                    'note' => $faker->boolean(30) ? $faker->sentence() : null,
                ]);
            }
        }
    }

    private function linkReports(Chantier $chantier, int $typeId, int $zoneId): void
    {
        $reports = Report::where('infrastructure_type_id', $typeId)
            ->where('zone_id', $zoneId)
            ->inRandomOrder()
            ->limit(rand(0, 3))
            ->get();
        if ($reports->isEmpty()) return;
        foreach ($reports as $r) {
            $chantier->reports()->syncWithoutDetaching([$r->id => ['note' => 'Lié automatiquement pour suivi']]);
        }
    }

    private function makeTitle(string $typeName, string $quartier): string
    {
        $prefixes = ['Réhabilitation', 'Construction', 'Extension', 'Aménagement'];
        $suffixes = ['phase I', 'phase II', 'lotissement', 'travaux prioritaires'];
        return sprintf('%s %s à %s (%s)',
            fake('fr_FR')->randomElement($prefixes),
            $typeName,
            $quartier,
            fake('fr_FR')->randomElement($suffixes)
        );
    }
}
