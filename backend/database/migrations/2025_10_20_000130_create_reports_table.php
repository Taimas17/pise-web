<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('infrastructure_type_id')->constrained('infrastructure_types');
            $table->foreignId('zone_id')->nullable()->constrained('zones')->nullOnDelete();
            $table->enum('criticality', ['faible','moyenne','haute'])->default('faible');
            $table->enum('status', ['draft','pending_review','assigned','resolved','rejected'])->default('draft')->index();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->boolean('public_location')->default(false);
            $table->point('location')->nullable();
            $table->text('location_precise_enc')->nullable();
            $table->decimal('lat_masked', 9, 6)->nullable();
            $table->decimal('lng_masked', 9, 6)->nullable();
            $table->text('citizen_email_enc')->nullable();
            $table->text('citizen_phone_enc')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('reported_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Ensure SRID 4326 and spatial index
        DB::statement('ALTER TABLE reports MODIFY COLUMN location POINT SRID 4326 NULL');
        DB::statement('CREATE SPATIAL INDEX reports_location_spatial_index ON reports (location)');
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
