import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function IncomingItems({ incomingItems }) {
    // STATE MANAGEMENT
    const [searchQuery, setSearchQuery] = useState('');

    // HELPER UTILITIES
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

    // DATA DERIVATION: SEARCH FILTERING
    const filteredItems = incomingItems.filter((log) => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();

        // Ekstraksi dan sanitasi nilai string dari setiap field untuk dicocokkan
        const itemName = (log.item?.name || 'Barang Terhapus').toLowerCase();
        const itemId = String(log.item_id).toLowerCase();
        const warehouse = (log.warehouse || 'Gudang HSSE Utama').toLowerCase();
        const date = (log.received_date || '').toLowerCase();
        const userName = (log.user?.name || 'Sistem Otomatis').toLowerCase();
        const notes = (log.notes || '').toLowerCase();

        // Evaluasi pencocokan query terhadap salah satu field yang tersedia
        return itemName.includes(searchLower) ||
            itemId.includes(searchLower) ||
            warehouse.includes(searchLower) ||
            date.includes(searchLower) ||
            userName.includes(searchLower) ||
            notes.includes(searchLower);
    });

    return (
        <div className="w-full pb-12 relative animate-in fade-in duration-300 px-4 sm:px-6 md:px-8 mt-6">
            <Head title="Riwayat Logistik Masuk" />

            {/* Header Konten & Action Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Logistik Barang Masuk</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Jejak audit otomatis logistik dan stok masuk aset HSSE.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={route('items.index')}
                        className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Kembali
                    </Link>
                </div>
            </div>

            {/* Container Tabel Logistik */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">

                {/* Table Toolbar (Pencarian & Counter) */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="relative w-full md:w-80 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400 group-focus-within:text-[#21409A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-[#21409A] focus:ring-4 focus:ring-[#21409A]/10 transition-all duration-300"
                            placeholder="Cari log barang masuk..."
                        />
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Total Log: <span className="bg-[#21409A] text-white px-2 py-0.5 rounded-md">{filteredItems.length}</span>
                    </div>
                </div>

                {/* Area Render Tabel */}
                <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
                    <table className="w-full text-left whitespace-nowrap table-fixed">
                        <thead>
                            <tr className="border-b border-gray-100 bg-white text-gray-400 text-[11px] font-extrabold uppercase tracking-widest">
                                <th className="px-6 py-5 w-[8%] text-center">No</th>
                                <th className="px-6 py-5 w-[22%]">Nama Barang</th>
                                <th className="px-6 py-5 w-[15%]">Gudang</th>
                                <th className="px-6 py-5 w-[12%]">Tanggal</th>
                                <th className="px-6 py-5 w-[12%] text-center">Jml Masuk</th>
                                <th className="px-6 py-5 w-[15%]">Dicatat Oleh</th>
                                <th className="px-6 py-5 w-[16%]">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {/* Render Baris Tabel Secara Dinamis dari Data filteredItems */}
                            {filteredItems.length > 0 ? (
                                filteredItems.map((log, index) => (
                                    <tr key={log.id} className="hover:bg-[#F4F5FA] transition-colors duration-200 group">

                                        {/* Kolom Nomor Indeks */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-gray-400 group-hover:text-[#21409A] transition-colors">{index + 1}</span>
                                        </td>

                                        {/* Kolom Info Barang */}
                                        <td className="px-6 py-4 truncate">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800 truncate">{log.item?.name || 'Barang Terhapus'}</span>
                                                <span className="text-[10px] text-gray-400 font-mono tracking-wide">ID: #{log.item_id}</span>
                                            </div>
                                        </td>

                                        {/* Kolom Gudang (Warehouse) */}
                                        <td className="px-6 py-4 truncate">
                                            <div className="flex items-center gap-2 text-sm font-medium text-[#21409A]">
                                                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                                <span className="truncate">{log.warehouse || 'Gudang HSSE Utama'}</span>
                                            </div>
                                        </td>

                                        {/* Kolom Tanggal Input */}
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium truncate">
                                            {log.received_date}
                                        </td>

                                        {/* Kolom Kuantitas (Jumlah) */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-lg bg-green-50 text-[#00A651] font-black text-sm border border-green-100 shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                                                +{log.quantity}
                                            </div>
                                        </td>

                                        {/* Kolom Akun Perekam */}
                                        <td className="px-6 py-4 truncate">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 text-gray-600 border border-gray-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                    {getInitials(log.user?.name)}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 truncate">
                                                    {log.user?.name || 'Sistem Otomatis'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Kolom Keterangan Tambahan */}
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500 font-medium truncate w-full" title={log.notes}>
                                                {log.notes || '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // Render Output Saat Hasil Pencarian Kosong (Empty State)
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 animate-in fade-in zoom-in duration-500">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 border border-gray-200 shadow-inner">
                                                <span className="text-2xl">{searchQuery ? '🔍' : '📦'}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-600 mb-1">
                                                {searchQuery ? 'Tidak Ada Hasil!' : 'Sistem Bersih!'}
                                            </p>
                                            <p className="text-xs font-medium">
                                                {searchQuery
                                                    ? `Kami tidak menemukan data yang cocok dengan "${searchQuery}".`
                                                    : 'Belum ada aktivitas barang masuk atau penambahan stok.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}