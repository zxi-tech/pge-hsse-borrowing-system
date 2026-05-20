import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function EditAdmin({ auth }) {
    const user = auth.user;

    // ================= STATE UNTUK OTP NOMOR HP =================
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    // Fungsi Simulasi Kirim OTP
    const handleSendOtp = () => {
        if (!newPhone || newPhone.length < 10) {
            return alert("Masukkan nomor WhatsApp yang valid terlebih dahulu!");
        }
        setOtpSent(true);
        alert(`[SIMULASI] Kode OTP telah dikirim ke WhatsApp: ${newPhone}`);
    };

    // Fungsi Simulasi Verifikasi OTP
    const handleVerifyOtp = () => {
        if (otpCode !== '123456') { // Kode rahasia sementara
            return alert("Kode OTP salah! (Gunakan: 123456 untuk testing)");
        }

        // Jika benar, masukkan nomor baru ke dalam 'profileForm' yang akan di-save
        profileForm.setData('phone', newPhone);
        setIsEditingPhone(false);
        setOtpSent(false);
        setOtpCode('');
        alert("WhatsApp Terverifikasi! Jangan lupa klik tombol 'SIMPAN PROFIL' di atas untuk menyimpan permanen.");
    };

    // ================= FORM LOGIC (INERTIA) =================
    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        nip: user.nip || '',
        phone: user.phone || '',
        department: user.department || '',
        about: user.about || '',
        photo: null,
        _method: 'PATCH',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // ================= PHOTO LOGIC =================
    const fileInputRef = useRef();
    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            profileForm.setData('photo', file);
            const reader = new FileReader();
            reader.onload = (e) => setPhotoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // ================= SUBMIT LOGIC =================
    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Biarkan foto preview tetap ada jika berhasil
            },
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    // Helper Inisial Nama
    const getInitials = (name) => {
        if (!name) return 'A';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <AdminLayout user={user}>
            <Head title="Edit Profil Admin" />

            <div className="max-w-[1200px] mx-auto pb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* ================= ALERTS SUCCESS ================= */}
                {profileForm.recentlySuccessful && (
                    <div className="mb-8 p-4 rounded-2xl bg-green-50 border border-green-200 text-[#00A651] text-sm font-bold flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Profil Admin berhasil diperbarui!
                    </div>
                )}

                {passwordForm.recentlySuccessful && (
                    <div className="mb-8 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        Password Admin berhasil diubah!
                    </div>
                )}

                {/* ================= ALERTS ERROR ================= */}
                {(Object.keys(profileForm.errors).length > 0 || Object.keys(passwordForm.errors).length > 0) && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold shadow-sm">
                        Hampir saja! Ada beberapa kesalahan input, silakan cek form di bawah.
                    </div>
                )}

                <div className="bg-white rounded-[32px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">

                    {/* ================= KOLOM KIRI (KARTU PROFIL) ================= */}
                    <div className="md:col-span-5 lg:col-span-4 p-8 lg:p-12 flex flex-col items-center border-r border-gray-100 bg-white relative">
                        <h1 className="text-2xl font-medium text-gray-500 tracking-wide mb-8">Admin Profile</h1>

                        {/* Foto Profil Besar */}
                        <div className="relative group mb-6">
                            <div className="w-[160px] h-[160px] lg:w-[180px] lg:h-[180px] rounded-full border-[6px] border-[#F4F5F9] shadow-sm overflow-hidden flex items-center justify-center bg-[#E8F5E9] text-[#00A651]">
                                {photoPreview ? (
                                    <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                                ) : user.photo ? (
                                    <img src={`/storage/${user.photo}`} className="w-full h-full object-cover" alt={user.name} />
                                ) : (
                                    <span className="text-6xl lg:text-7xl font-black">{getInitials(user.name)}</span>
                                )}
                            </div>
                        </div>

                        {/* Nama, NIP & Role Badge */}
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center mb-1">{user.name || '-'}</h2>
                        <p className="text-sm font-medium text-gray-400 mb-4 tracking-wide">{user.nip ? `NIP. ${user.nip}` : 'NIP.-'}</p>
                        
                        <div className="px-4 py-1.5 bg-green-50 border border-green-200 text-[#00A651] rounded-full text-xs font-black tracking-widest uppercase shadow-sm mb-10">
                            Super Admin
                        </div>

                        {/* Tombol Upload */}
                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                        <button type="button" onClick={triggerFileInput} className="w-full max-w-[240px] py-3.5 rounded-lg bg-[#00A651] hover:bg-[#008c44] text-white font-medium text-sm shadow-md transition-all mb-10">
                            Upload Foto Profil
                        </button>
                        {profileForm.errors.photo && <p className="text-red-500 text-xs mt-[-30px] mb-8 font-bold text-center">{profileForm.errors.photo}</p>}

                        {/* Teks Bawah */}
                        <div className="text-center mt-auto pt-6 w-full border-t border-gray-100">
                            <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{user.department || 'HSSE DEPARTMENT'}</p>
                            <p className="text-[12px] text-gray-400">PT Pertamina Geothermal Energy</p>
                        </div>
                    </div>

                    {/* ================= KOLOM KANAN (FORM) ================= */}
                    <div className="md:col-span-7 lg:col-span-8 p-10 lg:p-14">

                        {/* ---------------- FORM 1: PROFIL ---------------- */}
                        <form onSubmit={submitProfile} className="mb-16">
                            <div className="flex items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
                                <h2 className="text-lg font-black text-gray-950 uppercase tracking-widest">Informasi Admin</h2>
                                <button type="submit" disabled={profileForm.processing} className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${profileForm.processing ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-[#00A651] hover:bg-[#008c44] text-white shadow-sm'}`}>
                                    {profileForm.processing ? 'SAVING...' : 'SIMPAN PROFIL'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                                <div className="sm:col-span-2">
                                    <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input type="text" id="name" value={profileForm.data.name} onChange={(e) => profileForm.setData('name', e.target.value)} required className={`w-full bg-white border ${profileForm.errors.name ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all`} />
                                    {profileForm.errors.name && <p className="text-xs text-red-600 mt-1.5 font-medium">{profileForm.errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="nip" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">NIP Admin <span className="text-red-500">*</span></label>
                                    <input type="text" id="nip" value={profileForm.data.nip} onChange={(e) => profileForm.setData('nip', e.target.value)} required className={`w-full bg-white border ${profileForm.errors.nip ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all`} />
                                    {profileForm.errors.nip && <p className="text-xs text-red-600 mt-1.5 font-medium">{profileForm.errors.nip}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Email Perusahaan</label>
                                    <div className="relative">
                                        <input type="email" id="email" value={profileForm.data.email} readOnly className="w-full bg-[#F4F5F9] border border-gray-200 text-gray-500 rounded-xl px-4 py-3 pl-10 text-sm font-medium outline-none cursor-not-allowed" />
                                        <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                </div>

                                {/* NOMOR HP / WHATSAPP DENGAN OTP */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Nomor WhatsApp Aktif <span className="text-red-500">*</span></label>

                                    {!isEditingPhone ? (
                                        <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-2.5 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                <span className="text-sm font-bold text-gray-800">{profileForm.data.phone || 'Belum diatur'}</span>
                                            </div>
                                            <button type="button" onClick={() => { setIsEditingPhone(true); setNewPhone(profileForm.data.phone || ''); }} className="text-xs font-bold text-[#00A651] hover:underline bg-green-50 px-3 py-1.5 rounded-lg">
                                                Ubah Nomor
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 bg-green-50/50 p-4 rounded-xl border border-green-100 animate-in fade-in">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newPhone}
                                                    onChange={e => setNewPhone(e.target.value)}
                                                    disabled={otpSent}
                                                    placeholder="Contoh: 081234567890"
                                                    className="w-full bg-white border border-gray-300 text-gray-950 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] disabled:bg-gray-100"
                                                />
                                                {!otpSent && (
                                                    <button type="button" onClick={handleSendOtp} className="bg-gray-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-gray-900 shadow-sm transition-all">
                                                        Kirim OTP
                                                    </button>
                                                )}
                                            </div>

                                            {otpSent && (
                                                <div className="flex gap-2 animate-in slide-in-from-top-2">
                                                    <input
                                                        type="text"
                                                        value={otpCode}
                                                        onChange={e => setOtpCode(e.target.value)}
                                                        placeholder="Masukkan 6 Digit OTP"
                                                        maxLength="6"
                                                        className="w-full bg-white border border-green-400 text-gray-950 rounded-xl px-4 py-2.5 text-sm font-black tracking-[0.3em] text-center outline-none focus:ring-2 focus:ring-[#00A651]/30"
                                                    />
                                                    <button type="button" onClick={handleVerifyOtp} className="bg-[#00A651] text-white px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-[#008c44] shadow-sm transition-all">
                                                        Verifikasi
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center px-1 pt-1">
                                                <p className="text-[11px] text-gray-500">{otpSent ? 'Cek pesan WhatsApp Anda.' : 'Pastikan nomor WhatsApp aktif.'}</p>
                                                <button type="button" onClick={() => { setIsEditingPhone(false); setOtpSent(false); setOtpCode(''); }} className="text-xs font-bold text-red-500 hover:underline">
                                                    Batalkan
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {profileForm.errors.phone && <p className="text-xs text-red-600 mt-1.5 font-medium">{profileForm.errors.phone}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="about" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Tentang Saya / Catatan</label>
                                    <textarea id="about" value={profileForm.data.about} onChange={(e) => profileForm.setData('about', e.target.value)} rows="3" className={`w-full bg-white border ${profileForm.errors.about ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3.5 text-sm font-bold outline-none resize-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all`} placeholder="Tulis catatan admin..."></textarea>
                                    {profileForm.errors.about && <p className="text-xs text-red-600 mt-1.5 font-medium">{profileForm.errors.about}</p>}
                                </div>
                            </div>
                        </form>

                        {/* ---------------- FORM 2: UBAH PASSWORD ---------------- */}
                        <form onSubmit={submitPassword}>
                            <div className="flex items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-100">
                                <h2 className="text-lg font-black text-gray-950 uppercase tracking-widest">Ubah Password</h2>
                                <button type="submit" disabled={passwordForm.processing} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${passwordForm.processing ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-gray-800 hover:bg-black text-white shadow-sm'}`}>
                                    {passwordForm.processing ? 'UPDATING...' : 'UPDATE PASSWORD'}
                                </button>
                            </div>

                            {/* BANNER PERINGATAN KEAMANAN */}
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8 rounded-r-xl">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-[13px] font-black text-yellow-800 uppercase tracking-wide">Peringatan Keamanan</h3>
                                        <p className="text-[12px] text-yellow-700 mt-1 font-medium leading-relaxed">
                                            Sebagai Administrator, akun Anda memiliki kendali penuh atas sistem inventaris HSSE. Pastikan Anda menggunakan kombinasi password yang kuat. Jangan pernah membagikan kredensial ini kepada siapa pun.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Password Saat Ini</label>
                                    <input type="password" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} className={`w-full bg-white border ${passwordForm.errors.current_password ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all`} />
                                    {passwordForm.errors.current_password && <p className="text-xs text-red-600 mt-1.5 font-medium">{passwordForm.errors.current_password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Password Baru</label>
                                    <input type="password" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} className={`w-full bg-white border ${passwordForm.errors.password ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all`} />
                                    {passwordForm.errors.password && <p className="text-xs text-red-600 mt-1.5 font-medium">{passwordForm.errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Konfirmasi Password Baru</label>
                                    <input type="password" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} className={`w-full bg-white border ${passwordForm.errors.password_confirmation ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all`} />
                                    {passwordForm.errors.password_confirmation && <p className="text-xs text-red-600 mt-1.5 font-medium">{passwordForm.errors.password_confirmation}</p>}
                                </div>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}