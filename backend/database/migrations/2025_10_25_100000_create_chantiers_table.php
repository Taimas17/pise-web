<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chantiers', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('infrastructure_type_id');
            $table->unsignedBigInteger('zone_id');
            $table->enum('status', ['planned','in_progress','on_hold','completed','cancelled'])->index();
            $table->dateTime('planned_start_at');
            $table->dateTime('planned_end_at');
            $table->dateTime('actual_start_at')->nullable();
            $table->dateTime('actual_end_at')->nullable();
            $table->decimal('progress_pct', 5, 2)->default(0);
            $table->decimal('budget_planned', 14, 2);
            $table->decimal('budget_committed', 14, 2)->default(0);
            $table->decimal('budget_actual', 14, 2)->default(0);
            $table->unsignedBigInteger('manager_user_id')->nullable();
            $table->string('external_ref')->nullable();
            $table->timestamps();

            $table->index('zone_id');
            $table->index('infrastructure_type_id');
            $table->index('planned_end_at');
        });

        // Colonne geometry pour local, nullable, pas d'index spatial
        DB::statement('ALTER TABLE chantiers ADD geometry GEOMETRY NULL');

        // Index FULLTEXT sur les colonnes texte
        DB::statement('CREATE FULLTEXT INDEX chantiers_fulltext ON chantiers (title, description, external_ref)');
    }

    public function down(): void
    {
        Schema::dropIfExists('chantiers');
    }
};
