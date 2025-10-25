<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chantier_id');
            $table->unsignedBigInteger('lot_id')->nullable();
            $table->string('label');
            $table->decimal('amount', 14, 2);
            $table->date('incurred_at');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('chantier_id')->references('id')->on('chantiers')->onDelete('cascade');
            $table->foreign('lot_id')->references('id')->on('lots')->onDelete('set null');

            $table->index('incurred_at');
            $table->index('chantier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
