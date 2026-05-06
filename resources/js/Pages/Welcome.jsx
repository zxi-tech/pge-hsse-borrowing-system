import React, { useState, useEffect, useRef } from 'react';
import { Link, Head } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const user = auth?.user;

    // ================= STATES INTERAKTIVITAS =================
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    // Menutup dropdown profil jika user klik di luar area
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <>
            <Head title="SPB-HSSE | Pertamina Geothermal Energy" />

            <div className="min-h-screen bg-[#F4F7FF] font-sans text-gray-900 overflow-x-hidden flex flex-col selection:bg-[#21409A] selection:text-white antialiased">

                {/* ================= NAVBAR ================= */}
                <nav className="relative w-full max-w-[1536px] mx-auto flex items-center justify-between px-6 lg:px-12 xl:px-20 py-6 lg:py-8 z-50 bg-transparent">

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
                        <Link href={auth?.user?.role === 'admin' ? route('dashboard') : '/'} className="relative group py-2 text-[#21409A] hover:text-[#21409A] transition-colors duration-300">
                            {auth?.user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                        <Link href={route('borrow.create')} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            Ajukan Peminjaman
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                        <Link href={route('borrow.status')} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            Status
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                        <Link href={route('contact')} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            Contact Us
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                    </div>

                    {/* ZONA 3: Profil & Tombol Menu Mobile (Kanan) */}
                    <div className="flex items-center justify-end w-auto lg:w-1/4 shrink-0 gap-3 md:gap-4">

                        {auth?.user ? (
                            <div className="relative shrink-0" ref={profileMenuRef}>
                                <div onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className={`flex items-center space-x-2 md:space-x-3 cursor-pointer p-1.5 rounded-xl transition-all duration-200 border ${isProfileMenuOpen ? 'bg-white border-gray-200 shadow-sm' : 'border-transparent hover:bg-white/60 hover:border-gray-200'}`}>
                                    <div className="relative">
                                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#00A651] flex items-center justify-center text-white font-bold text-xs md:text-sm border-2 border-white shadow-sm overflow-hidden">
                                            {user?.photo ? (
                                                <img src={`/storage/${user.photo}`} alt={user?.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                            ) : null}
                                            <span className={`w-full h-full flex items-center justify-center ${user?.photo ? 'hidden' : ''}`}>{getInitials(user?.name)}</span>
                                        </div>
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div className="hidden md:flex flex-col text-left">
                                        <span className="text-[14px] font-bold text-gray-800 leading-tight">{user?.name || 'HSSE'}</span>
                                        <span className="text-[11px] text-[#21409A] font-semibold capitalize leading-tight">{user?.department || 'Departemen'}</span>
                                    </div>
                                    <svg className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 hidden md:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>

                                {/* Dropdown Profil */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-56 md:w-60 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Masuk sebagai</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link href={route('profile.edit')} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#21409A] transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Edit Profil</Link>
                                            {user?.role === 'admin' && (
                                                <Link href={route('dashboard')} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#21409A] transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> Dashboard Admin</Link>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-50 pt-1 mt-1">
                                            <Link href={route('logout')} method="post" as="button" className="flex items-center w-full gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg> Keluar</Link>
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

                        {/* HAMBURGER MENU BUTTON */}
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
                            <Link href={auth?.user?.role === 'admin' ? route('dashboard') : '/'} className="text-[15px] font-bold text-[#21409A] border-b border-gray-50 pb-2">
                                {auth?.user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                            </Link>
                            <Link href={route('borrow.create')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">Ajukan Peminjaman</Link>
                            <Link href={route('borrow.status')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">Status</Link>
                            <Link href={route('contact')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] pb-2">Contact Us</Link>
                        </div>
                    )}
                </nav>

                {/* ================= HERO SECTION ================= */}
                {/* Mengubah justify-center menjadi justify-start agar susunan dimulai dari atas */}
                <main className="relative flex-1 w-full max-w-[1536px] mx-auto px-6 lg:px-12 xl:px-20 flex flex-col lg:grid lg:grid-cols-2 items-center justify-start lg:justify-between pt-8 lg:pt-0 pb-10 z-10 min-h-[80vh] overflow-hidden lg:overflow-visible">

                    {/* Kolom Kiri: Teks */}
                    <div className="relative z-20 flex flex-col items-center text-center lg:items-start lg:text-left justify-start w-full">

                        <h1 className="text-[26px] sm:text-[34px] md:text-[48px] xl:text-[54px] font-semibold text-[#111827] leading-[1.15] tracking-tight drop-shadow-sm lg:drop-shadow-none">
                            Sistem Manajemen <br className="hidden lg:block" />
                            Peminjaman Barang <br className="hidden lg:block" />
                            <span className="font-black block mt-1 md:mt-2 tracking-normal">
                                <span className="text-[#1D7044]">H</span>
                                <span className="text-[#21409A]">S</span>
                                <span className="text-[#F37021]">S</span>
                                <span className="text-[#005B4E]">E</span>
                            </span>
                        </h1>

                        <p className="mt-3 md:mt-6 text-gray-800 lg:text-gray-600 text-[13px] md:text-[15px] xl:text-[16px] max-w-[340px] md:max-w-[500px] leading-relaxed mx-auto lg:mx-0 font-medium lg:font-normal">
                            Platform digital terpadu untuk mempermudah pengajuan, persetujuan, dan monitoring peminjaman barang HSSE guna meningkatkan efisiensi dan transparansi pengelolaan aset keselamatan kerja.
                        </p>

                        {/* Tombol diperkecil ukurannya (w-auto px-8 py-3) agar pas di tengah */}
                        <div className="mt-5 md:mt-10 mb-0">
                            <Link
                                href={auth?.user ? route('borrow.create') : route('login')}
                                className="inline-flex items-center justify-center px-8 py-3 md:px-8 bg-[#254294] hover:bg-[#1a2d6b] text-white rounded-xl text-[14px] md:text-[16px] font-medium shadow-xl shadow-blue-900/30 transition-all duration-300 transform hover:-translate-y-1 w-auto"
                            >
                                Ajukan Peminjaman
                            </Link>
                        </div>
                    </div>

                    {/* Kolom Kanan: Gambar (Di mobile jadi Background Absolute) */}
                    <div className="absolute inset-x-0 bottom-0 z-0 flex justify-center items-end opacity-[0.25] pointer-events-none lg:relative lg:opacity-100 lg:pointer-events-auto lg:justify-end lg:items-center">

                        <div className="absolute top-[40%] right-[-10%] lg:right-[-19%] w-[130%] opacity-25 z-0 pointer-events-none -translate-y-1/2 hidden sm:block">
                            <svg viewBox="0 0 600 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                                <ellipse cx="300" cy="175" rx="260" ry="65" transform="rotate(-15 300 175)" stroke="#111827" strokeWidth="2" />
                                <ellipse cx="300" cy="175" rx="260" ry="65" transform="rotate(15 300 175)" stroke="#111827" strokeWidth="2" />
                            </svg>
                        </div>

                        {/* Gambar diperlebar w-[150%] khusus mobile agar mengisi penuh tanpa terpotong kaku */}
                        <img
                            src="/images/hero-workers.png"
                            alt="Pekerja HSSE Pertamina"
                            className="w-[150%] max-w-[550px] lg:w-[900px] xl:w-[1000px] lg:max-w-none h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] lg:-translate-y-12 mb-[470px] lg:mb-0"
                        />
                    </div>
                </main>
            </div>
        </>
    );
}