<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BorrowController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\IncomingItemController;
use App\Http\Controllers\StatisticsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Grup Rute Publik (Akses Tanpa Autentikasi)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

Route::post('/contact-message', [\App\Http\Controllers\ContactMessageController::class, 'store'])->name('contact.store');


// Lapisan 1: Autentikasi Dasar (Diperlukan untuk proses verifikasi kredensial)
Route::middleware('auth')->group(function () {
    // Pemrosesan Verifikasi OTP Pengguna
    Route::get('/verify-email-otp', [OtpController::class, 'verifyEmailView'])->name('verification.notice');
    Route::post('/verify-email-otp', [OtpController::class, 'verifyEmail'])->name('otp.email.verify');
    Route::get('/verify-whatsapp-otp', [OtpController::class, 'verifyPhoneView'])->name('otp.phone.view');
    Route::post('/verify-whatsapp-otp', [OtpController::class, 'verifyPhone'])->name('otp.phone.verify');

    // Manajemen Inventori Barang Masuk
    Route::get('/admin/incoming-items', [IncomingItemController::class, 'index'])->name('admin.incoming-items.index');
    Route::post('/admin/incoming-items', [IncomingItemController::class, 'store'])->name('admin.incoming-items.store');
});


// Lapisan 2: Akses Pekerja (Memerlukan Autentikasi dan Lulus Verifikasi OTP)
Route::middleware(['auth', 'verified'])->group(function () {
    // Manajemen Profil Pengguna
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Verifikasi Perubahan Kontak Pengguna
    Route::post('/profile/verify-email-change', [ProfileController::class, 'verifyEmailChange'])->name('profile.verify-email-change');
    Route::post('/profile/verify-phone-change', [ProfileController::class, 'verifyPhoneChange'])->name('profile.verify-phone-change');

    // Fitur Utama Pekerja (Pengajuan dan Pemantauan Status Peminjaman)
    Route::get('/borrow/create', [BorrowController::class, 'create'])->name('borrow.create');
    Route::post('/borrow', [BorrowController::class, 'store'])->name('borrow.store');
    Route::get('/borrow/status', [BorrowController::class, 'index'])->name('borrow.status');
});


// Lapisan 3: Akses Admin HSSE (Memerlukan Autentikasi, Verifikasi, dan Hak Akses Admin)
Route::middleware(['auth', 'verified', 'admin'])->group(function () {

    // Dashboard Interaktif Admin
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Manajemen Katalog Barang (CRUD)
    Route::get('/items', [ItemController::class, 'index'])->name('items.index');
    Route::post('/items', [ItemController::class, 'store'])->name('items.store');
    Route::put('/items/{id}', [ItemController::class, 'update'])->name('items.update');
    Route::delete('/items/{id}', [ItemController::class, 'destroy'])->name('items.destroy');

    // Eksekusi dan Persetujuan Transaksi Peminjaman
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::put('/transactions/{id}', [TransactionController::class, 'update'])->name('transactions.update');

    // Ekspor Data Transaksi ke Format Excel
    Route::get('/admin/transactions/export', [\App\Http\Controllers\TransactionController::class, 'exportExcel'])->name('transactions.export');

    // Arsip dan Riwayat Transaksi Selesai
    Route::get('/history', [TransactionController::class, 'history'])->name('history.index');

    // Manajemen Akun Pengguna
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::put('/users/{id}', [\App\Http\Controllers\UserController::class, 'update'])->name('users.update');

    // Akses Kredensial Khusus Pengembang (Developer Backdoor)
    Route::get('/admin/users/secret-create', [UserController::class, 'secretCreate'])->name('users.secret-create');
    Route::post('/admin/users/secret-store', [UserController::class, 'secretStore'])->name('users.secret-store');

    // Manajemen Kotak Masuk Pesan Pengguna
    Route::get('/messages', [\App\Http\Controllers\ContactMessageController::class, 'index'])->name('messages.index');
    Route::put('/messages/{id}/read', [\App\Http\Controllers\ContactMessageController::class, 'markAsRead'])->name('messages.read');
    Route::delete('/messages/{id}', [\App\Http\Controllers\ContactMessageController::class, 'destroy'])->name('messages.destroy');

    // Modul Statistik dan Pelaporan
    Route::get('/admin/statistics/export', [StatisticsController::class, 'export'])->name('statistics.export');
    Route::get('/admin/statistics', [StatisticsController::class, 'index'])->name('statistics.index');
});

require __DIR__ . '/auth.php';