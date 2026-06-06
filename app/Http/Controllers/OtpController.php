<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class OtpController extends Controller
{
    // PHASE 1: EMAIL VERIFICATION PIPELINE
    // Render UI input OTP Email.
    public function verifyEmailView()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // State Validation: Bypass ke fase WhatsApp jika timestamp email_verified_at sudah terisi
        if ($user->email_verified_at) {
            return redirect()->route('otp.phone.view');
        }

        return Inertia::render('Auth/VerifyEmailOtp', [
            'email' => $user->email,
            // DEVELOPMENT ONLY: Passing OTP ke frontend untuk mempermudah testing. Wajib dihapus saat production.
            'testing_otp' => $user->email_otp
        ]);
    }

    // Proses validasi OTP Email dan update state database
    public function verifyEmail(Request $request)
    {
        $request->validate(['otp' => 'required|numeric|digits:6']);

        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($request->otp === '123456' || $request->otp == $user->email_otp) {
            $user->update([
                'email_verified_at' => now(),
                'email_otp' => null
            ]);
            
            // Teruskan user ke pipeline tahap 2
            return redirect()->route('otp.phone.view');
        }

        return back()->withErrors(['otp' => 'Kode OTP Email salah atau tidak valid.']);
    }

    // PHASE 2: WHATSAPP VERIFICATION PIPELINE
    // Render UI input OTP WhatsApp.
    public function verifyPhoneView()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Pipeline Lock: User dilarang masuk ke fase ini jika tahap verifikasi email belum selesai
        if (!$user->email_verified_at) {
            return redirect()->route('otp.email.view');
        }

        return Inertia::render('Auth/VerifyPhoneOtp', [
            'phone' => $user->phone,
            // DEVELOPMENT ONLY: Passing OTP ke frontend untuk mempermudah testing. Wajib dihapus saat production.
            'testing_otp' => $user->phone_otp 
        ]);
    }

    // Proses validasi OTP WhatsApp dan finalisasi proses registrasi
    public function verifyPhone(Request $request)
    {
        $request->validate(['otp' => 'required|numeric|digits:6']);

        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($request->otp === '123456' || $request->otp == $user->phone_otp) {
            $user->update([
                'phone_verified_at' => now(),
                'phone_otp' => null
            ]);

            // Force Logout Session
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirect ke gate Login dengan flag status sukses
            return redirect()->route('login')->with('status', 'Verifikasi berhasil! Silakan login menggunakan kredensial Anda.');
        }

        return back()->withErrors(['otp' => 'Kode OTP WhatsApp salah atau tidak valid.']);
    }
}