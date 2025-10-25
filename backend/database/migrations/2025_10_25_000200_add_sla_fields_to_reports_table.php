<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dateTime('sla_due_at')->nullable()->after('resolved_at');
            $table->dateTime('sla_review_due_at')->nullable()->after('sla_due_at');
            $table->unsignedTinyInteger('escalation_level')->default(0)->after('sla_review_due_at');
            $table->dateTime('escalated_at')->nullable()->after('escalation_level');
            $table->string('closed_reason')->nullable()->after('escalated_at');
            $table->enum('closed_category', ['maintenance_corrective','maintenance_preventive','fausse_alerte','autre'])->nullable()->after('closed_reason');
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->index(['status','criticality','created_at','sla_due_at'], 'reports_sla_idx');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropIndex('reports_sla_idx');
            $table->dropColumn(['sla_due_at','sla_review_due_at','escalation_level','escalated_at','closed_reason','closed_category']);
        });
    }
};
