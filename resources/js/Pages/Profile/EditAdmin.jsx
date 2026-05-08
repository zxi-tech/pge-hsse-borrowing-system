import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function EditAdmin({ auth, mustVerifyEmail, status, requires_email_otp, pending_email }) {
    const user = auth?.user;

    // 1. Tarik session/flash dari Laravel via usePage()
    const { flash } = usePage().props;

    const [photoPreview, setPhotoPreview] = useState(null);
    const [showOtpModal, setShowOtpModal] = useState(false); // State untuk Pop-up OTP

    const profileForm = useForm({
        nip: user?.nip || '', // <--- TAMBAHKAN BARIS INI
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        photo: null,
        _method: 'PATCH',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // 2. Form khusus untuk submit OTP
    const otpForm = useForm({
        otp: '',
    });

    // 3. Efek otomatis: Munculkan modal jika Laravel menahan perubahan email
    useEffect(() => {
        if (requires_email_otp) {
            setShowOtpModal(true);
        }
    }, [requires_email_otp]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            profileForm.setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const submitProfile = (e) => {
        e.preventDefault();

        if (profileForm.data.name.trim() === '') {
            alert('GAGAL: Nama Admin tidak boleh kosong!');
            return;
        }

        const emailInput = profileForm.data.email.toLowerCase();
        const isValidDomain = emailInput.endsWith('@pertamina.com') || emailInput.endsWith('@mk.pertamina.com');

        if (!isValidDomain) {
            alert('SECURITY ALERT: Alamat email Admin wajib menggunakan domain resmi perusahaan (@pertamina.com atau @mk.pertamina.com)!');
            return;
        }

        if (profileForm.data.phone.trim() === '') {
            alert('GAGAL: Nomor WhatsApp tidak boleh kosong untuk keperluan OTP!');
            return;
        }

        profileForm.post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
            onError: (err) => {
                // 👇 JURUS DEBUGGING: Munculkan pop-up alert berisi pesan error dari Laravel 👇
                alert("SERVER MENOLAK DATA:\n\n" + JSON.stringify(err, null, 2));
            }
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), { preserveScroll: true, onSuccess: () => passwordForm.reset() });
    };

    // 4. Fungsi Submit OTP ke Controller
    const handleVerifyOtp = (e) => {
        e.preventDefault();
        otpForm.post(route('profile.verify-email-change'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowOtpModal(false);
                otpForm.reset();
            }
        });
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    const currentDisplayPhoto = photoPreview || (user?.photo ? `/storage/${user.photo}` : null);

    return (
        <AdminLayout user={user}>
            <Head title="Profil Admin" />

            <div className="max-w-[1100px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                {status === 'profile-updated' && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-bold text-center shadow-sm">✅ Profil Admin berhasil diperbarui!</div>}
                {status === 'password-updated' && <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 text-sm font-bold text-center shadow-sm">🔐 Password Admin berhasil diubah!</div>}

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden">

                    {/* ================= BAGIAN KIRI: KARTU PROFIL ================= */}
                    <div className="w-full md:w-[35%] lg:w-[30%] border-r border-gray-100 p-8 flex flex-col items-center bg-white relative">
                        <h2 className="text-lg font-bold text-gray-800 tracking-tight mb-8">Profile Admin</h2>

                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full p-1 bg-white border-[3px] border-[#00A651] shadow-sm overflow-hidden flex items-center justify-center">
                                {currentDisplayPhoto ? (
                                    <img src={currentDisplayPhoto} alt={user?.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#00A651] to-green-400 flex items-center justify-center text-white font-extrabold text-4xl shadow-inner">
                                        {getInitials(user?.name)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide text-center">{profileForm.data.name || user?.name}</h3>
                        <p className="text-xs font-bold text-gray-400 tracking-widest mt-1 mb-8">{user?.nip || 'NIP: ADMIN-PGE'}</p>

                        <label className={`w-full text-center hover:bg-[#008c44] text-white text-sm font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-sm mt-auto ${profileForm.errors.photo ? 'bg-red-500' : 'bg-[#00A651]'}`}>
                            {photoPreview ? 'Ganti Foto Pilihan' : 'Upload Foto Profil'}
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                        {profileForm.errors.photo && <p className="text-red-500 text-[10px] mt-2 font-bold text-center">{profileForm.errors.photo}</p>}

                        <div className="mt-8 flex flex-col items-center text-center w-full">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">{user?.department || 'HSSE Department'}</p>
                            <p className="text-[10px] text-gray-400">PT Pertamina Geothermal Energy</p>
                        </div>
                    </div>

                    {/* ================= BAGIAN KANAN: FORMULIR ================= */}
                    <div className="w-full md:w-[65%] lg:w-[70%] p-8 lg:p-12 bg-gray-50/30">

                        {/* 1. Form Informasi Umum */}
                        <form id="profile-form" onSubmit={submitProfile} className="mb-12">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                <h2 className="text-[15px] font-extrabold text-gray-800 uppercase tracking-widest">Informasi Admin</h2>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            profileForm.reset();
                                            setPhotoPreview(null);
                                        }}
                                        className="px-6 py-2 rounded-lg border border-gray-300 text-gray-500 text-xs font-bold uppercase tracking-wide hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={profileForm.processing} className="px-8 py-2 rounded-lg bg-[#00A651] hover:bg-[#008c44] text-white text-xs font-bold uppercase tracking-wide transition-colors shadow-sm disabled:bg-gray-400">Save</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">NIP / ID Pegawai</label>
                                    <input type="text" value={user?.nip || 'Belum diatur'} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 font-medium cursor-not-allowed outline-none" title="NIP tidak dapat diubah" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Departemen</label>
                                    <input type="text" value={user?.department || 'HSSE'} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 font-medium cursor-not-allowed outline-none" title="Hubungi IT Pusat untuk mengubah Departemen" />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Nama Lengkap Admin *</label>
                                    <input type="text" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] outline-none" />
                                    {profileForm.errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{profileForm.errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Email Admin *</label>
                                    <input type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] outline-none" />
                                    {profileForm.errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{profileForm.errors.email}</p>}
                                    {/* Indikator bahwa email sedang tertunda (menunggu OTP) */}
                                    {flash?.pending_email && (
                                        <p className="text-orange-500 text-[10px] mt-1 font-bold italic">
                                            ⚠️ Menunggu verifikasi OTP untuk: {flash.pending_email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">No. WhatsApp *</label>
                                    <input type="text" value={profileForm.data.phone} onChange={e => profileForm.setData('phone', e.target.value)} placeholder="Contoh: 081234567890" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] outline-none" />
                                    {profileForm.errors.phone && <p className="text-red-500 text-[10px] mt-1 font-bold">{profileForm.errors.phone}</p>}
                                </div>
                            </div>
                        </form>

                        <div className="w-full h-px bg-gray-200 mb-12"></div>

                        {/* 2. Form Update Password */}
                        <form onSubmit={submitPassword}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                <h2 className="text-[15px] font-extrabold text-gray-800 uppercase tracking-widest">Ubah Password Admin</h2>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => passwordForm.reset()} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-500 text-xs font-bold uppercase tracking-wide hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button type="submit" disabled={passwordForm.processing} className="px-8 py-2 rounded-lg bg-[#00A651] hover:bg-[#008c44] text-white text-xs font-bold uppercase tracking-wide transition-colors shadow-sm disabled:bg-gray-400">Update</button>
                                </div>
                            </div>
                            <div className="space-y-5 max-w-2xl">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Password Saat Ini</label>
                                    <input type="password" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] outline-none" />
                                    {passwordForm.errors.current_password && <p className="text-red-500 text-[10px] mt-1 font-bold">{passwordForm.errors.current_password}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Password Baru</label>
                                    <input type="password" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] outline-none" />
                                    {passwordForm.errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold">{passwordForm.errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Konfirmasi Password Baru</label>
                                    <input type="password" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] outline-none" />
                                    {passwordForm.errors.password_confirmation && <p className="text-red-500 text-[10px] mt-1 font-bold">{passwordForm.errors.password_confirmation}</p>}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* ================= MODAL OTP POP-UP ================= */}
            {showOtpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-[#00A651] p-6 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Verifikasi Keamanan</h3>
                        </div>

                        <div className="p-8">
                            <p className="text-sm text-gray-600 text-center mb-6">
                                Kami telah mengirimkan <span className="font-bold text-gray-800">6-digit kode OTP</span> ke alamat email baru Anda: <br />
                                <span className="inline-block mt-2 font-bold text-[#00A651] bg-green-50 px-3 py-1 rounded-full">{pending_email}</span>
                            </p>

                            <form onSubmit={handleVerifyOtp}>
                                <div className="mb-6">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="••••••"
                                        className="w-full text-center tracking-[1em] text-3xl font-black text-gray-800 bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 focus:ring-2 focus:ring-[#00A651] focus:border-[#00A651] outline-none transition-shadow"
                                        value={otpForm.data.otp}
                                        onChange={e => otpForm.setData('otp', e.target.value.replace(/\D/g, ''))} // Hanya izinkan angka
                                        required
                                    />
                                    {otpForm.errors.otp && <p className="text-red-500 text-xs mt-2 text-center font-bold">{otpForm.errors.otp}</p>}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowOtpModal(false)}
                                        className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={otpForm.processing || otpForm.data.otp.length !== 6}
                                        className="flex-1 py-3 rounded-xl bg-[#00A651] hover:bg-[#008c44] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {otpForm.processing ? 'Memproses...' : 'Verifikasi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}