<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemSize;
use App\Models\IncomingItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ItemController extends Controller
{
    public function index()
    {
        $items = Item::with('sizes')->latest()->get();

        return Inertia::render('Dashboard/Items', [
            'items' => $items
        ]);
    }

    // Insert master data barang baru (beserta foto dan multi-variant sizing)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:asset,consumable',
            'warehouse' => 'required|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
            'sizes' => 'required|array|min:1',
            'sizes.*.size_name' => 'required|string|max:50',
            'sizes.*.stock' => 'required|integer|min:0',
            'sizes.*.status' => 'nullable|string|in:available,laundry,maintenance', // 👈 Validasi status
        ]);

        // Wrap dalam DB transaction untuk menjaga integritas data relasional (Item -> ItemSize -> IncomingItem)
        DB::beginTransaction();

        try {
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('items', 'public');
            }

            $item = Item::create([
                'name' => $validated['name'],
                'type' => $validated['type'],
                'warehouse' => $validated['warehouse'],
                'description' => $validated['description'],
                'photo_path' => $photoPath,
            ]);

            // Batch insert data varian (ukuran/size) ke tabel relasi
            foreach ($validated['sizes'] as $size) {
                ItemSize::create([
                    'item_id' => $item->id,
                    'size_name' => $size['size_name'],
                    'stock' => $size['stock'],
                    'status' => $size['status'] ?? 'available', // 👈 Simpan status
                ]);

                // Auto-generate audit trail (IncomingItem) jika input awal memiliki stok > 0
                if ($size['stock'] > 0) {
                    IncomingItem::create([
                        'item_id' => $item->id,
                        'user_id' => Auth::id(),
                        'quantity' => $size['stock'],
                        'received_date' => now()->toDateString(),
                        'warehouse' => $item->warehouse,
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

    // Handle update data barang beserta detektor mutasi stok otomatis
    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:asset,consumable',
            'warehouse' => 'required|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'sizes' => 'required|array|min:1',
            'sizes.*.id' => 'nullable|integer',
            'sizes.*.size_name' => 'required|string|max:50',
            'sizes.*.stock' => 'required|integer|min:0',
            'sizes.*.status' => 'nullable|string|in:available,laundry,maintenance', // 👈 Validasi status
        ]);

        DB::beginTransaction();

        try {
            // Hapus physical file lama sebelum upload file baru (Orphan file prevention)
            if ($request->hasFile('photo')) {
                if ($item->photo_path) {
                    Storage::disk('public')->delete($item->photo_path);
                }
                $item->photo_path = $request->file('photo')->store('items', 'public');
            }

            $item->name = $validated['name'];
            $item->type = $validated['type'];
            $item->warehouse = $validated['warehouse'];
            $item->description = $validated['description'];
            $item->save();

            // Syncing Relasi: Hapus varian ukuran yang di-remove oleh admin dari frontend
            $submittedSizeIds = collect($validated['sizes'])->pluck('id')->filter()->toArray();
            $item->sizes()->whereNotIn('id', $submittedSizeIds)->delete();

            // STOCK MUTATION DETECTOR & AUTO-LOGGING
            // Mengidentifikasi delta/selisih perubahan stok saat diedit
            foreach ($validated['sizes'] as $sizeData) {
                if (isset($sizeData['id'])) {
                    $oldSize = ItemSize::find($sizeData['id']);

                    if ($oldSize) {
                        $selisih = $sizeData['stock'] - $oldSize->stock;

                        // Trigger pembuatan log mutasi HANYA JIKA ada penambahan stok riil (Delta positif)
                        if ($selisih > 0) {
                            IncomingItem::create([
                                'item_id' => $item->id,
                                'user_id' => Auth::id(),
                                'quantity' => $selisih,
                                'received_date' => now()->toDateString(),
                                'warehouse' => $item->warehouse,
                                'notes' => "AUTO-LOG: Edit stok varian [{$sizeData['size_name']}]. Stok awal: {$oldSize->stock}, ditambah: {$selisih}.",
                            ]);
                        }

                        // Update data ukuran lama yang sudah ada di database
                        $oldSize->update([
                            'size_name' => $sizeData['size_name'],
                            'stock' => $sizeData['stock'],
                            'status' => $sizeData['status'] ?? 'available', // 👈 Update status
                        ]);
                    }
                } else {
                    // Jika ini adalah penambahan varian ukuran BARU saat di halaman edit
                    if ($sizeData['stock'] > 0) {
                        IncomingItem::create([
                            'item_id' => $item->id,
                            'user_id' => Auth::id(),
                            'quantity' => $sizeData['stock'],
                            'received_date' => now()->toDateString(),
                            'warehouse' => $item->warehouse,
                            'notes' => "AUTO-LOG: Varian baru [{$sizeData['size_name']}] ditambahkan dari menu edit.",
                        ]);
                    }

                    ItemSize::create([
                        'item_id' => $item->id,
                        'size_name' => $sizeData['size_name'],
                        'stock' => $sizeData['stock'],
                        'status' => $sizeData['status'] ?? 'available', // 👈 Simpan status varian baru
                    ]);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Data barang berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal mengupdate data: ' . $e->getMessage()]);
        }
    }

    // Hard delete data barang beserta cascade dependency-nya
    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $item = Item::findOrFail($id);

            // Storage cleanup
            if ($item->photo_path) {
                Storage::disk('public')->delete($item->photo_path);
            }

            // Cascade delete dependent relation manual (sizes & incoming item logs)
            $item->sizes()->delete();
            \App\Models\IncomingItem::where('item_id', $item->id)->delete();

            // Eksekusi hard delete object master
            $item->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Data barang beserta log riwayatnya berhasil dihapus permanen!');
        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();

            // Cegah aplikasi crash akibat SQL Error 23000 (Integrity Constraint Violation)
            if ($e->getCode() == '23000') {
                return redirect()->back()->with('error', 'GAGAL: Barang ini sudah pernah dipinjam oleh pegawai. Tidak dapat dihapus permanen demi integritas data laporan!');
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan database: ' . $e->getMessage());
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}