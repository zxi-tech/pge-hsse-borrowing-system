import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// Injeksi properti dari backend Laravel dengan nilai bawaan fallback
export default function Dashboard({ auth, stats, recentTransactions, chartData = [] }) {

    // Manajemen State: Kontrol Visibilitas Modal Detail Transaksi
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Manajemen State: Inisialisasi form Inertia untuk catatan
    const { data, setData, reset } = useForm({
        notes: ''
    });

    // Handler: Membuka modal dengan animasi transisi
    const openModal = (trx) => {
        setSelectedTrx(trx);
        setIsModalOpen(true);
        setTimeout(() => setIsAnimating(true), 10);
    };

    // Handler: Menutup modal dan mereset state
    const closeModal = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsModalOpen(false);
            setSelectedTrx(null);
            reset();
        }, 200);
    };

    // Helper: Ekstraksi inisial nama untuk fallback antarmuka
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Helper: Pemformatan Tanggal Standar Lokal Indonesia
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
        } catch (e) {
            return dateString.split('T')[0];
        }
    };

    // Helper: Ekstraksi dan penggabungan string item transaksi bersarang
    const getTransactionItems = (trx) => {
        if (trx?.items) return trx.items;
        if (trx?.details && trx.details.length > 0) {
            return trx.details.map(d => {
                const itemName = d.itemSize?.item?.name || d.item_size?.item?.name || 'Barang';
                const qty = d.quantity || 0;
                return `${itemName} (x${qty})`;
            }).join(', ');
        }
        return '-';
    };

    // Helper: Pemetaan gaya visual lencana berdasarkan status transaksi
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'menunggu':
                return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Menunggu</span>;
            case 'dipinjam':
                return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Dipinjam</span>;
            case 'ditolak':
                return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">Ditolak</span>;
            case 'selesai':
                return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Selesai</span>;
            case 'terlambat':
                return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Terlambat</span>;
            default:
                return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 capitalize">{status || '-'}</span>;
        }
    };

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Dashboard" />

            <div className="w-full pb-8">

                {/* Bagian: Header Utama */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Overview Dashboard
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Pantau aktivitas peminjaman inventaris hari ini.</p>
                    </div>
                </div>

                {/* Bagian: Indikator Metrik Kinerja Utama dan Grafik */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
                    <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">

                        {/* Metrik: Total Pengguna Aktif */}
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 group-hover:text-indigo-600 transition-colors">Total Pengguna</h3>
                                    <p className="text-3xl font-extrabold text-gray-800 mt-1.5 tracking-tight">{stats?.totalUsers || 0}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 font-medium">Karyawan Pertamina terdaftar</p>
                        </div>

                        {/* Metrik: Total Aset dan Inventaris */}
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:border-amber-100 hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 group-hover:text-amber-600 transition-colors">Total Barang / APD</h3>
                                    <p className="text-3xl font-extrabold text-gray-800 mt-1.5 tracking-tight">{stats?.totalItems || 0}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-600 shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 font-medium">
                                <span className="text-amber-500 font-semibold">{(stats?.totalItems || 0) - (stats?.borrowedItems || 0)}</span> Tersedia | <span className="text-gray-500">{stats?.borrowedItems || 0}</span> Dipinjam
                            </p>
                        </div>

                        {/* Metrik: Permintaan Tertunda */}
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:border-emerald-100 hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 group-hover:text-emerald-600 transition-colors">Pengajuan Menunggu</h3>
                                    <p className="text-3xl font-extrabold text-gray-800 mt-1.5 tracking-tight">{stats?.pendingTransactions || 0}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                                </div>
                            </div>
                            <p className="text-xs text-emerald-600 mt-4 font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                Membutuhkan persetujuan Anda
                            </p>
                        </div>

                        {/* Metrik: Transaksi Terlambat */}
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:border-red-100 hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 group-hover:text-red-600 transition-colors">Peminjaman Terlambat</h3>
                                    <p className="text-3xl font-extrabold text-gray-800 mt-1.5 tracking-tight">{stats?.lateTransactions || 0}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center text-red-600 shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                            <p className="text-xs text-red-500 mt-4 font-medium">Telah melewati batas waktu</p>
                        </div>
                    </div>

                    {/* Komponen: Render Grafik Recharts Dinamis */}
                    <div className="col-span-1 lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col min-h-[250px] hover:shadow-md transition-shadow duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-gray-800">Peminjaman 6 Bulan Terakhir</h3>
                        </div>
                        <div className="flex-1 w-full min-h-[200px]">
                            {/* Pemanggilan objek data serial dari Backend ke komponen Recharts */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#4B5563', paddingBottom: '20px' }} />
                                    <Bar name="Tepat Waktu" dataKey="tepatWaktu" stackId="a" fill="#34D399" radius={[0, 0, 4, 4]} />
                                    <Bar name="Terlambat" dataKey="terlambat" stackId="a" fill="#FCD34D" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bagian: Tabel Data Riwayat Transaksi Terbaru */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                        <h2 className="text-lg font-bold text-gray-900">Pengajuan Terbaru</h2>
                        <Link href={route('transactions.index')} className="text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors inline-block">
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold tracking-wider uppercase border-b border-gray-100">
                                    <th className="px-6 py-4">ID Peminjaman</th>
                                    <th className="px-6 py-4">Nama Peminjam</th>
                                    <th className="px-6 py-4">Item (Jumlah)</th>
                                    <th className="px-6 py-4">Tanggal Pinjam</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">

                                {recentTransactions && recentTransactions.length > 0 ? (
                                    recentTransactions.map((trx) => (
                                        <tr
                                            key={trx.id}
                                            onClick={() => openModal(trx)}
                                            className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                HSSE-{new Date(trx.created_at || new Date()).getFullYear()}{String(trx.id || trx.raw_id || 0).padStart(3, '0')}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {trx.user?.name || trx.name || 'User Terhapus'}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate font-medium">
                                                {getTransactionItems(trx)}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(trx.start_date || trx.dates?.split('-')[0]?.trim())}
                                            </td>

                                            <td className="px-6 py-4">
                                                {getStatusBadge(trx.status)}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openModal(trx); }}
                                                    className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all inline-block"
                                                >
                                                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                                <p className="text-sm">Belum ada data transaksi peminjaman.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Komponen: Modal Tinjauan Detail Transaksi (Akses Baca Saja) */}
            {isModalOpen && selectedTrx && (
                <div
                    className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 transition-opacity duration-200 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                    onClick={closeModal}
                >
                    <div
                        className={`bg-white rounded-[24px] shadow-2xl w-full max-w-xl flex flex-col overflow-hidden transform transition-all duration-200 ease-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-1.5 w-full flex">
                            <div className="bg-[#21409A] flex-1"></div>
                            <div className="bg-[#00A651] flex-1"></div>
                            <div className="bg-[#FBBF24] flex-1"></div>
                            <div className="bg-[#ED1C24] flex-1"></div>
                        </div>

                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Detail Transaksi</h2>
                                <p className="text-[10px] text-gray-500 font-mono mt-1 px-2 py-0.5 bg-gray-100 rounded-md inline-block border border-gray-200">
                                    HSSE-{new Date(selectedTrx.created_at || new Date()).getFullYear()}{String(selectedTrx.id || selectedTrx.raw_id || 0).padStart(3, '0')}
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 custom-scrollbar max-h-[65vh]">
                            <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#F4F5FA] text-[#21409A] flex items-center justify-center font-black text-sm">
                                        {getInitials(selectedTrx.user?.name || selectedTrx.name)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">{selectedTrx.user?.name || selectedTrx.name || 'User Terhapus'}</h3>
                                        {selectedTrx.user?.nip && <p className="text-[10px] text-gray-500 font-mono mt-0.5">NIP: {selectedTrx.user.nip}</p>}
                                    </div>
                                </div>
                                <div>{getStatusBadge(selectedTrx.status)}</div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mulai Pinjam</p>
                                    <p className="text-xs font-bold text-gray-800">{formatDate(selectedTrx.start_date || selectedTrx.dates?.split('-')[0]?.trim())}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Batas Pengembalian</p>
                                    <p className="text-xs font-bold text-gray-800 leading-snug">{formatDate(selectedTrx.end_date || selectedTrx.dates?.split('-')[1]?.trim())}</p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Item yang Dipinjam</p>
                                <p className="text-xs font-bold text-gray-800 leading-snug">
                                    {getTransactionItems(selectedTrx) !== '-' ? getTransactionItems(selectedTrx) : 'Tidak ada detail item.'}
                                </p>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Keperluan / Tujuan</p>
                                <p className="text-xs font-medium text-gray-700">{selectedTrx.purpose || 'Tidak ada catatan keperluan.'}</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
                            <p className="text-xs text-gray-400 italic hidden sm:block">Untuk mengeksekusi, buka halaman Daftar Peminjaman.</p>
                            <Link href={route('transactions.index')} className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors w-full sm:w-auto text-center shadow-sm">
                                Pergi ke Transaksi
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}