<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->decimal('preferred_min_rating', 2, 1)->nullable()->after('phone');
            $table->integer('preferred_max_distance')->nullable()->after('preferred_min_rating');
            $table->string('preferred_experience')->nullable()->after('preferred_max_distance');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['preferred_min_rating', 'preferred_max_distance', 'preferred_experience']);
        });
    }
};
