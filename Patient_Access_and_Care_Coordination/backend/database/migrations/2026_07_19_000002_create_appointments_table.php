<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->string('patient_name');
            $table->string('physician');
            $table->string('visit_type');
            $table->date('appt_date');
            $table->string('appt_time');
            $table->string('status')->default('Scheduled');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
