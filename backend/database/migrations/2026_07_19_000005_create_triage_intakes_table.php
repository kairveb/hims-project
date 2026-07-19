<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('triage_intakes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('patient_name');
            $table->string('complaint')->nullable();
            $table->integer('level');
            $table->json('vitals')->nullable();
            $table->json('symptoms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('triage_intakes');
    }
};
