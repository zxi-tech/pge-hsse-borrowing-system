import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function EditUser({ auth, status, mustVerifyEmail, stats }) {
    const user = auth.user;

    // ================= STATE UNTUK OTP NOMOR HP =================
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    // Fungsi Simulasi Kirim OTP
    const handleSendOtp = () => {
        if (!newPhone || newPhone.length < 10) {
            return alert("Masukkan nomor WhatsApp yang valid terlebih dahulu!");
        }
        setOtpSent(true);
        alert(`[SIMULASI] Kode OTP telah dikirim ke WhatsApp: ${newPhone}`);
    };

    // Fungsi Simulasi Verifikasi OTP
    const handleVerifyOtp = () => {
        if (otpCode !== '123456') { // Kita pakai 123456 sebagai kode rahasia sementara
            return alert("Kode OTP salah! (Gunakan: 123456 untuk testing)");
        }

        // Jika benar, masukkan nomor baru ke dalam 'data' yang akan di-save ke Laravel
        setData('phone', newPhone);
        setIsEditingPhone(false);
        setOtpSent(false);
        setOtpCode('');
        alert("WhatsApp Terverifikasi! Jangan lupa klik tombol 'SAVE' di atas untuk menyimpan permanen.");
    };

    // ================= FORM LOGIC (INERTIA) =================
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        nip: user.nip || '',
        phone: user.phone || '',           // <-- Field nomor HP ditambahkan
        department: user.department || '',
        about: user.about || '',
        photo: null,
        _method: 'PATCH',
    });

    // ================= PHOTO LOGIC =================
    const fileInputRef = useRef();
    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file); // Simpan file asli untuk dikirim ke server
            const reader = new FileReader();
            reader.onload = (e) => setPhotoPreview(e.target.result); // Simpan base64 untuk preview di browser
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // ================= SUBMIT LOGIC =================
    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setPhotoPreview(null);
                setData('photo', null);
            },
        });
    };

    // Helper Inisial Nama
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // ================= STATS =================
    const displayStats = stats || [
        { label: 'Barang Dipinjam', value: '0' },
        { label: 'Menunggu Persetujuan', value: '0' },
        { label: 'Riwayat Peminjaman', value: '0' },
    ];

    // ================= STATE DROPDOWN PROFIL & MOBILE MENU =================
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State untuk Hamburger
    const profileMenuRef = useRef(null);

    // Menutup dropdown jika klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Placeholder untuk fitur Coming Soon (opsional)
    const handleComingSoon = (featureName) => {
        alert(`Fitur ${featureName} sedang dalam tahap pengembangan.`);
    };

    return (
        <>
            <Head title="Edit Profil Pengguna" />

            <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-gray-800 selection:bg-[#21409A] selection:text-white antialiased">

                {/* ================= NAVBAR RESPONSIVE ================= */}
                <nav className="w-full max-w-[1536px] mx-auto flex items-center justify-between px-6 lg:px-12 xl:px-20 py-8 z-50 bg-transparent flex-shrink-0 relative">
                    
                    {/* ZONA 1: Logo Kiri */}
                    <div className="flex items-center group cursor-pointer w-auto lg:w-1/4 shrink-0">
                        <img
                            src="/images/pertamina-logo (1).png"
                            alt="Pertamina Geothermal Energy"
                            className="h-8 md:h-10 lg:h-12 object-contain transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x50?text=Logo+PGE"; }}
                        />
                    </div>

                    {/* ZONA 2: Navigasi Desktop (Sembunyi di HP) */}
                    <div className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-12 text-[14px] font-bold text-gray-600">
                        <Link href={user ? (user.role === 'admin' ? route('dashboard') : '/') : route('login')} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            {user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                        
                        <Link href={user ? route('borrow.create') : route('login')} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            Ajukan Peminjaman
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                        
                        <Link href={user ? route('borrow.status') : route('login')} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            Status
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                        
                        <Link href={user ? route('contact') : route('login')} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            Contact Us
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                    </div>

                    {/* ZONA 3: Profil & Tombol Menu Mobile (Kanan) */}
                    <div className="flex items-center justify-end w-auto lg:w-1/4 shrink-0 gap-3 md:gap-4">
                        {user ? (
                            <div className="relative shrink-0" ref={profileMenuRef}>
                                <div
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className={`flex items-center space-x-2 md:space-x-3 cursor-pointer p-1.5 rounded-xl transition-all duration-200 border ${isProfileMenuOpen ? 'bg-white border-gray-200 shadow-sm' : 'border-transparent hover:bg-white/60 hover:border-gray-200'}`}
                                >
                                    <div className="relative">
                                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#00A651] flex items-center justify-center text-white font-bold text-xs md:text-sm border-2 border-white shadow-sm overflow-hidden">
                                            {user.photo ? (<img src={`/storage/${user.photo}`} className="w-full h-full object-cover" alt={user.name} />) : getInitials(user.name)}
                                        </div>
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div className="hidden md:flex flex-col text-left">
                                        <span className="text-[14px] font-bold text-gray-800 leading-tight">{user.name}</span>
                                        <span className="text-[11px] text-[#21409A] font-semibold">{user.department}</span>
                                    </div>
                                    <svg className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 hidden md:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>

                                {/* Isi Dropdown (Hanya Logout) */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Link href={route('logout')} method="post" as="button" className="flex items-center w-full gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                            Keluar (Logout)
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href={route('login')} className="relative inline-flex items-center justify-center px-5 py-2 md:px-8 md:py-2.5 rounded-xl border border-[#21409A] bg-transparent font-medium text-[#21409A] text-sm md:text-base overflow-hidden group hover:border-[#21409A] transition-all duration-300">
                                <span className="absolute inset-0 w-full h-full bg-[#21409A] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                                <span className="relative group-hover:text-white transition-colors duration-300">Login</span>
                            </Link>
                        )}

                        {/* HAMBURGER MENU BUTTON (HANYA MUNCUL DI HP) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 ml-1 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* DROPDOWN MENU MOBILE */}
                    {isMobileMenuOpen && (
                        <div className="absolute top-[80px] left-0 w-full bg-white shadow-lg border-b border-gray-100 z-40 lg:hidden flex flex-col px-6 py-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <Link href={user ? (user.role === 'admin' ? route('dashboard') : '/') : route('login')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">
                                {user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                            </Link>
                            <Link href={user ? route('borrow.create') : route('login')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">
                                Ajukan Peminjaman
                            </Link>
                            <Link href={user ? route('borrow.status') : route('login')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">
                                Status
                            </Link>
                            <Link href={user ? route('contact') : route('login')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] pb-2">
                                Contact Us
                            </Link>
                        </div>
                    )}
                </nav>

                {/* ================= KONTEN UTAMA ================= */}
                <main className="flex-grow max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 mt-10">

                    {recentlySuccessful && (
                        <div className="mb-8 p-4 rounded-2xl bg-green-50 border border-green-200 text-[#00A651] text-sm font-bold flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Profil Anda berhasil diperbarui!
                        </div>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold shadow-sm">
                            Hampir saja! Ada beberapa kesalahan input, silakan cek form di sebelah kanan.
                        </div>
                    )}

                    <form onSubmit={submit} className="bg-white rounded-[32px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">

                        {/* ================= KOLOM KIRI ================= */}
                        <div className="md:col-span-5 lg:col-span-4 p-8 lg:p-12 flex flex-col items-center border-r border-gray-100 bg-white">

                            <h1 className="text-2xl font-medium text-gray-500 tracking-wide mb-8">Profile</h1>

                            {/* Foto Profil Besar */}
                            <div className="relative group mb-6">
                                <div className="w-[160px] h-[160px] lg:w-[180px] lg:h-[180px] rounded-full border-[6px] border-[#F4F5F9] shadow-sm overflow-hidden flex items-center justify-center bg-[#EDF0F7] text-[#21409A]">
                                    {photoPreview ? (
                                        <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                                    ) : user.photo ? (
                                        <img src={`/storage/${user.photo}`} className="w-full h-full object-cover" alt={user.name} />
                                    ) : (
                                        <span className="text-6xl lg:text-7xl font-black">{getInitials(user.name)}</span>
                                    )}
                                </div>
                            </div>

                            {/* Nama & NIPP */}
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center mb-1">{user.name || '-'}</h2>
                            <p className="text-sm font-medium text-gray-400 mb-10 tracking-wide">{user.nip ? `NIPP. ${user.nip}` : 'NIPP.-'}</p>

                            {/* Stats Row */}
                            <div className="w-full flex items-stretch justify-center border-t border-b border-gray-200 py-6 mb-10">
                                {displayStats.map((item, idx) => (
                                    <div key={idx} className={`flex-1 flex flex-col items-center justify-start px-2 ${idx === 1 ? 'border-l border-r border-gray-300' : ''}`}>
                                        <p className="text-3xl font-normal text-gray-900 mb-2">{item.value}</p>
                                        <p className="text-[11px] text-gray-500 text-center leading-snug max-w-[85px]">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Tombol Upload */}
                            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                            <button type="button" onClick={triggerFileInput} className="w-full max-w-[240px] py-3.5 rounded-lg bg-[#21409A] hover:bg-[#1a3380] text-white font-medium text-sm shadow-md transition-all mb-10">
                                Upload Foto Profil
                            </button>

                            {/* Teks Bawah */}
                            <div className="text-center mt-auto pt-6 border-t border-gray-100 w-full">
                                <p className="text-[13px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">{user.department || 'DEPARTEMEN'}</p>
                                <p className="text-[12px] text-gray-400">PT Pertamina Geothermal Energy</p>
                            </div>
                        </div>

                        {/* ================= KOLOM KANAN ================= */}
                        <div className="md:col-span-7 lg:col-span-8 p-10 lg:p-14">

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 pb-6 border-b border-gray-100">
                                <h2 className="text-lg font-black text-gray-950 uppercase tracking-widest">Informasi Pengguna</h2>
                                <div className="flex items-center gap-3">
                                    <Link href="/" className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors">
                                        CANCEL
                                    </Link>
                                    <button type="submit" disabled={processing} className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${processing ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-[#21409A] hover:bg-[#1a3380] text-white'}`}>
                                        {processing ? 'SAVING...' : 'SAVE'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">

                                <div className="sm:col-span-2">
                                    <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input type="text" id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required className={`w-full bg-white border ${errors.name ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#21409A]/20 focus:border-[#21409A] transition-all`} placeholder="Misal: Nieely" />
                                    {errors.name && <p className="text-xs text-red-600 mt-1.5 font-medium">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="nip" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Nomor Pekerja <span className="text-red-500">*</span></label>
                                    <input type="text" id="nip" value={data.nip} onChange={(e) => setData('nip', e.target.value)} required className={`w-full bg-white border ${errors.nip ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#21409A]/20 focus:border-[#21409A] transition-all`} placeholder="Misal: 12341749841" />
                                    {errors.nip && <p className="text-xs text-red-600 mt-1.5 font-medium">{errors.nip}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Email Perusahaan</label>
                                    <div className="relative">
                                        <input type="email" id="email" value={data.email} readOnly className="w-full bg-[#F4F5F9] border border-gray-200 text-gray-500 rounded-xl px-4 py-3 pl-10 text-sm font-medium outline-none cursor-not-allowed" />
                                        <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1.5 font-medium pl-1.5">Email tidak dapat diubah sendiri. Hubungi admin IT PGE jika ada perubahan.</p>
                                </div>

                                {/* NOMOR HP / WHATSAPP DENGAN OTP */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Nomor WhatsApp Aktif <span className="text-red-500">*</span></label>

                                    {!isEditingPhone ? (
                                        <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-2.5 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                <span className="text-sm font-bold text-gray-800">{data.phone || 'Belum diatur'}</span>
                                            </div>
                                            <button type="button" onClick={() => { setIsEditingPhone(true); setNewPhone(data.phone || ''); }} className="text-xs font-bold text-[#21409A] hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">
                                                Ubah Nomor
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in fade-in">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newPhone}
                                                    onChange={e => setNewPhone(e.target.value)}
                                                    disabled={otpSent}
                                                    placeholder="Contoh: 081234567890"
                                                    className="w-full bg-white border border-gray-300 text-gray-950 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#21409A]/20 disabled:bg-gray-100"
                                                />
                                                {!otpSent && (
                                                    <button type="button" onClick={handleSendOtp} className="bg-gray-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-gray-900 shadow-sm transition-all">
                                                        Kirim OTP
                                                    </button>
                                                )}
                                            </div>

                                            {otpSent && (
                                                <div className="flex gap-2 animate-in slide-in-from-top-2">
                                                    <input
                                                        type="text"
                                                        value={otpCode}
                                                        onChange={e => setOtpCode(e.target.value)}
                                                        placeholder="Masukkan 6 Digit OTP"
                                                        maxLength="6"
                                                        className="w-full bg-white border border-green-300 text-gray-950 rounded-xl px-4 py-2.5 text-sm font-black tracking-[0.3em] text-center outline-none focus:ring-2 focus:ring-green-500/20"
                                                    />
                                                    <button type="button" onClick={handleVerifyOtp} className="bg-[#00A651] text-white px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-green-700 shadow-sm transition-all">
                                                        Verifikasi
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center px-1 pt-1">
                                                <p className="text-[11px] text-gray-500">{otpSent ? 'Cek pesan WhatsApp Anda.' : 'Pastikan nomor WhatsApp aktif.'}</p>
                                                <button type="button" onClick={() => { setIsEditingPhone(false); setOtpSent(false); setOtpCode(''); }} className="text-xs font-bold text-red-500 hover:underline">
                                                    Batalkan
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {errors.phone && <p className="text-xs text-red-600 mt-1.5 font-medium">{errors.phone}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="department" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Departemen</label>
                                    <div className="relative">
                                        <input type="text" id="department" value={data.department || '-'} readOnly className="w-full bg-[#F4F5F9] border border-gray-200 text-gray-500 rounded-xl px-4 py-3 pl-10 text-sm font-medium outline-none cursor-not-allowed" />
                                        <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="about" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Tentang Saya / Catatan</label>
                                    <textarea id="about" value={data.about} onChange={(e) => setData('about', e.target.value)} rows="4" className={`w-full bg-white border ${errors.about ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3.5 text-sm font-bold outline-none resize-none focus:ring-2 focus:ring-[#21409A]/20 focus:border-[#21409A] transition-all`} placeholder="Tulis sedikit cerita tentang Anda atau info penting lainnya (Opsional)..."></textarea>
                                    {errors.about && <p className="text-xs text-red-600 mt-1.5 font-medium">{errors.about}</p>}
                                </div>

                            </div>
                        </div>

                    </form>
                </main>
                
                {/* ================= FOOTER AREA ================= */}
                <footer className="mt-auto shrink-0 bg-[#F4F5FA]">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 py-4 flex flex-col md:flex-row justify-between items-center text-[13px] text-gray-500 font-medium">
                        <div>© 2026, Sistem Peminjaman HSSE - PT Pertamina Geothermal Energy Tbk.</div>
                        <div className="flex space-x-4 mt-2 md:mt-0 text-[#21409A]">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleComingSoon("Lisensi"); }} className="hover:underline">License</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleComingSoon("Dokumentasi"); }} className="hover:underline">Documentation</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleComingSoon("Bantuan Support"); }} className="hover:underline">Support</a>
                        </div>
                    </div>
                    <div className="h-1.5 flex w-full">
                        <div className="bg-[#21409A] flex-1"></div>
                        <div className="bg-[#ED1C24] flex-1"></div>
                        <div className="bg-[#FBBF24] flex-1"></div>
                    </div>
                </footer>
            </div>
        </>
    );
}