import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Contact({ auth }) {
    const user = auth?.user;

    // State Management: Interaktivitas UI & Navigasi Seluler
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper: Format inisial nama untuk avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Manajemen State: Inisialisasi form Inertia
    const { data, setData, post, processing, reset, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
    });

    const [isSent, setIsSent] = useState(false);

    // Handler: Pengiriman data form ke peladen
    const submit = (e) => {
        e.preventDefault();

        post(route('contact.store'), {
            preserveScroll: true, // Mempertahankan posisi scroll
            onSuccess: () => {
                setIsSent(true); // Update state feedback sukses
                reset('subject', 'message'); // Reset nilai input teks spesifik
                setTimeout(() => setIsSent(false), 5000); // Auto-hide alert setelah 5 detik
            }
        });
    };

    return (
        <>
            <Head title="Contact Us" />

            <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-gray-800 selection:bg-[#21409A] selection:text-white">

                {/* Komponen: Navigasi Utama */}
                <nav className="relative w-full max-w-[1536px] mx-auto flex items-center justify-between px-6 lg:px-12 xl:px-20 py-6 lg:py-8 z-50 bg-transparent shrink-0">

                    {/* Bagian: Logo Instansi */}
                    <div className="flex items-center group cursor-pointer w-auto lg:w-1/4 shrink-0">
                        <img
                            src="/images/pertamina-logo (1).png"
                            alt="PGE"
                            className="h-8 md:h-10 lg:h-12 object-contain transition-all duration-500 ease-out group-hover:scale-105"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x50?text=Logo+PGE"; }}
                        />
                    </div>

                    {/* Bagian: Tautan Navigasi Utama Desktop */}
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

                        {/* Tautan Aktif: Contact Us */}
                        <Link href={user ? route('contact') : route('login')} className="relative group py-2 text-[#21409A] hover:text-[#21409A] transition-colors duration-300">
                            Contact Us
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                    </div>

                    {/* Bagian: Profil Pengguna dan Kontrol Menu Seluler */}
                    <div className="flex items-center justify-end w-auto lg:w-1/4 shrink-0 gap-3 md:gap-4">
                        {user ? (
                            <div className="relative shrink-0" ref={profileMenuRef}>
                                <div onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className={`flex items-center space-x-2 md:space-x-3 cursor-pointer p-1.5 rounded-xl transition-all duration-200 border ${isProfileMenuOpen ? 'bg-white border-gray-200 shadow-sm' : 'border-transparent hover:bg-white hover:shadow-sm hover:border-gray-200'}`}>
                                    <div className="relative">
                                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#00A651] flex items-center justify-center text-white font-bold text-xs md:text-sm border-2 border-white shadow-sm overflow-hidden">
                                            {user?.photo ? (<img src={`/storage/${user.photo}`} alt={user?.name} className="w-full h-full object-cover" />) : (<span>{getInitials(user?.name)}</span>)}
                                        </div>
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div className="hidden md:flex flex-col text-left">
                                        <span className="text-[14px] font-bold text-gray-800 leading-tight">{user?.name || 'HSSE'}</span>
                                        <span className="text-[11px] text-[#21409A] font-semibold capitalize leading-tight">{user?.department || 'Departemen'}</span>
                                    </div>
                                    <svg className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 hidden md:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>

                                {/* Konten Menu Dropdown Profil */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-56 md:w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Masuk sebagai</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user?.email || 'user@pertamina.com'}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link href={route('profile.edit')} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#21409A] transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Edit Profil</Link>
                                            {user?.role === 'admin' && (
                                                <Link href={route('dashboard')} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#21409A] transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> Dashboard Admin</Link>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-50 pt-1 mt-1">
                                            <Link href={route('logout')} method="post" as="button" className="flex items-center w-full gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg> Keluar</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href={route('login')} className="relative inline-flex items-center justify-center px-5 py-2 md:px-8 md:py-2.5 rounded-xl border border-[#21409A] bg-transparent font-medium text-[#21409A] text-sm md:text-base overflow-hidden group hover:border-[#21409A] transition-all duration-300">
                                <span className="absolute inset-0 w-full h-full bg-[#21409A] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                                <span className="relative group-hover:text-white transition-colors duration-300">Login</span>
                            </Link>
                        )}

                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 ml-1 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none z-50 relative">
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
                                    className="group flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-gray-50 active:scale-[0.985] transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3.5">

                                        <div className="w-11 h-11 shrink-0 rounded-[14px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 transition-all duration-200 group-hover:bg-[#21409A]/10 group-hover:border-[#21409A]/15 group-hover:text-[#21409A]">
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
                                            <span className="text-[14px] font-semibold text-gray-700 group-hover:text-[#21409A] transition-colors leading-tight">
                                                {user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                                            </span>

                                            <span className="text-[11px] text-gray-400 mt-0.5">
                                                Lihat informasi utama
                                            </span>
                                        </div>

                                    </div>

                                    <svg
                                        className="w-4 h-4 text-gray-300 group-hover:text-[#21409A] group-hover:translate-x-0.5 transition-all duration-200"
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

                                {/* Hubungi Kami (ACTIVE STATE) */}
                                <Link
                                    href={user ? route('contact') : route('login')}
                                    className="group flex items-center justify-between px-3.5 py-3 rounded-2xl bg-gray-900/[0.06] hover:bg-gray-900/[0.10] active:scale-[0.985] transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3.5">

                                        <div className="w-11 h-11 shrink-0 rounded-[14px] bg-white border border-gray-900/10 shadow-sm flex items-center justify-center text-gray-900 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
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
                                            <span className="text-[14px] font-bold text-gray-900 transition-colors leading-tight">
                                                Butuh Bantuan?
                                            </span>

                                            <span className="text-[11px] text-gray-900/50 mt-0.5">
                                                Kami siap membantu
                                            </span>
                                        </div>

                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-gray-900 group-hover:bg-white transition-colors">
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

                            </div>

                        </div>
                    )}
                </nav>

                {/* Komponen: Konten Utama Halaman */}
                <main className="flex-grow max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 mt-6 mb-20 w-full">

                    {/* Header Text */}
                    <div className="mb-12 text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mb-3 tracking-tight">Hubungi Kami</h1>
                        <p className="text-sm text-gray-500 max-w-xl mx-auto font-medium leading-relaxed">
                            Punya pertanyaan seputar peminjaman APD atau kendala pada sistem HSSE? Jangan ragu untuk menghubungi tim admin kami.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Bagian Kiri: Kartu Informasi Kontak */}
                        <div className="lg:col-span-4 flex flex-col gap-4">

                            {/* Kartu Informasi: Alamat Kantor */}
                            <a
                                href="https://maps.google.com/?q=PT+Pertamina+Geothermal+Energy+Area+Lahendong"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm flex items-start gap-4 transition-all duration-300 hover:border-[#21409A]/40 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer"
                                title="Buka di Google Maps"
                            >
                                <div className="w-10 h-10 shrink-0 bg-[#F1F5F9] rounded-full flex items-center justify-center mt-0.5 group-hover:bg-[#21409A] transition-colors duration-300">
                                    <svg className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                                        Kantor
                                        <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#21409A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    </h3>
                                    <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                                        Jl. Raya Tomohon No.420, Kolongan Satu,<br />
                                        Kec. Tomohon Sel., Kota Tomohon, Sulawesi Utara 95362
                                    </p>
                                </div>
                            </a>

                            {/* Kartu Informasi: Dukungan WhatsApp */}
                            <div className="bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-center gap-3 mb-4">
                                    <svg className="w-5 h-5 text-[#00A651]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    <h3 className="text-[15px] font-bold text-gray-900">WhatsApp Support</h3>
                                </div>
                                <hr className="border-gray-100 mb-4" />
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[12px] font-bold text-gray-900 mb-0.5">Admin HSSE</p>
                                        <a href="https://wa.me/62895635778291" target="_blank" rel="noopener noreferrer" className="text-[12px] text-gray-600 font-medium hover:text-[#00A651] hover:underline transition-colors block">
                                            +62 812-3456-7890
                                        </a>
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold text-gray-900 mb-0.5">Admin HSSE 2</p>
                                        <a href="https://wa.me/628991650508" target="_blank" rel="noopener noreferrer" className="text-[12px] text-gray-600 font-medium hover:text-[#00A651] hover:underline transition-colors block">
                                            +62 898-7654-3210
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Kartu Informasi: Dukungan Email */}
                            <div className="bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-center gap-3 mb-4">
                                    {/* Ikon Microsoft Outlook SVG */}
                                    <svg className="w-5 h-5 text-[#0072C6]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21.143 0H2.857A2.857 2.857 0 000 2.857v18.286A2.857 2.857 0 002.857 24h18.286A2.857 2.857 0 0024 21.143V2.857A2.857 2.857 0 0021.143 0zM12 14.57l-7.43-5.572h14.86zM4.57 6.857h14.86v1.144L12 13.57 4.57 9.001zm0 3.143l4.286 3.143-4.286 3.143zm14.86 6.286H4.57v-.571l4.286-3.143 3.144 2.286 3.143-2.286 4.286 3.143zm0-1.143l-4.286-3.143 4.286-3.143z" />
                                    </svg>
                                    <h3 className="text-[15px] font-bold text-gray-900">Email Support</h3>
                                </div>
                                <hr className="border-gray-100 mb-4" />
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[12px] font-bold text-gray-900 mb-0.5">HSSE Support</p>
                                        <a href="mailto:admin.k3ll.LHD@pertamina.com" className="text-[12px] text-[#21409A] font-bold hover:underline break-all block">admin.k3ll.LHD@pertamina.com</a>
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold text-gray-900 mb-0.5">ICT PGE Support</p>
                                        <a href="mailto:Admin.it.lhd@pertamina.com" className="text-[12px] text-[#21409A] font-bold hover:underline break-all block">Admin.it.lhd@pertamina.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bagian Kanan: Formulir Pesan */}
                        <div className="lg:col-span-8">
                            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[16px] border border-gray-200 shadow-sm h-full">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Kirim Pesan</h2>

                                {isSent && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm font-bold text-[#00A651] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Message sent successfully! Our admin will respond shortly.
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-5">

                                    {/* Baris 1: Nama & Email (Hanya Baca) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[12px] font-bold text-gray-900 mb-2">Nama Lengkap</label>
                                            <div className="relative">
                                                <input type="text" value={data.name} readOnly disabled className="w-full bg-[#E5E7EB] border border-transparent rounded-md px-4 py-2.5 text-[13px] font-medium text-gray-500 cursor-not-allowed outline-none opacity-80" />
                                                <svg className="absolute right-3.5 top-3 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[12px] font-bold text-gray-900 mb-2">Alamat Email</label>
                                            <div className="relative">
                                                <input type="email" value={data.email} readOnly disabled className="w-full bg-[#E5E7EB] border border-transparent rounded-md px-4 py-2.5 text-[13px] font-medium text-gray-500 cursor-not-allowed outline-none opacity-80" />
                                                <svg className="absolute right-3.5 top-3 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Baris 2: Subjek Pesan */}
                                    <div>
                                        <label className="block text-[12px] font-bold text-gray-900 mb-2">Subjek Pesan</label>
                                        <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} required className="w-full bg-white border border-gray-200 focus:border-[#21409A] focus:ring-2 focus:ring-[#21409A]/10 rounded-md px-4 py-2.5 text-[13px] font-medium text-gray-900 transition-all outline-none" placeholder="Contoh: Kendala Peminjaman Safety Helmet..." />
                                    </div>

                                    {/* Baris 3: Isi Pesan */}
                                    <div>
                                        <label className="block text-[12px] font-bold text-gray-900 mb-2">Pesan Anda</label>
                                        <textarea value={data.message} onChange={e => setData('message', e.target.value)} required rows="5" className="w-full bg-white border border-gray-200 focus:border-[#21409A] focus:ring-2 focus:ring-[#21409A]/10 rounded-md px-4 py-3 text-[13px] font-medium text-gray-900 transition-all outline-none resize-none" placeholder="Ceritakan detail pertanyaan atau kendala Anda di sini..."></textarea>
                                    </div>

                                    {/* Tombol Aksi: Kirim Pesan */}
                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={processing} className="bg-[#21409A] hover:bg-[#1a3380] text-white px-6 py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                            {processing ? 'Sending...' : (
                                                <>
                                                    Kirim Pesan Sekarang
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="mt-auto shrink-0 bg-[#F4F5FA]">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 py-6 md:py-4 flex flex-col md:flex-row justify-between items-center text-[13px] text-gray-500 font-medium gap-4 md:gap-0">

                        {/* Hak Cipta */}
                        <div className="text-center md:text-left leading-relaxed">
                            © 2026, Sistem Peminjaman HSSE - PT Pertamina Geothermal Energy Tbk.
                        </div>

                        {/* Pemisah Visual Khusus Seluler */}
                        <div className="w-16 h-[2px] bg-gray-300 rounded-full md:hidden"></div>

                        {/* Atribusi Pengembang */}
                        <div className="flex items-center justify-center space-x-2">
                            <span>Developed by</span>
                            <a
                                href="https://github.com/zxi-tech"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[#21409A] hover:text-[#1a3380] font-bold transition-colors group"
                                title="Lihat Portofolio GitHub"
                            >
                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 100 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                                </svg>
                                Timothy (@zxi-tech)
                            </a>
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