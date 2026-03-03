<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('law_firms', function (Blueprint $table) {
            $table->string('contact_person_name')->nullable()->after('lawyers');
            $table->string('contact_person_role')->nullable()->after('contact_person_name');
            $table->string('contact_person_phone')->nullable()->after('contact_person_role');
            $table->string('contact_person_email')->nullable()->after('contact_person_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('law_firms', function (Blueprint $table) {
            $table->dropColumn(['contact_person_name', 'contact_person_role', 'contact_person_phone', 'contact_person_email']);
        });
    }
};
