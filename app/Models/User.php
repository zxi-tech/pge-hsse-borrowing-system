<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'nip',
        'phone',      
        'department',   
        'role',         
        'area',         
        'about',        
        'photo',        
        'status',       
        'email_otp',        
        'phone_otp',         
        'email_verified_at',
        'phone_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'wa_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relasi: Satu User punya Satu data OTP aktif
    public function otp()
    {
        return $this->hasOne(Otp::class);
    }

    // Relasi: Satu User bisa melakukan Banyak Transaksi peminjaman
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
