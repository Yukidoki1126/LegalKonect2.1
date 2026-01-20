<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('law_firm_specializations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('law_firm_id')->constrained()->onDelete('cascade');
            $table->foreignId('specialization_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['law_firm_id', 'specialization_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('law_firm_specializations');
    }
};
