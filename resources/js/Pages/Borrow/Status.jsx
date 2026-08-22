import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Status({ auth, transactions }) {
    const user = auth?.user;

    // ================= STATE MANAGEMENT: UI INTERACTIVITY =================
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    // ================= STATE MANAGEMENT: FILTER & SEARCH =================
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);
    const [statusFilter, setStatusFilter] = useState('Semua');
    const statusOptions = ['Semua', 'Menunggu', 'Dipinjam', 'Selesai', 'Ditolak', 'Terlambat'];

    const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
    const timeFilterRef = useRef(null);
    const [timeFilter, setTimeFilter] = useState('Semua Waktu');
    const timeOptions = ['Semua Waktu', 'Hari Ini', '7 Hari Terakhir', 'Bulan Ini', 'Tahun Ini'];

    const [searchQuery, setSearchQuery] = useState('');

    // ================= STATE MANAGEMENT: PAGINATION =================
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Effect: Me-reset paginasi ke halaman pertama saat parameter pencarian/filter diubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, timeFilter]);

    // Effect: Event Listener untuk menutup dropdown (Profil & Filter) saat user klik di luar elemen (Outside Click)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileMenuOpen(false);
            if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
            if (timeFilterRef.current && !timeFilterRef.current.contains(event.target)) setIsTimeFilterOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ================= DATA PROCESSING: VISUAL OVERRIDE (LATE STATUS) =================
    // Mencegat (Intercept) data transaksi untuk menyuntikkan status 'Terlambat' secara dinamis berdasarkan perbandingan tanggal (Frontend check)
    const processedTransactions = useMemo(() => {
        if (!transactions) return [];

        return transactions.map(trx => {
            let currentStatus = trx.status?.toLowerCase();

            // Cek jika status barang masih dipinjam/disetujui dan memiliki batas waktu pengembalian (end_date)
            if ((currentStatus === 'dipinjam' || currentStatus === 'disetujui') && trx.end_date) {
                const endDate = new Date(trx.end_date);
                const today = new Date();

                // Normalisasi jam ke 00:00:00 untuk perbandingan murni berdasarkan hari/tanggal
                endDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                // Override status ke 'terlambat' jika tanggal hari ini telah melewati batas waktu pengembalian
                if (today > endDate) {
                    currentStatus = 'terlambat';
                }
            }
            return { ...trx, status: currentStatus };
        });
    }, [transactions]);


    // ================= DATA FILTERING ENGINE =================
    // Mem-filter array hasil proses (processedTransactions) berdasarkan kombinasi 3 kriteria: Status, String Query, dan Time Range
    const filteredTransactions = processedTransactions.filter(trx => {
        // 1. Cek Kesesuaian Status
        const matchesStatus = statusFilter === 'Semua' || trx.status === statusFilter.toLowerCase();

        // 2. Cek Kesesuaian Pencarian String (ID Transaksi, Nama Barang, Tujuan)
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            (trx.id || '').toLowerCase().includes(searchLower) ||
            (trx.items || '').toLowerCase().includes(searchLower) ||
            (trx.purpose || '').toLowerCase().includes(searchLower);

        // 3. Cek Kesesuaian Rentang Waktu (Berdasarkan timestamp created_at)
        let matchesTime = true;
        if (timeFilter !== 'Semua Waktu' && trx.created_at) {
            const trxDate = new Date(trx.created_at);
            const today = new Date();

            if (timeFilter === 'Hari Ini') {
                matchesTime = trxDate.toDateString() === today.toDateString();
            } else if (timeFilter === '7 Hari Terakhir') {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 7);
                matchesTime = trxDate >= sevenDaysAgo && trxDate <= today;
            } else if (timeFilter === 'Bulan Ini') {
                matchesTime = trxDate.getMonth() === today.getMonth() && trxDate.getFullYear() === today.getFullYear();
            } else if (timeFilter === 'Tahun Ini') {
                matchesTime = trxDate.getFullYear() === today.getFullYear();
            }
        }

        return matchesStatus && matchesSearch && matchesTime;
    });

    // ================= PAGINATION LOGIC CALCULATION =================
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem); // Array final yang dirender ke DOM (Tabel)

    // ================= HELPER UTILITIES: UI STYLING =================
    // Mapping warna background, teks, dan border badge berdasarkan keyword status
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'menunggu': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'disetujui':
            case 'dipinjam': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'ditolak': return 'bg-red-50 text-red-600 border-red-200';
            case 'selesai':
            case 'dikembalikan': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'terlambat': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    // Mapping warna solid (Hex) untuk aksen pita (Ribbon) di sebelah kiri kartu (Mobile UI)
    const getStatusRibbonColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'menunggu': return '#FBBF24'; // Kuning (Amber)
            case 'disetujui':
            case 'dipinjam': return '#21409A'; // Biru (PGE Corporate Color)
            case 'ditolak': return '#ED1C24'; // Merah (PGE Corporate Color)
            case 'selesai':
            case 'dikembalikan': return '#00A651'; // Hijau (PGE Corporate Color)
            case 'terlambat': return '#E11D48'; // Merah Gelap (Rose)
            default: return '#D1D5DB'; // Abu-abu default
        }
    };

    // Helper untuk membuat fallback Avatar 2 huruf dari string Nama
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <>
            <Head title="Status Peminjaman" />

            <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 text-gray-800 selection:bg-[#21409A] selection:text-white">

                {/* Navbar (Main Navigation) */}
                <nav className="w-full max-w-[1536px] mx-auto flex items-center justify-between px-6 lg:px-12 xl:px-20 py-8 z-50 bg-transparent relative">

                    {/* Navbar Kiri: Logo Container */}
                    <div className="flex items-center group cursor-pointer w-auto lg:w-1/4 shrink-0">
                        <img src="/images/pertamina-logo (1).png" alt="Pertamina Geothermal Energy" className="h-8 md:h-10 lg:h-12 object-contain transition-all duration-500 ease-out group-hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x50?text=Logo+PGE"; }} />
                    </div>

                    {/* Navbar Tengah: Main Links (Desktop Only) */}
                    <div className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-12 text-[14px] font-bold text-gray-600">
                        <Link href={user?.role === 'admin' ? route('dashboard') : '/'} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            {user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                        <Link href={route('borrow.create')} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            Ajukan Peminjaman
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>

                        {/* Active Route Link */}
                        <Link href={route('borrow.status')} className="relative group py-2 hover:text-[#21409A] text-[#21409A] transition-colors duration-300">
                            Status
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>

                        <Link href={route('contact')} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            Contact Us
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>
                    </div>

                    {/* Navbar Kanan: User Profile & Mobile Toggle */}
                    <div className="flex items-center justify-end w-auto lg:w-1/4 shrink-0 gap-3 md:gap-4">
                        {user ? (
                            <div className="relative shrink-0" ref={profileMenuRef}>
                                {/* Profile Trigger Button */}
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

                                {/* Profile Dropdown Options */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-56 md:w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Masuk sebagai</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user?.email || 'user@pertamina.com'}</p>
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

                        {/* Hamburger Button (Mobile Only) */}
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

                    {/* Mobile Full Screen Menu Panel */}
                    {isMobileMenuOpen && (
                        <div className="absolute top-[80px] left-0 w-full bg-white shadow-lg border-b border-gray-100 z-50 lg:hidden flex flex-col px-6 py-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <Link href={user?.role === 'admin' ? route('dashboard') : '/'} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">
                                {user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                            </Link>
                            <Link href={route('borrow.create')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">
                                Ajukan Peminjaman
                            </Link>
                            <Link href={route('borrow.status')} className="text-[15px] font-bold text-[#21409A] border-b border-gray-50 pb-2">
                                Status
                            </Link>
                            <Link href={route('contact')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] pb-2">
                                Contact Us
                            </Link>
                        </div>
                    )}
                </nav>

                <main className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 mt-6 relative z-10">

                    {/* ================= HEADER & STATISTIK CARD KARTU ================= */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start lg:items-center justify-between mb-12">
                        <div className="flex-1">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mb-3 tracking-tight">Status Peminjaman APD</h1>
                            <p className="text-sm text-gray-500 max-w-xl font-medium leading-relaxed">Pantau seluruh riwayat dan status terkini pengajuan alat pelindung diri Anda di sini.</p>
                        </div>

                        {/* Statistik Dinamis Berdasarkan Filter processedTransactions */}
                        <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 shrink-0">
                            {[
                                {
                                    label: 'Total',
                                    value: processedTransactions?.length || 0,
                                    color: 'text-gray-800',
                                    bgIcon: 'bg-gray-100',
                                    icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                },
                                {
                                    label: 'Menunggu',
                                    value: processedTransactions?.filter(t => t.status === 'menunggu').length || 0,
                                    color: 'text-amber-500',
                                    bgIcon: 'bg-amber-50',
                                    icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                },
                                {
                                    label: 'Dipinjam',
                                    value: processedTransactions?.filter(t => t.status === 'dipinjam' || t.status === 'disetujui').length || 0,
                                    color: 'text-blue-600',
                                    bgIcon: 'bg-blue-50',
                                    icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                },
                                {
                                    label: 'Selesai',
                                    value: processedTransactions?.filter(t => t.status === 'selesai' || t.status === 'dikembalikan').length || 0,
                                    color: 'text-emerald-500',
                                    bgIcon: 'bg-emerald-50',
                                    icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                },
                            ].map((item, i) => (
                                <div key={i} className="bg-white px-4 md:px-5 py-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between min-w-[120px] gap-2 md:gap-3 group hover:border-gray-200 transition-colors">
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                        <h2 className={`text-2xl font-black leading-none ${item.color}`}>{item.value}</h2>
                                    </div>
                                    <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shrink-0 ${item.bgIcon} transition-transform group-hover:scale-110`}>
                                        {item.icon}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ================= AREA TABEL DATA & TOOLBAR ================= */}
                    <div className="bg-white rounded-[24px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col overflow-visible">

                        {/* Toolbar: Search input & Filter Dropdowns */}
                        <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-50">

                            {/* Komponen Search Bar Dinamis */}
                            <div className="relative w-full md:max-w-md group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400 group-focus-within:text-[#21409A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari ID, Barang, atau Tujuan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#F8FAFC] border-transparent focus:bg-white focus:border-[#21409A]/30 focus:ring-4 focus:ring-[#21409A]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-800 placeholder-gray-400 transition-all outline-none"
                                />
                                {/* Tombol Reset Search */}
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                )}
                            </div>

                            <div className="flex w-full md:w-auto gap-3">

                                {/* Komponen Filter Select: Status */}
                                <div className="relative flex-1 md:flex-none" ref={filterRef}>
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className={`flex items-center justify-between w-full gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${statusFilter !== 'Semua' ? 'bg-blue-50 border-blue-200 text-[#21409A]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                                            <span className="truncate">{statusFilter === 'Semua' ? 'Status' : statusFilter}</span>
                                        </div>
                                        <svg className={`w-4 h-4 shrink-0 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>

                                    {isFilterOpen && (
                                        <div className="absolute right-0 sm:left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-2 animate-in fade-in slide-in-from-top-2">
                                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Filter Status</div>
                                            {statusOptions.map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => { setStatusFilter(status); setIsFilterOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors flex items-center justify-between ${statusFilter === status ? 'bg-blue-50 text-[#21409A]' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {status}
                                                    {statusFilter === status && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Komponen Filter Select: Rentang Waktu */}
                                <div className="relative flex-1 md:flex-none" ref={timeFilterRef}>
                                    <button
                                        onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                                        className={`flex items-center justify-between w-full gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${timeFilter !== 'Semua Waktu' ? 'bg-green-50 border-green-200 text-[#00A651]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            <span className="truncate">{timeFilter === 'Semua Waktu' ? 'Periode' : timeFilter}</span>
                                        </div>
                                        <svg className={`w-4 h-4 shrink-0 transition-transform ${isTimeFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>

                                    {isTimeFilterOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-2 animate-in fade-in slide-in-from-top-2">
                                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Filter Waktu</div>
                                            {timeOptions.map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => { setTimeFilter(time); setIsTimeFilterOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors flex items-center justify-between ${timeFilter === time ? 'bg-green-50 text-[#00A651]' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {time}
                                                    {timeFilter === time && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Rendering Tabel Data (Responsive: Menggunakan block stack di Mobile dan thead di Desktop) */}
                        <div className="p-4 md:p-0 bg-gray-50/30 md:bg-transparent rounded-b-[24px] overflow-hidden md:overflow-x-auto custom-scrollbar flex flex-col">
                            <table className="w-full text-left block md:table whitespace-nowrap">

                                {/* Header Tabel Khusus Desktop */}
                                <thead className="hidden md:table-header-group">
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">ID Transaksi</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Barang Dipinjam</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Keperluan</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Durasi Pinjam</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Catatan Admin</th>
                                    </tr>
                                </thead>

                                {/* Iterasi Data Tabel dari array currentItems (Paginasi Output) */}
                                <tbody className="block md:table-row-group divide-y-0 md:divide-y divide-gray-50">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((trx, index) => (
                                            <tr
                                                key={index}
                                                style={{ borderLeftColor: getStatusRibbonColor(trx.status) }}
                                                className="flex flex-col md:table-row bg-white md:bg-transparent border border-gray-200 md:border-0 border-l-[6px] md:border-l-0 rounded-[16px] md:rounded-none overflow-hidden mb-3 md:mb-0 p-3 md:p-0 shadow-sm md:shadow-none hover:bg-blue-50/30 transition-colors group"
                                            >

                                                {/* Kolom: ID TRANSAKSI */}
                                                <td className="block md:table-cell px-0 md:px-6 py-1.5 md:py-4 border-b border-dashed border-gray-100 md:border-0">
                                                    <div className="flex justify-between items-center md:block">
                                                        <span className="md:hidden text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">ID Transaksi</span>
                                                        <span className="font-extrabold text-[#21409A] md:text-gray-900 text-[13px] md:text-sm tracking-wide">{trx.id}</span>
                                                    </div>
                                                </td>

                                                {/* Kolom: BARANG DIPINJAM */}
                                                <td className="block md:table-cell px-0 md:px-6 py-1.5 md:py-4 border-b border-dashed border-gray-100 md:border-0 md:min-w-[280px]">
                                                    <div className="flex flex-col md:block items-start gap-0.5 md:gap-0 mt-1 md:mt-0">
                                                        <span className="md:hidden text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Barang Dipinjam</span>
                                                        <p className="text-[12px] md:text-[13px] font-bold text-gray-700 whitespace-normal leading-snug">{trx.items || '-'}</p>
                                                    </div>
                                                </td>

                                                {/* Kolom: TUJUAN PINJAM (KEPERLUAN) */}
                                                <td className="block md:table-cell px-0 md:px-6 py-1.5 md:py-4 border-b border-dashed border-gray-100 md:border-0 md:min-w-[200px]">
                                                    <div className="flex flex-col md:block items-start gap-0.5 md:gap-0 mt-1 md:mt-0">
                                                        <span className="md:hidden text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Keperluan</span>
                                                        <p className="text-[12px] md:text-[13px] font-medium text-gray-500 whitespace-normal line-clamp-2" title={trx.purpose}>{trx.purpose || '-'}</p>
                                                    </div>
                                                </td>

                                                {/* Kolom: DURASI PINJAM */}
                                                <td className="block md:table-cell px-0 md:px-6 py-1.5 md:py-4 border-b border-dashed border-gray-100 md:border-0">
                                                    <div className="flex justify-between items-center md:block mt-1 md:mt-0">
                                                        <span className="md:hidden text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Durasi Pinjam</span>
                                                        <div className="inline-flex items-center gap-1.5 bg-[#F4F5F9] px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg border border-gray-100 group-hover:border-blue-100 transition-colors">
                                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                            <span className="text-[11px] md:text-[12px] font-bold text-gray-600">{trx.dates || '-'}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Kolom: STATUS BADGE */}
                                                <td className="block md:table-cell px-0 md:px-6 py-1.5 md:py-4 border-b border-dashed border-gray-100 md:border-0">
                                                    <div className="flex justify-between items-center md:block mt-1 md:mt-0">
                                                        <span className="md:hidden text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Status</span>
                                                        <span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-[11px] font-black border uppercase tracking-wider inline-block ${getStatusStyle(trx.status)}`}>{trx.status}</span>
                                                    </div>
                                                </td>

                                                {/* Kolom: CATATAN ADMIN / ALASAN TOLAK */}
                                                <td className="block md:table-cell px-0 md:px-6 py-1.5 md:py-4 md:min-w-[200px]">
                                                    <div className="flex flex-col md:block items-start gap-0.5 md:gap-0 mt-1 md:mt-0">
                                                        <span className="md:hidden text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Catatan Admin</span>
                                                        {trx.notes ? (
                                                            <p className="text-[11px] md:text-[12px] text-red-600 font-medium whitespace-normal bg-red-50 px-2.5 py-1.5 md:px-3 md:py-2 rounded-md md:rounded-lg border border-red-100 inline-block w-full md:w-auto mt-1 md:mt-0">{trx.notes}</p>
                                                        ) : (<span className="text-gray-300 font-bold text-sm">-</span>)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        // Empty State (Fallback UI saat pencarian nihil)
                                        <tr className="block md:table-row">
                                            <td colSpan="6" className="block md:table-cell px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    </div>
                                                    <h3 className="font-bold text-gray-800 text-[15px] mb-1">Data Tidak Ditemukan</h3>
                                                    <p className="text-[13px] text-gray-500 font-medium mb-4">Tidak ada transaksi yang cocok dengan filter atau pencarian Anda.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* ================= KONTROL KOMPONEN PAGINASI ================= */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-2 py-4 md:px-6 md:py-5 border-t border-gray-100 bg-transparent md:bg-white mt-1 md:mt-0">
                                    {/* Informasi Data Tampil */}
                                    <p className="text-[12px] text-gray-500 font-medium hidden sm:block">
                                        Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> - <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredTransactions.length)}</span> dari <span className="font-bold text-gray-900">{filteredTransactions.length}</span> entri
                                    </p>

                                    {/* Button Navigasi (Prev, Page Numbers, Next) */}
                                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-[#21409A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                            <span className="hidden sm:inline">Prev</span>
                                        </button>

                                        {/* Dynamic Page Number Generation */}
                                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[#21409A] text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-[#21409A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 shadow-sm"
                                        >
                                            <span className="hidden sm:inline">Next</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7-7"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </main>
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