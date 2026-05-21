<?php

namespace App\Http\Controllers;

use App\Models\IncomingItem;
use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class IncomingItemController extends Controller
{
    public function index()
    {
        // Fetch incoming item logs dengan eager loading (item, user) 
        $incomingItems = IncomingItem::with(['item', 'user'])->latest()->get();

        $items = Item::all();

        return Inertia::render('Dashboard/IncomingItems', [
            'incomingItems' => $incomingItems,
            'items' => $items
        ]);
    }

    // Handle proses pencatatan barang masuk & penambahan stok
    public function store(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'received_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Insert record ke tabel log (incoming_items) sebagai audit trail.
        // ID Admin (user_id) diambil otomatis dari session untuk tracking akuntabilitas.
        IncomingItem::create([
            'item_id' => $request->item_id,
            'user_id' => Auth::id(),
            'quantity' => $request->quantity,
            'received_date' => $request->received_date,
            'notes' => $request->notes,
        ]);

        // Atomic update: langsung increment total stok di tabel master items
        // Menggunakan method increment() agar query langsung dieksekusi di level database
        $item = Item::findOrFail($request->item_id);
        $item->increment('stock', $request->quantity);

        return redirect()->back()->with('message', 'Riwayat barang masuk berhasil dicatat dan stok bertambah!');
    }
}