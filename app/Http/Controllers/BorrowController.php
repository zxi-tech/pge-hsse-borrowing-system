<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemSize;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class BorrowController extends Controller
{
    // =========================================================================
    // 1. MUNCULKAN HALAMAN FORM PENGAJUAN PINJAM (Ini yang tadi hilang!)
    // =========================================================================
    public function create()
    {
        // Ambil semua barang dari database beserta ukuran dan stoknya.
        // Kita hanya mengambil ukuran yang stoknya lebih dari 0.
        $items = Item::with(['sizes' => function ($query) {
            $query->where('stock', '>', 0);
        }])->get();

        return Inertia::render('Borrow/Create', [
            'items' => $items
        ]);
    }

    // =========================================================================
    // 2. MUNCULKAN HALAMAN STATUS PEMINJAMAN PEKERJA
    // =========================================================================
    public function index()
    {
        $transactions = Transaction::with(['details.itemSize.item'])
            ->where('user_id', Auth::id()) // HANYA AMBIL MILIK USER INI
            ->latest()
            ->get()
            ->map(function ($trx) {
                // Rangkai daftar barang
                $itemsList = $trx->details->map(function ($detail) {
                    $itemName = $detail->itemSize->item->name ?? 'Barang Dihapus';
                    $sizeName = $detail->itemSize->size_name ?? '-';
                    return "{$itemName} ({$sizeName}) x{$detail->quantity}";
                })->join(', ');

                return [
                    'id' => 'HSSE-' . Carbon::parse($trx->created_at)->format('Y') . str_pad($trx->id, 3, '0', STR_PAD_LEFT),
                    'items' => $itemsList,
                    'dates' => Carbon::parse($trx->start_date)->format('d M') . ' - ' . Carbon::parse($trx->end_date)->format('d M Y'),
                    'status' => $trx->status,
                    'purpose' => $trx->purpose,
                    'notes' => $trx->notes, // Alasan penolakan dari admin (jika ada)
                    'created_at' => $trx->created_at,
                ];
            });

        return Inertia::render('Borrow/Status', [
            'transactions' => $transactions
        ]);
    }

    // =========================================================================
    // 3. SIMPAN PENGAJUAN PINJAMAN & POTONG STOK SEMENTARA
    // =========================================================================
    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'purpose' => 'required|string',
            'selected_items' => 'required|array'
        ]);
        
        DB::beginTransaction();

        try {
            // Kita gunakan cara 'new' agar terhindar dari blokir Mass Assignment
            $transaction = new Transaction();
            $transaction->user_id = Auth::id();
            $transaction->start_date = $request->start_date;
            $transaction->end_date = $request->end_date;
            $transaction->purpose = $request->purpose;
            $transaction->status = 'menunggu';
            $transaction->save();

            foreach ($request->selected_items as $itemId => $sizes) {
                foreach ($sizes as $sizeId => $quantity) {
                    if ($quantity > 0) {
                        $itemSize = ItemSize::lockForUpdate()->findOrFail($sizeId);

                        if ($itemSize->stock < $quantity) {
                            throw new \Exception("Maaf, stok {$itemSize->item->name} tidak mencukupi.");
                        }

                        // Gunakan cara 'new' untuk Detail Transaksi
                        $detail = new TransactionDetail();
                        $detail->transaction_id = $transaction->id;
                        $detail->item_size_id = $sizeId;
                        $detail->quantity = $quantity;
                        $detail->save();

                        $itemSize->decrement('stock', $quantity);
                    }
                }
            }

            DB::commit();
            return redirect()->route('borrow.status')->with('success', 'Pengajuan berhasil dikirim! Menunggu persetujuan Admin.');
        } catch (\Exception $e) {
            DB::rollBack();

            // PAKSA LEMPAR ERROR VALIDASI AGAR REACT BISA MENANGKAPNYA
            throw \Illuminate\Validation\ValidationException::withMessages([
                'selected_items' => 'Sistem Gagal Menyimpan: ' . $e->getMessage()
            ]);
        }
    }
}
