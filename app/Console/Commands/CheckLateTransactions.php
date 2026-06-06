<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CheckLateTransactions extends Command
{
    protected $signature = 'transactions:check-late';

    protected $description = 'Cek dan update otomatis status transaksi yang melewati batas waktu pengembalian menjadi terlambat';

    public function handle()
    {
        $today = Carbon::today()->toDateString(); 
        $updated = DB::table('transactions')
            ->whereIn('status', ['dipinjam', 'disetujui'])
            ->whereDate('end_date', '<', $today)
            ->update(['status' => 'terlambat']);

        $this->info("Selesai! {$updated} transaksi telah diubah statusnya menjadi terlambat.");
    }
}