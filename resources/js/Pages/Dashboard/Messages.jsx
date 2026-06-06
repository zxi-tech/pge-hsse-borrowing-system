import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function Messages({ auth, messages }) {
    // State Management
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState('Semua');

    // Helper: Format timestamp ke format lokal Indonesia
    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Helper: Generate warna background avatar dinamis berdasarkan panjang string nama
    const getAvatarColor = (name) => {
        const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-purple-100 text-purple-700'];
        const index = name?.length % colors.length || 0;
        return colors[index];
    };

    // Handler: Buka modal detail dan kirim PUT request untuk update status is_read
    const handleSelectMessage = (msg) => {
        setSelectedMessage(msg);

        if (!msg.is_read) {
            router.put(route('messages.read', msg.id), {}, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    // Handler: Hapus pesan secara permanen (DELETE request)
    const handleDeleteMessage = (e, id) => {
        e.stopPropagation();
        if (confirm('Apakah Anda yakin ingin menghapus pesan ini secara permanen?')) {
            router.delete(route('messages.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    if (selectedMessage?.id === id) {
                        setSelectedMessage(null);
                    }
                }
            });
        }
    };

    // Data Derivation: Filter pesan berdasarkan input pencarian dan tab aktif
    const displayedMessages = messages?.data?.filter(msg => {
        const matchesSearch = msg.name.toLowerCase().includes(searchQuery.toLowerCase()) || (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filterTab === 'Semua' ? true : filterTab === 'Unread' ? !msg.is_read : msg.is_read;
        return matchesSearch && matchesFilter;
    }) || [];

    // Kalkulasi jumlah pesan yang belum dibaca untuk badge indikator
    const unreadCount = messages?.data?.filter(m => !m.is_read).length || 0;

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Pesan Masuk" />

            <div className="w-full flex flex-col pb-10">

                {/* Header Konten */}
                <div className="w-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-[28px] font-bold text-gray-800 tracking-tight mb-2">Pesan Masuk</h1>
                    <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                        Pantau, cari, dan tinjau pertanyaan atau keluhan yang dikirimkan oleh pengguna.
                    </p>
                </div>

                {/* Area Tabel Data */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 delay-75">

                    {/* Toolbar: Tab Filter & Search Bar */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 bg-white">

                        {/* Tab Navigation */}
                        <div className="inline-flex bg-gray-50 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full custom-scrollbar">
                            {['Semua', 'Unread', 'Read'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterTab(tab)}
                                    className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${filterTab === tab ? 'bg-white text-[#21409A] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                                >
                                    {tab === 'Unread' && unreadCount > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0"></span>}
                                    {tab === 'Unread' ? 'Belum Dibaca' : tab === 'Read' ? 'Sudah Dibaca' : 'Semua'}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:max-w-xs group">
                            <svg className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-[#21409A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input
                                type="text"
                                placeholder="Cari pengirim atau subjek..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F4F5FA] border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-[#21409A]/30 focus:ring-4 focus:ring-[#21409A]/10 transition-all"
                            />
                        </div>
                    </div>

                    {/* Render Tabel Pesan */}
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left whitespace-nowrap table-fixed min-w-[800px]">
                            <thead>
                                <tr className="text-gray-400 text-[11px] font-bold tracking-widest uppercase border-b border-gray-100 bg-gray-50/30">
                                    <th className="px-4 py-4 w-10"></th>
                                    <th className="px-4 py-4 w-56">Pengirim</th>
                                    <th className="px-4 py-4 w-48">Subjek</th>
                                    <th className="px-4 py-4">Cuplikan Pesan</th>
                                    <th className="px-4 py-4 w-36">Tanggal</th>
                                    <th className="px-4 py-4 w-16 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayedMessages.length > 0 ? (
                                    displayedMessages.map((msg) => (
                                        <tr
                                            key={msg.id}
                                            onDoubleClick={() => handleSelectMessage(msg)}
                                            title="Klik ganda untuk membuka detail pesan"
                                            className={`cursor-pointer transition-colors duration-200 select-none group ${!msg.is_read ? 'bg-blue-50/20 hover:bg-blue-50/50' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            {/* Unread Indicator */}
                                            <td className="pl-6 py-4">
                                                {!msg.is_read ? (
                                                    <div className="w-2.5 h-2.5 bg-[#21409A] rounded-full shadow-sm ring-4 ring-blue-100"></div>
                                                ) : (
                                                    <div className="w-2.5 h-2.5 bg-transparent"></div>
                                                )}
                                            </td>

                                            {/* Data Pengirim */}
                                            <td className="px-4 py-4 truncate">
                                                <div className="flex items-center gap-3 truncate">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(msg.name)}`}>
                                                        {msg.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex flex-col truncate">
                                                        <span className={`text-sm truncate ${!msg.is_read ? 'font-extrabold text-gray-900' : 'font-bold text-gray-700'}`}>{msg.name}</span>
                                                        <span className="text-xs text-gray-500 truncate">{msg.email}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Data Subjek */}
                                            <td className="px-4 py-4 truncate">
                                                <div className={`text-[13px] truncate ${!msg.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>
                                                    {msg.subject || '(Tanpa Subjek)'}
                                                </div>
                                            </td>

                                            {/* Cuplikan Pesan */}
                                            <td className="px-4 py-4 truncate">
                                                <div className="text-[13px] text-gray-500 truncate">
                                                    {msg.message}
                                                </div>
                                            </td>

                                            {/* Data Tanggal */}
                                            <td className="px-4 py-4 text-xs font-medium text-gray-400 truncate">
                                                {formatDate(msg.created_at)}
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={(e) => handleDeleteMessage(e, msg.id)}
                                                    className="p-2 bg-white border border-gray-200 text-red-500 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                                    title="Hapus Pesan"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                                </div>
                                                <p className="text-sm font-bold text-gray-600 mb-1">Tidak ada pesan</p>
                                                <p className="text-xs">Coba ubah filter atau kata kunci pencarian Anda.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Component */}
                    {messages?.links?.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between">
                            <span className="text-[11px] text-gray-500 font-medium">
                                Menampilkan {messages.from || 0} - {messages.to || 0} dari total {messages.total} Pesan
                            </span>
                            <div className="flex justify-center gap-1">
                                {messages.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${!link.url ? 'text-gray-300 pointer-events-none hidden' : link.active ? 'bg-[#21409A] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Modal Detail Pesan */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

                        {/* Modal Header */}
                        <div className="p-6 lg:p-8 border-b border-gray-100 flex justify-between items-start bg-white shrink-0 relative">
                            <div className="flex-1 pr-10">
                                <h2 className="text-2xl font-black text-gray-900 mb-6 leading-tight">
                                    {selectedMessage.subject || '(Tanpa Subjek)'}
                                </h2>

                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ${getAvatarColor(selectedMessage.name)}`}>
                                        {selectedMessage.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">{selectedMessage.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{selectedMessage.email}</p>
                                        <p className="text-xs font-bold text-gray-400 mt-1">{formatDate(selectedMessage.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="absolute top-6 right-6 w-8 h-8 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 lg:p-8 overflow-y-auto custom-scrollbar bg-[#F4F5FA] flex-1">
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[200px]">
                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                                    {selectedMessage.message}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer Action */}
                        <div className="p-5 lg:px-8 lg:py-5 border-t border-gray-100 bg-white shrink-0 flex items-center justify-end">
                            <button
                                onClick={(e) => handleDeleteMessage(e, selectedMessage.id)}
                                className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                Hapus Pesan
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </AdminLayout>
    );
}