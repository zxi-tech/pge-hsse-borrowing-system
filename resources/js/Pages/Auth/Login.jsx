import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    // Inisialisasi state form dan fungsi submit bawaan Inertia.js
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    // State untuk kontrol visibilitas password (fitur mata)
    const [showPassword, setShowPassword] = useState(false);

    // Handler form submit (Mencegah reload browser dan melakukan POST request)
    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans selection:bg-[#21409A] selection:text-white overflow-hidden relative">
            <Head title="Login Akun" />

            {/* Container Utama Login */}
            <div className="w-full max-w-[900px] md:min-h-[500px] bg-white rounded-[24px] shadow-xl overflow-hidden flex flex-col md:flex-row -mt-28 md:mt-0 relative z-10">

                {/* SISI KIRI: Area Form Login */}
                <div className="relative w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-center overflow-hidden bg-white/95 md:bg-white">

                    {/* Gambar Latar (Hanya untuk mode Mobile) */}
                    <div className="absolute inset-0 z-0 md:hidden pointer-events-none opacity-50">
                        <img
                            src="/images/login-image2.png"
                            alt="Background Mobile"
                            className="w-full h-full object-cover origin-center scale-[1] translate-x-[30%]"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop";
                            }}
                        />
                    </div>

                    {/* Header Text & Logo Instansi */}
                    <div className="relative z-10 mb-6">
                        <img
                            src="/images/pertamina-logo (1).png"
                            alt="Logo PGE"
                            className="h-10 w-auto mb-6 object-contain md:-mt-12"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/150x40?text=Logo+PGE";
                            }}
                        />

                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            Selamat Datang 👋
                        </h1>
                        <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                            Masuk untuk mengakses sistem peminjaman barang dan APD.
                        </p>
                    </div>

                    {/* Pembungkus Form */}
                    <form onSubmit={submit} className="relative z-10 space-y-4">

                        {/* Input Group: Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-[#4B5563] font-extrabold uppercase tracking-widest">
                                Email
                            </label>

                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className="w-full bg-white md:bg-[#F9FAFB] border border-gray-200 text-gray-800 rounded-lg px-3.5 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all placeholder-gray-400 font-medium"
                                placeholder="nama@pertamina.com"
                            />

                            {/* Alert Validasi Error Email */}
                            {errors.email && (
                                <p className="text-red-500 text-[10px]">{errors.email}</p>
                            )}
                        </div>

                        {/* Input Group: Password dengan Fitur Toggle Visibility */}
                        <div className="flex flex-col gap-1.5 relative">
                            <label className="text-[10px] text-[#4B5563] font-extrabold uppercase tracking-widest">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="w-full bg-white md:bg-[#F9FAFB] border border-gray-200 text-gray-800 rounded-lg pl-3.5 pr-10 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all placeholder-gray-400 font-medium tracking-widest"
                                    placeholder="••••••••"
                                />

                                {/* Tombol Toggle Mata (Show/Hide Password) */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#00A651] transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Alert Validasi Error Password */}
                            {errors.password && (
                                <p className="text-red-500 text-[10px]">{errors.password}</p>
                            )}
                        </div>

                        {/* Tombol Aksi Submit Form */}
                        <div className="pt-3 flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition-all duration-300 ${processing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#21409A] hover:bg-[#1a3380] hover:shadow-lg transform hover:-translate-y-0.5'
                                    }`}
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* SISI KANAN: Gambar Cover (Disembunyikan saat mode Mobile) */}
                <div className="hidden md:block md:w-5/12 p-3 bg-white">
                    <div className="w-full h-full rounded-[20px] overflow-hidden relative bg-gray-100">
                        <img
                            src="/images/login-image1.png"
                            alt="Pekerja Pertamina"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop";
                            }}
                        />
                        {/* Overlay Gradient untuk Estetika Desain */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#21409A]/30 to-transparent"></div>
                    </div>
                </div>

            </div>
        </div>
    );
}