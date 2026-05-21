import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        nip: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    const handleNipChange = (e) => {
        const numericValue = e.target.value.replace(/\D/g, '');
        setData('nip', numericValue);
    };

    const handlePhoneChange = (e) => {
        const numericValue = e.target.value.replace(/\D/g, '');
        setData('phone', numericValue);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans selection:bg-[#21409A] selection:text-white overflow-hidden">
            <Head title="Registrasi Akun" />

            <div className="w-full max-w-[900px] md:min-h-[500px] bg-white rounded-[24px] shadow-xl overflow-hidden flex flex-col md:flex-row">

                <div className="hidden md:block md:w-5/12 p-3">
                    <div className="w-full h-full rounded-[20px] overflow-hidden relative bg-gray-100">
                        <img
                            src="/images/register-image.png"
                            alt="Pekerja Pertamina"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop";
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#21409A]/30 to-transparent"></div>
                    </div>
                </div>

                {/* ================= KOLOM KANAN: FORM REGISTRASI COMPACT ================= */}
                <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-center">

                    <div className="mb-5">
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            Buat Akun Baru <span className="animate-wave origin-bottom-right">👋</span>
                        </h1>
                        <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                            Daftarkan diri Anda untuk mengakses sistem peminjaman barang dan APD.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">

                        {/* Baris 1: NIP & Nama Lengkap */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-[#4B5563] font-extrabold uppercase tracking-widest">
                                    Nomor Pekerja (NIP)
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#00A651] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input type="text" value={data.nip} onChange={handleNipChange} required className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 rounded-lg pl-10 pr-3.5 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all placeholder-gray-400 font-medium" placeholder="Contoh: 703703" />
                                </div>
                                {errors.nip && <p className="text-red-500 text-[10px]">{errors.nip}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-[#4B5563] font-extrabold uppercase tracking-widest">
                                    Nama Lengkap
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#00A651] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 rounded-lg pl-10 pr-3.5 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all placeholder-gray-400 font-medium" placeholder="Sesuai ID Card" />
                                </div>
                                {errors.name && <p className="text-red-500 text-[10px]">{errors.name}</p>}
                            </div>
                        </div>

                        {/* Baris 2: Email & Nomor Telepon */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-[#4B5563] font-extrabold uppercase tracking-widest">
                                    Alamat Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#00A651] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 rounded-lg pl-10 pr-3.5 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all placeholder-gray-400 font-medium" placeholder="nama@pertamina.com" />
                                </div>
                                {errors.email && <p className="text-red-500 text-[10px]">{errors.email}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-[#4B5563] font-extrabold uppercase tracking-widest">
                                    Nomor Telepon
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#00A651] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        </svg>
                                    </div>
                                    <input type="tel" value={data.phone} onChange={handlePhoneChange} required className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 rounded-lg pl-10 pr-3.5 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all placeholder-gray-400 font-medium" placeholder="0812..." />
                                </div>
                                {errors.phone && <p className="text-red-500 text-[10px]">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Baris 3: Departemen */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-[#4B5563] font-extrabold uppercase tracking-widest">
                                Departemen
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                    <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#00A651] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                                    </svg>
                                </div>
                                <select value={data.department} onChange={(e) => setData('department', e.target.value)} required className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-600 rounded-lg pl-10 pr-10 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all cursor-pointer font-medium appearance-none relative">
                                    <option value="" disabled>-- Pilih Departemen --</option>
                                    <option value="Operasional">Operasional Panas Bumi</option>
                                    <option value="Teknik">Teknik & Pemeliharaan</option>
                                    <option value="HSSE">HSSE / K3</option>
                                    <option value="Logistik">Logistik & SCM</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#00A651]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            {errors.department && <p className="text-red-500 text-[10px]">{errors.department}</p>}
                        </div>

                        {/* Baris 4: Kata Sandi & Konfirmasi */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-[10px] text-[#4B5563] font-extrabold uppercase tracking-widest">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#00A651] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 rounded-lg pl-10 pr-10 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all placeholder-gray-400 font-medium tracking-widest"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#00A651] transition-colors"
                                        tabIndex="-1"
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0l1.414 1.414M15 15l1.414 1.414M21 21l-3.29-3.29m-3.532-3.532l-1.414-1.414m-4.242 0L9.88 9.88M21.543 12c-1.274 4.057-5.065 7-9.543 7m0 0l.002.002"></path></svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-[10px]">{errors.password}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-[10px] text-[#4B5563] font-extrabold uppercase tracking-widest">
                                    Konfirmasi Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#00A651] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                        className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 rounded-lg pl-10 pr-10 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all placeholder-gray-400 font-medium tracking-widest"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#00A651] transition-colors"
                                        tabIndex="-1"
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0l1.414 1.414M15 15l1.414 1.414M21 21l-3.29-3.29m-3.532-3.532l-1.414-1.414m-4.242 0L9.88 9.88M21.543 12c-1.274 4.057-5.065 7-9.543 7m0 0l.002.002"></path></svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && <p className="text-red-500 text-[10px]">{errors.password_confirmation}</p>}
                            </div>
                        </div>

                        {/* Tombol Submit & Teks Bawah */}
                        <div className="pt-3 flex flex-col gap-3">
                            <button type="submit" disabled={processing} className={`w-full py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition-all duration-300 ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#21409A] hover:bg-[#1a3380] hover:shadow-lg transform hover:-translate-y-0.5'}`}>
                                {processing ? 'Memproses...' : 'Daftar Sekarang'}
                            </button>

                            <p className="text-center text-xs text-gray-600 font-medium">
                                Sudah punya akun?{' '}
                                <Link href={route('login')} className="text-[#21409A] font-bold hover:underline">
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>

                    </form>
                </div>
            </div>

            {/* Animasi Kustom untuk tangan melambai */}
            <style jsx="true">{`
                @keyframes wave {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(20deg); }
                    50% { transform: rotate(-10deg); }
                    75% { transform: rotate(10deg); }
                }
                .animate-wave {
                    display: inline-block;
                    animation: wave 1.5s infinite;
                }
            `}</style>
        </div>
    );
}