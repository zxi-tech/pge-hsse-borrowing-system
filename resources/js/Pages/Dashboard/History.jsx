import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function History({ auth, transactions }) {
    const displayTransactions = transactions || [];

    // STATE MANAGEMENT
    // State Tab Filter
    const [activeTab, setActiveTab] = useState('semua');

    // State Modal Detail Riwayat
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // State Modal Export Excel
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState('semua');
    const [exportStart, setExportStart] = useState('');
    const [exportEnd, setExportEnd] = useState('');

    // EVENT HANDLERS: MODAL DETAIL
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
        }, 200);
    };

    // EVENT HANDLERS: EXPORT EXCEL
    // Fungsi untuk mengarahkan request download file ke Backend Laravel
    const handleExportDownload = () => {
        let url = route('transactions.export');
        url += `?type=${exportType}`;

        // Validasi input khusus untuk export custom date range
        if (exportType === 'custom') {
            if (!exportStart || !exportEnd) {
                return alert('Mohon isi tanggal mulai dan tanggal akhir terlebih dahulu.');
            }
            url += `&start_date=${exportStart}&end_date=${exportEnd}`;
        }

        window.location.href = url;
        setIsExportModalOpen(false);
    };

    // DATA DERIVATION: FILTER
    // Menyaring transaksi berdasarkan Tab yang sedang aktif (Semua, Selesai, Ditolak)
    const filteredTransactions = displayTransactions.filter(trx => {
        if (activeTab === 'semua') return true;
        return trx.status === activeTab;
    });

    // HELPER UTILITIES: UI
    // Generate styling visual untuk status badge
    const getStatusBadge = (status) => {
        const statusMap = {
            'selesai': { bg: 'bg-[#00A651]', text: 'text-white', shadow: 'shadow-[#00A651]/40', icon: '✅' },
            'ditolak': { bg: 'bg-[#ED1C24]', text: 'text-white', shadow: 'shadow-[#ED1C24]/40', icon: '❌' }
        };
        const config = statusMap[status?.toLowerCase()] || { bg: 'bg-gray-200', text: 'text-gray-700', shadow: '', icon: '📌' };
        const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';

        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-md ${config.bg} ${config.text} ${config.shadow}`}>
                <span className="text-[10px]">{config.icon}</span>{label}
            </div>
        );
    };

    // Generate inisial untuk avatar fallback (maksimal 2 karakter)
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Riwayat Transaksi" />

            {/* Container Utama Konten */}
            <div className="w-full pb-12 relative animate-in fade-in duration-300">

                {/* Header Section & Action Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Riwayat Peminjaman</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Arsip seluruh transaksi yang telah selesai dikembalikan atau ditolak.</p>
                    </div>

                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="bg-[#107C41] hover:bg-[#0c6132] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-1 duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Export to Excel
                    </button>
                </div>

                {/* Main Card Wrapper */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">

                    {/* Tab Navigation Controls */}
                    <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar relative">
                            {['semua', 'selesai', 'ditolak'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative z-10 px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 whitespace-nowrap ${activeTab === tab ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}
                                >
                                    {activeTab === tab && (
                                        <div className={`absolute inset-0 -z-10 rounded-lg transition-all duration-300 ${tab === 'selesai' ? 'bg-[#00A651]' : tab === 'ditolak' ? 'bg-[#ED1C24]' : 'bg-[#21409A]'}`}></div>
                                    )}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Data Table Rendering */}
                    <div className="overflow-x-auto custom-scrollbar min-h-[300px]">
                        <table className="w-full text-left whitespace-nowrap table-fixed min-w-[900px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-white text-gray-400 text-[11px] font-extrabold uppercase tracking-widest">
                                    <th className="px-6 py-5 w-[15%]">ID Transaksi</th>
                                    <th className="px-6 py-5 w-[25%]">Peminjam</th>
                                    <th className="px-6 py-5 w-[25%]">Item Transaksi</th>
                                    <th className="px-6 py-5 w-[20%]">Durasi Peminjaman</th>
                                    <th className="px-6 py-5 text-center w-[10%]">Status Akhir</th>
                                    <th className="px-6 py-5 text-center w-[5%]">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTransactions.length > 0 ? filteredTransactions.map((trx, index) => (
                                    <tr key={index} className="hover:bg-[#F4F5FA] transition-colors duration-200 group cursor-pointer" onClick={() => openModal(trx)}>

                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-500 font-bold px-3 py-1.5 rounded-lg text-xs font-mono border border-gray-200 group-hover:border-[#21409A]/30 group-hover:text-[#21409A] transition-colors duration-300">
                                                {trx.id}
                                            </span>
                                        </td>

                                        {/* Perbaikan Truncate Kolom Peminjam */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 w-full min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border border-gray-200 flex items-center justify-center font-bold text-xs shrink-0 group-hover:from-[#21409A]/10 group-hover:to-[#21409A]/20 group-hover:text-[#21409A] transition-all duration-300">
                                                    {getInitials(trx.name)}
                                                </div>
                                                {/* Pembungkus min-w-0 dan truncate w-full */}
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-sm font-bold text-gray-800 truncate block w-full" title={trx.name}>
                                                        {trx.name}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 font-medium font-mono tracking-wide truncate block w-full" title={`NIP: ${trx.nip}`}>
                                                        NIP: {trx.nip}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Perbaikan Truncate Kolom Item */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 font-medium truncate w-full" title={trx.items}>
                                                {trx.items}
                                            </div>
                                        </td>

                                        {/* Perbaikan Truncate Kolom Durasi */}
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium truncate" title={trx.dates}>
                                            {trx.dates}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(trx.status)}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-white hover:bg-[#21409A] hover:border-[#21409A] transition-all duration-300 shadow-sm transform hover:scale-110">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            </button>
                                        </td>

                                    </tr>
                                )) : (
                                    // Fallback Empty State
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                                </div>
                                                <p className="text-sm font-medium">Tidak ada arsip transaksi yang cocok.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL: DETAIL RIWAYAT TRANSAKSI */}
            {isModalOpen && selectedTrx && (
                <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 transition-opacity duration-200 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`} onClick={closeModal}>
                    <div className={`bg-white rounded-[24px] shadow-2xl w-full max-w-xl flex flex-col overflow-hidden transform transition-all duration-200 ease-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={(e) => e.stopPropagation()}>

                        <div className="h-1.5 w-full flex"><div className="bg-[#21409A] flex-1"></div><div className="bg-[#00A651] flex-1"></div><div className="bg-[#FBBF24] flex-1"></div><div className="bg-[#ED1C24] flex-1"></div></div>

                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-lg font-bold text-[#21409A] tracking-tight">Detail Arsip Transaksi</h2>
                                <p className="text-[10px] text-gray-500 font-mono mt-1 px-2 py-0.5 bg-gray-100 rounded-md inline-block border border-gray-200">{selectedTrx.id}</p>
                            </div>
                            <div>{getStatusBadge(selectedTrx.status)}</div>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 custom-scrollbar max-h-[70vh]">
                            <div className="flex items-center gap-3 mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#21409A]/10 to-[#00A651]/10 text-[#21409A] border border-[#21409A]/20 flex items-center justify-center font-black text-lg">{getInitials(selectedTrx.name)}</div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{selectedTrx.name}</h3>
                                    <span className="text-[11px] text-gray-500 font-medium font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200 mt-1 inline-block">🆔 NIP: {selectedTrx.nip}</span>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Durasi Peminjaman</p>
                                <p className="text-xs font-bold text-gray-800">{selectedTrx.dates}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Item Dipinjam</p>
                                <p className="text-[12px] font-bold text-[#21409A] leading-relaxed bg-blue-50 p-3 rounded-lg border border-blue-100">{selectedTrx.items}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${selectedTrx.status === 'ditolak' ? 'bg-[#ED1C24]' : 'bg-[#00A651]'}`}></div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-2">Keterangan / Catatan</p>
                                <p className={`text-xs font-medium leading-relaxed pl-2 ${selectedTrx.status === 'ditolak' ? 'text-[#ED1C24]' : 'text-gray-700'}`}>{selectedTrx.notes || selectedTrx.purpose || '-'}</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end">
                            <button onClick={closeModal} className="px-6 py-2 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors shadow-sm">Tutup Arsip</button>
                        </div>

                    </div>
                </div>
            )}

            {/* MODAL: EXPORT EXCEL PARAMETERS */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/50 animate-in fade-in" onClick={() => setIsExportModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-[#107C41]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                Export Data
                            </h3>
                            <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>

                        {/* Pengaturan Parameter Waktu Export */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pilih Periode Export</label>
                                <select
                                    value={exportType}
                                    onChange={(e) => setExportType(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#107C41] focus:border-[#107C41] p-3 font-bold cursor-pointer"
                                >
                                    <option value="semua">Semua Waktu (Seluruh Data)</option>
                                    <option value="bulan_ini">Bulan Ini</option>
                                    <option value="tahun_ini">Tahun Ini</option>
                                    <option value="custom">Pilih Tanggal Spesifik...</option>
                                </select>
                            </div>

                            {/* Dynamic Inputs: Hanya muncul saat memilih opsi Custom Date Range */}
                            {exportType === 'custom' && (
                                <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Dari Tanggal</label>
                                        <input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} className="w-full text-sm border-gray-200 rounded-lg p-2.5 focus:ring-[#107C41]" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Hingga Tanggal</label>
                                        <input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} className="w-full text-sm border-gray-200 rounded-lg p-2.5 focus:ring-[#107C41]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons Export */}
                        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <button onClick={() => setIsExportModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
                            <button
                                onClick={handleExportDownload}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-[#107C41] hover:bg-[#0c6132] rounded-xl shadow-md transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Unduh Excel
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </AdminLayout>
    );
}