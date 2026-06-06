<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncomingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'user_id',
        'quantity',
        'received_date',
        'notes',
    ];

    // Relasi: Log Barang Masuk ini milik 1 Barang (Item)
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    // Relasi: Log Barang Masuk ini dicatat oleh 1 Admin (User)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
