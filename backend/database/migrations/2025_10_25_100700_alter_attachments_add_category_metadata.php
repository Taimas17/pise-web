<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            $table->enum('category', ['contrat','OS','PV_reception','photo','autre'])->nullable()->after('type');
            $table->json('metadata')->nullable()->after('size_kb');
        });
    }

    public function down(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            $table->dropColumn(['category', 'metadata']);
        });
    }
};
