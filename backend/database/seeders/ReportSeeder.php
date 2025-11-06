<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\InfrastructureType;
use App\Models\Report;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Carbon;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('fr_FR');

        $types = InfrastructureType::all();
        $quartiers = Zone::where('level', 'quartier')->get();
        if ($types->isEmpty() || $quartiers->isEmpty()) {
            return;
        }

        $citizens = User::where('role', 'citizen')->get();
        $agents = User::whereIn('role', ['agent','moderator'])->get();

        $statuses = ['draft','pending_review','assigned','resolved','rejected'];
        $criticalities = ['faible','moyenne','haute'];
        $closedCategories = ['maintenance_corrective','maintenance_preventive','fausse_alerte','autre'];

        $count = rand(20, 30);
        for ($i = 0; $i < $count; $i++) {
            $type = $types->random();
            $zone = $quartiers->random();
            $crit = $faker->randomElement($criticalities);
            $status = $faker->randomElement($statuses);

            $submittedAt = $faker->dateTimeBetween('-3 months', 'now');
            $reviewedAt = in_array($status, ['pending_review','assigned','resolved','rejected']) ? $faker->dateTimeBetween($submittedAt, 'now') : null;
            $assignedAt = in_array($status, ['assigned','resolved']) ? $faker->dateTimeBetween($reviewedAt ?? $submittedAt, 'now') : null;
            $resolvedAt = $status === 'resolved' ? $faker->dateTimeBetween($assignedAt ?? $submittedAt, 'now') : null;

            $lat = $faker->randomFloat(6, 10.20, 10.40);
            $lng = $faker->randomFloat(6, 3.20, 3.40);

            $title = $this->makeTitle($type->name, $zone->name, $crit);
            $desc = $faker->paragraphs(rand(1, 3), true);

            $citizen = $faker->boolean(70) && $citizens->isNotEmpty() ? $citizens->random() : null;

            $slaDays = $crit === 'haute' ? 3 : ($crit === 'moyenne' ? 7 : 14);
            $slaDueAt = (clone $submittedAt)->modify("+{$slaDays} days");
            $slaReviewDueAt = (clone $submittedAt)->modify('+2 days');
            $escalationLevel = 0;
            $escalatedAt = null;
            if (in_array($status, ['pending_review','assigned']) && $slaDueAt < new \DateTime()) {
                $escalationLevel = $faker->numberBetween(0, 2);
                $escalatedAt = $faker->boolean(30) ? $faker->dateTimeBetween($slaDueAt, 'now') : null;
            }

            $report = new Report([
                'infrastructure_type_id' => $type->id,
                'zone_id' => $zone->id,
                'criticality' => $crit,
                'status' => $status,
                'title' => $title,
                'description' => $desc,
                'public_location' => $faker->boolean(70),
                'lat_masked' => $lat,
                'lng_masked' => $lng,
                'citizen_email_enc' => $citizen ? $citizen->email : ($faker->boolean(30) ? $faker->safeEmail() : null),
                'citizen_phone_enc' => $faker->boolean(40) ? sprintf('+229 %02d %02d %02d %02d', rand(50, 99), rand(10, 99), rand(10, 99), rand(10, 99)) : null,
                'submitted_at' => $submittedAt,
                'reviewed_at' => $reviewedAt,
                'assigned_at' => $assignedAt,
                'resolved_at' => $resolvedAt,
                'reported_by_user_id' => $citizen?->id,
                'sla_due_at' => $slaDueAt,
                'sla_review_due_at' => $slaReviewDueAt,
                'escalation_level' => $escalationLevel,
                'escalated_at' => $escalatedAt,
                'closed_reason' => in_array($status, ['resolved','rejected']) ? $faker->sentence() : null,
                'closed_category' => in_array($status, ['resolved','rejected']) ? $faker->randomElement($closedCategories) : null,
            ]);
            $report->save();

            if (in_array($status, ['assigned','resolved']) && $agents->isNotEmpty()) {
                $assignee = $agents->random();
                Assignment::create([
                    'report_id' => $report->id,
                    'assigned_to_user_id' => $assignee->id,
                    'assigned_by_user_id' => User::whereIn('role', ['moderator','admin'])->inRandomOrder()->value('id'),
                    'assigned_at' => $assignedAt ?? $submittedAt,
                ]);
            }
        }
    }

    private function makeTitle(string $typeName, string $quartier, string $crit): string
    {
        $prefix = [
            'faible' => 'Anomalie',
            'moyenne' => 'Problème',
            'haute' => 'Urgence',
        ][$crit] ?? 'Signalement';

        $templates = [
            "$prefix sur %s à %s",
            "$prefix concernant %s au quartier %s",
            "$prefix - %s défectueux à %s",
        ];
        $t = $templates[array_rand($templates)];
        return sprintf($t, $typeName, $quartier);
    }
}
