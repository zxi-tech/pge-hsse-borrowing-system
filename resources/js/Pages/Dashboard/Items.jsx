import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

export default function Items({ auth, items }) {

    // ================= STATE & LOGIKA FORM MODAL =================
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State untuk menyimpan data barang yang sedang diedit (null jika mode Tambah)
    const [editingItem, setEditingItem] = useState(null);

    // 👇 TAMBAHAN: status 'available' ditambahkan sebagai default di dalam sizes 👇
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'asset',
        warehouse: 'Gudang HSSE Utama',
        description: '',
        photo: null,
        sizes: [{ size_name: 'All Size', stock: 0, status: 'available' }],
        _method: 'POST'
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset();
        clearErrors();
    };

    // Fungsi untuk Buka Modal "Tambah"
    const openCreateModal = () => {
        setEditingItem(null);
        reset();
        clearErrors();
        setData('_method', 'POST');
        setIsModalOpen(true);
    };

    // Fungsi untuk Buka Modal "Edit"
    const openEditModal = (item) => {
        setEditingItem(item);
        clearErrors();
        setData({
            name: item.name,
            type: item.type,
            warehouse: item.warehouse || 'Gudang HSSE Utama',
            description: item.description || '',
            photo: null,
            // 👇 TAMBAHAN: Pastikan saat edit, status ikut terbawa (atau default available) 👇
            sizes: item.sizes.length > 0
                ? item.sizes.map(s => ({ ...s, status: s.status || 'available' }))
                : [{ size_name: 'All Size', stock: 0, status: 'available' }],
            _method: 'PUT'
        });
        setIsModalOpen(true);
    };

    // ================= FUNGSI HAPUS BARANG =================
    const handleDelete = (item) => {
        if (window.confirm(`Peringatan!\n\nApakah Anda yakin ingin menghapus barang "${item.name}" secara permanen?\nSemua data stok dan foto barang ini akan hilang dan tidak dapat dikembalikan.`)) {
            router.delete(route('items.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const targetRoute = editingItem
            ? route('items.update', editingItem.id)
            : route('items.store');

        post(targetRoute, {
            forceFormData: true,
            onSuccess: () => closeModal(),
            onError: (err) => {
                console.error("Error dari Laravel:", err);
                alert("Gagal menyimpan! Periksa tulisan merah pada formulir.");
            }
        });
    };

    // 👇 TAMBAHAN: handleAddSize sekarang membawa default status 👇
    const handleAddSize = () => setData('sizes', [...data.sizes, { size_name: '', stock: 0, status: 'available' }]);
    const handleRemoveSize = (index) => setData('sizes', data.sizes.filter((_, i) => i !== index));
    const handleSizeChange = (index, field, value) => {
        const newSizes = [...data.sizes];
        newSizes[index][field] = value;
        setData('sizes', newSizes);
    };

    // Logika hitung stok (Abaikan stok yang statusnya rusak/hilang, tapi laundry tetap dihitung total aset)
    const calculateTotalStock = (sizes) => {
        return sizes.reduce((total, size) => total + Number(size.stock), 0);
    };

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Data Barang" />

            <div className="w-full pb-8">

                {/* ================= HEADER SECTION ================= */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                        Manajemen Barang
                    </h1>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.incoming-items.index')}
                            className="bg-[#21409A] hover:bg-[#1a3380] text-white px-5 py-2 rounded-full text-[11px] font-bold shadow-sm hover:shadow-md transition-all uppercase tracking-wider flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            Riwayat Barang Masuk
                        </Link>

                        <button
                            onClick={openCreateModal}
                            className="bg-[#00A651] hover:bg-[#008c44] text-white px-5 py-2 rounded-full text-[11px] font-bold shadow-sm hover:shadow-md transition-all uppercase tracking-wider"
                        >
                            + Tambah Barang
                        </button>
                    </div>
                </div>

                {/* ================= GRID DATA BARANG ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

                    {items && items.length > 0 ? (
                        items.map((item) => {
                            const totalStock = calculateTotalStock(item.sizes);

                            return (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#00A651]/30 transition-all duration-300 flex flex-col group">

                                    <div className="h-40 bg-[#F8F9FA] p-4 flex items-center justify-center relative border-b border-gray-100">

                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold text-white shadow-sm uppercase w-max ${item.type === 'asset' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                                                {item.type}
                                            </span>
                                            {item.warehouse && (
                                                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-gray-200 text-gray-700 shadow-sm uppercase w-max">
                                                    {item.warehouse}
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                            <button onClick={() => openEditModal(item)} title="Edit Barang" className="bg-white hover:bg-[#00A651] hover:text-white text-gray-600 p-1.5 rounded-lg shadow-sm border border-gray-200 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={() => handleDelete(item)} title="Hapus Barang" className="bg-white hover:bg-red-500 hover:text-white text-gray-600 p-1.5 rounded-lg shadow-sm border border-gray-200 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>

                                        {item.photo_path ? (
                                            <img src={`/storage/${item.photo_path}`} alt={item.name} className="max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="text-gray-300 text-center flex flex-col items-center">
                                                <svg className="w-10 h-10 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col text-center">
                                        <h3 className="text-xs font-bold text-gray-800 mb-1 leading-tight group-hover:text-[#00A651] transition-colors line-clamp-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 mb-3 line-clamp-2 h-7 font-medium">
                                            {item.description || 'Spesifikasi material standar PGE.'}
                                        </p>

                                        <div className="mb-4 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-2">Stok Per Varian</p>
                                            <div className="flex flex-wrap justify-center gap-1.5">
                                                {item.sizes.map((size, index) => (
                                                    // 👇 TAMBAHAN: Visual Badge diubah jika statusnya sedang laundry 👇
                                                    <div key={index} className={`inline-flex items-center border rounded px-1.5 py-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${size.status === 'laundry' ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
                                                        <span className="text-[9px] text-slate-400 font-bold mr-1">{size.size_name}:</span>
                                                        <span className={`text-[9px] font-extrabold ${size.status === 'laundry' ? 'text-orange-500' : (size.stock > 0 ? 'text-slate-700' : 'text-red-500')}`}>
                                                            {size.status === 'laundry' ? 'Laundry' : size.stock}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-3 border-t border-slate-50">
                                            <p className="text-[10px] font-black text-[#00A651] uppercase tracking-widest">
                                                Total: {totalStock} Unit
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm font-medium">Belum ada data barang tersedia.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= MODAL POP-UP (TAMBAH / EDIT) ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                                {editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="itemForm" onSubmit={handleSubmit} className="space-y-5">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Nama Barang *</label>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A651] outline-none transition-shadow`} placeholder="Contoh: Helm Safety Putih" required />
                                        {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Tipe Barang *</label>
                                        <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A651] outline-none transition-shadow">
                                            <option value="asset">Asset (Dikembalikan)</option>
                                            <option value="consumable">Consumable (Habis Pakai)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Lokasi Gudang *</label>
                                        <input type="text" value={data.warehouse} onChange={e => setData('warehouse', e.target.value)} className={`w-full border ${errors.warehouse ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A651] outline-none transition-shadow`} placeholder="Contoh: Gudang Area Kamojang" required />
                                        {errors.warehouse && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.warehouse}</p>}
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Foto Barang {editingItem ? '(Opsional)' : '*'}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setData('photo', e.target.files[0])}
                                            className={`w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#00A651]/10 file:text-[#00A651] hover:file:bg-[#00A651]/20 border ${errors.photo ? 'border-red-500' : 'border-gray-300'} rounded-lg p-1 transition-colors`}
                                            required={!editingItem}
                                        />
                                        {errors.photo && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.photo}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Deskripsi</label>
                                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A651] outline-none transition-shadow" placeholder="Tuliskan spesifikasi material atau fungsi barang..."></textarea>
                                </div>

                                <div className="border-t border-gray-200 my-2"></div>

                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">Varian Ukuran, Stok & Status *</label>
                                        <button type="button" onClick={handleAddSize} className="text-[10px] font-bold text-[#00A651] hover:text-[#008c44] flex items-center gap-1 bg-[#00A651]/10 px-2 py-1 rounded transition-colors">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                            Tambah Ukuran
                                        </button>
                                    </div>

                                    {errors.sizes && <p className="text-red-500 text-[10px] mb-2 font-bold">{errors.sizes}</p>}

                                    <div className="space-y-2">
                                        {data.sizes.map((size, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                                <div className="flex-1">
                                                    <input type="text" value={size.size_name} onChange={e => handleSizeChange(index, 'size_name', e.target.value)} className="w-full border border-gray-300 rounded text-xs px-2 py-1.5 focus:ring-1 focus:ring-[#00A651] outline-none" placeholder="All Size, 39, 40, L, XL" required />
                                                </div>
                                                <div className="w-20">
                                                    <input type="number" min="0" value={size.stock} onChange={e => handleSizeChange(index, 'stock', e.target.value)} className="w-full border border-gray-300 rounded text-xs px-2 py-1.5 focus:ring-1 focus:ring-[#00A651] outline-none" placeholder="Qty" required />
                                                </div>

                                                {/* 👇 TAMBAHAN: Dropdown Status untuk setiap Varian 👇 */}
                                                <div className="w-32">
                                                    <select
                                                        value={size.status || 'available'}
                                                        onChange={e => handleSizeChange(index, 'status', e.target.value)}
                                                        className="w-full border border-gray-300 rounded text-xs px-2 py-1.5 focus:ring-1 focus:ring-[#00A651] outline-none bg-white"
                                                    >
                                                        <option value="available">Tersedia</option>
                                                        <option value="laundry">Laundry</option>
                                                        <option value="maintenance">Perbaikan</option>
                                                    </select>
                                                </div>

                                                <button type="button" onClick={() => handleRemoveSize(index)} disabled={data.sizes.length === 1} className={`p-1.5 rounded transition-colors ${data.sizes.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button onClick={closeModal} className="px-5 py-2 text-[11px] uppercase tracking-wider font-bold text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                                Batal
                            </button>
                            <button type="submit" form="itemForm" disabled={processing} className={`px-5 py-2 text-[11px] uppercase tracking-wider font-bold text-white rounded-full shadow-sm transition-all ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00A651] hover:bg-[#008c44] hover:shadow-md'}`}>
                                {processing ? 'Menyimpan...' : (editingItem ? 'Update Barang' : 'Simpan Barang')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}