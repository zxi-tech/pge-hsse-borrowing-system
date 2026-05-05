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
        Schema::table('users', function (Blueprint $table) {
            // Menambahkan kolom 'about' dengan tipe teks, boleh kosong, ditempatkan setelah kolom 'department'
            if (!Schema::hasColumn('users', 'about')) {
                $table->text('about')->nullable()->after('department');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Menghapus kolom 'about' jika kita melakukan rollback
            if (Schema::hasColumn('users', 'about')) {
                $table->dropColumn('about');
            }
        });
    }
};
