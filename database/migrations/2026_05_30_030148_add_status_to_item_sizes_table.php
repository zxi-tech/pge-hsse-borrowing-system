<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Cek dulu, kalau sudah ada, biarkan saja dan jangan error
        if (!Schema::hasColumn('item_sizes', 'status')) {
            Schema::table('item_sizes', function (Blueprint $table) {
                $table->string('status')->default('available')->after('stock');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('item_sizes', 'status')) {
            Schema::table('item_sizes', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};