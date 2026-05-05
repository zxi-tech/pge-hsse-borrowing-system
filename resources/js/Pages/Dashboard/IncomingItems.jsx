import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function IncomingItems({ incomingItems, items }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Form data untuk Catat Manual
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        item_id: '',
        quantity: '',
        received_date: '',
        warehouse: 'Gudang HSSE Utama',
        notes: '',
    });

    const openModal = () => {
        clearErrors();
        reset();
        setIsModalOpen(true);
        setTimeout(() => setIsAnimating(true), 10);
    };

    const closeModal = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsModalOpen(false);
            reset();
        }, 200);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.incoming-items.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

    return (
        // Menggunakan background yang sama dengan AdminLayout agar menyatu sempurna
        <div className="w-full pb-12 relative animate-in fade-in duration-300">
            <Head title="Riwayat Logistik Masuk" />

            {/* ================= HEADER SECTION ================= */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Logistik Barang Masuk</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Jejak audit otomatis & pencatatan manual stok masuk aset HSSE.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={route('items.index')}
                        className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Kembali
                    </Link>
                    <button
                        onClick={openModal}
                        className="bg-[#00A651] hover:bg-[#008c44] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-1 duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Catat Manual
                    </button>
                </div>
            </div>

            {/* ================= TABLE SECTION ================= */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">

                {/* Search / Filter Mockup Bar (Menambah kesan Enterprise) */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="relative w-full md:w-80 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400 group-focus-within:text-[#21409A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input type="text" className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-[#21409A] focus:ring-4 focus:ring-[#21409A]/10 transition-all duration-300" placeholder="Cari log barang masuk..." />
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Total Log: <span className="bg-[#21409A] text-white px-2 py-0.5 rounded-md">{incomingItems.length}</span>
                    </div>
                </div>

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
                            {incomingItems.length > 0 ? (
                                incomingItems.map((log, index) => (
                                    <tr key={log.id} className="hover:bg-[#F4F5FA] transition-colors duration-200 group">
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-gray-400 group-hover:text-[#21409A] transition-colors">{index + 1}</span>
                                        </td>
                                        <td className="px-6 py-4 truncate">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800 truncate">{log.item?.name || 'Barang Terhapus'}</span>
                                                <span className="text-[10px] text-gray-400 font-mono tracking-wide">ID: #{log.item_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 truncate">
                                            <div className="flex items-center gap-2 text-sm font-medium text-[#21409A]">
                                                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                                <span className="truncate">{log.warehouse || 'Gudang HSSE Utama'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium truncate">
                                            {log.received_date}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-lg bg-green-50 text-[#00A651] font-black text-sm border border-green-100 shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                                                +{log.quantity}
                                            </div>
                                        </td>
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
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500 font-medium truncate w-full" title={log.notes}>
                                                {log.notes || '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 animate-in fade-in zoom-in duration-500">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 border border-gray-200 shadow-inner">
                                                <span className="text-2xl">📦</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-600 mb-1">Sistem Bersih!</p>
                                            <p className="text-xs font-medium">Belum ada aktivitas barang masuk atau penambahan stok.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= MODAL CATAT MANUAL ================= */}
            {isModalOpen && (
                <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 transition-opacity duration-200 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`} onClick={closeModal}>
                    <div className={`bg-white rounded-[24px] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden transform transition-all duration-200 ease-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={(e) => e.stopPropagation()}>

                        {/* Aksen Garis Warna PGE di atas Modal */}
                        <div className="h-1.5 w-full flex">
                            <div className="bg-[#21409A] flex-1"></div>
                            <div className="bg-[#00A651] flex-1"></div>
                            <div className="bg-[#FBBF24] flex-1"></div>
                        </div>

                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Catat Logistik Masuk</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Penambahan Stok Manual</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 custom-scrollbar">
                            <form id="incomingForm" onSubmit={submit} className="space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <label className="block text-[10px] font-bold text-[#21409A] uppercase tracking-widest mb-2">Pilih Barang Aset *</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#00A651] focus:border-[#00A651] p-2.5 font-medium outline-none transition-all"
                                        value={data.item_id}
                                        onChange={e => setData('item_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Silakan Pilih Barang --</option>
                                        {items.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                    {errors.item_id && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{errors.item_id}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Jumlah *</label>
                                        <input
                                            type="number" min="1"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-bold text-gray-900 focus:ring-[#00A651] focus:border-[#00A651] outline-none transition-all"
                                            placeholder="Contoh: 10"
                                            value={data.quantity}
                                            onChange={e => setData('quantity', e.target.value)}
                                            required
                                        />
                                        {errors.quantity && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{errors.quantity}</p>}
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Tanggal *</label>
                                        <input
                                            type="date"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-bold text-gray-900 focus:ring-[#00A651] focus:border-[#00A651] outline-none transition-all"
                                            value={data.received_date}
                                            onChange={e => setData('received_date', e.target.value)}
                                            required
                                        />
                                        {errors.received_date && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{errors.received_date}</p>}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Lokasi Gudang *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 p-2.5 text-sm font-bold text-gray-900 focus:ring-[#00A651] focus:border-[#00A651] outline-none transition-all"
                                            value={data.warehouse}
                                            onChange={e => setData('warehouse', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.warehouse && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{errors.warehouse}</p>}
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Keterangan Opsional</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-medium text-gray-700 focus:ring-[#00A651] focus:border-[#00A651] outline-none transition-all resize-none"
                                        rows="2"
                                        placeholder="Contoh: Pengadaan kuartal ke-3 dari Vendor X..."
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                    ></textarea>
                                    {errors.notes && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{errors.notes}</p>}
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                            <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                Batal
                            </button>
                            <button type="submit" form="incomingForm" disabled={processing} className="px-5 py-2.5 text-sm font-bold text-white bg-[#00A651] hover:bg-[#008c44] rounded-xl shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                                {processing ? 'Menyimpan...' : 'Simpan Logistik'}
                                {!processing && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}