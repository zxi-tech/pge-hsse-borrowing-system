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
    // Render UI Edit Profil dinamis berdasarkan role user
    public function edit(Request $request)
    {
        $user = $request->user();
        $viewName = $user->role === 'admin' ? 'Profile/EditAdmin' : 'Profile/EditUser';

        // Kalkulasi real-time user metrics untuk ditampilkan di UI
        $stats = [
            ['label' => 'Barang Dipinjam', 'value' => $user->transactions()->whereIn('status', ['dipinjam', 'disetujui'])->count()],
            ['label' => 'Menunggu Persetujuan', 'value' => $user->transactions()->where('status', 'menunggu')->count()],
            ['label' => 'Riwayat Peminjaman', 'value' => $user->transactions()->count()],
        ];

        return Inertia::render($viewName, [
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),
            'stats' => $stats,
            // Inject session flags ke frontend untuk men-trigger OTP modal secara reaktif
            'requires_email_otp' => Session::has('pending_email_change'),
            'pending_email' => Session::get('pending_email_change'),
            'requires_phone_otp' => Session::has('pending_phone_change'),
            'pending_phone' => Session::get('pending_phone_change'),
        ]);
    }

    // Handle profile update dan interceptor OTP untuk kredensial sensitif
    public function update(\Illuminate\Http\Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'nip'        => ['nullable', 'string', 'max:50'],
            'email'      => ['required', 'string', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'phone'      => ['nullable', 'string', 'max:20'], 
            'department' => ['nullable', 'string', 'max:255'],
            'photo'      => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'about'      => ['nullable', 'string'],
        ]);

        $newEmail = $validated['email'];
        
        $newPhone = $request->filled('phone') ? $validated['phone'] : $user->phone;

        $emailChanged = $newEmail !== $user->email;
        $phoneChanged = $request->filled('phone') && $newPhone !== $user->phone;

        // Eksekusi update untuk non-sensitive credentials
        $user->name  = $validated['name'];
        if (isset($validated['nip'])) $user->nip = $validated['nip'];
        if (isset($validated['department'])) $user->department = $validated['department'];
        if (isset($validated['about'])) $user->about = $validated['about'];

        // Storage cleanup: Hapus foto lama sebelum attach file baru
        if ($request->hasFile('photo')) {
            if ($user->photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->photo);
            }
            $user->photo = $request->file('photo')->store('profiles', 'public');
        }
        
        $user->save();

        // SECURITY INTERCEPTOR
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

            return Redirect::route('profile.edit')->with('status', 'otp-sent');
        }

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    // Validasi OTP Email dan finalisasi update
    public function verifyEmailChange(Request $request)
    {
        $request->validate(['otp' => 'required|numeric|digits:6']);

        if ($request->otp == Session::get('email_change_otp') && Session::has('pending_email_change')) {
            $user = $request->user();
            $user->email = Session::get('pending_email_change');
            $user->email_verified_at = now();
            $user->save();

            // Clear session state
            Session::forget(['email_change_otp', 'pending_email_change']);

            // Session chaining: Jika nomor WA juga diubah, fallback status kembali ke 'otp-sent'
            if (Session::has('pending_phone_change')) {
                return Redirect::route('profile.edit')->with('status', 'otp-sent');
            }
            return Redirect::route('profile.edit')->with('status', 'profile-updated');
        }
        return redirect()->back()->withErrors(['otp' => 'Kode OTP Email salah.']);
    }

    // Validasi OTP WhatsApp dan finalisasi update
    public function verifyPhoneChange(Request $request)
    {
        $request->validate(['otp' => 'required|numeric|digits:6']);

        if ($request->otp == Session::get('phone_change_otp') && Session::has('pending_phone_change')) {
            $user = $request->user();
            $user->phone = Session::get('pending_phone_change');
            $user->wa_verified_at = now();
            $user->save();

            // Clear session state
            Session::forget(['phone_change_otp', 'pending_phone_change']);

            // Session chaining: Jika email juga diubah, fallback status kembali ke 'otp-sent'
            if (Session::has('pending_email_change')) {
                return Redirect::route('profile.edit')->with('status', 'otp-sent');
            }
            return Redirect::route('profile.edit')->with('status', 'profile-updated');
        }
        return redirect()->back()->withErrors(['otp' => 'Kode OTP WhatsApp salah.']);
    }

    // Account Deletion dengan extra layer password confirmation
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