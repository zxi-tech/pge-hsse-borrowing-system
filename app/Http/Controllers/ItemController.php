<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemSize;
use App\Models\IncomingItem; // 👈 Wajib ditambahkan untuk log otomatis
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth; // 👈 Wajib ditambahkan untuk mengambil ID Admin

class ItemController extends Controller
{
    /**
     * Menampilkan halaman Manajemen Barang (Dashboard/Items.jsx)
     */
    public function index()
    {
        $items = Item::with('sizes')->latest()->get();

        return Inertia::render('Dashboard/Items', [
            'items' => $items
        ]);
    }

    /**
     * Menyimpan data barang baru ke database beserta foto dan varian ukurannya
     */
    public function store(Request $request)
    {
        // 1. Tambahkan validasi warehouse di sini
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:asset,consumable',
            'warehouse' => 'required|string|max:255', // 👈 Penambahan validasi gudang
            'description' => 'nullable|string',
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
            'sizes' => 'required|array|min:1',
            'sizes.*.size_name' => 'required|string|max:50',
            'sizes.*.stock' => 'required|integer|min:0',
        ]);

        DB::beginTransaction();

        try {
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('items', 'public');
            }

            // 2. Simpan nama gudang ke tabel items
            $item = Item::create([
                'name' => $validated['name'],
                'type' => $validated['type'],
                'warehouse' => $validated['warehouse'], // 👈 Simpan ke database
                'description' => $validated['description'],
                'photo_path' => $photoPath,
            ]);

            foreach ($validated['sizes'] as $size) {
                ItemSize::create([
                    'item_id' => $item->id,
                    'size_name' => $size['size_name'],
                    'stock' => $size['stock'],
                ]);

                if ($size['stock'] > 0) {
                    IncomingItem::create([
                        'item_id' => $item->id,
                        'user_id' => Auth::id(),
                        'quantity' => $size['stock'],
                        'received_date' => now()->toDateString(),
                        'warehouse' => $item->warehouse, // 👈 Ambil nama gudang dari item
                        'notes' => "AUTO-LOG: Barang baru ditambahkan (Varian: {$size['size_name']}).",
                    ]);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Barang dan stok berhasil ditambahkan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    /**
     * Mengupdate data barang yang sudah ada & Mencatat Jejak Otomatis
     */
    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);

        // 1. Tambahkan validasi warehouse di sini
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:asset,consumable',
            'warehouse' => 'required|string|max:255', // 👈 Penambahan validasi gudang
            'description' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'sizes' => 'required|array|min:1',
            'sizes.*.id' => 'nullable|integer',
            'sizes.*.size_name' => 'required|string|max:50',
            'sizes.*.stock' => 'required|integer|min:0',
        ]);

        DB::beginTransaction();

        try {
            if ($request->hasFile('photo')) {
                if ($item->photo_path) {
                    Storage::disk('public')->delete($item->photo_path);
                }
                $item->photo_path = $request->file('photo')->store('items', 'public');
            }

            // 2. Update data gudang di database
            $item->name = $validated['name'];
            $item->type = $validated['type'];
            $item->warehouse = $validated['warehouse']; // 👈 Update data gudang
            $item->description = $validated['description'];
            $item->save();

            $submittedSizeIds = collect($validated['sizes'])->pluck('id')->filter()->toArray();
            $item->sizes()->whereNotIn('id', $submittedSizeIds)->delete();

            // 👇 INI ADALAH LOGIKA DETEKTOR JEJAK OTOMATISNYA 👇
            foreach ($validated['sizes'] as $sizeData) {
                if (isset($sizeData['id'])) {
                    // Cek stok lama di database
                    $oldSize = ItemSize::find($sizeData['id']);

                    if ($oldSize) {
                        $selisih = $sizeData['stock'] - $oldSize->stock;

                        // Jika stok BARU lebih besar dari stok LAMA = Ada barang masuk!
                        if ($selisih > 0) {
                            IncomingItem::create([
                                'item_id' => $item->id,
                                'user_id' => Auth::id(),
                                'quantity' => $selisih,
                                'received_date' => now()->toDateString(),
                                'warehouse' => $item->warehouse, // 👈 Ambil otomatis dari item yang sedang diedit
                                'notes' => "AUTO-LOG: Edit stok varian [{$sizeData['size_name']}]. Stok awal: {$oldSize->stock}, ditambah: {$selisih}.",
                            ]);
                        }

                        // Update datanya
                        $oldSize->update([
                            'size_name' => $sizeData['size_name'],
                            'stock' => $sizeData['stock'],
                        ]);
                    }
                } else {
                    // Admin menambahkan Varian Ukuran BARU saat edit barang
                    if ($sizeData['stock'] > 0) {
                        IncomingItem::create([
                            'item_id' => $item->id,
                            'user_id' => Auth::id(),
                            'quantity' => $sizeData['stock'],
                            'received_date' => now()->toDateString(),
                            'warehouse' => $item->warehouse, // 👈 Ambil otomatis dari item yang sedang diedit
                            'notes' => "AUTO-LOG: Varian baru [{$sizeData['size_name']}] ditambahkan dari menu edit.",
                        ]);
                    }

                    ItemSize::create([
                        'item_id' => $item->id,
                        'size_name' => $sizeData['size_name'],
                        'stock' => $sizeData['stock'],
                    ]);
                }
            }
            // 👆 SELESAI 👆

            DB::commit();
            return redirect()->back()->with('success', 'Data barang berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal mengupdate data: ' . $e->getMessage()]);
        }
    }

    /**
     * Menghapus data barang
     */
    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $item = Item::findOrFail($id);

            // 1. Hapus foto dari server agar tidak jadi sampah (makan storage)
            if ($item->photo_path) {
                Storage::disk('public')->delete($item->photo_path);
            }

            // 2. Hapus semua ukuran/sizes yang terikat
            $item->sizes()->delete();

            // 3. Hapus log riwayat barang masuk (IncomingItems) yang terikat dengan barang ini
            \App\Models\IncomingItem::where('item_id', $item->id)->delete();

            // 4. Eksekusi hapus barang utama
            $item->delete();

            DB::commit();

            // Gunakan flash session 'success' (biasanya ditangkap oleh AdminLayout)
            return redirect()->back()->with('success', 'Data barang beserta log riwayatnya berhasil dihapus permanen!');
        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();

            // Error Code 23000: Foreign Key Constraint (Biasanya karena barang masih ada di tabel Borrowings)
            if ($e->getCode() == '23000') {
                // Pakai flash 'error' agar muncul pop-up merah di frontend
                return redirect()->back()->with('error', 'GAGAL: Barang ini sudah pernah dipinjam oleh pegawai. Tidak dapat dihapus permanen!');
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan database: ' . $e->getMessage());
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}
