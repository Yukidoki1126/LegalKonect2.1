<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration expands column sizes to accommodate AES-256 encrypted data.
     * Encrypted strings are significantly longer than plain text (typically 200-500+ chars).
     * 
     * Changes VARCHAR(255) to TEXT for encrypted fields:
     * - clients: phone, address
     * - law_firms: license_number, phone, address, contact_person_phone, contact_person_email
     * - appointments: notes, cancellation_reason (already TEXT)
     */
    public function up(): void
    {
        // Update clients table
        Schema::table('clients', function (Blueprint $table) {
            $table->text('phone')->nullable()->change();
            $table->text('address')->nullable()->change();
        });

        // Update law_firms table
        Schema::table('law_firms', function (Blueprint $table) {
            $table->text('license_number')->nullable()->change();
            $table->text('phone')->nullable()->change();
            $table->text('address')->nullable()->change();
            $table->text('contact_person_phone')->nullable()->change();
            $table->text('contact_person_email')->nullable()->change();
        });

        // Appointments table already uses TEXT for notes and cancellation_reason
        // No changes needed for appointments
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert clients table (WARNING: may truncate data if encrypted values exist)
        Schema::table('clients', function (Blueprint $table) {
            $table->string('phone')->nullable()->change();
            $table->string('address')->nullable()->change();
        });

        // Revert law_firms table (WARNING: may truncate data if encrypted values exist)
        Schema::table('law_firms', function (Blueprint $table) {
            $table->string('license_number')->nullable()->change();
            $table->string('phone')->nullable()->change();
            $table->string('address')->nullable()->change();
            $table->string('contact_person_phone')->nullable()->change();
            $table->string('contact_person_email')->nullable()->change();
        });
    }
};
