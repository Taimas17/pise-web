<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('etapes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chantier_id');
            $table->unsignedBigInteger('lot_id')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->dateTime('planned_start_at');
            $table->dateTime('planned_end_at');
            $table->dateTime('actual_start_at')->nullable();
            $table->dateTime('actual_end_at')->nullable();
            $table->enum('status', ['planned','in_progress','done','blocked','cancelled']);
            $table->decimal('progress_pct', 5, 2)->default(0);
            $table->integer('order_index');
            $table->timestamps();

            $table->foreign('chantier_id')->references('id')->on('chantiers')->onDelete('cascade');
            $table->foreign('lot_id')->references('id')->on('lots')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etapes');
    }
};
