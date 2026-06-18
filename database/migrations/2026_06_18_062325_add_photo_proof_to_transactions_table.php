<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Menambahkan kolom photo_proof setelah kolom purpose
            $table->string('photo_proof')->nullable()->after('purpose');
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Menghapus kolom jika di-rollback
            $table->dropColumn('photo_proof');
        });
    }
};