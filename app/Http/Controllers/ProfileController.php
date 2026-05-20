<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();
        $viewName = $user->role === 'admin' ? 'Profile/EditAdmin' : 'Profile/EditUser';

        $stats = [
            ['label' => 'Barang Dipinjam', 'value' => $user->transactions()->whereIn('status', ['dipinjam', 'disetujui'])->count()],
            ['label' => 'Menunggu Persetujuan', 'value' => $user->transactions()->where('status', 'menunggu')->count()],
            ['label' => 'Riwayat Peminjaman', 'value' => $user->transactions()->count()],
        ];

        return Inertia::render($viewName, [
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),
            'stats' => $stats,
            // 👇 KITA CEK LANGSUNG KE DALAM SESSION (Sangat Akurat) 👇
            'requires_email_otp' => Session::has('pending_email_change'),
            'pending_email' => Session::get('pending_email_change'),
            'requires_phone_otp' => Session::has('pending_phone_change'),
            'pending_phone' => Session::get('pending_phone_change'),
        ]);
    }

    public function update(\Illuminate\Http\Request $request)
    {
        $user = $request->user();

        // 1. Validasi Manual (TAMBAHKAN NIP DAN ABOUT DI SINI)
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'nip'   => ['required', 'string', 'max:50'], // NIP ditambahkan
            'email' => ['required', 'string', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'phone' => ['required', 'string', 'max:20'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'about' => ['nullable', 'string'], // ABOUT ditambahkan
        ]);

        $newEmail = $validated['email'];
        $newPhone = $validated['phone'];

        $emailChanged = $newEmail !== $user->email;
        $phoneChanged = $newPhone !== $user->phone;

        // 2. Simpan Data Aman (Nama, NIP, About & Foto)
        $user->name  = $validated['name'];
        $user->nip   = $validated['nip'];   // Simpan NIP
        $user->about = $validated['about']; // Simpan About

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->photo);
            }
            $user->photo = $request->file('photo')->store('profiles', 'public');
        }
        
        $user->save();

        // 3. TAHAN JIKA ADA PERUBAHAN EMAIL ATAU WHATSAPP!
        if ($emailChanged || $phoneChanged) {

            if ($emailChanged) {
                $emailOtp = rand(100000, 999999);
                Session::put('pending_email_change', $newEmail);
                Session::put('email_change_otp', $emailOtp);
                Log::info("SECURITY SPB-HSSE: OTP Ganti Email [{$newEmail}] : {$emailOtp}");
            }

            if ($phoneChanged) {
                $phoneOtp = rand(100000, 999999);
                Session::put('pending_phone_change', $newPhone);
                Session::put('phone_change_otp', $phoneOtp);
                Log::info("SECURITY SPB-HSSE: OTP Ganti WhatsApp [{$newPhone}] : {$phoneOtp}");
            }

            // Kembalikan ke halaman dengan status khusus agar modal terbuka
            return Redirect::route('profile.edit')->with('status', 'otp-sent');
        }

        // 4. Jika hanya ganti nama/foto/nip/about, langsung sukses
        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    public function verifyEmailChange(Request $request)
    {
        $request->validate(['otp' => 'required|numeric|digits:6']);

        if ($request->otp == Session::get('email_change_otp') && Session::has('pending_email_change')) {
            $user = $request->user();
            $user->email = Session::get('pending_email_change');
            $user->email_verified_at = now();
            $user->save();

            Session::forget(['email_change_otp', 'pending_email_change']);

            // Jika WA juga diganti bersamaan, munculkan lagi modal untuk WA
            if (Session::has('pending_phone_change')) {
                return Redirect::route('profile.edit')->with('status', 'otp-sent');
            }
            return Redirect::route('profile.edit')->with('status', 'profile-updated');
        }
        return redirect()->back()->withErrors(['otp' => 'Kode OTP Email salah.']);
    }

    public function verifyPhoneChange(Request $request)
    {
        $request->validate(['otp' => 'required|numeric|digits:6']);

        if ($request->otp == Session::get('phone_change_otp') && Session::has('pending_phone_change')) {
            $user = $request->user();
            $user->phone = Session::get('pending_phone_change');
            $user->wa_verified_at = now();
            $user->save();

            Session::forget(['phone_change_otp', 'pending_phone_change']);

            // Jika Email juga diganti bersamaan, munculkan lagi modal untuk Email
            if (Session::has('pending_email_change')) {
                return Redirect::route('profile.edit')->with('status', 'otp-sent');
            }
            return Redirect::route('profile.edit')->with('status', 'profile-updated');
        }
        return redirect()->back()->withErrors(['otp' => 'Kode OTP WhatsApp salah.']);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);
        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return Redirect::to('/');
    }
}
