import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Transactions({ auth, transactions }) {

    // 👇 LOGIKA BARU: Deteksi Keterlambatan Otomatis 👇
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset jam agar akurat per hari

    const displayTransactions = (transactions || []).map(trx => {
        let currentStatus = trx.status?.toLowerCase();

        if (currentStatus === 'dipinjam') {
            let endDate = null;

            // 1. Coba baca dari trx.end_date jika Laravel mengirimkannya
            if (trx.end_date) {
                endDate = new Date(trx.end_date);
            }
            // 2. Jika tidak ada, KITA BEDAH teks trx.dates (Contoh: "10 Apr 2026 - 12 Apr 2026")
            else if (trx.dates && trx.dates.includes(' - ')) {
                const textTanggalKembali = trx.dates.split(' - ')[1]; // Ambil teks setelah " - "
                endDate = new Date(textTanggalKembali);
            }

            // 3. Jika berhasil menjadi format Waktu/Tanggal yang sah, kita bandingkan!
            if (endDate && !isNaN(endDate.getTime())) {
                endDate.setHours(0, 0, 0, 0);

                // Jika hari ini LEBIH BESAR (lewat) dari tanggal kembali, jadikan terlambat
                if (today > endDate) {
                    currentStatus = 'terlambat';
                }
            }
        }

        return {
            ...trx,
            status: currentStatus
        };
    });
    // 👆 ============================================== 👆

    const [activeTab, setActiveTab] = useState('semua');
    const [selectedTrx, setSelectedTrx] = useState(null);

    // State Animasi Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const { data, setData, reset } = useForm({
        notes: ''
    });

    const openModal = (trx) => {
        setSelectedTrx(trx);
        setIsModalOpen(true);
        setTimeout(() => setIsAnimating(true), 10);
    };

    const closeModal = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsModalOpen(false);
            setSelectedTrx(null);
            reset();
        }, 200);
    };

    // KONEKSI ASLI KE BACKEND LARAVEL
    const handleAction = (e, actionType) => {
        e.preventDefault();

        router.put(route('transactions.update', selectedTrx.raw_id), {
            action: actionType,
            notes: data.notes
        }, {
            preserveScroll: true,
            onSuccess: () => closeModal()
        });
    };

    // Filter transaksi berdasarkan tab yang aktif
    const filteredTransactions = displayTransactions.filter(trx => {
        if (activeTab === 'semua') return true;
        return trx.status === activeTab;
    });

    // Badge Status Premium
    const getStatusBadge = (status) => {
        const statusMap = {
            'menunggu': { bg: 'bg-[#FBBF24]', text: 'text-white', shadow: 'shadow-[#FBBF24]/40', icon: '⏱️' },
            'dipinjam': { bg: 'bg-[#21409A]', text: 'text-white', shadow: 'shadow-[#21409A]/40', icon: '📦' },
            'terlambat': { bg: 'bg-[#ED1C24]', text: 'text-white', shadow: 'shadow-[#ED1C24]/40', icon: '⚠️' }
        };
        const config = statusMap[status?.toLowerCase()] || { bg: 'bg-gray-500', text: 'text-white', shadow: 'shadow-gray-500/40', icon: '📌' };
        const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-sm ${config.bg} ${config.text} ${config.shadow}`}>
                <span className="text-[10px]">{config.icon}</span>{label}
            </div>
        );
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Daftar Peminjaman" />

            <div className="w-full pb-12 relative animate-in fade-in duration-300">

                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Daftar Peminjaman</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Pantau dan eksekusi transaksi peminjaman aset HSSE yang sedang aktif.</p>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar relative">
                            {['semua', 'menunggu', 'dipinjam', 'terlambat'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative z-10 px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 whitespace-nowrap ${activeTab === tab ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}
                                >
                                    {activeTab === tab && (
                                        <div className={`absolute inset-0 -z-10 rounded-lg transition-all duration-300 ${tab === 'menunggu' ? 'bg-[#FBBF24]' : tab === 'dipinjam' ? 'bg-[#21409A]' : tab === 'terlambat' ? 'bg-[#ED1C24]' : 'bg-[#00A651]'}`}></div>
                                    )}
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-72 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400 group-focus-within:text-[#00A651] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input type="text" className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#00A651] focus:ring-4 focus:ring-[#00A651]/10 transition-all duration-300" placeholder="Cari transaksi aktif..." />
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
                        <table className="w-full text-left whitespace-nowrap table-fixed">
                            <thead>
                                <tr className="border-b border-gray-100 bg-white text-gray-400 text-[11px] font-extrabold uppercase tracking-widest">
                                    <th className="px-6 py-5">ID Transaksi</th>
                                    <th className="px-6 py-5">Peminjam</th>
                                    <th className="px-6 py-5">Item Diajukan</th>
                                    <th className="px-6 py-5">Durasi</th>
                                    <th className="px-6 py-5 text-center">Status</th>
                                    <th className="px-6 py-5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTransactions.length > 0 ? filteredTransactions.map((trx, index) => (
                                    <tr key={index} className="hover:bg-[#F4F5FA] transition-colors duration-200 group cursor-pointer" onClick={() => openModal(trx)}>
                                        <td className="px-6 py-4">
                                            {/* ID sudah diformat dari Backend */}
                                            <span className="bg-gray-100 text-gray-500 font-bold px-3 py-1.5 rounded-lg text-xs font-mono border border-gray-200 group-hover:border-[#00A651]/30 group-hover:text-[#00A651] transition-colors duration-300">
                                                {trx.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border border-gray-200 flex items-center justify-center font-bold text-xs shrink-0 group-hover:from-[#00A651]/10 group-hover:to-[#00A651]/20 group-hover:text-[#00A651] transition-all duration-300">{getInitials(trx.name)}</div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800">{trx.name}</span>
                                                    <span className="text-[11px] text-gray-400 font-medium font-mono tracking-wide">NIP: {trx.nip}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            <div className="truncate max-w-[200px]">{trx.items}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {trx.dates}
                                        </td>
                                        <td className="px-6 py-4 text-center">{getStatusBadge(trx.status)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openModal(trx); }}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-white hover:bg-[#00A651] hover:border-[#00A651] transition-all duration-300 shadow-sm transform hover:scale-110"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400 animate-in fade-in zoom-in duration-500">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                                </div>
                                                <p className="text-sm font-medium">Tidak ada transaksi di kategori ini.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL EKSEKUSI */}
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
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Tindak Lanjut Transaksi</h2>
                                <p className="text-[10px] text-gray-500 font-mono mt-1 px-2 py-0.5 bg-gray-100 rounded-md inline-block border border-gray-200">
                                    {selectedTrx.id}
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 custom-scrollbar max-h-[65vh]">
                            <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#F4F5FA] text-[#21409A] flex items-center justify-center font-black text-sm">{getInitials(selectedTrx.name)}</div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">{selectedTrx.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-mono">NIP: {selectedTrx.nip}</p>
                                    </div>
                                </div>
                                <div>{getStatusBadge(selectedTrx.status)}</div>
                            </div>

                            <div className="mb-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Durasi Peminjaman</p>
                                    <p className="text-xs font-bold text-[#21409A]">{selectedTrx.dates}</p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Item Requested</p>
                                <p className="text-xs font-bold text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedTrx.items}</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Keperluan / Tujuan</p>
                                <p className="text-xs font-medium text-gray-700">{selectedTrx.purpose || 'Tidak ada catatan keperluan.'}</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm focus-within:border-[#21409A] transition-colors">
                                <label className="text-[9px] font-bold text-[#21409A] uppercase tracking-widest mb-2 block">📝 Catatan Admin (Opsional)</label>
                                <textarea
                                    rows="2"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Ketik alasan penolakan atau catatan tambahan di sini..."
                                    className="w-full text-xs font-medium text-gray-700 bg-gray-50 border-none rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#21409A]/10 resize-none"
                                ></textarea>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-white">
                            {selectedTrx.status === 'menunggu' ? (
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={(e) => handleAction(e, 'reject')}
                                        className="px-5 py-2 text-xs font-bold text-[#ED1C24] bg-red-50 hover:bg-[#ED1C24] hover:text-white rounded-lg transition-colors border border-red-100"
                                    >
                                        Tolak Pengajuan
                                    </button>
                                    <button
                                        onClick={(e) => handleAction(e, 'approve')}
                                        className="px-5 py-2 text-xs font-bold text-white bg-[#00A651] hover:bg-[#008c44] shadow-sm rounded-lg transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5"
                                    >
                                        Setujui Peminjaman
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </button>
                                </div>
                            ) : (selectedTrx.status === 'dipinjam' || selectedTrx.status === 'terlambat') ? (
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-gray-500 italic max-w-[200px]">Cek fisik dan kelengkapan alat sebelum menekan tombol terima.</p>
                                    <button
                                        onClick={(e) => handleAction(e, 'return')}
                                        className="px-5 py-2 text-xs font-bold text-white bg-[#21409A] hover:bg-[#1a3380] shadow-sm rounded-lg transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5"
                                    >
                                        Konfirmasi Pengembalian
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-end">
                                    <button onClick={closeModal} className="px-6 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Tutup</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}