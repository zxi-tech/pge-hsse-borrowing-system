import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

// Import Recharts untuk berbagai jenis grafik kompleks
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, ComposedChart
} from 'recharts';

// Import Chart.js untuk Doughnut Chart
import { Chart as ChartJS, ArcElement, Tooltip as ChartJsTooltip, Legend as ChartJsLegend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartJsTooltip, ChartJsLegend);

export default function Statistics({ auth, totalPeminjaman, miniLineData, totalMingguIni, deptDataBackend, itemStatsBackend, dropdownItems, globalChart, sizesChartData, latestActivities, activityStatsBackend }) {
    // ================= DUMMY DATA & STATE FILTER =================
    const itemsList = [
        { id: 'all', name: 'Semua APD (Ringkasan Global)' },
        ...(dropdownItems || [])
    ];

    const [selectedItem, setSelectedItem] = useState('all');
    const [selectedTimeRange, setSelectedTimeRange] = useState('all');

    const currentStats = itemStatsBackend && itemStatsBackend[selectedItem]
        ? itemStatsBackend[selectedItem]
        : { available: 0, laundry: 0, maintenance: 0 };

    const totalLaundry = currentStats.laundry;
    const totalAvailable = currentStats.available;
    const totalMaintenance = currentStats.maintenance;

    const totalKeseluruhan = totalAvailable + totalLaundry + totalMaintenance;
    const persentaseBaik = totalKeseluruhan > 0
        ? Math.round((totalAvailable / totalKeseluruhan) * 100)
        : 0;

    const dummyLaundryData = [
        { val: 10 }, { val: 20 }, { val: 15 }, { val: 30 }, { val: 25 }, { val: 40 }
    ];

    const deptData = deptDataBackend || [];

    const doughnutChartData = useMemo(() => {
        if (selectedItem === 'all' && globalChart) {
            return {
                labels: globalChart.labels,
                datasets: [{
                    data: globalChart.data,
                    backgroundColor: globalChart.colors,
                    borderWidth: 2, borderColor: '#ffffff', hoverOffset: 6
                }]
            };
        } else if (sizesChartData && sizesChartData[selectedItem]) {
            const specData = sizesChartData[selectedItem];
            return {
                labels: specData.labels.length > 0 ? specData.labels : ['Belum Ada Ukuran'],
                datasets: [{
                    data: specData.data.length > 0 ? specData.data : [1],
                    backgroundColor: specData.colors.length > 0 ? specData.colors : ['#E5E7EB'],
                    borderWidth: 2, borderColor: '#ffffff', hoverOffset: 6
                }]
            };
        }
        return { labels: [], datasets: [] };
    }, [selectedItem, globalChart, sizesChartData]);

    const doughnutTotalPcs = useMemo(() => {
        if (selectedItem === 'all' && globalChart) return globalChart.total;
        if (sizesChartData && sizesChartData[selectedItem]) return sizesChartData[selectedItem].total;
        return 0;
    }, [selectedItem, globalChart, sizesChartData]);

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { size: 11, family: "'Inter', sans-serif" },
                    padding: 20,
                    boxWidth: 25,
                }
            },
            tooltip: { enabled: true },

            centerText: {
                totalValue: doughnutTotalPcs
            }
        },
        cutout: '80%',
    };

    // 👇 PLUGIN CUSTOM CHART.JS UNTUK MELUKIS TEKS TEPAT DI TENGAH DONAT 👇
    const centerTextPlugin = {
        id: 'centerText',
        // Tambahkan parameter `options` di sini 👇
        beforeDraw: (chart, args, options) => {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;

            ctx.save();
            // Menghitung titik tengah secara absolut dari area grafik
            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;

            // 👇 AMBIL NILAI DINAMIS DARI OPTIONS 👇
            const dynamicTotal = options.totalValue !== undefined ? options.totalValue : 0;

            // 1. Lukis Angka Total Pcs
            ctx.font = '900 28px "Inter", sans-serif';
            ctx.fillStyle = '#1f2937'; // text-gray-800
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Gunakan variabel dynamicTotal di sini
            ctx.fillText(dynamicTotal, centerX, centerY - 6);

            // 2. Lukis Teks "TOTAL PCS"
            ctx.font = '700 9px "Inter", sans-serif';
            ctx.fillStyle = '#9ca3af'; // text-gray-400
            ctx.fillText('TOTAL PCS', centerX, centerY + 14);

            ctx.restore();
        }
    };

    const weeklyActivityData = activityStatsBackend && activityStatsBackend[selectedItem]
        ? activityStatsBackend[selectedItem]
        : [];

    const totalPinjam6Bulan = weeklyActivityData.reduce((sum, item) => sum + item.pinjam, 0);
    const totalKembali6Bulan = weeklyActivityData.reduce((sum, item) => sum + item.kembali, 0);

    const conditionData = useMemo(() => ({
        labels: ['Kondisi Baik', 'Perbaikan', 'Di Laundry'],
        datasets: [{
            data: [totalAvailable, totalMaintenance, totalLaundry],
            backgroundColor: ['#00A651', '#EF4444', '#F59E0B'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    }), [totalAvailable, totalMaintenance, totalLaundry]);

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Dashboard Statistik" />

            <div className="w-full pb-10 bg-[#F4F5FA] space-y-6">

                {/* ================= HEADER & FILTER ================= */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Statistik Peminjaman</h1>
                        <p className="text-[13px] text-gray-500 mt-1 font-medium">Analisa data inventori dan performa APD</p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">

                        {/* 1. Dropdown Filter WAKTU */}
                        <div className="w-full sm:w-auto flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                            <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <select
                                value={selectedTimeRange}
                                onChange={(e) => setSelectedTimeRange(e.target.value)}
                                className="bg-transparent border-none text-gray-700 text-sm focus:ring-0 block w-full sm:w-40 p-1 outline-none font-bold cursor-pointer"
                            >
                                <option value="all">Semua Waktu</option>
                                <option value="7">7 Hari Terakhir</option>
                                <option value="30">30 Hari Terakhir</option>
                                <option value="180">6 Bulan Terakhir</option>
                            </select>
                        </div>

                        {/* 2. Dropdown Filter BARANG */}
                        <div className="w-full sm:w-auto flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                            <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                            <select
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="bg-transparent border-none text-gray-700 text-sm focus:ring-0 block w-full sm:w-48 p-1 outline-none font-bold cursor-pointer"
                            >
                                {itemsList.map((item, idx) => (
                                    <option key={idx} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. TOMBOL EXCEL (Menggunakan Ziggy Route) */}
                        <a
                            href={route('statistics.export', { item_id: selectedItem, time_range: selectedTimeRange })}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00A651] text-white text-sm font-bold px-5 py-3 sm:py-2.5 rounded-xl shadow-sm hover:bg-[#008c44] transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export Excel
                        </a>

                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10 w-2/3">
                            <h2 className="text-xl font-black text-gray-800 mb-2">
                                Selamat Datang, <span className="text-[#21409A]">{auth?.user?.name || 'Admin'}! 🎉</span>
                            </h2>
                            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                                Kamu telah menyelesaikan <strong className="text-gray-700">86%</strong> pengecekan stok APD hari ini. Pantau terus distribusi APD pekerja di lapangan.
                            </p>
                            <Link href={route('items.index')} className="bg-[#21409A] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm hover:bg-[#1a3380] transition-colors">
                                CEK INVENTORI
                            </Link>
                        </div>
                        <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none flex items-center justify-end pr-6">
                            <svg className="w-24 h-24 text-blue-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="w-8 h-8 rounded bg-blue-50 text-[#21409A] flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-black text-gray-800">
                                {totalPeminjaman ? totalPeminjaman.toLocaleString() : 0}
                            </h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 leading-tight">Total Peminjaman<br />(Sepanjang Waktu)</p>
                        </div>
                    </div>

                    <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-lg font-black text-gray-800">
                                    {totalMingguIni ? totalMingguIni : 0} <span className="text-[10px] text-gray-400 uppercase">Trx</span>
                                </h3>
                                <span className="text-[10px] font-bold text-[#00A651]">7 Hari Terakhir</span>
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Aktivitas Harian</p>
                        </div>
                        <div className="h-16 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={miniLineData || []}>
                                    <Line type="monotone" dataKey="val" stroke="#00A651" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Peminjaman per Departemen</h3>
                            <p className="text-[10px] text-gray-400">Total Selesai vs Ditolak</p>
                        </div>
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <RechartsTooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                    <Bar dataKey="selesai" name="Selesai" fill="#00A651" radius={[0, 4, 4, 0]} barSize={10} />
                                    <Bar dataKey="ditolak" name="Ditolak" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={10} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-4 grid grid-rows-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">-12% ↓</span>
                                <h3 className="text-lg font-black text-gray-800 mt-2">{totalLaundry}</h3>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Barang di Laundry</p>
                            </div>
                            <div className="h-12 w-20">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dummyLaundryData}>
                                        <Bar dataKey="val" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-[#21409A] bg-blue-50 px-1.5 py-0.5 rounded">+42% ↑</span>
                                <h3 className="text-lg font-black text-gray-800 mt-2">{persentaseBaik}%</h3>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Kondisi Baik</p>
                            </div>
                            <div className="h-14 w-14 relative">
                                <Doughnut data={conditionData} options={{ responsive: true, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#00A651]">
                                    {persentaseBaik}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col relative">
                        <div className="mb-4 text-center">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                                {selectedItem === 'all' ? 'Proporsi Peminjaman APD' : 'Distribusi Peminjaman per Ukuran'}
                            </h3>
                            <p className="text-[10px] text-gray-400 mt-1">
                                {selectedItem === 'all' ? 'Kategori barang yang paling sering dipinjam.' : 'Porsi ukuran yang paling sering dipinjam pekerja.'}
                            </p>
                        </div>

                        <div className="flex-1 relative min-h-[260px]">
                            <div className="w-full h-full">
                                {/* 👇 PLUGIN DIPASANG DI SINI 👇 */}
                                <Doughnut
                                    data={doughnutChartData}
                                    options={doughnutOptions}
                                    plugins={[centerTextPlugin]}
                                />
                                {/* Overlay HTML CSS kita HAPUS total! */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-x-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-gray-800">Aktivitas Pekerja Terbaru</h3>
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pekerja</th>
                                    <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Durasi</th>
                                    <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Item Terkait</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-medium text-gray-700">
                                {/* 👇 Menggunakan variabel latestActivities dari backend 👇 */}
                                {(latestActivities || []).map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 font-bold text-gray-800">{row.name}</td>
                                        <td className="py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${row.badge}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center text-gray-500">{row.time}</td>
                                        <td className="py-3 text-right font-black text-gray-900">{row.items}</td>
                                    </tr>
                                ))}

                                {/* Pesan kosong jika belum ada transaksi sama sekali */}
                                {(!latestActivities || latestActivities.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="py-6 text-center text-gray-400 italic">
                                            Belum ada aktivitas pekerja.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Aktivitas Mingguan</h3>
                                <p className="text-[10px] text-gray-400">Total pinjam vs kembali</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded">
                                <span className="w-2 h-2 rounded-full bg-[#21409A]"></span>
                                <span className="text-[10px] font-bold text-[#21409A]">{totalPinjam6Bulan} Pinjam</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded">
                                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                                <span className="text-[10px] font-bold text-[#F59E0B]">{totalKembali6Bulan} Kembali</span>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={weeklyActivityData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={5} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                    <RechartsTooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                    <Bar dataKey="pinjam" name="Dipinjam" fill="#21409A" radius={[4, 4, 0, 0]} barSize={12} />
                                    <Line type="monotone" dataKey="kembali" name="Dikembalikan" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#F59E0B', strokeWidth: 2 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}