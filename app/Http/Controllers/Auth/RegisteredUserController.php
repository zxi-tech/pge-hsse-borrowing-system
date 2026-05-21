<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Mail; // Pastikan ini ada
use App\Mail\OtpMail; // Pastikan ini ada

class RegisteredUserController extends Controller
{
    // Display the registration view
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        // Validasi
        $request->validate([
            'nip' => 'required|string|max:255|unique:users,nip',
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:users,email',
                'ends_with:@pertamina.com,@mitrakerja.pertamina.com'
            ],
            'phone' => 'required|string|max:255|unique:users,phone',
            'department' => 'required|string|max:255',
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ], [
            'email.ends_with' => 'Pendaftaran gagal! Anda wajib menggunakan email @pertamina.com atau @mitrakerja.pertamina.com.',
        ]);

        // Generate OTP
        $emailOtp = rand(100000, 999999);
        $phoneOtp = rand(100000, 999999);

        // Save data to Database
        $user = User::create([
            'nip' => $request->nip,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'department' => $request->department,
            'password' => Hash::make($request->password),
            'email_otp' => $emailOtp,
            'phone_otp' => $phoneOtp,
        ]);

        // Call Email
        Mail::to($user->email)->send(new OtpMail($emailOtp));

        // Login
        Auth::login($user);

        // Redirect to verification page
        return redirect()->route('verification.notice');
    }
}
