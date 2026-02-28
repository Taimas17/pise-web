<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Zone;
use App\Models\InfrastructureType;
use App\Models\Report;
use App\Models\User;
use App\Models\Chantier;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. ZONES — Commune de Nikki ──────────────────────────────────────
        $commune = Zone::firstOrCreate(
            ['name' => 'Commune de Nikki', 'level' => 'commune'],
            ['parent_id' => null]
        );

        $arrondissements = [
            'Nikki'      => [9.9448,  3.2117],
            'Biro'       => [10.0120, 3.1850],
            'Damé'       => [9.8750,  3.1500],
            'Sérékalé'   => [9.9200,  3.3200],
            'Suya'       => [10.0600, 3.2500],
            'Tasso'      => [9.8100,  3.2800],
            'Ouénou'     => [9.7500,  3.1700],
        ];

        $zones = [];
        foreach ($arrondissements as $name => $coords) {
            $zones[$name] = Zone::firstOrCreate(
                ['name' => $name, 'level' => 'arrondissement'],
                ['parent_id' => $commune->id]
            );
        }

        // Quelques quartiers pour Nikki
        $quartiers = [
            ['name' => 'Centre-Ville',    'parent' => 'Nikki'],
            ['name' => 'Marché Central',  'parent' => 'Nikki'],
            ['name' => 'Quartier Peulh',  'parent' => 'Nikki'],
            ['name' => 'Alafia',          'parent' => 'Nikki'],
            ['name' => 'Biro-Centre',     'parent' => 'Biro'],
            ['name' => 'Damé-Bord',       'parent' => 'Damé'],
        ];
        foreach ($quartiers as $q) {
            Zone::firstOrCreate(
                ['name' => $q['name'], 'level' => 'quartier'],
                ['parent_id' => $zones[$q['parent']]->id]
            );
        }

        // ── 2. TYPES D'INFRASTRUCTURE ────────────────────────────────────────
        $types = [
            ['name' => 'Route / Piste',                'slug' => 'route',        'description' => 'Routes bitumées, pistes rurales et voies de desserte'],
            ['name' => 'Pont / Ouvrage d\'art',        'slug' => 'pont',         'description' => 'Ponts, buses et ouvrages hydrauliques'],
            ['name' => 'École / Établissement scolaire','slug' => 'ecole',        'description' => 'Écoles primaires, collèges et lycées'],
            ['name' => 'Centre de Santé',              'slug' => 'sante',        'description' => 'Centres de santé, dispensaires et maternités'],
            ['name' => 'Forage / Point d\'eau',        'slug' => 'eau',          'description' => 'Forages, puits et bornes fontaines'],
            ['name' => 'Marché / Commerce',            'slug' => 'marche',       'description' => 'Marchés, boutiques et espaces commerciaux'],
            ['name' => 'Électricité / Éclairage',      'slug' => 'electricite',  'description' => 'Réseau électrique et éclairage public'],
        ];

        $infraTypes = [];
        foreach ($types as $t) {
            $infraTypes[$t['slug']] = InfrastructureType::firstOrCreate(
                ['slug' => $t['slug']],
                ['name' => $t['name'], 'description' => $t['description']]
            );
        }

        // ── 3. UTILISATEURS (agents & modérateurs) ────────────────────────────
        $agentMoussa = User::firstOrCreate(
            ['email' => 'moussa.amadou@nikki.bj'],
            [
                'name'     => 'Moussa Amadou',
                'password' => Hash::make('Agent2024!'),
                'role'     => 'agent',
            ]
        );
        $agentFatima = User::firstOrCreate(
            ['email' => 'fatima.bello@nikki.bj'],
            [
                'name'     => 'Fatima Bello',
                'password' => Hash::make('Agent2024!'),
                'role'     => 'agent',
            ]
        );
        $moderateur = User::firstOrCreate(
            ['email' => 'ibrahim.sani@nikki.bj'],
            [
                'name'     => 'Ibrahim Sani',
                'password' => Hash::make('Modo2024!'),
                'role'     => 'moderator',
            ]
        );

        // ── 4. SIGNALEMENTS (Reports) ─────────────────────────────────────────
        $reports = [
            // ─ Routes / Pistes ─
            [
                'title'       => 'Nid-de-poule dangereux sur la route Nikki-Biro',
                'description' => 'Un large nid-de-poule de plus d\'un mètre de diamètre obstrue partiellement la chaussée près du carrefour principal. Plusieurs motos ont déjà chuté.',
                'criticality' => 'haute',
                'status'      => 'pending_review',
                'type'        => 'route',
                'zone'        => 'Nikki',
                'lat'         => 9.9510, 'lng' => 3.2050,
                'days_ago'    => 5,
            ],
            [
                'title'       => 'Piste dégradée après les pluies — axe Damé-Ouénou',
                'description' => 'La piste de latérite est complètement défoncée sur 3 km suite aux dernières pluies. Passage impossible pour les camions de collecte.',
                'criticality' => 'haute',
                'status'      => 'assigned',
                'type'        => 'route',
                'zone'        => 'Damé',
                'lat'         => 9.8820, 'lng' => 3.1620,
                'days_ago'    => 12,
            ],
            [
                'title'       => 'Panneau de signalisation manquant — entrée Suya',
                'description' => 'Le panneau de limitation de vitesse à l\'entrée de Suya a disparu. Zone scolaire non signalée.',
                'criticality' => 'moyenne',
                'status'      => 'resolved',
                'type'        => 'route',
                'zone'        => 'Suya',
                'lat'         => 10.0580, 'lng' => 3.2480,
                'days_ago'    => 30,
                'resolved_days_ago' => 10,
            ],
            [
                'title'       => 'Rue inondée en saison de pluies — Centre-Ville Nikki',
                'description' => 'La rue principale du centre-ville est régulièrement inondée. Les eaux stagnent pendant 2-3 jours. Problème de drainage à corriger.',
                'criticality' => 'moyenne',
                'status'      => 'pending_review',
                'type'        => 'route',
                'zone'        => 'Nikki',
                'lat'         => 9.9440, 'lng' => 3.2130,
                'days_ago'    => 8,
            ],

            // ─ Ponts ─
            [
                'title'       => 'Pont de Biro — garde-corps effondré',
                'description' => 'Le garde-corps côté droit du pont a cédé sur 4 mètres. Risque de chute pour les piétons et les deux-roues. Urgent.',
                'criticality' => 'haute',
                'status'      => 'assigned',
                'type'        => 'pont',
                'zone'        => 'Biro',
                'lat'         => 10.0090, 'lng' => 3.1820,
                'days_ago'    => 3,
            ],
            [
                'title'       => 'Buse obstruée — passage d\'eau coupé à Tasso',
                'description' => 'La buse de passage sous la piste est complètement bouchée par des déchets et de la latérite. L\'eau déborde sur la chaussée.',
                'criticality' => 'moyenne',
                'status'      => 'pending_review',
                'type'        => 'pont',
                'zone'        => 'Tasso',
                'lat'         => 9.8150, 'lng' => 3.2820,
                'days_ago'    => 15,
            ],

            // ─ Écoles ─
            [
                'title'       => 'Toiture effondrée — EPP Sérékalé',
                'description' => 'La toiture de la 3ème salle de classe de l\'École Primaire Publique de Sérékalé s\'est partiellement effondrée. 45 élèves sans salle.',
                'criticality' => 'haute',
                'status'      => 'assigned',
                'type'        => 'ecole',
                'zone'        => 'Sérékalé',
                'lat'         => 9.9230, 'lng' => 3.3180,
                'days_ago'    => 7,
            ],
            [
                'title'       => 'Latrines hors service — CEG Nikki',
                'description' => 'Les latrines du Collège d\'Enseignement Général de Nikki sont inutilisables. Problème d\'assainissement affectant 800 élèves.',
                'criticality' => 'haute',
                'status'      => 'pending_review',
                'type'        => 'ecole',
                'zone'        => 'Nikki',
                'lat'         => 9.9380, 'lng' => 3.2200,
                'days_ago'    => 4,
            ],
            [
                'title'       => 'Clôture dégradée — EPP Biro',
                'description' => 'La clôture de l\'école primaire est effondrée sur 20 mètres. Les animaux en divagation entrent dans la cour.',
                'criticality' => 'faible',
                'status'      => 'draft',
                'type'        => 'ecole',
                'zone'        => 'Biro',
                'lat'         => 10.0080, 'lng' => 3.1900,
                'days_ago'    => 2,
            ],

            // ─ Centres de Santé ─
            [
                'title'       => 'Groupe électrogène en panne — CS Damé',
                'description' => 'Le groupe électrogène du centre de santé de Damé est en panne depuis 10 jours. Les accouchements de nuit sont impossibles sans éclairage.',
                'criticality' => 'haute',
                'status'      => 'assigned',
                'type'        => 'sante',
                'zone'        => 'Damé',
                'lat'         => 9.8780, 'lng' => 3.1530,
                'days_ago'    => 10,
            ],
            [
                'title'       => 'Toit percé — maternité de Ouénou',
                'description' => 'La salle de maternité de Ouénou a le toit percé en trois endroits. En saison de pluies, l\'eau coule sur les lits.',
                'criticality' => 'haute',
                'status'      => 'pending_review',
                'type'        => 'sante',
                'zone'        => 'Ouénou',
                'lat'         => 9.7530, 'lng' => 3.1750,
                'days_ago'    => 6,
            ],
            [
                'title'       => 'Réfrigérateur vaccins HS — CS Suya',
                'description' => 'Le réfrigérateur de conservation des vaccins est défaillant. Rupture possible de la chaîne du froid. Signalé au DSIO.',
                'criticality' => 'haute',
                'status'      => 'resolved',
                'type'        => 'sante',
                'zone'        => 'Suya',
                'lat'         => 10.0550, 'lng' => 3.2520,
                'days_ago'    => 20,
                'resolved_days_ago' => 5,
            ],

            // ─ Eau / Forages ─
            [
                'title'       => 'Forage en panne — quartier Alafia',
                'description' => 'La pompe du forage du quartier Alafia est hors service. 300 personnes s\'approvisionnent désormais à des sources non potables.',
                'criticality' => 'haute',
                'status'      => 'pending_review',
                'type'        => 'eau',
                'zone'        => 'Nikki',
                'lat'         => 9.9490, 'lng' => 3.2080,
                'days_ago'    => 9,
            ],
            [
                'title'       => 'Borne fontaine vandalisée — Marché Central',
                'description' => 'La borne fontaine du marché central a été endommagée. L\'eau coule en permanence, gaspillage important.',
                'criticality' => 'moyenne',
                'status'      => 'assigned',
                'type'        => 'eau',
                'zone'        => 'Nikki',
                'lat'         => 9.9460, 'lng' => 3.2140,
                'days_ago'    => 14,
            ],
            [
                'title'       => 'Puits collectif asséché — village de Tasso',
                'description' => 'Le puits du village n\'a plus d\'eau depuis la saison sèche. Les femmes parcourent plus de 5 km pour s\'approvisionner.',
                'criticality' => 'haute',
                'status'      => 'pending_review',
                'type'        => 'eau',
                'zone'        => 'Tasso',
                'lat'         => 9.8120, 'lng' => 3.2860,
                'days_ago'    => 18,
            ],

            // ─ Marchés ─
            [
                'title'       => 'Hangar du marché effondré — Biro',
                'description' => 'Le hangar central du marché de Biro s\'est effondré après les fortes pluies. Les commerçants exposent en plein soleil.',
                'criticality' => 'moyenne',
                'status'      => 'pending_review',
                'type'        => 'marche',
                'zone'        => 'Biro',
                'lat'         => 10.0100, 'lng' => 3.1840,
                'days_ago'    => 11,
            ],
            [
                'title'       => 'Caniveaux du marché bouchés — Nikki',
                'description' => 'Les caniveaux du marché de Nikki débordent et créent des flaques nauséabondes. Problème d\'hygiène pour les vendeurs de denrées.',
                'criticality' => 'faible',
                'status'      => 'resolved',
                'type'        => 'marche',
                'zone'        => 'Nikki',
                'lat'         => 9.9455, 'lng' => 3.2125,
                'days_ago'    => 25,
                'resolved_days_ago' => 8,
            ],

            // ─ Électricité ─
            [
                'title'       => 'Poteaux électriques inclinés — axe Nikki-Sérékalé',
                'description' => 'Trois poteaux électriques sont fortement inclinés suite à l\'érosion du sol. Risque de chute et de coupure.',
                'criticality' => 'haute',
                'status'      => 'pending_review',
                'type'        => 'electricite',
                'zone'        => 'Sérékalé',
                'lat'         => 9.9310, 'lng' => 3.2700,
                'days_ago'    => 4,
            ],
            [
                'title'       => 'Éclairage public éteint — rue principale Nikki',
                'description' => '12 lampadaires sur la rue principale de Nikki sont en panne depuis 3 semaines. Insécurité nocturne.',
                'criticality' => 'moyenne',
                'status'      => 'assigned',
                'type'        => 'electricite',
                'zone'        => 'Nikki',
                'lat'         => 9.9430, 'lng' => 3.2150,
                'days_ago'    => 21,
            ],
            [
                'title'       => 'Câble électrique à terre — Damé-Bord',
                'description' => 'Un câble électrique basse tension est tombé au sol et traîne en bordure de route. Danger immédiat pour les passants.',
                'criticality' => 'haute',
                'status'      => 'resolved',
                'type'        => 'electricite',
                'zone'        => 'Damé',
                'lat'         => 9.8760, 'lng' => 3.1610,
                'days_ago'    => 35,
                'resolved_days_ago' => 28,
            ],
        ];

        foreach ($reports as $r) {
            $submittedAt = Carbon::now()->subDays($r['days_ago']);
            $resolvedAt  = isset($r['resolved_days_ago'])
                ? Carbon::now()->subDays($r['resolved_days_ago'])
                : null;

            Report::firstOrCreate(
                ['title' => $r['title']],
                [
                    'infrastructure_type_id' => $infraTypes[$r['type']]->id,
                    'zone_id'                => $zones[$r['zone']]->id,
                    'criticality'            => $r['criticality'],
                    'status'                 => $r['status'],
                    'description'            => $r['description'],
                    'public_location'        => true,
                    'latitude'               => $r['lat'],
                    'longitude'              => $r['lng'],
                    'lat_masked'             => round($r['lat'], 3),
                    'lng_masked'             => round($r['lng'], 3),
                    'submitted_at'           => $submittedAt,
                    'resolved_at'            => $resolvedAt,
                    'reported_by_user_id'    => null,
                    'escalation_level'       => 0,
                    'created_at'             => $submittedAt,
                    'updated_at'             => $resolvedAt ?? $submittedAt,
                ]
            );
        }

        // ── 5. CHANTIERS ──────────────────────────────────────────────────────
        $chantiers = [
            [
                'title'            => 'Réhabilitation route Nikki–Biro (12 km)',
                'description'      => 'Travaux de réhabilitation de la route en terre reliant Nikki à Biro. Rechargement en latérite compactée, cunettes et buses de franchissement.',
                'type'             => 'route',
                'zone'             => 'Nikki',
                'status'           => 'in_progress',
                'progress_pct'     => 45.00,
                'budget_planned'   => 85000000,
                'budget_committed' => 72000000,
                'budget_actual'    => 38000000,
                'planned_start'    => '-6 months',
                'planned_end'      => '+4 months',
                'actual_start'     => '-5 months',
                'manager'          => $agentMoussa->id,
            ],
            [
                'title'            => 'Construction pont sur la rivière Suya',
                'description'      => 'Construction d\'un pont en béton armé de 15 m de portée sur la rivière Suya, permettant la liaison permanente entre Suya et Ouénou.',
                'type'             => 'pont',
                'zone'             => 'Suya',
                'status'           => 'planned',
                'progress_pct'     => 0.00,
                'budget_planned'   => 120000000,
                'budget_committed' => 0,
                'budget_actual'    => 0,
                'planned_start'    => '+2 months',
                'planned_end'      => '+14 months',
                'actual_start'     => null,
                'manager'          => $agentFatima->id,
            ],
            [
                'title'            => 'Extension et équipement CEG Nikki',
                'description'      => 'Construction de 4 nouvelles salles de classe, d\'un laboratoire et d\'un bloc sanitaire pour le Collège d\'Enseignement Général de Nikki.',
                'type'             => 'ecole',
                'zone'             => 'Nikki',
                'status'           => 'in_progress',
                'progress_pct'     => 70.00,
                'budget_planned'   => 55000000,
                'budget_committed' => 52000000,
                'budget_actual'    => 41000000,
                'planned_start'    => '-10 months',
                'planned_end'      => '+2 months',
                'actual_start'     => '-9 months',
                'manager'          => $moderateur->id,
            ],
            [
                'title'            => 'Construction forage solaire — 5 villages',
                'description'      => 'Installation de 5 forages équipés de pompes solaires dans les villages de Tasso, Ouénou, Biro-Nord, Damé-Bord et Sérékalé-Centre.',
                'type'             => 'eau',
                'zone'             => 'Tasso',
                'status'           => 'completed',
                'progress_pct'     => 100.00,
                'budget_planned'   => 32000000,
                'budget_committed' => 32000000,
                'budget_actual'    => 31500000,
                'planned_start'    => '-14 months',
                'planned_end'      => '-2 months',
                'actual_start'     => '-13 months',
                'actual_end'       => '-3 months',
                'manager'          => $agentMoussa->id,
            ],
            [
                'title'            => 'Réhabilitation Centre de Santé de Damé',
                'description'      => 'Travaux de réhabilitation complets du centre de santé de Damé : toiture, sol, réseau électrique, équipements sanitaires et groupe électrogène.',
                'type'             => 'sante',
                'zone'             => 'Damé',
                'status'           => 'in_progress',
                'progress_pct'     => 25.00,
                'budget_planned'   => 28000000,
                'budget_committed' => 18000000,
                'budget_actual'    => 7000000,
                'planned_start'    => '-2 months',
                'planned_end'      => '+6 months',
                'actual_start'     => '-1 month',
                'manager'          => $agentFatima->id,
            ],
        ];

        foreach ($chantiers as $c) {
            Chantier::firstOrCreate(
                ['title' => $c['title']],
                [
                    'description'          => $c['description'],
                    'infrastructure_type_id' => $infraTypes[$c['type']]->id,
                    'zone_id'              => $zones[$c['zone']]->id,
                    'status'               => $c['status'],
                    'progress_pct'         => $c['progress_pct'],
                    'budget_planned'       => $c['budget_planned'],
                    'budget_committed'     => $c['budget_committed'],
                    'budget_actual'        => $c['budget_actual'],
                    'planned_start_at'     => Carbon::parse('now ' . $c['planned_start']),
                    'planned_end_at'       => Carbon::parse('now ' . $c['planned_end']),
                    'actual_start_at'      => isset($c['actual_start']) && $c['actual_start'] ? Carbon::parse('now ' . $c['actual_start']) : null,
                    'actual_end_at'        => isset($c['actual_end']) ? Carbon::parse('now ' . $c['actual_end']) : null,
                    'manager_user_id'      => $c['manager'],
                ]
            );
        }

        $this->command->info('');
        $this->command->info('✅ Données de démonstration insérées avec succès !');
        $this->command->info('   Zones          : ' . Zone::count());
        $this->command->info('   Types infra    : ' . InfrastructureType::count());
        $this->command->info('   Utilisateurs   : ' . User::count());
        $this->command->info('   Signalements   : ' . Report::count());
        $this->command->info('   Chantiers      : ' . Chantier::count());
    }
}
