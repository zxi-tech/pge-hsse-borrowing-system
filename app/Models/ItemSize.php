<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemSize extends Model
{
    protected $fillable = [
        'item_id',
        'size_name',
        'stock',
        'status'
    ];

    // Relasi: Ukuran ini milik Satu Barang
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    // Relasi: Ukuran barang ini bisa ada di Banyak Detail Transaksi
    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }
}