<?php

namespace Database\Factories;

use App\Models\InfrastructureType;
use App\Models\Report;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReportFactory extends Factory
{
    protected $model = Report::class;

    public function definition(): array
    {
        return [
            'infrastructure_type_id' => InfrastructureType::factory(),
            'zone_id' => null,
            'criticality' => 'faible',
            'status' => 'draft',
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'public_location' => false,
            'submitted_at' => now(),
            'reviewed_at' => null,
            'assigned_at' => null,
            'resolved_at' => null,
        ];
    }
}
