<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaction;
use App\Models\User;
use App\Services\WhatsAppService;
use Carbon\Carbon;

class CheckLateTransactions extends Command
{
    protected $signature = 'transactions:check-late';
    protected $description = 'Cek transaksi terlambat dan kirim notifikasi WA berulang ke User & Admin';

    public function handle()
    {
        $today = Carbon::today()->toDateString();
        $lateTransactions = Transaction::with('user')
            ->whereIn('status', ['dipinjam', 'disetujui', 'terlambat']) 
            ->whereDate('end_date', '<', $today) 
            ->get();

        if ($lateTransactions->isEmpty()) {
            $this->info('Aman: Tidak ada transaksi terlambat hari ini.');
            return;
        }

        $daftarTerlambatAdmin = "*[IMPORTANT] REKAP APD OVERDUE*\n\n"
                              . "Ada peminjaman APD yang sudah melewati batas waktu pengembalian:\n\n";
        $adaTerlambat = false;

        foreach ($lateTransactions as $trx) {
            if ($trx->status !== 'terlambat') {
                $trx->status = 'terlambat';
                $trx->save();
            }

            $user = $trx->user;
            $tglKembali = Carbon::parse($trx->end_date)->format('d M Y');

            if ($user && $user->phone) {
                $pesanPekerja = "*[SIAP-APD] PENGEMBALIAN APD TERLAMBAT*\n\n"
                              . "Halo {$user->name}, pengembalian APD kamu sudah melewati batas waktu (*{$tglKembali}*).\n\n"
                              . "Mohon segera kembalikan APD tersebut ke tim HSSE agar bisa diproses kembali.\n\n"
                              . "Kalau APD sudah dikembalikan, abaikan pesan ini. Terima kasih.";
                
                WhatsAppService::send($user->phone, $pesanPekerja);
            }

            if ($user) {
                $daftarTerlambatAdmin .= "- {$user->name} (Tenggat: {$tglKembali})\n";
                $adaTerlambat = true;
            }
        }

        if ($adaTerlambat) {
            $daftarTerlambatAdmin .= "\nAda pengembalian yang terlambat. Yuk, cek dashboard untuk melihat detailnya:\n"
                                    . url('/dashboard');

            $admins = User::where('role', 'admin')->whereNotNull('phone')->get();
            foreach ($admins as $admin) {
                WhatsAppService::send($admin->phone, $daftarTerlambatAdmin);
            }
        }

        $this->info("Selesai! " . $lateTransactions->count() . " notifikasi keterlambatan diproses.");
    }
}