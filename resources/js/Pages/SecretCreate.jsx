import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';

export default function SecretCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nip: '',
        phone: '',
        email: '',
        department: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('users.secret-store'), {
            onSuccess: () => {
                alert('New user record successfully added to the database!');
                router.get(route('users.index'));
            }
        });
    };

    const handleNumberOnly = (field, value) => {
        const numericValue = value.replace(/\D/g, '');
        setData(field, numericValue);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 font-mono text-green-500 relative overflow-hidden">
            <Head title="Developer Override" />

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

            <div className="w-full max-w-lg bg-[#121212] border border-green-900 rounded-lg shadow-2xl p-8 relative z-10">
                <button onClick={() => router.get(route('users.index'))} className="absolute top-4 right-4 text-green-800 hover:text-green-400 transition-colors">
                    [ X ]
                </button>

                <div className="mb-8">
                    <svg className="w-10 h-10 mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <h1 className="text-2xl font-bold tracking-widest uppercase">Input Manual User</h1>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">Nama Lengkap</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full bg-black/50 border border-green-900/50 text-green-400 px-4 py-3 rounded outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 tracking-widest" placeholder="NAMA_PEKERJA" />
                        {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">NIP</label>
                            <input
                                type="text"
                                value={data.nip}
                                onChange={e => setData('nip', e.target.value.toUpperCase())}
                                required
                                className="w-full bg-black/50 border border-green-900/50 text-green-400 px-4 py-3 rounded outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 tracking-widest"
                                placeholder="ID_001"
                            />
                            {errors.nip && <p className="text-red-500 text-[10px] mt-1">{errors.nip}</p>}
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">Departemen</label>
                            <select value={data.department} onChange={e => setData('department', e.target.value)} required className="w-full bg-black/50 border border-green-900/50 text-green-400 px-4 py-3 rounded outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 tracking-widest appearance-none">
                                <option value="" disabled className="bg-[#121212]">PILIH_DEPT</option>
                                <option value="Operation" className="bg-[#121212]">Operation</option>
                                <option value="Business Support" className="bg-[#121212]">Business Support</option>
                                <option value="Maintenance" className="bg-[#121212]">Maintenance</option>
                                <option value="Healthy, Safety, Security, Environment (HSSE)" className="bg-[#121212]">HSSE</option>
                                <option value="GPR" className="bg-[#121212]">GPR</option>
                            </select>
                            {errors.department && <p className="text-red-500 text-[10px] mt-1">{errors.department}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required className="w-full bg-black/50 border border-green-900/50 text-green-400 px-4 py-3 rounded outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 tracking-widest" placeholder="email@pertamina" />
                            {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">Nomor Telepon</label>
                            <input type="tel" value={data.phone} onChange={e => handleNumberOnly('phone', e.target.value)} required className="w-full bg-black/50 border border-green-900/50 text-green-400 px-4 py-3 rounded outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 tracking-widest" placeholder="0812..." />
                            {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">Password</label>
                        <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} required minLength="8" className="w-full bg-black/50 border border-green-900/50 text-green-400 px-4 py-3 rounded outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 tracking-widest" placeholder="********" />
                        {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>}
                    </div>

                    <button type="submit" disabled={processing} className="w-full mt-6 bg-green-900/40 border border-green-700 text-green-400 py-4 uppercase tracking-widest text-xs font-bold hover:bg-green-800 hover:text-white transition-colors">
                        {processing ? '[ UPLOADING DATA... ]' : '[ EXCUTE ]'}
                    </button>
                </form>
            </div>
        </div>
    );
}