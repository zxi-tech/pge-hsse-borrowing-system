import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function EditAdmin({ auth }) {
    const user = auth.user;

    // State Management: Form Data & Inertia Submission
    // Catatan: Field phone tidak disertakan untuk peran Admin
    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        nip: user.nip || '',
        department: user.department || '',
        about: user.about || '',
        photo: null,
        _method: 'PATCH',
    });

    // Handlers: Photo Upload & Local Preview
    const fileInputRef = useRef();
    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            profileForm.setData('photo', file);
            // Render file lokal ke base64 untuk UI preview
            const reader = new FileReader();
            reader.onload = (e) => setPhotoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Handler: Submit Update Profile
    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // UI state untuk preview foto otomatis dipertahankan oleh React
            },
        });
    };

    // Helper: Generate 2 huruf inisial untuk fallback avatar
    const getInitials = (name) => {
        if (!name) return 'A';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <AdminLayout user={user}>
            <Head title="Edit Profil Admin" />

            <div className="max-w-[1200px] mx-auto pb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* UI Feedback: Success Alert */}
                {profileForm.recentlySuccessful && (
                    <div className="mb-8 p-4 rounded-2xl bg-green-50 border border-green-200 text-[#00A651] text-sm font-bold flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Profil Admin berhasil diperbarui!
                    </div>
                )}

                {/* UI Feedback: Error Alert */}
                {Object.keys(profileForm.errors).length > 0 && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold shadow-sm">
                        Hampir saja! Ada beberapa kesalahan input, silakan cek form di bawah.
                    </div>
                )}

                <div className="bg-white rounded-[32px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">

                    {/* Layout Sidebar: Profile Card Info */}
                    <div className="md:col-span-5 lg:col-span-4 p-8 lg:p-12 flex flex-col items-center border-r border-gray-100 bg-white relative">
                        <h1 className="text-2xl font-medium text-gray-500 tracking-wide mb-8">Admin Profile</h1>

                        {/* User Avatar & Preview */}
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

                        {/* Static User Info */}
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center mb-1">{user.name || '-'}</h2>
                        <p className="text-sm font-medium text-gray-400 mb-4 tracking-wide">{user.nip ? `NIP. ${user.nip}` : 'NIP.-'}</p>

                        <div className="px-4 py-1.5 bg-green-50 border border-green-200 text-[#00A651] rounded-full text-xs font-black tracking-widest uppercase shadow-sm mb-10">
                            Super Admin
                        </div>

                        {/* Upload Trigger Button */}
                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                        <button type="button" onClick={triggerFileInput} className="w-full max-w-[240px] py-3.5 rounded-lg bg-[#00A651] hover:bg-[#008c44] text-white font-medium text-sm shadow-md transition-all mb-10">
                            Upload Foto Profil
                        </button>
                        {profileForm.errors.photo && <p className="text-red-500 text-xs mt-[-30px] mb-8 font-bold text-center">{profileForm.errors.photo}</p>}

                        {/* Organization Info */}
                        <div className="text-center mt-auto pt-6 w-full border-t border-gray-100">
                            <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{user.department || 'HSSE DEPARTMENT'}</p>
                            <p className="text-[12px] text-gray-400">PT Pertamina Geothermal Energy</p>
                        </div>
                    </div>

                    {/* Layout Content: Form Inputs */}
                    <div className="md:col-span-7 lg:col-span-8 p-10 lg:p-14">

                        <form onSubmit={submitProfile} className="mb-0">
                            <div className="flex items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
                                <h2 className="text-lg font-black text-gray-950 uppercase tracking-widest">Informasi Admin</h2>
                                <button type="submit" disabled={profileForm.processing} className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${profileForm.processing ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-[#00A651] hover:bg-[#008c44] text-white shadow-sm'}`}>
                                    {profileForm.processing ? 'SAVING...' : 'SIMPAN PROFIL'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">

                                {/* Dynamic Input: Editable Name */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input type="text" id="name" value={profileForm.data.name} onChange={(e) => profileForm.setData('name', e.target.value)} required className={`w-full bg-white border ${profileForm.errors.name ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all`} />
                                    {profileForm.errors.name && <p className="text-xs text-red-600 mt-1.5 font-medium">{profileForm.errors.name}</p>}
                                </div>

                                {/* Read-Only Field: NIP */}
                                <div>
                                    <label htmlFor="nip" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">NIP Admin</label>
                                    <div className="relative">
                                        <input type="text" id="nip" value={profileForm.data.nip} readOnly className="w-full bg-[#F4F5F9] border border-gray-200 text-gray-500 rounded-xl px-4 py-3 pl-10 text-sm font-medium outline-none cursor-not-allowed" />
                                        <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                </div>

                                {/* Read-Only Field: Email */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Email Perusahaan</label>
                                    <div className="relative">
                                        <input type="email" id="email" value={profileForm.data.email} readOnly className="w-full bg-[#F4F5F9] border border-gray-200 text-gray-500 rounded-xl px-4 py-3 pl-10 text-sm font-medium outline-none cursor-not-allowed" />
                                        <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                                    </div>
                                </div>

                                {/* Dynamic Input: Editable About */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="about" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Tentang Saya / Catatan</label>
                                    <textarea id="about" value={profileForm.data.about} onChange={(e) => profileForm.setData('about', e.target.value)} rows="3" className={`w-full bg-white border ${profileForm.errors.about ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} text-gray-950 rounded-xl px-4 py-3.5 text-sm font-bold outline-none resize-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all`} placeholder="Tulis catatan admin..."></textarea>
                                    {profileForm.errors.about && <p className="text-xs text-red-600 mt-1.5 font-medium">{profileForm.errors.about}</p>}
                                </div>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}