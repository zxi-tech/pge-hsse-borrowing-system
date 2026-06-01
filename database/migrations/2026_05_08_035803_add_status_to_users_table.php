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
        // Pengecekan dilakukan DI LUAR closure Blueprint agar lebih aman
        if (!Schema::hasColumn('users', 'status')) {
            Schema::table('users', function (Blueprint $table) {
                // Menambahkan kolom status dengan nilai default 'Aktif'
                $table->string('status', 50)->default('Aktif')->after('role');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'status')) {
            Schema::table('users', function (Blueprint $table) {
                // Menghapus kolom status jika migration dibatalkan (rollback)
                $table->dropColumn('status');
            });
        }
    }
};