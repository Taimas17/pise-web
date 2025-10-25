<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chantier_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('budget_planned', 14, 2);
            $table->decimal('budget_actual', 14, 2)->default(0);
            $table->decimal('progress_pct', 5, 2)->default(0);
            $table->integer('order_index');
            $table->timestamps();

            $table->foreign('chantier_id')->references('id')->on('chantiers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lots');
    }
};
