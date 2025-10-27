<?php

namespace Database\Factories;

use App\Models\InfrastructureType;
use Illuminate\Database\Eloquent\Factories\Factory;

class InfrastructureTypeFactory extends Factory
{
    protected $model = InfrastructureType::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
        ];
    }
}
