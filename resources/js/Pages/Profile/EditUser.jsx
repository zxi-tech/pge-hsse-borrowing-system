import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function EditUser({ auth, status, mustVerifyEmail, stats }) {
    const user = auth.user;

    // Manajemen State: Verifikasi OTP Nomor Ponsel
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    // Handler: Simulasi pengiriman OTP
    const handleSendOtp = () => {
        if (!newPhone || newPhone.length < 10) {
            return alert("Masukkan nomor WhatsApp yang valid terlebih dahulu!");
        }
        setOtpSent(true);
        alert(`[SIMULASI] Kode OTP telah dikirim ke WhatsApp: ${newPhone}`);
    };

    // Handler: Simulasi verifikasi OTP
    const handleVerifyOtp = () => {
        // Menggunakan 123456 sebagai kode statis untuk keperluan simulasi
        if (otpCode !== '123456') {
            return alert("Kode OTP salah! (Gunakan: 123456 untuk testing)");
        }

        // Memperbarui state form dengan nomor ponsel yang telah terverifikasi
        setData('phone', newPhone);
        setIsEditingPhone(false);
        setOtpSent(false);
        setOtpCode('');
        alert("WhatsApp Terverifikasi! Jangan lupa klik tombol 'SAVE' di atas untuk menyimpan permanen.");
    };

    // Manajemen State: Inisialisasi form Inertia
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        nip: user.nip || '',
        phone: user.phone || '', // Field nomor ponsel pengguna
        department: user.department || '',
        about: user.about || '',
        photo: null,
        _method: 'PATCH',
    });

    // Logika Pemrosesan Foto Profil
    const fileInputRef = useRef();
    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file); // Menyimpan objek file untuk transmisi ke peladen
            const reader = new FileReader();
            reader.onload = (e) => setPhotoPreview(e.target.result); // Menghasilkan representasi base64 untuk pratinjau antarmuka
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Handler: Pengiriman data form
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

    // Helper: Pembuatan inisial nama untuk fallback avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Inisialisasi data statistik peminjaman
    const displayStats = stats || [
        { label: 'Barang Dipinjam', value: '0' },
        { label: 'Menunggu Persetujuan', value: '0' },
        { label: 'Riwayat Peminjaman', value: '0' },
    ];

    // Manajemen State: Interaktivitas UI dan Navigasi
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State untuk menu navigasi seluler
    const profileMenuRef = useRef(null);

    // Efek Samping: Menutup menu dropdown saat interaksi di luar elemen
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handler: Fitur dalam tahap pengembangan
    const handleComingSoon = (featureName) => {
        alert(`Fitur ${featureName} sedang dalam tahap pengembangan.`);
    };

    return (
        <>
            <Head title="Edit Profil Pengguna" />

            <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-gray-800 selection:bg-[#21409A] selection:text-white antialiased">

                {/* Komponen: Navigasi Utama */}
                <nav className="w-full max-w-[1536px] mx-auto flex items-center justify-between px-6 lg:px-12 xl:px-20 py-8 z-50 bg-transparent flex-shrink-0 relative">

                    {/* Bagian: Logo Instansi */}
                    <div className="flex items-center group cursor-pointer w-auto lg:w-1/4 shrink-0">
                        <img
                            src="/images/pertamina-logo (1).png"
                            alt="Pertamina Geothermal Energy"
                            className="h-8 md:h-10 lg:h-12 object-contain transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x50?text=Logo+PGE"; }}
                        />
                    </div>

                    {/* Bagian: Tautan Navigasi Utama */}
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

                    {/* Bagian: Profil Pengguna dan Kontrol Menu Seluler */}
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

                                {/* Konten Menu Dropdown Profil */}
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

                        {/* Tombol Toggle Menu Seluler */}
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 ml-1 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* DROPDOWN MOBILE */}
                    {isMobileMenuOpen && (
                        <div className="absolute top-[80px] left-0 w-full bg-white/95 backdrop-blur-2xl shadow-[0_24px_50px_-20px_rgba(0,0,0,0.18)] border-b border-gray-100/80 z-40 lg:hidden flex flex-col px-4 pt-4 pb-5 animate-in fade-in slide-in-from-top-4 duration-300 rounded-b-[1.75rem]">

                            {/* Header */}
                            <div className="px-2 pb-3">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                                    Menu
                                </p>
                            </div>

                            {/* Menu List */}
                            <div className="flex flex-col gap-1.5">

                                {/* Dashboard / Beranda */}
                                <Link
                                    href={user ? (user.role === 'admin' ? route('dashboard') : '/') : route('login')}
                                    className="group flex items-center justify-between px-3.5 py-3 rounded-2xl bg-[#21409A]/[0.06] hover:bg-[#21409A]/[0.10] active:scale-[0.985] transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3.5">

                                        <div className="w-11 h-11 shrink-0 rounded-[14px] bg-white border border-[#21409A]/10 shadow-sm flex items-center justify-center text-[#21409A] transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                                            <svg
                                                className="w-[21px] h-[21px]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.8"
                                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
                                                />
                                            </svg>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-bold text-[#21409A] leading-tight">
                                                {user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                                            </span>

                                            <span className="text-[11px] text-[#21409A]/50 mt-0.5">
                                                Lihat informasi utama
                                            </span>
                                        </div>

                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-[#21409A] group-hover:bg-white transition-colors">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </Link>


                                {/* Ajukan Peminjaman */}
                                <Link
                                    href={user ? route('borrow.create') : route('login')}
                                    className="group flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-gray-50 active:scale-[0.985] transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3.5">

                                        <div className="w-11 h-11 shrink-0 rounded-[14px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#00A651]/10 group-hover:border-[#00A651]/15 group-hover:text-[#00A651] transition-all duration-200">
                                            <svg
                                                className="w-[21px] h-[21px]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.8"
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-semibold text-gray-700 group-hover:text-[#00A651] transition-colors">
                                                Pinjam APD
                                            </span>

                                            <span className="text-[11px] text-gray-400 mt-0.5">
                                                Ajukan APD yang kamu butuhkan
                                            </span>
                                        </div>

                                    </div>

                                    <svg
                                        className="w-4 h-4 text-gray-300 group-hover:text-[#00A651] group-hover:translate-x-0.5 transition-all duration-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>


                                {/* Status Peminjaman */}
                                <Link
                                    href={user ? route('borrow.status') : route('login')}
                                    className="group flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-gray-50 active:scale-[0.985] transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3.5">

                                        <div className="w-11 h-11 shrink-0 rounded-[14px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-orange-50 group-hover:border-orange-100 group-hover:text-orange-500 transition-all duration-200">
                                            <svg
                                                className="w-[21px] h-[21px]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.8"
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-semibold text-gray-700 group-hover:text-orange-500 transition-colors">
                                                Cek Peminjaman
                                            </span>

                                            <span className="text-[11px] text-gray-400 mt-0.5">
                                                Lihat status peminjamanmu
                                            </span>
                                        </div>

                                    </div>

                                    <svg
                                        className="w-4 h-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all duration-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>

                                {/* Hubungi Kami */}
                                <Link
                                    href={user ? route('contact') : route('login')}
                                    className="group flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-gray-50 active:scale-[0.985] transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3.5">

                                        <div className="w-11 h-11 shrink-0 rounded-[14px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:text-white transition-all duration-200">
                                            <svg
                                                className="w-[21px] h-[21px]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.8"
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                                                Butuh Bantuan?
                                            </span>

                                            <span className="text-[11px] text-gray-400 mt-0.5">
                                                Kami siap membantu
                                            </span>
                                        </div>

                                    </div>

                                    <svg
                                        className="w-4 h-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all duration-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>

                            </div>

                        </div>
                    )}
                </nav>

                <main className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 mt-10">

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

                    {/* Komponen: Formulir Profil */}
                    {/* Penyesuaian tata letak responsif untuk tampilan kartu */}
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-0 md:bg-white md:rounded-[32px] md:shadow-[0_10px_60px_-15px_rgba(0,0,0,0.08)] md:border md:border-gray-100 md:overflow-hidden">

                        {/* Bagian Kiri: Kartu Informasi Profil */}
                        <div className="md:col-span-5 lg:col-span-4 p-6 sm:p-8 lg:p-12 flex flex-col items-center bg-white rounded-[24px] shadow-sm border border-gray-100 md:rounded-none md:shadow-none md:border-0 md:border-r md:border-gray-100">

                            <h1 className="text-2xl font-medium text-gray-500 tracking-wide mb-8">Profile</h1>

                            {/* Tampilan Pratinjau Foto Profil */}
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

                            {/* Identitas Pengguna */}
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center mb-1">{user.name || '-'}</h2>
                            <p className="text-sm font-medium text-gray-400 mb-10 tracking-wide">{user.nip ? `NIPP. ${user.nip}` : 'NIPP.-'}</p>

                            {/* Baris Indikator Statistik */}
                            <div className="w-full flex items-stretch justify-center border-t border-b border-gray-200 py-6 mb-10">
                                {displayStats.map((item, idx) => (
                                    <div key={idx} className={`flex-1 flex flex-col items-center justify-start px-2 ${idx === 1 ? 'border-l border-r border-gray-300' : ''}`}>
                                        <p className="text-3xl font-normal text-gray-900 mb-2">{item.value}</p>
                                        <p className="text-[11px] text-gray-500 text-center leading-snug max-w-[85px]">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Kontrol Unggah Foto */}
                            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                            <button type="button" onClick={triggerFileInput} className="w-full max-w-[240px] py-3.5 rounded-lg bg-[#21409A] hover:bg-[#1a3380] text-white font-medium text-sm shadow-md transition-all mb-10">
                                Upload Foto Profil
                            </button>

                            {/* Informasi Organisasi */}
                            <div className="text-center mt-auto pt-6 border-t border-gray-100 w-full">
                                <p className="text-[13px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">{user.department || 'DEPARTEMEN'}</p>
                                <p className="text-[12px] text-gray-400">PT Pertamina Geothermal Energy</p>
                            </div>
                        </div>

                        {/* Bagian Kanan: Formulir Pembaruan Data */}
                        {/* Penyesuaian gaya kontainer formulir berdasarkan ukuran layar */}
                        <div className="md:col-span-7 lg:col-span-8 p-6 sm:p-8 md:p-10 lg:p-14 bg-white rounded-[24px] shadow-sm border border-gray-100 md:rounded-none md:shadow-none md:border-0 md:bg-transparent">

                            {/* Header Formulir dan Kontrol Penyimpanan */}
                            {/* Penyesuaian gaya tombol aksi */}
                            <div className="flex flex-row items-center justify-between mb-6 md:mb-12 pb-4 md:pb-6 border-b border-gray-100">
                                <h2 className="text-base md:text-lg font-black text-gray-950 md:uppercase tracking-normal md:tracking-widest leading-snug">
                                    Informasi<br className="block md:hidden" /> Pengguna
                                </h2>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Link href="/" className="px-2 md:px-5 py-2 md:py-2.5 md:rounded-lg md:border border-gray-300 md:bg-white text-gray-700 text-[13px] md:text-xs font-bold md:hover:bg-gray-50 transition-colors">
                                        <span className="md:hidden">Batal</span>
                                        <span className="hidden md:block">CANCEL</span>
                                    </Link>
                                    <button type="submit" disabled={processing} className={`px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-[13px] md:text-xs font-bold transition-all md:shadow-sm ${processing ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-[#00A651] md:bg-[#21409A] hover:opacity-90 md:hover:bg-[#1a3380] text-white'}`}>
                                        <span className="md:hidden">{processing ? '...' : 'Simpan'}</span>
                                        <span className="hidden md:block">{processing ? 'SAVING...' : 'SAVE'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Konfigurasi jarak antar elemen input */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 md:gap-y-8">

                                {/* Input: Nama Lengkap (Hanya Baca) */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="name" className="block text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 md:mb-2 md:uppercase md:tracking-wide md:text-gray-500">Nama Lengkap</label>
                                    <div className="relative">
                                        <input type="text" id="name" value={data.name} readOnly disabled className="w-full bg-[#F4F5F9] border border-gray-200 text-gray-700 md:text-gray-500 rounded-xl px-4 py-2.5 md:py-3 pl-10 text-[13px] md:text-sm font-bold md:font-medium outline-none cursor-not-allowed opacity-90" />
                                        <svg className="absolute left-3.5 top-3 md:top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                </div>

                                {/* Input: Nomor Induk Pegawai (Hanya Baca) */}
                                <div>
                                    <label htmlFor="nip" className="block text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 md:mb-2 md:uppercase md:tracking-wide md:text-gray-500">Nomor Pekerja (NIPP)</label>
                                    <div className="relative">
                                        <input type="text" id="nip" value={data.nip} readOnly disabled className="w-full bg-[#F4F5F9] border border-gray-200 text-gray-700 md:text-gray-500 rounded-xl px-4 py-2.5 md:py-3 pl-10 text-[13px] md:text-sm font-bold md:font-medium outline-none cursor-not-allowed opacity-90" />
                                        <svg className="absolute left-3.5 top-3 md:top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                </div>

                                {/* Input: Alamat Email (Hanya Baca) */}
                                <div>
                                    <label htmlFor="email" className="block text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 md:mb-2 md:uppercase md:tracking-wide md:text-gray-500">Email Perusahaan</label>
                                    <div className="relative">
                                        <input type="email" id="email" value={data.email} readOnly disabled className="w-full bg-[#F4F5F9] border border-gray-200 text-gray-700 md:text-gray-500 rounded-xl px-4 py-2.5 md:py-3 pl-10 text-[13px] md:text-sm font-bold md:font-medium outline-none cursor-not-allowed opacity-90" />
                                        <svg className="absolute left-3.5 top-3 md:top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                </div>

                                {/* Input: Nomor Telepon dengan Verifikasi OTP */}
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 md:mb-2 md:uppercase md:tracking-wide">Nomor WhatsApp Aktif</label>

                                    {!isEditingPhone ? (
                                        <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-2 md:py-2.5 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                <span className="text-[13px] md:text-sm font-bold text-gray-800">{data.phone || 'Belum diatur'}</span>
                                            </div>
                                            <button type="button" onClick={() => { setIsEditingPhone(true); setNewPhone(data.phone || ''); }} className="text-[11px] md:text-xs font-bold text-[#00A651] md:text-[#21409A] hover:underline bg-transparent md:bg-blue-50 px-0 md:px-3 py-1.5 rounded-lg">
                                                Ubah Nomor
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in fade-in">
                                            <div className="flex gap-2">
                                                <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} disabled={otpSent} placeholder="Contoh: 081234567890" className="w-full bg-white border border-gray-300 text-gray-950 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#21409A]/20 disabled:bg-gray-100" />
                                                {!otpSent && (
                                                    <button type="button" onClick={handleSendOtp} className="bg-gray-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-gray-900 shadow-sm transition-all">
                                                        Kirim OTP
                                                    </button>
                                                )}
                                            </div>

                                            {otpSent && (
                                                <div className="flex gap-2 animate-in slide-in-from-top-2">
                                                    <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="Masukkan 6 Digit OTP" maxLength="6" className="w-full bg-white border border-green-300 text-gray-950 rounded-xl px-4 py-2.5 text-sm font-black tracking-[0.3em] text-center outline-none focus:ring-2 focus:ring-green-500/20" />
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

                                {/* Input: Departemen (Hanya Baca) */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="department" className="block text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 md:mb-2 md:uppercase md:tracking-wide md:text-gray-500">Departemen</label>
                                    <div className="relative">
                                        <input type="text" id="department" value={data.department || '-'} readOnly disabled className="w-full bg-[#F4F5F9] border border-gray-200 text-gray-700 md:text-gray-500 rounded-xl px-4 py-2.5 md:py-3 pl-10 text-[13px] md:text-sm font-bold md:font-medium outline-none cursor-not-allowed opacity-90" />
                                        <svg className="absolute left-3.5 top-3 md:top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                </div>

                                {/* Input: Catatan Profil */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="about" className="block text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 md:mb-2 md:uppercase md:tracking-wide">Tentang Saya / Catatan</label>
                                    <textarea id="about" value={data.about} onChange={(e) => setData('about', e.target.value)} rows="3" className={`w-full bg-white border ${errors.about ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3 text-[13px] md:text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-[#21409A]/20 focus:border-[#21409A] transition-all`} placeholder="Tambahkan catatan..."></textarea>
                                    {errors.about && <p className="text-xs text-red-600 mt-1.5 font-medium">{errors.about}</p>}
                                </div>

                            </div>
                        </div>

                    </form>
                </main>

                {/* Komponen: Footer Sistem */}
                <footer className="mt-auto shrink-0 bg-[#F4F5FA]">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 py-6 md:py-4 flex flex-col md:flex-row justify-between items-center text-[13px] text-gray-500 font-medium gap-4 md:gap-0">

                        {/* Hak Cipta */}
                        <div className="text-center md:text-left leading-relaxed">
                            © 2026, Sistem Peminjaman HSSE - PT Pertamina Geothermal Energy Tbk.
                        </div>

                        {/* Pemisah Visual Khusus Seluler */}
                        <div className="w-16 h-[2px] bg-gray-200 rounded-full md:hidden"></div>

                    </div>

                    {/* Elemen Visual Identitas Perusahaan */}
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