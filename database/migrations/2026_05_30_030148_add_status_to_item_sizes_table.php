<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('item_sizes', function (Blueprint $table) {
            // Menambahkan kolom status, posisinya ditaruh setelah kolom stock
            $table->string('status')->default('available')->after('stock');
        });
    }

    public function down(): void
    {
        Schema::table('item_sizes', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};