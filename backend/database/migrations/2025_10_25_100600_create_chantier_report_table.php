<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chantier_report', function (Blueprint $table) {
            $table->unsignedBigInteger('chantier_id');
            $table->unsignedBigInteger('report_id');
            $table->timestamp('linked_at')->useCurrent();
            $table->text('note')->nullable();

            $table->primary(['chantier_id', 'report_id']);
            $table->foreign('chantier_id')->references('id')->on('chantiers')->onDelete('cascade');
            $table->foreign('report_id')->references('id')->on('reports')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chantier_report');
    }
};
