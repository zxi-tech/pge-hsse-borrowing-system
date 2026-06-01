<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ItemSize;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Hitung total entitas pekerja aktif (mengabaikan role admin) untuk summary metric
        $totalUsers = User::where('role', '!=', 'admin')->count();

        // Agregasi total kuantitas fisik APD dari tabel item_sizes
        $totalItems = ItemSize::sum('stock');

        // Count transaksi on-going (barang fisik sedang berada di tangan pekerja)
        $borrowedItems = Transaction::where('status', 'dipinjam')->count();

        // Count backlog pengajuan yang masih memerlukan review/approval dari Admin
        $pendingTransactions = Transaction::where('status', 'menunggu')->count();

        // Identifikasi transaksi overdue: status masih 'dipinjam' tapi melebihi end_date (deadline)
        $lateTransactions = Transaction::where('status', 'dipinjam')
            ->where('end_date', '<', Carbon::today())
            ->count();

        // Fetch 5 transaksi terbaru untuk komponen Quick View Table.
        // Eager loading relasi (user, details.itemSize.item) digunakan untuk mencegah N+1 Query Problem.
        $recentTransactions = Transaction::with(['user', 'details.itemSize.item'])
            ->latest()
            ->take(5)
            ->get();

        // TIMESERIES CHART LOGIC (6 Bulan Terakhir)
        $chartData = [];
        
        for ($i = 5; $i >= 0; $i--) {
            // Loop mundur dari 5 bulan lalu hingga bulan berjalan
            $date = Carbon::now()->subMonths($i);

            // Kalkulasi transaksi on-track (tepat waktu / sedang berjalan / pending) bulan ini
            $tepatWaktu = Transaction::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->whereIn('status', ['selesai', 'dipinjam', 'menunggu'])
                ->count();

            // Kalkulasi transaksi dengan flagging 'terlambat' bulan ini
            $terlambat = Transaction::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->where('status', 'terlambat')
                ->count();

            // Mapping array properties disesuaikan dengan kebutuhan format data <LineChart> Recharts di React
            $chartData[] = [
                'name' => $date->translatedFormat('M'), // Output: Jan, Feb, Mar, dst.
                'tepatWaktu' => $tepatWaktu,
                'terlambat' => $terlambat,
            ];
        }

        // Return seluruh payload via Inertia adapter
        return Inertia::render('Dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalItems' => $totalItems,
                'borrowedItems' => $borrowedItems,
                'pendingTransactions' => $pendingTransactions,
                'lateTransactions' => $lateTransactions,
            ],
            'recentTransactions' => $recentTransactions,
            'chartData' => $chartData
        ]);
    }
}