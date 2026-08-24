import React, { useState, useEffect, useRef } from 'react';
import { Link, Head } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const user = auth?.user;

    // STATES INTERAKTIVITAS
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

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const apdKatalog = [
        {
            id: 1,
            title: "Safety Helmet",
            desc: "Pelindung kepala standar operasional untuk mencegah cedera akibat benturan atau benda jatuh di area kerja.",
            image: "/images/Helmet.png",
            cardBg: "bg-[#F8F9FA] border-2 border-gray-100",
            textStyle: "text-gray-800",
            pillBg: "bg-[#00A651] text-white",
            iconBg: "bg-[#18191E] text-white group-hover:bg-[#00A651]",
            linkText: "Learn more",
            linkHref: "https://www.pge.pertamina.com/id/kesehatan-dan-keselamatan-kerja",
            imageSizeClasses: "max-h-24 sm:max-h-48 scale-[1.35]",
            imagePositionClasses: "-translate-y-2 -translate-x-1",
        },
        {
            id: 2,
            title: "Safety Goggles",
            desc: "Perlindungan area mata dari paparan debu, percikan bahan kimia, dan partikel berbahaya di lokasi operasional.",
            image: "/images/Kaca-Mata.png",
            cardBg: "bg-[#00A651]",
            textStyle: "text-white",
            pillBg: "bg-white text-gray-900",
            iconBg: "bg-[#18191E] text-white group-hover:bg-white group-hover:text-[#00A651]",
            linkText: "Learn more",
            linkHref: "https://www.pge.pertamina.com/id/kesehatan-dan-keselamatan-kerja",
            imageSizeClasses: "max-h-20 sm:max-h-48 scale-[1.5]",
            imagePositionClasses: "-translate-y-2 -translate-x-1",
        },
        {
            id: 3,
            title: "Coverall Onshore",
            desc: "Pakaian kerja teknis dengan fitur flame retardant dan high-visibility untuk perlindungan tubuh menyeluruh di area operasional darat.",
            image: "/images/Coverall.png",
            cardBg: "bg-[#1A1C23]",
            textStyle: "text-white",
            pillBg: "bg-white text-gray-900",
            iconBg: "bg-white text-[#1A1C23] group-hover:bg-[#00A651] group-hover:text-white",
            linkText: "Learn more",
            linkHref: "https://www.pge.pertamina.com/id/kesehatan-dan-keselamatan-kerja",
            imageSizeClasses: "max-h-28 sm:max-h-48 scale-[1.2]",
            imagePositionClasses: "translate-y-1 -translate-x-1",
        },
        {
            id: 4,
            title: "Safety Shoes",
            desc: "Alas kaki pelindung dengan ujung besi (steel toe) untuk melindungi kaki dari benturan benda berat dan risiko tertusuk di area proyek.",
            image: "/images/Safety Shoes.png",
            cardBg: "bg-[#F8F9FA] border-2 border-gray-100",
            textStyle: "text-gray-800",
            pillBg: "bg-[#00A651] text-white",
            iconBg: "bg-[#18191E] text-white group-hover:bg-[#00A651]",
            linkText: "Learn more",
            linkHref: "https://www.pge.pertamina.com/id/kesehatan-dan-keselamatan-kerja",
            imageSizeClasses: "max-h-24 sm:max-h-48 scale-[1.3]",
            imagePositionClasses: "-translate-y-2 -translate-x-1",
        },
        {
            id: 5,
            title: "Safety Gloves",
            desc: "Proteksi tangan standar HSSE yang fleksibel dan nyaman tanpa mengurangi ketangkasankerja.",
            image: "/images/Safety Gloves.png",
            cardBg: "bg-[#00A651]",
            textStyle: "text-white",
            pillBg: "bg-white text-gray-900",
            iconBg: "bg-[#18191E] text-white group-hover:bg-white group-hover:text-[#00A651]",
            linkText: "Learn more",
            linkHref: "https://www.pge.pertamina.com/id/kesehatan-dan-keselamatan-kerja",
            imageSizeClasses: "max-h-20 sm:max-h-48 scale-[1.4]",
            imagePositionClasses: "-translate-y-2 -translate-x-1",
        },
        {
            id: 6,
            title: "Layanan Lainnya",
            desc: "Butuh bantuan teknis atau laporan kerusakan alat? Tim HSSE siap membantu koordinasi kebutuhan peralatan Anda.",
            isIcon: true,
            cardBg: "bg-[#1A1C23]",
            textStyle: "text-white",
            pillBg: "bg-[#00A651] text-white",
            iconBg: "bg-white text-[#1A1C23] group-hover:bg-[#00A651] group-hover:text-white",
            linkText: "Contact Us",
            linkHref: auth?.user ? route('contact') : route('login')
        }
    ];

    return (
        <>
            <Head title="SiapAPD | Pertamina Geothermal Energy" />

            <div className="min-h-screen bg-[#F4F7FF] font-sans text-gray-900 overflow-x-hidden flex flex-col selection:bg-[#21409A] selection:text-white antialiased">

                <nav className="relative w-full max-w-[1536px] mx-auto flex items-center justify-between px-6 lg:px-12 xl:px-20 py-6 lg:py-8 z-50 bg-transparent shrink-0">

                    {/* ZONA 1: Logo Kiri */}
                    <div className="flex items-center group w-auto lg:w-1/4 shrink-0">
                        <img
                            src="/images/pertamina-logo (1).png"
                            alt="Pertamina Geothermal Energy"
                            fetchpriority="high"
                            className="h-8 md:h-10 lg:h-12 object-contain transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x50?text=Logo+PGE"; }}
                        />
                    </div>

                    {/* ZONA 2: Navigasi Desktop */}
                    <div className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-12 text-[14px] font-bold text-gray-600">
                        <Link href={user ? (user.role === 'admin' ? route('dashboard') : '/') : route('login')} className="relative group py-2 text-[#21409A] hover:text-[#21409A] transition-colors duration-300">
                            {user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
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

                    {/* ZONA 3: Profil & Menu Mobile */}
                    <div className="flex items-center justify-end w-auto lg:w-1/4 shrink-0 gap-3 md:gap-4">
                        {user ? (
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
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 ml-1 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
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

                <main className="relative w-full max-w-[1536px] mx-auto px-6 lg:px-12 xl:px-20 flex flex-col lg:grid lg:grid-cols-2 items-start justify-start lg:justify-between pt-8 lg:pt-0 pb-12 lg:pb-0 z-10 min-h-0 lg:min-h-[42vh] overflow-hidden lg:overflow-visible shrink-0 antialiased">

                    {/* Teks */}
                    <div className="relative z-20 flex flex-col items-start text-left justify-start w-full mt-0 lg:mt-8">
                        <h1 className="text-[26px] sm:text-[34px] md:text-[48px] xl:text-[54px] font-semibold text-[#111827] leading-[1.15] tracking-tight antialiased">
                            Sistem Manajemen <br className="hidden lg:block" />
                            Peminjaman APD <br className="hidden lg:block" />
                            <span className="font-black block mt-1 md:mt-2 tracking-normal">
                                <span className="text-[#1D7044]">H</span><span className="text-[#21409A]">S</span><span className="text-[#F37021]">S</span><span className="text-[#005B4E]">E</span>
                            </span>
                        </h1>
                        <p className="mt-3 md:mt-6 text-gray-800 lg:text-gray-600 text-[13px] md:text-[15px] xl:text-[16px] max-w-[340px] md:max-w-[500px] leading-relaxed font-medium lg:font-normal">
                            Platform digital terpadu untuk mempermudah pengajuan, persetujuan, dan monitoring peminjaman barang HSSE guna meningkatkan efisiensi dan transparansi pengelolaan aset keselamatan kerja.
                        </p>
                        <div className="mt-5 md:mt-10 mb-0">
                            <Link href={user ? route('borrow.create') : route('login')} className="inline-flex items-center justify-center px-8 py-3 bg-[#254294] hover:bg-[#1a2d6b] text-white rounded-xl text-[14px] md:text-[16px] font-medium shadow-xl shadow-blue-900/30 transition-all duration-300 transform hover:-translate-y-1 w-auto">
                                Ajukan Peminjaman
                            </Link>
                        </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-18 sm:bottom-28 z-0 flex justify-center items-end opacity-[0.35] pointer-events-none lg:relative lg:bottom-auto lg:opacity-100 lg:pointer-events-auto lg:justify-end lg:items-center">
                        <img
                            src="/images/hero-worker3.png"
                            alt="Pekerja HSSE Pertamina"
                            fetchpriority="high"
                            loading="eager"
                            className="w-[160%] sm:w-[120%] max-w-[850px] sm:max-w-[700px] lg:w-[950px] xl:w-[1050px] lg:max-w-none h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] translate-x-[-60px] translate-y-[-80px] lg:translate-x-[10px] lg:translate-y-[-80px] origin-bottom"
                        />
                    </div>
                </main>

                <section className="w-full bg-transparent pt-2 pb-16 lg:pt-3 lg:pb-24 shrink-0 flex-1 relative antialiased z-10">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20">

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-12 mb-6 md:mb-12">
                            <h2 className="inline-block bg-[#00A651] text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold text-lg md:text-3xl tracking-wide shrink-0 antialiased">
                                Alat Pelindung Diri
                            </h2>
                            <p className="text-gray-700 text-[12px] sm:text-sm md:text-[15px] max-w-2xl font-medium leading-relaxed">
                                Kami menyediakan berbagai perlengkapan HSSE (Health, Safety, Security, and Environment) standar industri untuk menjamin keamanan dan keselamatan setiap personel di area operasional geothermal.
                            </p>
                        </div>

                        {/* Grid Katalog */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
                            {apdKatalog.map((item) => (
                                <div
                                    key={item.id}
                                    className={`relative overflow-hidden p-4 sm:p-10 rounded-[16px] sm:rounded-[32px] flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-6 transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] ${item.cardBg}`}
                                >
                                    {/* KIRI: Teks & Tombol */}
                                    <div className="flex flex-col h-full w-[70%] sm:w-[55%] z-10 relative">
                                        <div className="mb-1.5 sm:mb-4">
                                            <span className={`hidden sm:inline-block px-4 py-1.5 rounded-lg text-lg font-bold tracking-wide ${item.pillBg}`}>
                                                {item.title}
                                            </span>
                                            <h3 className={`sm:hidden text-[15px] font-extrabold tracking-wide mb-0.5 ${item.textStyle}`}>
                                                {item.title}
                                            </h3>
                                        </div>

                                        <p className={`text-[11px] sm:text-[13px] lg:text-sm leading-relaxed mb-4 sm:mb-8 opacity-90 font-medium ${item.textStyle}`}>
                                            {item.desc}
                                        </p>

                                        <div className="mt-auto">
                                            <Link href={item.linkHref} className="inline-flex items-center gap-1 sm:gap-3 group w-fit cursor-pointer">
                                                <div className={`hidden sm:flex w-8 h-8 rounded-full items-center justify-center transition-colors duration-300 shadow-sm ${item.iconBg}`}>
                                                    <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 17L17 7M17 7H9M17 7v8" />
                                                    </svg>
                                                </div>
                                                <span className={`text-[11px] sm:text-[13px] font-bold tracking-wide transition-opacity group-hover:opacity-80 ${item.textStyle}`}>
                                                    {item.linkText}
                                                </span>
                                                <svg className={`sm:hidden w-2.5 h-2.5 ${item.textStyle}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="absolute sm:relative bottom-0 sm:bottom-auto right-0 sm:right-auto w-[40%] sm:w-[45%] flex justify-end sm:justify-center items-end sm:items-center h-full z-0 sm:z-10 opacity-80 sm:opacity-100 pointer-events-none">
                                        {item.isIcon ? (
                                            <svg className="w-20 h-20 sm:w-28 sm:h-28 text-white opacity-90 drop-shadow-md -translate-x-4 -translate-y-2 sm:translate-x-0 sm:translate-y-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10a9 9 0 0118 0v4a2 2 0 01-2 2h-1.5a1.5 1.5 0 01-1.5-1.5v-3a1.5 1.5 0 011.5-1.5H19v-1a7 7 0 10-14 0v1h1.5A1.5 1.5 0 018 12.5v3A1.5 1.5 0 016.5 17H5a2 2 0 01-2-2v-4z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 15.5l-2.5 2.5A2 2 0 007.5 21h9a2 2 0 002-2.91L16 15.5" />
                                                <circle cx="17.5" cy="14.5" r="1.5" fill="currentColor" />
                                            </svg>
                                        ) : (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className={`object-contain drop-shadow-xl origin-bottom-right sm:origin-center sm:translate-y-0 sm:translate-x-0 transition-transform duration-500 group-hover:scale-[1.55] sm:group-hover:scale-125 
                                                    ${item.imageSizeClasses || 'max-h-24 sm:max-h-48 scale-110'} 
                                                    ${item.imagePositionClasses || '-translate-y-4 -translate-x-4'}`
                                                }
                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200/EFEFEF/21409A?text=Gambar+APD"; }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

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
        </>
    );
}