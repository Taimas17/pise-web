<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Add a geometry column `location` to reports if it doesn't exist
        DB::statement("ALTER TABLE reports ADD COLUMN IF NOT EXISTS location geometry NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE reports DROP COLUMN IF EXISTS location");
    }
};
