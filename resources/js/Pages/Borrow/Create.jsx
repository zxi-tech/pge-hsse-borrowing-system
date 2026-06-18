import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Create({ auth, items }) {
    const { flash } = usePage().props;
    const user = auth?.user;

    // Memastikan array items tidak undefined
    const displayItems = items || [];

    // Inisialisasi state form menggunakan Inertia.js (Ditambah photo_proof)
    const { data, setData, post, processing, reset, errors } = useForm({
        start_date: '',
        end_date: '',
        purpose: '',
        photo_proof: null,
        selected_items: {} // Format: { item_id: { size_id: quantity } }
    });

    // State UI & Interaktivitas
    const [expandedItems, setExpandedItems] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    // State Custom Alert untuk validasi stok & ketersediaan
    const [customAlert, setCustomAlert] = useState({
        show: false,
        title: '',
        message: '',
        color: 'orange'
    });

    // Effect: Auto-close Custom Alert setelah 6 detik
    useEffect(() => {
        if (customAlert.show) {
            const timer = setTimeout(() => {
                setCustomAlert(prev => ({ ...prev, show: false }));
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [customAlert.show]);

    // Effect: Auto-close dropdown profil saat klik di luar elemen
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Effect: Reset form dan tutup accordion item setelah pengajuan berhasil (flash success)
    useEffect(() => {
        if (flash?.success) {
            reset();
            setExpandedItems({});
        }
    }, [flash?.success]);

    // Memoization: Filter daftar barang berdasarkan input pencarian
    const filteredItems = useMemo(() => {
        return displayItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [displayItems, searchTerm]);

    // Memoization: Kalkulasi ringkasan barang yang dipilih (total qty & rincian ukuran)
    const selectedSummary = useMemo(() => {
        let summary = [];
        let totalItems = 0;

        Object.keys(data.selected_items).forEach(itemId => {
            const item = displayItems.find(i => i.id === parseInt(itemId));
            if (!item) return;

            let itemTotalQty = 0;
            let sizesSelected = [];

            Object.keys(data.selected_items[itemId]).forEach(sizeId => {
                const qty = data.selected_items[itemId][sizeId];
                if (qty > 0) {
                    const sizeInfo = item.sizes.find(s => s.id === parseInt(sizeId));
                    if (sizeInfo) {
                        itemTotalQty += qty;
                        totalItems += qty;
                        sizesSelected.push(`${sizeInfo.size_name} (${qty})`);
                    }
                }
            });

            if (itemTotalQty > 0) {
                summary.push({
                    name: item.name,
                    details: sizesSelected.join(', '),
                    total: itemTotalQty
                });
            }
        });

        return { summary, totalItems };
    }, [data.selected_items, displayItems]);

    // Handler: Proses submit form dengan validasi manual di sisi Frontend
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validasi 1: Pastikan minimal ada 1 barang yang dipilih
        if (selectedSummary.totalItems === 0) {
            setCustomAlert({
                show: true,
                title: '⚠️ Pilih Barang Terlebih Dahulu',
                message: 'Silakan isi jumlah barang yang ingin Anda pinjam sebelum mengajukan.',
                color: 'red'
            });
            return;
        }

        // Validasi 2: Pastikan detail jadwal, keperluan, DAN FOTO terisi (Diperbarui)
        if (!data.start_date || !data.end_date || !data.purpose || !data.photo_proof) {
            setCustomAlert({
                show: true,
                title: '⚠️ Form Belum Lengkap',
                message: 'Harap pastikan Tanggal Pinjam, Tanggal Kembali, Tujuan Keperluan, dan Foto Bukti Selfie sudah terisi semua.',
                color: 'red'
            });
            return;
        }

        // Eksekusi POST request ke Backend Laravel (Inertia otomatis handle FormData untuk upload file)
        post(route('borrow.store'), {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Pengajuan Sukses!");
            },
            onError: (err) => {
                console.error("Error dari Laravel:", err);
            }
        });
    };

    // Handler: Buka/Tutup accordion varian ukuran barang
    const toggleItemExpansion = (itemId) => {
        setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    // Handler: Mengubah state kuantitas barang yang dipilih
    const handleQuantityChange = (itemId, sizeId, qty) => {
        const parsedQty = parseInt(qty) || 0;
        setData(prev => {
            const currentItemObj = prev.selected_items[itemId] || {};
            return {
                ...prev,
                selected_items: {
                    ...prev.selected_items,
                    [itemId]: {
                        ...currentItemObj,
                        [sizeId]: parsedQty
                    }
                }
            };
        });
    };

    // Interceptor: Menampilkan alert spesifik jika user mengklik ukuran yang tidak tersedia
    const handleDisabledClick = (size) => {
        if (size.status === 'laundry') {
            setCustomAlert({
                show: true,
                title: '⚠️ Ukuran Sedang Tidak Tersedia',
                message: `Saat ini APD ukuran [ ${size.size_name} ] sedang dalam proses laundry, sehingga belum bisa dipinjam. Silakan pilih ukuran lain yang tersedia atau cek kembali nanti. Terima kasih 😊`,
                color: 'orange'
            });
        } else if (size.status === 'maintenance') {
            setCustomAlert({
                show: true,
                title: '⚠️ APD Sedang Dalam Perbaikan',
                message: `Saat ini APD ukuran [ ${size.size_name} ] sedang menjalani proses perbaikan atau maintenance sehingga belum dapat dipinjam. Silakan pilih ukuran lain yang tersedia. Terima kasih 😊`,
                color: 'red'
            });
        } else if (size.stock === 0) {
            setCustomAlert({
                show: true,
                title: '⚠️ Stok Tidak Tersedia',
                message: `Maaf, APD ukuran [ ${size.size_name} ] saat ini sedang tidak tersedia karena stok habis atau masih digunakan oleh pekerja lain. Silakan pilih ukuran lain yang tersedia 😊`,
                color: 'red'
            });
        }
    };

    // Helper: Cek apakah item sedang dipilih (untuk styling UI Active State)
    const isItemSelected = (itemId) => {
        const itemSizes = data.selected_items[itemId];
        if (!itemSizes) return false;
        return Object.values(itemSizes).some(qty => qty > 0);
    };

    // Helper: Generate inisial nama untuk avatar fallback
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <>
            <Head title="Ajukan Peminjaman" />

            {/* Custom Alert Pop-up */}
            <div
                className={`fixed top-6 md:top-24 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-md transition-all duration-500 ease-in-out ${customAlert.show ? 'translate-y-0 opacity-100 visible' : '-translate-y-10 opacity-0 invisible'
                    }`}
            >
                <div className={`bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border-l-[6px] p-4 md:p-5 flex flex-col gap-2 ${customAlert.color === 'orange' ? 'border-orange-500' : 'border-red-500'}`}>
                    <div className="flex justify-between items-start gap-3">
                        <h3 className={`font-extrabold text-sm md:text-base leading-tight ${customAlert.color === 'orange' ? 'text-orange-600' : 'text-red-600'}`}>
                            {customAlert.title}
                        </h3>
                        <button onClick={() => setCustomAlert({ ...customAlert, show: false })} className="text-gray-400 hover:text-gray-600 transition-colors p-1 bg-gray-50 hover:bg-gray-100 rounded-full shrink-0">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm font-medium leading-relaxed">
                        {customAlert.message}
                    </p>
                </div>
            </div>

            <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 text-gray-800 selection:bg-[#21409A] selection:text-white">

                {/* Navigasi Utama */}
                <nav className="relative w-full max-w-[1536px] mx-auto flex items-center justify-between px-6 lg:px-12 xl:px-20 py-6 lg:py-8 z-50 bg-transparent">
                    <div className="flex items-center group cursor-pointer w-auto lg:w-1/4 shrink-0">
                        <img
                            src="/images/pertamina-logo (1).png"
                            alt="Pertamina Geothermal Energy"
                            className="h-8 md:h-10 lg:h-12 object-contain transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x50?text=Logo+PGE"; }}
                        />
                    </div>

                    {/* Navigasi Link (Desktop) */}
                    <div className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-12 text-[14px] font-bold text-gray-600">
                        <Link href={user?.role === 'admin' ? route('dashboard') : '/'} className="relative group py-2 hover:text-[#21409A] transition-colors duration-300">
                            {user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                        </Link>

                        <Link href={route('borrow.create')} className="relative group py-2 hover:text-[#21409A] text-[#21409A] transition-colors duration-300">
                            Ajukan Peminjaman
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#21409A] scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
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

                    {/* Profil User & Hamburger Button */}
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

                                {/* Dropdown Profil */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-56 md:w-60 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50">
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

                    {/* Menu Navigasi (Mobile) */}
                    {isMobileMenuOpen && (
                        <div className="absolute top-[80px] left-0 w-full bg-white shadow-lg border-b border-gray-100 z-40 lg:hidden flex flex-col px-6 py-4 gap-4">
                            <Link href={user?.role === 'admin' ? route('dashboard') : '/'} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">
                                {user?.role === 'admin' ? 'Dashboard' : 'Beranda'}
                            </Link>
                            <Link href={route('borrow.create')} className="text-[15px] font-bold text-[#21409A] border-b border-gray-50 pb-2">Ajukan Peminjaman</Link>
                            <Link href={route('borrow.status')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] border-b border-gray-50 pb-2">Status</Link>
                            <Link href={route('contact')} className="text-[15px] font-medium text-gray-600 hover:text-[#21409A] pb-2">Contact Us</Link>
                        </div>
                    )}
                </nav>

                {/* Konten Utama */}
                <main className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-4 lg:mt-10">

                    {/* Alert Flash Message: Sukses */}
                    {flash?.success && (
                        <div className="mb-8 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="bg-[#00A651] text-white p-2 rounded-full shrink-0 shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-green-900">Pengajuan Berhasil!</h3>
                                <p className="text-sm text-green-700 mt-0.5">{flash.success}</p>
                                <Link href={route('borrow.status')} className="inline-block mt-2 text-xs font-bold text-[#00A651] hover:underline">Lihat Status Peminjaman →</Link>
                            </div>
                        </div>
                    )}

                    {/* Alert Flash Message & Form Error: Gagal */}
                    {(flash?.error || Object.keys(errors).length > 0) && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <span>⚠️</span>
                                <h3 className="font-extrabold text-red-800">Sistem Menolak Pengajuan Anda:</h3>
                            </div>
                            {flash?.error && <p className="ml-6 mb-2">{flash.error}</p>}
                            {Object.keys(errors).length > 0 && (
                                <ul className="list-disc ml-10 font-medium text-xs space-y-1">
                                    {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Ajukan Peminjaman APD</h1>
                        <p className="text-sm text-gray-500 max-w-2xl leading-relaxed mx-auto md:mx-0">Lengkapi detail peminjaman dan pilih perlengkapan yang Anda butuhkan untuk keperluan lapangan.</p>
                    </div>

                    {/* Wrapper Form Pengajuan */}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8" noValidate>

                        {/* Kolom Kiri: Input Detail & Pemilihan Barang */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Bagian 1: Informasi Peminjam & Jadwal */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50/50 px-5 md:px-6 py-4 md:py-5 border-b border-gray-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#21409A] shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                                        </svg>
                                    </div>
                                    <h2 className="text-base md:text-lg font-bold text-gray-900">Detail Peminjam</h2>
                                </div>
                                <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                    <div>
                                        <label className="block text-[11px] md:text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nama Pekerja</label>
                                        <input type="text" disabled value={auth?.user?.name || "Nama (Otomatis)"} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-2.5 text-sm font-medium outline-none cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] md:text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Departemen</label>
                                        <input type="text" disabled value={auth?.user?.department || "Operasional"} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-2.5 text-sm font-medium outline-none cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Tanggal Pinjam <span className="text-red-500">*</span></label>
                                        <input type="date" required value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className={`w-full bg-white border ${errors.start_date ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'} text-gray-900 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#21409A]/20 focus:border-[#21409A] transition-all`} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Tanggal Kembali <span className="text-red-500">*</span></label>
                                        <input type="date" required value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} className={`w-full bg-white border ${errors.end_date ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'} text-gray-900 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#21409A]/20 focus:border-[#21409A] transition-all`} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Tujuan Keperluan <span className="text-red-500">*</span></label>
                                        <textarea rows="3" required value={data.purpose} onChange={(e) => setData('purpose', e.target.value)} className={`w-full bg-white border ${errors.purpose ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'} text-gray-900 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-[#21409A]/20 focus:border-[#21409A] transition-all`} placeholder="Jelaskan secara singkat untuk keperluan apa APD ini dipinjam..."></textarea>
                                    </div>

                                    <div className="md:col-span-2 mt-2">
                                        <label className="block text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                                            Foto Wajah (Bukti Peminjaman) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="user"
                                                onChange={e => setData('photo_proof', e.target.files[0])}
                                                className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#00A651] file:text-white hover:file:bg-green-700 cursor-pointer border ${errors.photo_proof ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl bg-white p-1.5 transition-all`}
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium leading-relaxed">
                                            *Wajib melampirkan foto selfie langsung dari kamera sebagai bukti identitas dan niat peminjaman.
                                        </p>
                                        {errors.photo_proof && <p className="text-red-500 text-[10px] mt-1">{errors.photo_proof}</p>}
                                    </div>

                                </div>
                            </div>

                            {/* Bagian 2: Katalog & Pemilihan Barang */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                <div className="bg-gray-50/50 px-5 md:px-6 py-4 md:py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#00A651] shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                                            </svg>
                                        </div>
                                        <h2 className="text-base md:text-lg font-bold text-gray-900">Pilih Barang</h2>
                                    </div>
                                    <div className="relative w-full sm:max-w-xs">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#21409A]/20 focus:border-[#21409A] transition-all placeholder-gray-400 font-medium" placeholder="Cari perlengkapan..." />
                                    </div>
                                </div>
                                <div className="p-4 sm:p-5 md:p-6 space-y-3">
                                    {filteredItems.length === 0 ? (
                                        <div className="text-center py-10"><p className="text-gray-500 font-medium text-sm">Barang belum tersedia di inventori.</p></div>
                                    ) : (
                                        filteredItems.map((item) => {
                                            const isSelected = isItemSelected(item.id);
                                            return (
                                                <div key={item.id} className={`border rounded-2xl transition-all duration-300 overflow-hidden ${isSelected ? 'border-[#00A651] ring-1 ring-[#00A651]/20 bg-green-50/10' : 'border-gray-200 bg-white hover:border-[#21409A]/30'}`}>

                                                    {/* Row Header: Nama & Info Singkat Barang */}
                                                    <div className="flex items-center justify-between p-3 md:p-4 cursor-pointer select-none" onClick={() => toggleItemExpansion(item.id)}>
                                                        <div className="flex items-center gap-3 md:gap-4">
                                                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
                                                                {item.photo_path ? (<img src={`/storage/${item.photo_path}`} className="w-full h-full object-contain" alt={item.name} />) : (<svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>)}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center flex-wrap gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                                                    <h3 className="text-sm md:text-base font-bold text-gray-900">{item.name}</h3>
                                                                    {isSelected && <span className="bg-[#00A651] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Terpilih</span>}
                                                                </div>
                                                                <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-medium text-gray-500">
                                                                    <span className={`px-1.5 md:px-2 py-0.5 rounded uppercase ${item.type === 'asset' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{item.type}</span>
                                                                    <span>• Total Stok: <strong className="text-gray-700">{item.sizes.reduce((sum, size) => sum + size.stock, 0)}</strong></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition-transform duration-300 shrink-0 ml-2 ${expandedItems[item.id] ? 'rotate-180 bg-[#00A651] border-[#00A651] text-white' : 'bg-white border-gray-200 text-gray-400'}`}><svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                                                    </div>

                                                    {/* Sub-bagian: Input Kuantitas per Ukuran */}
                                                    <div className={`transition-all duration-300 ease-in-out ${expandedItems[item.id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                        <div className="p-3 md:p-4 pt-0 border-t border-gray-100 bg-gray-50/50">
                                                            <p className="text-[10px] md:text-[11px] font-bold text-gray-500 mb-2 md:mb-3 uppercase tracking-wider mt-2 md:mt-3">Tentukan Jumlah Pinjam per Ukuran</p>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                                                                {item.sizes.map(size => {
                                                                    const isLaundry = size.status === 'laundry';
                                                                    const isMaintenance = size.status === 'maintenance';
                                                                    const isOutOfStock = size.stock === 0;
                                                                    const isDisabled = isOutOfStock || isLaundry || isMaintenance;
                                                                    const currentVal = data.selected_items[item.id]?.[size.id] || '';

                                                                    return (
                                                                        <div
                                                                            key={size.id}
                                                                            onClick={() => isDisabled ? handleDisabledClick(size) : null}
                                                                            className={`border p-2.5 md:p-3 rounded-xl flex items-center justify-between shadow-sm transition-colors relative
                                                                            ${currentVal > 0 ? 'border-[#00A651] bg-white' : 'border-gray-200 bg-white'}
                                                                            ${isDisabled ? 'opacity-80 bg-gray-100/50 cursor-pointer' : ''}`}
                                                                        >
                                                                            <div className="flex flex-col gap-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs md:text-sm font-bold text-gray-800">{size.size_name}</span>

                                                                                    {isLaundry && (
                                                                                        <span className="bg-orange-100 text-orange-600 text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                                                                                            Laundry
                                                                                        </span>
                                                                                    )}
                                                                                    {isMaintenance && (
                                                                                        <span className="bg-red-100 text-red-600 text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                                                                                            Perbaikan
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <span className={`text-[9px] md:text-[10px] font-bold ${isOutOfStock && !isLaundry && !isMaintenance ? 'text-red-500' : 'text-gray-500'}`}>
                                                                                    {isDisabled ? (isOutOfStock && !isLaundry && !isMaintenance ? 'Stok Habis' : 'Terkunci') : `Sisa: ${size.stock}`}
                                                                                </span>
                                                                            </div>

                                                                            <div className="w-16 md:w-20">
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max={size.stock}
                                                                                    disabled={isDisabled}
                                                                                    placeholder="0"
                                                                                    value={currentVal}
                                                                                    onChange={(e) => handleQuantityChange(item.id, size.id, e.target.value)}
                                                                                    className={`w-full text-center border rounded-lg py-1 md:py-1.5 text-xs md:text-sm font-bold outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all 
                                                                                    ${isDisabled ? 'bg-gray-200 border-gray-300 text-gray-400 pointer-events-none' : currentVal > 0 ? 'border-[#00A651] text-[#00A651] bg-green-50/30' : 'border-gray-300 text-gray-900'}`}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Kanan: Ringkasan Pengajuan (Sticky) */}
                        <div className="lg:col-span-4 relative mt-2 lg:mt-0">
                            <div className="lg:sticky lg:top-24 space-y-6">
                                <div className="bg-white rounded-[24px] shadow-sm border border-[#21409A]/20 overflow-hidden flex flex-col">
                                    <div className="bg-[#21409A] px-5 md:px-6 py-3 md:py-4 flex items-center gap-3">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                        <h3 className="text-white font-bold text-base md:text-lg">Ringkasan</h3>
                                    </div>
                                    <div className="p-5 md:p-6">
                                        {selectedSummary.totalItems === 0 ? (
                                            <div className="text-center py-6 flex flex-col items-center">
                                                <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3"><svg className="w-6 h-6 md:w-8 md:h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div>
                                                <p className="text-xs md:text-sm font-medium text-gray-500">Belum ada barang dipilih.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 mb-6">
                                                {selectedSummary.summary.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-start pb-4 border-b border-dashed border-gray-200 last:border-0 last:pb-0">
                                                        <div className="pr-3 md:pr-4">
                                                            <p className="text-xs md:text-sm font-bold text-gray-800">{item.name}</p>
                                                            <p className="text-[11px] md:text-xs font-medium text-gray-500 mt-0.5">{item.details}</p>
                                                        </div>
                                                        <div className="font-extrabold text-[#21409A] bg-blue-50 px-2 py-1 rounded text-xs md:text-sm shrink-0">{item.total} item</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-6">
                                            <span className="text-xs md:text-sm font-bold text-gray-600">Total Pinjaman</span>
                                            <span className="text-lg md:text-xl font-black text-gray-900">{selectedSummary.totalItems} <span className="text-[10px] md:text-sm font-bold text-gray-500">Pcs</span></span>
                                        </div>
                                        <button type="submit" disabled={processing} className={`w-full py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-extrabold shadow-md transition-all flex justify-center items-center gap-2 transform hover:-translate-y-0.5 ${processing ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#21409A] hover:bg-[#1a3380] text-white hover:shadow-lg'}`}>
                                            {processing ? 'MEMPROSES...' : 'AJUKAN SEKARANG'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}