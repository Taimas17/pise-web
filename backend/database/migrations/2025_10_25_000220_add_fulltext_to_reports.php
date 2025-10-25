<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement('ALTER TABLE reports ADD FULLTEXT reports_fulltext_idx (title, description, closed_reason)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE reports DROP INDEX reports_fulltext_idx');
    }
};
