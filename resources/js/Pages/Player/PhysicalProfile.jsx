// resources/js/Pages/Player/PhysicalProfile.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Save, Activity, User, Target, CheckCircle2 } from 'lucide-react';

export default function PhysicalProfile({ auth, player, categories, assessments }) {
    const [activeTab, setActiveTab] = useState(categories[0]?.id || null);

    // --- INISIALISASI FORM ---
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        date: new Date().toISOString().split('T')[0],
        results: {} 
    });

    // Helper untuk mengambil hasil tes tersimpan
    const getResult = (metricId) => assessments.find(a => a.metric_id === metricId);

    // Form input handler
    const handleResultChange = (metricId, value) => {
        setData('results', { ...data.results, [metricId]: value });
    };

    const submitForm = (e) => {
        e.preventDefault();
        post(route('players.physical.store', player.id), {
            preserveScroll: true
        });
    };

    // --- LOGIKA PERHITUNGAN RATA-RATA & PERIODISASI ---
    const getCategoryAverage = (categoryId) => {
        const catMetrics = categories.find(c => c.id === categoryId)?.metrics || [];
        let total = 0; let count = 0;
        catMetrics.forEach(m => {
            const res = getResult(m.id);
            if (res) { total += parseFloat(res.percentage); count++; }
        });
        return count > 0 ? Math.round(total / count) : 0;
    };

    // Logika warna berdasarkan persentase (Sesuai skema dashboard)
    const getColorClass = (percent) => {
        if (percent >= 90) return 'text-blue-500 bg-blue-500 fill-blue-500'; // Best
        if (percent >= 80) return 'text-emerald-500 bg-emerald-500 fill-emerald-500'; // Good
        if (percent >= 60) return 'text-yellow-500 bg-yellow-500 fill-yellow-500'; // Average
        if (percent > 0) return 'text-red-500 bg-red-500 fill-red-500'; // Bad/Worst
        return 'text-zinc-300 bg-zinc-200 fill-zinc-200 dark:bg-zinc-800 dark:fill-zinc-800'; // Belum ada data
    };

    // Logika periodisasi pintar yang membaca dari database JSON
    const getPeriodization = (categoryId, percent) => {
        if (percent === 0) return 'Belum ada data';
        
        // Cari data kategori berdasarkan ID
        const category = categories.find(c => c.id === categoryId);
        if (!category || !category.periodization_rules) return '-';

        // Cocokkan persentase saat ini dengan rentang min & max di database
        const matchedRule = category.periodization_rules.find(
            rule => percent >= rule.min && percent <= rule.max
        );

        return matchedRule ? matchedRule.label : '-';
    };

    // --- SVG ANATOMI KOMPONEN ---
    // Mengambil rata-rata spesifik untuk bagian tubuh
    const getBodyPartAvg = (part) => {
        const cat = categories.find(c => c.body_part === part);
        return cat ? getCategoryAverage(cat.id) : 0;
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle={`Physical Profile : ${player.name}`} headerDescription="Dashboard analisis kemampuan fisik dan persentase target atlet.">
            <Head title={`Physical Profile - ${player.name}`} />

            {recentlySuccessful && (
                <div className="fixed bottom-6 right-6 z-[60] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm animate-in fade-in slide-in-from-bottom-5">
                    <CheckCircle2 size={18} className="text-emerald-500" /> Data Assessment Berhasil Disimpan!
                </div>
            )}

            <div className="max-w-7xl mx-auto pb-12 space-y-6">
                
                {/* ========================================== */}
                {/* BAGIAN 1: DASHBOARD VISUAL (ATAS)            */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* AREA KIRI: KOTAK KATEGORI (BAR CHARTS) */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {categories.map(category => {
                            const avg = getCategoryAverage(category.id);
                            const periodization = getPeriodization(category.id, avg);
                            const colorClass = getColorClass(avg).split(' ')[0]; // Ambil class text color
                            const bgColorClass = getColorClass(avg).split(' ')[1]; // Ambil class bg color

                            return (
                                <div key={category.id} className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                                    {/* Header Kotak */}
                                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                                        <div>
                                            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{category.name}</h3>
                                            <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Tahap: <span className={colorClass}>{periodization}</span></p>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-lg text-white font-black text-sm ${bgColorClass}`}>
                                            {avg}%
                                        </div>
                                    </div>
                                    
                                    {/* Body Kotak (Grafik Balok) */}
                                    <div className="p-4 flex gap-4 overflow-x-auto items-end h-48 pb-2">
                                        {category.metrics.map(metric => {
                                            const res = getResult(metric.id);
                                            const pct = res ? Math.min(parseFloat(res.percentage), 100) : 0;
                                            const barColor = getColorClass(pct).split(' ')[1];

                                            return (
                                                <div key={metric.id} className="flex flex-col items-center justify-end h-full min-w-[60px]">
                                                    <span className="text-[10px] font-black text-zinc-500 mb-1">{pct}%</span>
                                                    {/* Balok Background */}
                                                    <div className="w-10 h-28 bg-zinc-100 dark:bg-zinc-800 rounded-t-sm relative overflow-hidden flex items-end justify-center">
                                                        {/* Balok Persentase (Tumbuh dari bawah) */}
                                                        <div className={`w-full rounded-t-sm transition-all duration-1000 ${barColor}`} style={{ height: `${pct}%` }}></div>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 mt-2 text-center leading-tight truncate w-14" title={metric.name}>
                                                        {metric.name.substring(0, 10)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* AREA KANAN: SVG HUMAN ANATOMY */}
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col items-center justify-center relative overflow-hidden">
                        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2 w-full text-center">Body Assessment</h3>
                        
                        {/* 
                            SVG ANATOMY SEDERHANA 
                            Warna diisi otomatis berdasarkan rata-rata kategori yang di-mapping ke 'body_part'
                        */}
                        <svg viewBox="0 0 100 200" className="w-48 h-auto drop-shadow-xl">
                            {/* Kepala */}
                            <circle cx="50" cy="20" r="15" className="fill-zinc-200 dark:fill-zinc-800" />
                            
                            {/* Dada / Jantung (Endurance) */}
                            <path d="M 35 40 L 65 40 L 60 90 L 40 90 Z" className={`transition-colors duration-700 ${getColorClass(getBodyPartAvg('heart')).split(' ')[2]}`} />
                            
                            {/* Lengan Kiri & Kanan (Strength) */}
                            <rect x="22" y="40" width="10" height="50" rx="5" className={`transition-colors duration-700 ${getColorClass(getBodyPartAvg('arms')).split(' ')[2]}`} />
                            <rect x="68" y="40" width="10" height="50" rx="5" className={`transition-colors duration-700 ${getColorClass(getBodyPartAvg('arms')).split(' ')[2]}`} />
                            
                            {/* Kaki Kiri & Kanan (Speed / Flexibility) */}
                            <rect x="38" y="95" width="10" height="70" rx="5" className={`transition-colors duration-700 ${getColorClass(getBodyPartAvg('legs')).split(' ')[2]}`} />
                            <rect x="52" y="95" width="10" height="70" rx="5" className={`transition-colors duration-700 ${getColorClass(getBodyPartAvg('legs')).split(' ')[2]}`} />
                        </svg>

                        <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                            <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg"><p className="text-[10px] font-bold text-zinc-500 uppercase">Engine (Endurance)</p><p className="text-sm font-black">{getBodyPartAvg('heart')}%</p></div>
                            <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg"><p className="text-[10px] font-bold text-zinc-500 uppercase">Upper (Strength)</p><p className="text-sm font-black">{getBodyPartAvg('arms')}%</p></div>
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* BAGIAN 2: FORM INPUT BERBASIS TAB (BAWAH)  */}
                {/* ========================================== */}
                <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                        <div className="flex items-center gap-2">
                            <Activity className="text-blue-500" size={20} />
                            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-none">Input Hasil Tes Fisik</h3>
                        </div>
                        <input type="date" value={data.date} onChange={e => setData('date', e.target.value)} className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold py-1.5 px-3 outline-none" required/>
                    </div>

                    <form onSubmit={submitForm}>
                        {/* TAB NAVIGASI */}
                        <div className="flex overflow-x-auto border-b border-zinc-100 dark:border-zinc-800">
                            {categories.map(cat => (
                                <button type="button" key={cat.id} onClick={() => setActiveTab(cat.id)} className={`px-6 py-4 text-sm font-black whitespace-nowrap transition-colors border-b-2 ${activeTab === cat.id ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5' : 'border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* FORM KONTEN PER TAB */}
                        <div className="p-6">
                            {categories.map(cat => (
                                <div key={cat.id} className={activeTab === cat.id ? 'block' : 'hidden'}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {cat.metrics.map(metric => {
                                            const savedValue = getResult(metric.id)?.result_value || '';
                                            const currentValue = data.results[metric.id] !== undefined ? data.results[metric.id] : savedValue;

                                            return (
                                                <div key={metric.id} className="bg-zinc-50 dark:bg-[#111113] p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <label className="block text-sm font-black text-zinc-900 dark:text-zinc-100">{metric.name}</label>
                                                            <p className="text-[10px] font-bold text-zinc-500 mt-1">Target: {metric.target_value} {metric.unit} {metric.is_lower_better ? '(Makin kecil makin bagus)' : ''}</p>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <input 
                                                            type="number" step="0.01" 
                                                            value={currentValue} 
                                                            onChange={e => handleResultChange(metric.id, e.target.value)} 
                                                            className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-600 rounded-lg text-lg font-black py-2.5 pl-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums" 
                                                            placeholder="0.00"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">{metric.unit}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* TOMBOL SIMPAN */}
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                            <button type="submit" disabled={processing} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black transition-all shadow-sm disabled:opacity-50">
                                <Save size={18} /> {processing ? 'Menyimpan...' : 'Simpan Assessment'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}