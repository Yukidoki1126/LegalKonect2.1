<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('law_firms', function (Blueprint $table) {
            $table->string('profile_image')->nullable()->after('verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('law_firms', function (Blueprint $table) {
            $table->dropColumn('profile_image');
        });
    }
};
