<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nip' => '123456789',
            'name' => 'Admin HSSE',
            'email' => 'admin.hsse@pertamina.com',
            'phone' => '081234567890',
            'role' => 'admin',
            'password' => Hash::make('password123'),
            'email_verified_at' => Carbon::now(),
            'wa_verified_at' => Carbon::now(),
        ]);
    }
}