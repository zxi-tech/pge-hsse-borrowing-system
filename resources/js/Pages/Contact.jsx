import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Contact({ auth }) {
    const user = auth?.user;

    // ================= STATES INTERAKTIVITAS DROPDOWN & MOBILE =================
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State untuk Menu HP
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

    // Helper Inisial Nama
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // ================= FORM LOGIC =================
    const { data, setData, post, processing, reset, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
    });

    const [isSent, setIsSent] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        // MENGIRIM DATA KE LARAVEL
        post(route('contact.store'), {
            preserveScroll: true, // Layar tidak lompat ke atas
            onSuccess: () => {
                setIsSent(true); // Tampilkan pesan sukses
                reset('subject', 'message'); // Kosongkan form isian
                setTimeout(() => setIsSent(false), 5000); // Hilangkan notif setelah 5 detik
            }
        });
    };

    return (
        <>
            <Head title="Contact Us" />

            <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-gray-800 selection:bg-[#21409A] selection:text-white">

                {/* ================= NAVBAR RESPONSIVE ================= */}
                <nav className="relative w-full max-w-[1536px] mx-auto flex items-center justify-between px-6 lg:px-12 xl:px-20 py-6 lg:py-8 z-50 bg-transparent shrink-0">
                    
                    {/* ZONA 1: Logo Kiri */}
                    <div className="flex items-center group cursor-pointer w-auto lg:w-1/4 shrink-0">
                        <img 
                            src="/images/pertamina-logo (1).png" 
                            alt="PGE" 
                            className="h-8 md:h-10 lg:h-12 object-contain transition-all duration-500 ease-out group-hover:scale-105" 
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

                        {/* 👇 CONTACT US (AKTIF) 👇 */}
                        <Link href={user ? route('contact') : route('login')} className="relative group py-2 text-[#21409A] hover:text-[#21409A] transition-colors duration-300">
                            Contact Us
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                    </div>

                    {/* ZONA 3: Profil & Tombol Mobile (Kanan) */}
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

                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-56 md:w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Masuk sebagai</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link href={route('profile.edit')} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#21409A]"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>Edit Profil</Link>
                                            {user?.role === 'admin' && (
                                                <Link href={route('dashboard')} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#21409A]"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>Dashboard Admin</Link>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-50 pt-1 mt-1">
                                            <Link href={route('logout')} method="post" as="button" className="flex items-center w-full gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>Keluar (Logout)</Link>
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
                        <div className="absolute top-[80px] left-0 w-full bg-white shadow-lg border-b border-gray-100 z-50 lg:hidden flex flex-col px-6 py-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <Link href={user ? (user.role === 'admin' ? route('dashboard') : '/') : route('login')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">
                                {user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                            </Link>
                            <Link href={user ? route('borrow.create') : route('login')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">
                                Ajukan Peminjaman
                            </Link>
                            <Link href={user ? route('borrow.status') : route('login')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">
                                Status
                            </Link>
                            <Link href={user ? route('contact') : route('login')} className="text-[15px] font-bold text-[#21409A] pb-2">
                                Contact Us
                            </Link>
                        </div>
                    )}
                </nav>

                {/* ================= KONTEN UTAMA ================= */}
                <main className="flex-grow max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 mt-6 mb-20 w-full">

                    {/* Header Text */}
                    <div className="mb-12 text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mb-3 tracking-tight">Hubungi Kami</h1>
                        <p className="text-sm text-gray-500 max-w-xl mx-auto font-medium leading-relaxed">
                            Punya pertanyaan seputar peminjaman APD atau kendala pada sistem HSSE? Jangan ragu untuk menghubungi tim admin kami.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

                        {/* Area Kiri: Info Kontak */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* Kartu Alamat Utama */}
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=PT.+Pertamina+Geothermal+Energy+Area+Lahendong,+Tomohon"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-white p-8 rounded-[24px] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#21409A] transition-colors">
                                    <svg className="w-6 h-6 text-[#21409A] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2">
                                    PT. Pertamina Geothermal Energy<br />Area Lahendong
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    Kelurahan Tondangow, Kecamatan Tomohon Selatan<br />
                                    Kota Tomohon, Sulawesi Utara 95438<br />
                                    Indonesia
                                </p>
                            </a>

                            {/* GRID 2x2 UNTUK WA & EMAIL */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* WA 1 - Operasional */}
                                <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm hover:border-green-300 hover:shadow-md transition-all group block">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#00A651] transition-colors">
                                        <svg className="w-5 h-5 text-[#00A651] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[13px] font-bold text-gray-900 mb-1">WA Admin HSSE</h3>
                                    <p className="text-xs text-gray-500 font-medium">+62 812-3456-7890</p>
                                </a>

                                {/* Email 1 - Operasional */}
                                <a href="mailto:hsse.support@pge.com" className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm hover:border-red-300 hover:shadow-md transition-all group block">
                                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#ED1C24] transition-colors">
                                        <svg className="w-5 h-5 text-[#ED1C24] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.728L12 16.64l-6.545-4.912v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[13px] font-bold text-gray-900 mb-1">Email Admin HSSE</h3>
                                    <p className="text-[11px] text-gray-500 font-medium truncate">hsse.support@pge.com</p>
                                </a>

                                {/* WA 2 - Sistem/IT */}
                                <a href="https://wa.me/6289876543210" target="_blank" rel="noreferrer" className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm hover:border-green-300 hover:shadow-md transition-all group block">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#00A651] transition-colors">
                                        <svg className="w-5 h-5 text-[#00A651] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[13px] font-bold text-gray-900 mb-1">WA Admin IT</h3>
                                    <p className="text-xs text-gray-500 font-medium">+62 898-7654-3210</p>
                                </a>

                                {/* Email 2 - Keluhan Umum */}
                                <a href="mailto:complaint@pge.com" className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm hover:border-red-300 hover:shadow-md transition-all group block">
                                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#ED1C24] transition-colors">
                                        <svg className="w-5 h-5 text-[#ED1C24] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.728L12 16.64l-6.545-4.912v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[13px] font-bold text-gray-900 mb-1">Email Admin IT</h3>
                                    <p className="text-[11px] text-gray-500 font-medium truncate">layanan@pge.com</p>
                                </a>

                            </div>
                        </div>

                        {/* Area Kanan: Form Pesan */}
                        <div className="lg:col-span-7">
                            <div className="bg-white p-8 lg:p-10 rounded-[24px] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
                                <h2 className="text-xl font-extrabold text-gray-900 mb-6">Kirim Pesan</h2>

                                {isSent && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm font-bold text-[#00A651] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Pesan Anda berhasil terkirim. Admin kami akan segera merespon!
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                        {/* INPUT NAMA (TERKUNCI / BACA SAJA) */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nama Lengkap</label>
                                            <div className="relative">
                                                <input type="text" value={data.name} readOnly className="w-full bg-[#F4F5F9] border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 cursor-not-allowed outline-none" />
                                                <svg className="absolute right-4 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            </div>
                                        </div>

                                        {/* INPUT EMAIL (TERKUNCI / BACA SAJA) */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email</label>
                                            <div className="relative">
                                                <input type="email" value={data.email} readOnly className="w-full bg-[#F4F5F9] border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 cursor-not-allowed outline-none" />
                                                <svg className="absolute right-4 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Input Subjek dan Pesan tetap bisa diedit */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Subjek Pesan *</label>
                                        <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} required className="w-full bg-[#F8FAFC] border-transparent focus:bg-white focus:border-[#21409A]/30 focus:ring-4 focus:ring-[#21409A]/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 transition-all outline-none" placeholder="Contoh: Kendala Peminjaman Sepatu Safety..." />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Pesan Anda *</label>
                                        <textarea value={data.message} onChange={e => setData('message', e.target.value)} required rows="5" className="w-full bg-[#F8FAFC] border-transparent focus:bg-white focus:border-[#21409A]/30 focus:ring-4 focus:ring-[#21409A]/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 transition-all outline-none resize-none" placeholder="Ceritakan detail pertanyaan atau kendala Anda di sini..."></textarea>
                                    </div>

                                    <button type="submit" disabled={processing} className="w-full py-4 bg-[#21409A] hover:bg-[#1a3380] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2">
                                        {processing ? 'Mengirim...' : (
                                            <>
                                                Kirim Pesan Sekarang
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="mt-auto shrink-0 bg-[#F4F5FA]">
     <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 py-4 flex flex-col md:flex-row justify-between items-center text-[13px] text-gray-500 font-medium">
        <div>© 2026, Sistem Peminjaman HSSE - PT Pertamina Geothermal Energy Tbk.</div>
        
        {/* 👇 CREDIT DEVELOPER (NAMA ASLI + GITHUB) 👇 */}
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
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
    
    {/* Garis Warna Warni Bawah */}
    <div className="h-1.5 flex w-full mt-4 md:mt-0">
        <div className="bg-[#21409A] flex-1"></div>
        <div className="bg-[#ED1C24] flex-1"></div>
        <div className="bg-[#FBBF24] flex-1"></div>
    </div>
</footer>

            </div>
        </>
    );
}