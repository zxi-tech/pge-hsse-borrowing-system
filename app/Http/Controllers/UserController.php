<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // USER MANAGEMENT BOARD (Admin View)
    public function index(Request $request)
    {
        // Query Optimization: Gunakan withCount() untuk mendapatkan agregat data transaksi
        // langsung di level database (via subquery) tanpa me-load full collection ke memory.
        $query = User::withCount('transactions')
            ->withCount(['transactions as on_time_count' => function ($q) {
                $q->where('status', 'selesai')->whereNull('notes');
            }])
            ->withCount(['transactions as late_count' => function ($q) {
                // Asumsi flag keterlambatan bisa terdeteksi dari status enumerator atau field notes
                $q->where('status', 'terlambat')->orWhere('notes', 'LIKE', '%terlambat%');
            }]);

        // Search Filter (Full-text search logic)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status State Filter
        if ($request->filled('status') && $request->status !== 'Semua') {
            $query->where('status', $request->status);
        }

        // Eksekusi Query dengan Pagination (7 rows per page)
        $users = $query->latest()
            ->paginate(7)
            ->through(function ($user) {
                // Data mapping: Format payload sebelum di-pass ke React frontend
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'nip' => $user->nip,
                    'email' => $user->email,
                    'department' => $user->department,
                    'phone' => $user->phone,
                    'photo' => $user->photo,
                    'status' => $user->status ?? 'Aktif',
                    // Null coalescing fallback untuk data yang berpotensi empty
                    'about' => $user->about ?? 'Belum ada deskripsi profil untuk pengguna ini.',
                    'area' => $user->area ?? 'Site Lahendong',

                    // Append computed properties dari subquery withCount()
                    'total_borrow' => $user->transactions_count,
                    'on_time' => $user->on_time_count,
                    'late' => $user->late_count,
                ];
            })
            // Pertahankan query string parameter (search/status) saat admin berpindah halaman
            ->withQueryString(); 

        return Inertia::render('Dashboard/Users', [
            'users' => $users,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    // HANDLE ACCOUNT MUTATION (Admin Action)
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:Aktif,Nonaktif,Cuti',
            'email' => [
                'sometimes',
                'required',
                'email',
                // Cegah duplicate email exception, tapi abaikan jika emailnya milik user ini sendiri
                Rule::unique('users')->ignore($user->id),
                // Validasi domain email untuk whitelist akses internal perusahaan
                'ends_with:@pertamina.com,@mitrakerja.pertamina.com'
            ],
            'otp' => 'sometimes|required|digits:6'
        ]);

        // SCENARIO 1: Non-Critical Mutation (Status Only)
        // Bypass verifikasi OTP jika admin hanya mengupdate status akun
        if (!isset($validated['email']) || $validated['email'] === $user->email) {
            $user->update(['status' => $validated['status']]);
            return back()->with('success', 'Status akun berhasil diperbarui!');
        }

        // SCENARIO 2: Critical Credential Mutation (Email Update)
        // Wajib verifikasi OTP sebelum menyetujui pergantian email
        if (isset($validated['email']) && $validated['email'] !== $user->email) {

            // Validate payload OTP vs Database state. 
            // Note: Hardcoded '123456' untuk bypass pada fase development/testing. Harus dihapus saat production.
            $isValidOtp = ($request->otp === $user->email_otp || $request->otp === '123456');

            if (!$isValidOtp) {
                // Reject invalid OTP dan passing pesan error ke state frontend
                return back()->withErrors(['otp' => 'Kode OTP tidak valid! Akses ditolak.']);
            }

            // Eksekusi mutasi credential
            $user->update([
                'email' => $validated['email'],
                'status' => $validated['status'],
                'email_otp' => null
            ]);

            return back()->with('success', 'Email dan Status berhasil diperbarui melalui verifikasi OTP!');
        }
    }

    public function secretCreate()
    {
        return Inertia::render('SecretCreate');
    }

    public function secretStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nip' => 'required|string|max:50|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'department' => 'required|string|max:255',
        ]);

        \App\Models\User::create([
            'name' => $request->name,
            'nip' => $request->nip,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'department' => $request->department,
            'status' => 'Aktif', // Otomatis langsung aktif
            'role' => 'pekerja', // Asumsi role default adalah pekerja
        ]);

        return redirect()->route('users.index');
    }
}