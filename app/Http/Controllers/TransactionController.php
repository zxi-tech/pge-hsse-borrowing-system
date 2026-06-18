<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Exports\TransactionsExport;
use Maatwebsite\Excel\Facades\Excel;

class TransactionController extends Controller
{
    // 1. ACTIVE TRANSACTIONS BOARD
    public function index()
    {
        // Fetch transaksi yang statusnya masih 'on-going' (belum selesai/ditolak)
        $transactions = Transaction::with(['user', 'details.itemSize.item'])
            ->whereIn('status', ['menunggu', 'dipinjam', 'terlambat'])
            ->latest()
            ->get()
            ->map(function ($trx) {

                // Data Transformation: Flatten collection relasi details menjadi single string
                $itemsList = $trx->details->map(function ($detail) {
                    $itemName = $detail->itemSize->item->name;
                    $sizeName = $detail->itemSize->size_name;
                    $qty = $detail->quantity;
                    return "{$itemName} ({$sizeName}) x{$qty}";
                })->join(', ');

                return [
                    'raw_id' => $trx->id, // Diperlukan untuk endpoint update/delete
                    'id' => 'HSSE-' . Carbon::parse($trx->created_at)->format('Y') . str_pad($trx->id, 3, '0', STR_PAD_LEFT),
                    'name' => $trx->user->name ?? 'User Dihapus',
                    'nip' => $trx->user->nip ?? '-',
                    'department' => $trx->user->department ?? '-',
                    'items' => $itemsList,
                    'dates' => Carbon::parse($trx->start_date)->format('d M') . ' - ' . Carbon::parse($trx->end_date)->format('d M Y'),
                    'status' => $trx->status,
                    'purpose' => $trx->purpose,
                    'photo_proof' => $trx->photo_proof,
                    'notes' => $trx->notes, // Meneruskan field catatan/remark dari admin ke UI
                ];
            });

        return Inertia::render('Dashboard/Transactions', [
            'transactions' => $transactions
        ]);
    }

    // 2. TRANSACTION STATE MANAGER
    public function update(Request $request, $id)
    {
        // Validasi trigger action dari UI Admin
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,return',
            'notes' => 'nullable|string'
        ]);

        DB::beginTransaction();

        try {
            // Eager load details dan itemSize karena akan ada eksekusi mutasi stok
            $transaction = Transaction::with('details.itemSize')->findOrFail($id);

            // State Transition: Menunggu -> Dipinjam (Stok fisik sudah terpotong di BorrowController)
            if ($validated['action'] === 'approve') {
                $transaction->update([
                    'status' => 'dipinjam',
                    'notes' => $validated['notes']
                ]);
            
            // State Transition: Menunggu -> Ditolak (Stock Reversal)
            } elseif ($validated['action'] === 'reject') {
                $transaction->update([
                    'status' => 'ditolak',
                    'notes' => $validated['notes']
                ]);
                
                // Kembalikan/Reversal stok barang ke database karena pengajuan dibatalkan admin
                foreach ($transaction->details as $detail) {
                    $detail->itemSize->increment('stock', $detail->quantity);
                }
            
            // State Transition: Dipinjam -> Selesai (Stock Reversal)
            } elseif ($validated['action'] === 'return') {
                $transaction->update([
                    'status' => 'selesai',
                    'notes' => $validated['notes']
                ]);
                
                // Kembalikan/Reversal stok barang karena fisik APD sudah dipulangkan pekerja
                foreach ($transaction->details as $detail) {
                    $detail->itemSize->increment('stock', $detail->quantity);
                }
            }

            DB::commit();
            return back()->with('success', 'Status transaksi berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    // 3. TRANSACTION HISTORY BOARD
    public function history()
    {
        // Fetch transaksi yang lifecycle-nya sudah berakhir (Closed Tickets)
        $transactions = Transaction::with(['user', 'details.itemSize.item'])
            ->whereIn('status', ['selesai', 'ditolak'])
            ->latest()
            ->get()
            ->map(function ($trx) {

                // Data Transformation: Flatten collection relasi details menjadi single string
                $itemsList = $trx->details->map(function ($detail) {
                    $itemName = $detail->itemSize->item->name;
                    $sizeName = $detail->itemSize->size_name;
                    $qty = $detail->quantity;
                    return "{$itemName} ({$sizeName}) x{$qty}";
                })->join(', ');

                return [
                    'raw_id' => $trx->id,
                    'id' => 'HSSE-' . Carbon::parse($trx->created_at)->format('Y') . str_pad($trx->id, 3, '0', STR_PAD_LEFT),
                    'name' => $trx->user->name ?? 'User Dihapus',
                    'nip' => $trx->user->nip ?? '-',
                    'department' => $trx->user->department ?? '-',
                    'items' => $itemsList,
                    'dates' => Carbon::parse($trx->start_date)->format('d M') . ' - ' . Carbon::parse($trx->end_date)->format('d M Y'),
                    'status' => $trx->status,
                    'purpose' => $trx->purpose,
                    'photo_proof' => $trx->photo_proof, // 👈 TAMBAHKAN INI JUGA DI SINI
                    'notes' => $trx->notes, 
                ];
            });

        return Inertia::render('Dashboard/History', [
            'transactions' => $transactions
        ]);
    }

    // EXCEL EXPORTER GENERATOR
    public function exportExcel(Request $request)
    {
        // Init base query: Hanya export transaksi yang sudah final
        $query = \App\Models\Transaction::with(['user', 'details.itemSize.item'])
            ->whereIn('status', ['selesai', 'ditolak']);

        $type = $request->query('type', 'semua');

        // Dynamic Query Builder berdasarkan parameter filter waktu dari UI Admin
        if ($type === 'bulan_ini') {
            $query->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year);
        } elseif ($type === 'tahun_ini') {
            $query->whereYear('created_at', now()->year);
        } elseif ($type === 'custom' && $request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        $transactions = $query->latest()->get();

        // Generate file dengan timestamp agar file tidak menimpa satu sama lain saat di-download
        $fileName = 'Riwayat_Peminjaman_HSSE_' . date('Y-m-d_H-i') . '.xlsx';
        
        // Pass payload transaksi ke class logic Maatwebsite Excel
        return Excel::download(new TransactionsExport($transactions), $fileName);
    }
}