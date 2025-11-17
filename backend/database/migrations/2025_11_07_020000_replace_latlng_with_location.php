<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Ensure decimal latitude/longitude and masked columns exist for local/dev compatibility
        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'latitude')) {
                $table->decimal('latitude', 10, 7)->nullable();
            }
            if (!Schema::hasColumn('reports', 'longitude')) {
                $table->decimal('longitude', 10, 7)->nullable();
            }
            if (!Schema::hasColumn('reports', 'lat_masked')) {
                $table->decimal('lat_masked', 9, 6)->nullable();
            }
            if (!Schema::hasColumn('reports', 'lng_masked')) {
                $table->decimal('lng_masked', 9, 6)->nullable();
            }
        });

        // If a geometry `location` column exists, we avoid running DB-specific geometry
        // conversions here (some local MySQL/MariaDB versions differ). Migrating values
        // from a geometry column to decimals can be done manually or via a safe script
        // if needed. For portability in local/dev, we prefer storing decimal coords.
    }

    public function down(): void
    {
        // Remove the decimal columns if present
        Schema::table('reports', function (Blueprint $table) {
            if (Schema::hasColumn('reports', 'latitude')) {
                $table->dropColumn('latitude');
            }
            if (Schema::hasColumn('reports', 'longitude')) {
                $table->dropColumn('longitude');
            }
            if (Schema::hasColumn('reports', 'lat_masked')) {
                $table->dropColumn('lat_masked');
            }
            if (Schema::hasColumn('reports', 'lng_masked')) {
                $table->dropColumn('lng_masked');
            }
        });
    }
};
