import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function Users({ auth, users, filters }) {

    // ================= STATE UTAMA DARI SERVER =================
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'Semua');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    const filteredUsers = users.data || [];

    // ================= STATE MODAL & EDIT =================
    const [selectedUser, setSelectedUser] = useState(filteredUsers[0] || null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [animateChart, setAnimateChart] = useState(false);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    // ================= STATE PINTU RAHASIA (DEVELOPER ONLY) =================
    const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
    const [secretStep, setSecretStep] = useState(1);
    const [secretPass1, setSecretPass1] = useState('');
    const [secretPassConfirm, setSecretPassConfirm] = useState('');
    const [secretPass2, setSecretPass2] = useState('');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ================= LOGIKA PENCARIAN OTOMATIS (DEBOUNCE) =================
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery !== (filters?.search || '') || statusFilter !== (filters?.status || 'Semua')) {
                router.get(route('users.index'), { search: searchQuery, status: statusFilter }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, statusFilter]);

    // ================= HANDLER INTERAKSI =================
    const handleDoubleClick = (user) => {
        setSelectedUser(user);
        setEditData({ ...user });
        setIsModalOpen(true);
        setIsOtpStep(false);
        setAnimateChart(false);
        setTimeout(() => setAnimateChart(true), 150);
    };

    const handleSaveClick = () => {
        const emailInput = editData.email.toLowerCase();
        const isValidDomain = emailInput.endsWith('@pertamina.com') || emailInput.endsWith('@mk.pertamina.com');

        if (!isValidDomain) {
            alert('GAGAL: Alamat email wajib menggunakan domain resmi (@pertamina.com atau @mk.pertamina.com)!');
            return;
        }

        if (editData.email !== selectedUser.email) {
            alert(`OTP Verifikasi telah dikirim ke email baru: ${editData.email}`);
            setIsOtpStep(true);
        } else {
            router.put(route('users.update', editData.id), {
                status: editData.status
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    alert('Status karyawan berhasil diperbarui!');
                }
            });
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);
        if (value !== '' && index < 5) otpRefs[index + 1].current.focus();
    };

    const handleVerifyOtp = () => {
        const otpCode = otpValues.join('');
        if (otpCode.length === 6) {
            router.put(route('users.update', editData.id), {
                email: editData.email,
                status: editData.status,
                otp: otpCode
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    setOtpValues(['', '', '', '', '', '']);
                    alert('Email dan status berhasil diperbarui!');
                },
                onError: (errors) => alert(errors.otp || 'Terjadi kesalahan saat menyimpan data.')
            });
        } else {
            alert("Harap isi 6 digit OTP!");
        }
    };

    // ================= LOGIKA PINTU RAHASIA =================
    const handleSecretTrigger = () => {
        // Langsung buka modal tanpa mengecek nama user
        setIsSecretModalOpen(true);
        setSecretStep(1);
        setSecretPass1('');
        setSecretPassConfirm('');
        setSecretPass2('');
    };

    const verifySecretStep1 = () => {
        if (secretPass1 === 'XyZ-99#Protocol' && secretPassConfirm === 'XyZ-99#Protocol') {
            setSecretStep(2);
        } else {
            alert('Akses Ditolak: Kredensial Lapis 1 Tidak Valid.');
            setSecretPass1('');
            setSecretPassConfirm('');
        }
    };

    const verifySecretStep2 = () => {
        if (secretPass2 === 'Genesis-X7R$88@Key') {
            setIsSecretModalOpen(false);
            // 👇 Ganti URL ini dengan URL rute rahasia untuk tambah user kamu nanti
            router.get('/admin/users/secret-create');
        } else {
            alert('Akses Ditolak: Otorisasi Final Gagal.');
            setSecretPass2('');
        }
    };

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Data Pengguna" />

            <div className="w-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 👇 TRIGGER RAHASIA DITANAM DI SINI (onDoubleClick) 👇 */}
                <h1
                    onDoubleClick={handleSecretTrigger}
                    className="text-[28px] font-bold text-gray-800 tracking-tight mb-2 select-none cursor-default"
                >
                    Data Pengguna
                </h1>
                <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                    Kelola informasi profil, pantau statistik peminjaman, dan atur status akses karyawan ke sistem HSSE.
                </p>
            </div>

            <div className="w-full flex flex-col xl:flex-row gap-8 pb-10">

                {/* ================= AREA KIRI: TABEL ================= */}
                <div className="flex-1 min-w-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                    <div className="bg-transparent border-t border-b sm:border border-gray-100 sm:bg-white sm:rounded-[24px] sm:shadow-sm overflow-hidden flex-1 flex flex-col">

                        {/* TOOLBAR INTERAKTIF */}
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 bg-white border-b border-gray-100">
                            <div className="relative w-full sm:w-auto" ref={filterRef}>
                                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center justify-between sm:justify-start gap-2 text-sm font-medium transition-all px-3 py-2 rounded-xl border w-full sm:w-auto ${statusFilter !== 'Semua' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                                        {statusFilter !== 'Semua' ? `Status: ${statusFilter}` : 'Add filter'}
                                    </div>
                                    <svg className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                {isFilterOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter by Status</div>
                                        {['Semua', 'Aktif', 'Nonaktif', 'Cuti'].map(status => (
                                            <button key={status} onClick={() => { setStatusFilter(status); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${statusFilter === status ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                                {status}
                                                {statusFilter === status && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:block h-6 w-px bg-gray-200 mx-2"></div>
                            <div className="relative w-full flex-1 group">
                                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <input type="text" placeholder="Cari nama, NIP, atau email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none pl-8 pr-4 py-2 text-sm text-gray-800 outline-none placeholder-gray-400 focus:ring-0" />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* TABEL */}
                        <div className="overflow-x-auto bg-white flex-1 custom-scrollbar min-h-[300px]">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="text-gray-500 text-[11px] font-bold tracking-widest uppercase border-b border-gray-100">
                                        <th className="px-5 sm:px-6 py-4">Nama Karyawan</th>
                                        <th className="px-5 sm:px-6 py-4">ID Pekerja</th>
                                        <th className="px-5 sm:px-6 py-4">Email address</th>
                                        <th className="px-5 sm:px-6 py-4">Departemen</th>
                                        <th className="px-5 sm:px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((u) => {
                                            const isSelected = selectedUser?.id === u.id;
                                            return (
                                                <tr
                                                    key={u.id}
                                                    onClick={() => setSelectedUser(u)}
                                                    onDoubleClick={() => handleDoubleClick(u)}
                                                    className={`cursor-pointer transition-colors duration-200 select-none ${isSelected ? 'bg-[#3b82f6] hover:bg-[#3b82f6]' : 'hover:bg-gray-50 bg-white'}`}
                                                    title="Klik ganda untuk melihat detail dan mengedit"
                                                >
                                                    <td className="px-5 sm:px-6 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-blue-100 flex items-center justify-center border border-gray-200 shadow-sm relative">
                                                                {u.photo ? (
                                                                    <img src={u.photo.startsWith('http') ? u.photo : `/storage/${u.photo}`} alt={u.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                                ) : (
                                                                    <span className="text-blue-600 font-bold text-xs flex items-center justify-center w-full h-full">{u.name ? u.name.charAt(0).toUpperCase() : 'U'}</span>
                                                                )}
                                                                <span className="hidden text-blue-600 font-bold text-xs items-center justify-center w-full h-full absolute inset-0 bg-blue-100">{u.name ? u.name.charAt(0).toUpperCase() : 'U'}</span>
                                                            </div>
                                                            <span className={`text-[13px] font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 sm:px-6 py-3.5"><span className={`text-[13px] ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{u.nip}</span></td>
                                                    <td className="px-5 sm:px-6 py-3.5"><span className={`text-[13px] ${isSelected ? 'text-white' : 'text-gray-500'}`}>{u.email}</span></td>
                                                    <td className="px-5 sm:px-6 py-3.5"><span className={`text-[13px] ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{u.department}</span></td>
                                                    <td className="px-5 sm:px-6 py-3.5">
                                                        {isSelected ? (
                                                            <span className="text-[13px] font-bold text-white">{u.status}</span>
                                                        ) : (
                                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${u.status === 'Aktif' ? 'bg-green-100 text-green-700' : u.status === 'Cuti' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                                    <p className="text-sm font-medium text-gray-600">Karyawan tidak ditemukan</p>
                                                    <button onClick={() => { setSearchQuery(''); setStatusFilter('Semua'); }} className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                                                        Reset Pencarian
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ================= AREA PAGINASI ================= */}
                        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <span className="text-xs text-gray-500 font-medium">
                                Menampilkan {users.from || 0} - {users.to || 0} dari total {users.total} Karyawan
                            </span>
                            <div className="flex space-x-1">
                                {users.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${!link.url ? 'text-gray-300 cursor-not-allowed' : link.active ? 'bg-[#21409A] text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'} `}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* ================= AREA KANAN: KARTU PROFIL ================= */}
                <div className="w-full xl:w-[320px] shrink-0 animate-in fade-in slide-in-from-right-8 duration-500 delay-150 fill-mode-both">
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col items-center sticky top-24 transition-all">

                        <p className="text-sm font-semibold text-gray-500 mb-4">{selectedUser?.nip || '-'}</p>

                        <div className="w-36 h-36 rounded-full p-1 bg-white border border-gray-200 shadow-sm mb-5 overflow-hidden flex items-center justify-center">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-blue-400 flex items-center justify-center relative">
                                {selectedUser?.photo ? (
                                    <img src={selectedUser.photo.startsWith('http') ? selectedUser.photo : `/storage/${selectedUser.photo}`} alt={selectedUser?.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                ) : (
                                    <span className="text-white font-extrabold text-5xl shadow-sm flex items-center justify-center w-full h-full">{selectedUser?.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}</span>
                                )}
                                <span className="hidden text-white font-extrabold text-5xl shadow-sm items-center justify-center w-full h-full absolute inset-0 bg-gradient-to-tr from-blue-500 to-blue-400">{selectedUser?.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}</span>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 tracking-tight text-center">{selectedUser?.name || 'Tidak ada data'}</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 mb-6 text-center">{selectedUser?.department || '-'}</p>

                        <div className="flex gap-3 mb-8 w-full justify-center">
                            <button className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#4B70F5] hover:bg-blue-50 transition-colors shadow-sm" title="Hubungi via Telepon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            </button>
                        </div>

                        <div className="w-full h-px bg-gray-100 mb-6"></div>

                        <div className="w-full text-left mb-6">
                            <h4 className="text-xs font-extrabold text-gray-800 mb-2">Tentang Karyawan</h4>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                {selectedUser?.about || 'Belum ada deskripsi profil untuk pengguna ini.'}
                            </p>
                        </div>

                        <div className="w-full flex justify-between text-left">
                            <div>
                                <h4 className="text-[11px] font-bold text-gray-800 mb-1">Nomor Telepon</h4>
                                <p className="text-xs text-gray-400 font-medium">{selectedUser?.phone || 'Belum diisi'}</p>
                            </div>

                            <div className="text-right">
                                <h4 className="text-[11px] font-bold text-gray-800 mb-1">Status Akun</h4>
                                <p className={`text-xs font-bold ${selectedUser?.status === 'Aktif' ? 'text-green-500' : selectedUser?.status === 'Cuti' ? 'text-amber-500' : 'text-red-400'}`}>{selectedUser?.status || '-'}</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* ================= MODAL RAHASIA (DEVELOPER ACCESS) ================= */}
            {isSecretModalOpen && (
                <div className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#121212] border border-gray-800 rounded-lg shadow-2xl w-full max-w-md p-8 relative font-mono text-green-500 overflow-hidden">

                        {/* Matrix-style decoration */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

                        <button onClick={() => setIsSecretModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="mb-8">
                            <h2 className="text-xl font-bold tracking-widest uppercase">System Authorization</h2>
                        </div>

                        {secretStep === 1 ? (
                            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">&gt; Layer 1 Credentials</label>
                                    <input
                                        type="password"
                                        value={secretPass1}
                                        onChange={(e) => setSecretPass1(e.target.value)}
                                        className="w-full bg-black/50 border border-green-900/50 text-green-400 px-4 py-3 rounded outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono tracking-widest"
                                        placeholder="Input_Key_1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">&gt; Lvl 1 Verification</label>
                                    <input
                                        type="password"
                                        value={secretPassConfirm}
                                        onChange={(e) => setSecretPassConfirm(e.target.value)}
                                        className="w-full bg-black/50 border border-green-900/50 text-green-400 px-4 py-3 rounded outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono tracking-widest"
                                        placeholder="Confirm_Key"
                                    />
                                </div>
                                <button onClick={verifySecretStep1} className="w-full mt-4 bg-green-900/40 border border-green-700 text-green-400 py-3 uppercase tracking-widest text-xs font-bold hover:bg-green-800 hover:text-white transition-colors">
                                    [ Protocol Startup ]
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                <div className="p-3 bg-green-900/20 border border-green-800/50 text-xs mb-6">
                                    Lvl 1 Accepted.<br />
                                    Awaiting final authorization...
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest mb-2 text-rose-500">&gt; Final Authorization (Lvl 2)</label>
                                    <input
                                        type="password"
                                        value={secretPass2}
                                        onChange={(e) => setSecretPass2(e.target.value)}
                                        className="w-full bg-black/50 border border-rose-900/50 text-rose-400 px-4 py-3 rounded outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono tracking-widest"
                                        placeholder="Input_Final_Key"
                                    />
                                </div>
                                <button onClick={verifySecretStep2} className="w-full mt-4 bg-rose-900/40 border border-rose-700 text-rose-400 py-3 uppercase tracking-widest text-xs font-bold hover:bg-rose-800 hover:text-white transition-colors">
                                    [ Security Bypass ]
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ================= MODAL POPUP DOUBLE CLICK (EDIT USER NORMAL) ================= */}
            {isModalOpen && editData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300">

                        {/* Kolom Kiri: Profil & Chart Animasi */}
                        <div className="w-full md:w-5/12 bg-[#F8FAFC] p-8 border-r border-gray-100 flex flex-col items-center">

                            {/* FOTO PROFIL DENGAN ANTI-ERROR FALLBACK */}
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg mb-4 overflow-hidden bg-[#21409A] text-white relative flex justify-center items-center text-4xl font-black">
                                {editData.photo ? (
                                    <img
                                        src={editData.photo.startsWith('http') ? editData.photo : `/storage/${editData.photo}`}
                                        alt={editData.name}
                                        className="w-full h-full object-cover relative z-10"
                                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                ) : null}
                                <span className={`${editData.photo ? 'hidden ' : ''}absolute inset-0 flex items-center justify-center w-full h-full bg-[#21409A] text-white z-0`}>
                                    {editData.name ? editData.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900">{editData.name}</h2>

                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {editData.nip} {editData.department ? '• ' + editData.department : ''}
                            </p>

                            <div className="w-full h-px bg-gray-200 my-6"></div>

                            {/* CUSTOM CHART: MODERN HORIZONTAL PROGRESS BAR */}
                            <div className="w-full">
                                {(() => {
                                    const total = editData.total_borrow || 0;
                                    const onTime = editData.on_time || 0;
                                    const late = editData.late || 0;
                                    const onTimePct = total > 0 ? Math.round((onTime / total) * 100) : 0;
                                    const latePct = total > 0 ? Math.round((late / total) * 100) : 0;

                                    return (
                                        <>
                                            <div className="flex items-center justify-between mb-5">
                                                <h3 className="text-sm font-extrabold text-gray-800">Statistik Peminjaman</h3>
                                                <span className="text-[10px] font-bold bg-blue-100 text-[#21409A] px-2 py-1 rounded-md">{total} Total Transaksi</span>
                                            </div>

                                            <div className="space-y-5">
                                                <div className="group">
                                                    <div className="flex justify-between text-xs font-bold mb-2">
                                                        <span className="text-gray-500 flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-[#00A651]"></span>
                                                            Tepat Waktu
                                                        </span>
                                                        <span className="text-gray-700">{onTime} <span className="text-gray-400 font-medium ml-1">({onTimePct}%)</span></span>
                                                    </div>
                                                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                                        <div className="h-full bg-[#00A651] rounded-full transition-all duration-1000 ease-out relative overflow-hidden" style={{ width: animateChart ? `${onTimePct}%` : '0%' }}>
                                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="group">
                                                    <div className="flex justify-between text-xs font-bold mb-2">
                                                        <span className="text-gray-500 flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                            Terlambat
                                                        </span>
                                                        <span className="text-gray-700">{late} <span className="text-gray-400 font-medium ml-1">({latePct}%)</span></span>
                                                    </div>
                                                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                                        <div className="h-full bg-rose-500 rounded-full transition-all duration-1000 delay-150 ease-out" style={{ width: animateChart ? `${latePct}%` : '0%' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Kolom Kanan: Form Edit & OTP */}
                        <div className="w-full md:w-7/12 p-8 relative flex flex-col">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex justify-center items-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            {!isOtpStep ? (
                                <div className="flex-1 animate-in fade-in duration-300">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Akses & Status</h2>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Alamat Email</label>
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#21409A]/20 focus:border-[#21409A] transition-all outline-none"
                                            />
                                            {editData.email !== selectedUser.email && (
                                                <p className="text-[11px] text-amber-600 font-bold mt-2 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                    Perubahan email memerlukan verifikasi OTP!
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Status Akun</label>
                                            <select
                                                value={editData.status}
                                                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#21409A]/20 focus:border-[#21409A] transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="Aktif">Aktif (Dapat meminjam APD)</option>
                                                <option value="Nonaktif">Nonaktif (Akses ditangguhkan)</option>
                                                <option value="Cuti">Cuti (Sementara tidak aktif)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex gap-3 justify-end">
                                        <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">Batal</button>
                                        <button onClick={handleSaveClick} className="px-6 py-2.5 text-sm font-bold text-white bg-[#21409A] hover:bg-blue-800 rounded-xl shadow-lg shadow-[#21409A]/30 transition-all">
                                            Simpan Perubahan
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col justify-center items-center text-center animate-in slide-in-from-right-8 duration-300">
                                    <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex justify-center items-center mb-6">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Verifikasi Keamanan</h2>
                                    <p className="text-sm text-gray-500 mb-8 max-w-sm">
                                        Kode OTP 6-digit telah dikirim ke email baru <span className="font-bold text-[#21409A]">{editData.email}</span>. Minta pengguna untuk memeriksa kotak masuknya untuk membuktikan kepemilikan email.
                                    </p>

                                    <div className="flex gap-2 justify-center mb-8">
                                        {otpValues.map((val, index) => (
                                            <input
                                                key={index}
                                                ref={otpRefs[index]}
                                                type="text"
                                                maxLength="1"
                                                value={val}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                className="w-12 h-14 text-center text-xl font-black text-[#21409A] bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#21409A]/30 focus:border-[#21409A] outline-none transition-all"
                                            />
                                        ))}
                                    </div>

                                    <div className="flex gap-3 w-full max-w-sm">
                                        <button onClick={() => setIsOtpStep(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Kembali</button>
                                        <button onClick={handleVerifyOtp} className="flex-[2] py-3 text-sm font-bold text-white bg-[#00A651] hover:bg-green-600 rounded-xl shadow-lg shadow-[#00A651]/30 transition-all">Verifikasi & Simpan</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}