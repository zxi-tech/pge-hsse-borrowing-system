import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function VerifyPhoneOtp({ phone }) {
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    useEffect(() => {
        setData('otp', otpValues.join(''));
    }, [otpValues]);

    const handleChange = (index, e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (!value) return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value.substring(value.length - 1);
        setOtpValues(newOtpValues);

        if (index < 5 && value) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            const newOtpValues = [...otpValues];

            if (!otpValues[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            }

            newOtpValues[index] = '';
            setOtpValues(newOtpValues);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);

        if (pastedData) {
            const newOtpValues = [...otpValues];
            for (let i = 0; i < pastedData.length; i++) {
                newOtpValues[i] = pastedData[i];
            }
            setOtpValues(newOtpValues);

            const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
            inputRefs.current[focusIndex].focus();
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('otp.phone.verify'));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans selection:bg-[#00A651] selection:text-white overflow-x-hidden">
            <Head title="Verifikasi WhatsApp" />

            <div className="w-full max-w-[480px] bg-white rounded-[24px] shadow-xl p-6 sm:p-10 flex flex-col isolation-auto -mt-24 md:mt-0">

                <img
                    src="/images/pertamina-logo (1).png"
                    alt="PGE Logo"
                    className="h-10 w-auto mx-auto mb-6 object-contain"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150x40/ffffff/00A651?text=Logo+PGE"; }}
                />

                <div className="flex flex-wrap items-center justify-start gap-2 mb-2">
                    <h1 className="text-[22px] sm:text-2xl font-extrabold text-gray-900 tracking-tight">Verifikasi WhatsApp</h1>
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#00A651] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2-2v14a2 2 0 002 2z"></path>
                    </svg>
                </div>

                <p className="text-[13px] sm:text-sm text-gray-600 font-medium leading-relaxed mb-8">
                    Kami telah mengirimkan pesan berisi kode verifikasi ke nomor WhatsApp Anda. Masukkan kode tersebut pada kolom di bawah ini. <br />
                    <strong className="text-[#00A651] mt-1 inline-block break-all">{phone || '+62 812-3456-7890'}</strong>
                </p>

                <form onSubmit={submit} className="flex flex-col w-full">

                    <div className="flex justify-between items-center gap-1.5 sm:gap-3 mb-8 w-full" onPaste={handlePaste}>
                        {otpValues.map((value, index) => (
                            <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                ref={(el) => (inputRefs.current[index] = el)}
                                value={value}
                                onChange={(e) => handleChange(index, e)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="flex-1 w-full max-w-[48px] h-12 sm:h-14 text-center text-xl font-bold text-gray-900 bg-[#F9FAFB] border border-gray-200 rounded-[12px] outline-none transition-all focus:bg-white focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20 shadow-sm"
                            />
                        ))}
                    </div>
                    {errors.otp && <p className="text-red-500 text-xs font-medium text-center mb-4">{errors.otp}</p>}

                    <button
                        type="submit"
                        disabled={processing || data.otp.length < 6}
                        className={`w-full py-3 sm:py-3.5 rounded-xl text-sm font-bold shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${processing || data.otp.length < 6
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#00A651] hover:bg-[#008c44] text-white hover:shadow-lg transform hover:-translate-y-0.5'
                            }`}
                    >
                        {processing ? 'MEMVERIFIKASI...' : 'VERIFIKASI WHATSAPP'}
                        {!processing && data.otp.length === 6 && (
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                        )}
                    </button>

                    <p className="text-[13px] text-gray-600 font-medium text-center mt-6 sm:mt-8">
                        Belum menerima pesan WhatsApp? <Link href="#" method="post" as="button" className="text-[#00A651] hover:underline font-bold cursor-pointer">Kirim Ulang</Link>
                    </p>

                </form>

            </div>
        </div>
    );
}