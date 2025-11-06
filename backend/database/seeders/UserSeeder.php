<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('fr_FR');

        User::updateOrCreate(
            ['email' => 'admin@pise.local'],
            [
                'name' => 'Administrateur Principal',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone_enc' => '+229 60 00 00 01',
            ]
        );

        $moderators = [
            ['email' => 'moderator1@pise.local', 'name' => 'Salimatou Bio'],
            ['email' => 'moderator2@pise.local', 'name' => 'Brice Hounkpè'],
        ];
        foreach ($moderators as $i => $mod) {
            User::updateOrCreate(
                ['email' => $mod['email']],
                [
                    'name' => $mod['name'],
                    'password' => Hash::make('password'),
                    'role' => 'moderator',
                    'phone_enc' => sprintf('+229 %02d %02d %02d %02d', rand(60, 69), rand(10, 99), rand(10, 99), rand(10, 99)),
                ]
            );
        }

        $agents = [
            ['email' => 'agent1@pise.local', 'name' => 'Issifou Alimi'],
            ['email' => 'agent2@pise.local', 'name' => 'Rachida Gbadamassi'],
            ['email' => 'agent3@pise.local', 'name' => 'Sèna Kossi'],
        ];
        foreach ($agents as $ag) {
            User::updateOrCreate(
                ['email' => $ag['email']],
                [
                    'name' => $ag['name'],
                    'password' => Hash::make('password'),
                    'role' => 'agent',
                    'phone_enc' => sprintf('+229 %02d %02d %02d %02d', rand(90, 99), rand(10, 99), rand(10, 99), rand(10, 99)),
                ]
            );
        }

        for ($i = 1; $i <= 5; $i++) {
            User::updateOrCreate(
                ['email' => "citizen{$i}@pise.local"],
                [
                    'name' => $faker->name(),
                    'password' => Hash::make('password'),
                    'role' => 'citizen',
                    'phone_enc' => $i % 2 === 0 ? sprintf('+229 %02d %02d %02d %02d', rand(50, 59), rand(10, 99), rand(10, 99), rand(10, 99)) : null,
                ]
            );
        }
    }
}
