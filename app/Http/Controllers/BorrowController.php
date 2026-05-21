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
    // Render form pengajuan pinjaman APD via Inertia
    public function create()
    {
        // Fetch master data barang beserta sizes.
        $items = Item::with(['sizes' => function ($query) {
            $query->where('stock', '>', 0);
        }])->get();

        return Inertia::render('Borrow/Create', [
            'items' => $items
        ]);
    }

    // Load history transaksi khusus untuk user yang sedang login
    public function index()
    {
        $transactions = Transaction::with(['details.itemSize.item'])
            ->where('user_id', Auth::id()) // Data isolation
            ->latest()
            ->get()
            ->map(function ($trx) {
                $itemsList = $trx->details->map(function ($detail) {
                    $itemName = $detail->itemSize->item->name ?? 'Barang Dihapus';
                    $sizeName = $detail->itemSize->size_name ?? '-';
                    return "{$itemName} ({$sizeName}) x{$detail->quantity}";
                })->join(', ');

                return [
                    // Generate custom transaction ID (Format: HSSE-YYYY000)
                    'id' => 'HSSE-' . Carbon::parse($trx->created_at)->format('Y') . str_pad($trx->id, 3, '0', STR_PAD_LEFT),
                    'items' => $itemsList,
                    'dates' => Carbon::parse($trx->start_date)->format('d M') . ' - ' . Carbon::parse($trx->end_date)->format('d M Y'),
                    'status' => $trx->status,
                    'purpose' => $trx->purpose,
                    'notes' => $trx->notes,
                    'created_at' => $trx->created_at,
                ];
            });

        return Inertia::render('Borrow/Status', [
            'transactions' => $transactions
        ]);
    }

    // Handle penyimpanan transaksi baru dan pengurangan stok secara atomic
    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'purpose' => 'required|string',
            'selected_items' => 'required|array'
        ]);

        // Memulai DB Transaction agar jika terjadi error (misal: gagal validasi stok), 
        // semua insert dan update data akan di-rollback tanpa sisa.
        DB::beginTransaction();

        try {
            // Instansiasi model manual untuk bypass proteksi Mass Assignment ($fillable)
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

            // Ubah Exception sistem menjadi ValidationException
            throw \Illuminate\Validation\ValidationException::withMessages([
                'selected_items' => 'Sistem Gagal Menyimpan: ' . $e->getMessage()
            ]);
        }
    }
}