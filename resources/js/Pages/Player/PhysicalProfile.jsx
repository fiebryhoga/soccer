// resources/js/Pages/Player/PhysicalProfile.jsx

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Save, Activity, CheckCircle2 } from 'lucide-react';

export default function PhysicalProfile({ auth, player, categories, assessments }) {
    const [activeTab, setActiveTab] = useState(categories[0]?.id || null);

    // --- INISIALISASI FORM ---
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        date: new Date().toISOString().split('T')[0],
        results: {} 
    });

    const getResult = (metricId) => assessments.find(a => a.metric_id === metricId);

    const handleResultChange = (metricId, value) => {
        setData('results', { ...data.results, [metricId]: value });
    };

    const submitForm = (e) => {
        e.preventDefault();
        post(route('players.physical.store', player.id), { preserveScroll: true });
    };

    // --- LOGIKA PERHITUNGAN RATA-RATA ---
    const getCategoryAverage = (categoryId) => {
        const catMetrics = categories.find(c => c.id === categoryId)?.metrics || [];
        let total = 0; let count = 0;
        catMetrics.forEach(m => {
            const res = getResult(m.id);
            if (res) { total += parseFloat(res.percentage); count++; }
        });
        return count > 0 ? Math.round(total / count) : 0;
    };

    const getCatAvgByName = (nameMatch) => {
        const cat = categories.find(c => c.name.toLowerCase().includes(nameMatch.toLowerCase()));
        return cat ? getCategoryAverage(cat.id) : 0;
    };

    // --- LOGIKA WARNA & GLOWING (Sesuai Aturan Periodisasi) ---
    const getColorTheme = (percent) => {
        if (percent >= 90) return { 
            fill: 'fill-fuchsia-500', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-500', 
            glow: 'drop-shadow-[0_0_12px_rgba(217,70,239,0.8)]', bg: 'bg-fuchsia-500' 
        }; // Best
        if (percent >= 80) return { 
            fill: 'fill-blue-500', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500', 
            glow: 'drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]', bg: 'bg-blue-500' 
        }; // Good
        if (percent >= 61) return { 
            fill: 'fill-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500', 
            glow: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]', bg: 'bg-emerald-500' 
        }; // Average
        if (percent > 0) return { 
            fill: 'fill-red-500', text: 'text-red-600 dark:text-red-400', border: 'border-red-500', 
            glow: 'drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]', bg: 'bg-red-500' 
        }; // Bad
        return { 
            fill: 'fill-zinc-800 dark:fill-zinc-900', text: 'text-zinc-400', border: 'border-zinc-300 dark:border-zinc-700', 
            glow: '', bg: 'bg-zinc-200 dark:bg-zinc-800' 
        }; // Empty
    };

    // Logika Periodisasi dari JSON DB
    const getPeriodization = (categoryId, percent) => {
        if (percent === 0) return 'Belum ada data';
        const category = categories.find(c => c.id === categoryId);
        if (!category || !category.periodization_rules) return '-';
        const matchedRule = category.periodization_rules.find(rule => percent >= rule.min && percent <= rule.max);
        return matchedRule ? matchedRule.label : '-';
    };

    // Mapping Data untuk SVG
    const engineData = {
        heart: getCatAvgByName('Endurance'),
        arms: getCatAvgByName('Max Strength'),
        core: getCatAvgByName('Strength End'),
        legs: getCatAvgByName('Power') || getCatAvgByName('SAQ')
    };
    const flexData = getCatAvgByName('Flexibility');

    return (
        <AuthenticatedLayout user={auth.user} headerTitle={`Physical Profile : ${player.name}`} headerDescription="Dashboard analisis kemampuan fisik dan persentase target atlet.">
            <Head title={`Physical Profile - ${player.name}`} />

            {recentlySuccessful && (
                <div className="fixed bottom-6 right-6 z-[60] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm animate-in fade-in slide-in-from-bottom-5">
                    <CheckCircle2 size={18} className="text-emerald-500" /> Assessment Disimpan!
                </div>
            )}

            <div className="max-w-7xl mx-auto pb-12 space-y-6">
                
                {/* ========================================== */}
                {/* BAGIAN 1: ANATOMY DASHBOARD (SVG MIRIP GAMBAR) */}
                {/* ========================================== */}
                <div className="bg-zinc-200 dark:bg-[#1a1a1a] rounded-3xl border border-zinc-300 dark:border-zinc-800 shadow-inner p-8 relative overflow-hidden">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto relative">
                        
                        {/* --- KIRI: FLEXIBILITY FUNCTION --- */}
                        <div className="relative flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="w-8 h-8 flex items-center justify-center bg-zinc-300 dark:bg-zinc-800 border-2 border-zinc-400 dark:border-zinc-600 rounded-lg transform -skew-x-12 font-black text-zinc-700 dark:text-zinc-300">L</span>
                                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Flexibility Function</h3>
                                <span className="w-8 h-8 flex items-center justify-center bg-zinc-300 dark:bg-zinc-800 border-2 border-zinc-400 dark:border-zinc-600 rounded-lg transform -skew-x-12 font-black text-zinc-700 dark:text-zinc-300">R</span>
                            </div>

                            <div className="relative w-64 h-[400px]">
                                {/* SVG HUMAN STICK (FLEXIBILITY) */}
                                <svg viewBox="0 0 100 220" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="flexGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="currentColor" className={getColorTheme(flexData).text} />
                                            <stop offset="100%" stopColor="currentColor" className={getColorTheme(flexData).text} />
                                        </linearGradient>
                                    </defs>
                                    {/* Head */}
                                    <circle cx="50" cy="25" r="16" className="fill-black" />
                                    {/* Shoulders / Upper */}
                                    <path d="M 20 50 Q 50 40 80 50 L 80 70 L 20 70 Z" className={`transition-all duration-1000 ${getColorTheme(flexData).fill} ${getColorTheme(flexData).glow}`} />
                                    {/* Arms */}
                                    <rect x="20" y="70" width="14" height="60" rx="7" className="fill-black" />
                                    <rect x="66" y="70" width="14" height="60" rx="7" className="fill-black" />
                                    {/* Core / Base */}
                                    <rect x="36" y="70" width="28" height="30" className="fill-black" />
                                    {/* Hips / Mid Flex */}
                                    <rect x="36" y="100" width="28" height="35" className={`transition-all duration-1000 ${getColorTheme(flexData).fill} ${getColorTheme(flexData).glow}`} />
                                    {/* Knees Base */}
                                    <rect x="36" y="135" width="12" height="15" className="fill-black" />
                                    <rect x="52" y="135" width="12" height="15" className="fill-black" />
                                    {/* Calves / Lower Flex */}
                                    <rect x="36" y="150" width="12" height="50" rx="6" className={`transition-all duration-1000 ${getColorTheme(flexData).fill} ${getColorTheme(flexData).glow}`} />
                                    <rect x="52" y="150" width="12" height="50" rx="6" className={`transition-all duration-1000 ${getColorTheme(flexData).fill} ${getColorTheme(flexData).glow}`} />
                                </svg>

                                {/* Callout Bubbles Flexibility */}
                                <div className={`absolute top-[15%] -left-8 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(flexData).border} px-4 py-1.5 rounded-xl rounded-br-none shadow-lg`}>
                                    <span className={`text-lg font-black ${getColorTheme(flexData).text}`}>{flexData}%</span>
                                </div>
                                <div className={`absolute top-[15%] -right-8 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(flexData).border} px-4 py-1.5 rounded-xl rounded-bl-none shadow-lg`}>
                                    <span className={`text-lg font-black ${getColorTheme(flexData).text}`}>{flexData}%</span>
                                </div>
                                <div className={`absolute bottom-[10%] -left-8 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(flexData).border} px-4 py-1.5 rounded-xl rounded-tr-none shadow-lg`}>
                                    <span className={`text-lg font-black ${getColorTheme(flexData).text}`}>{flexData}%</span>
                                </div>
                                <div className={`absolute bottom-[10%] -right-8 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(flexData).border} px-4 py-1.5 rounded-xl rounded-tl-none shadow-lg`}>
                                    <span className={`text-lg font-black ${getColorTheme(flexData).text}`}>{flexData}%</span>
                                </div>
                            </div>
                        </div>

                        {/* --- KANAN: ENGINE FUNCTION --- */}
                        <div className="relative flex flex-col items-center">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-8 mt-2">Engine Function</h3>

                            <div className="relative w-64 h-[400px]">
                                {/* SVG HUMAN STICK (ENGINE) */}
                                <svg viewBox="0 0 100 220" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="armGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="black" />
                                            <stop offset="100%" stopColor="currentColor" className={getColorTheme(engineData.arms).text} />
                                        </linearGradient>
                                        <linearGradient id="legGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="black" />
                                            <stop offset="100%" stopColor="currentColor" className={getColorTheme(engineData.legs).text} />
                                        </linearGradient>
                                        <linearGradient id="coreGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="black" />
                                            <stop offset="100%" stopColor="currentColor" className={getColorTheme(engineData.core).text} />
                                        </linearGradient>
                                    </defs>
                                    
                                    {/* Glowing Aura Background Base */}
                                    <path d="M 35 45 Q 50 35 65 45 L 80 55 L 80 120 L 65 120 L 65 200 L 35 200 L 35 120 L 20 120 L 20 55 Z" className="fill-transparent drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]" />

                                    {/* Head */}
                                    <circle cx="50" cy="25" r="16" className="fill-black" />
                                    {/* Shoulders & Chest Base */}
                                    <path d="M 20 55 Q 50 40 80 55 L 80 80 L 20 80 Z" className="fill-black" />
                                    
                                    {/* Gradient Core */}
                                    <rect x="36" y="80" width="28" height="30" fill="url(#coreGrad)" className={`${getColorTheme(engineData.core).glow}`} />
                                    
                                    {/* Gradient Arms */}
                                    <rect x="20" y="80" width="14" height="50" rx="7" fill="url(#armGrad)" className={`${getColorTheme(engineData.arms).glow}`} />
                                    <rect x="66" y="80" width="14" height="50" rx="7" fill="url(#armGrad)" className={`${getColorTheme(engineData.arms).glow}`} />
                                    
                                    {/* Pelvis Base */}
                                    <rect x="36" y="110" width="28" height="20" className="fill-black" />
                                    
                                    {/* Gradient Legs */}
                                    <rect x="36" y="130" width="12" height="70" rx="6" fill="url(#legGrad)" className={`${getColorTheme(engineData.legs).glow}`} />
                                    <rect x="52" y="130" width="12" height="70" rx="6" fill="url(#legGrad)" className={`${getColorTheme(engineData.legs).glow}`} />

                                    {/* Heart Center */}
                                    <path d="M 50 70 C 50 70 43 55 38 60 C 33 65 38 75 50 85 C 62 75 67 65 62 60 C 57 55 50 70 50 70 Z" 
                                          className={`stroke-white stroke-[1.5] transition-all duration-1000 ${getColorTheme(engineData.heart).fill} ${getColorTheme(engineData.heart).glow}`} />
                                </svg>

                                {/* Callout Bubbles Engine */}
                                {/* Heart / Endurance */}
                                <div className={`absolute top-[10%] left-0 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(engineData.heart).border} px-4 py-1.5 rounded-xl rounded-br-none shadow-lg z-10`}>
                                    <span className={`text-lg font-black ${getColorTheme(engineData.heart).text}`}>{engineData.heart}%</span>
                                    <div className={`absolute -bottom-6 -right-6 w-8 h-px bg-zinc-400 rotate-[45deg] origin-top-left`}></div>
                                </div>
                                
                                {/* Arms / Max Strength */}
                                <div className={`absolute top-[35%] -right-12 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(engineData.arms).border} px-4 py-1.5 rounded-xl shadow-lg z-10`}>
                                    <span className={`text-lg font-black ${getColorTheme(engineData.arms).text}`}>{engineData.arms}%</span>
                                </div>

                                {/* Core / Strength End */}
                                <div className={`absolute top-[52%] left-[38%] translate-x-[-50%] bg-zinc-900/60 backdrop-blur-sm border border-zinc-600 px-3 py-1 rounded-lg z-10`}>
                                    <span className="text-sm font-black text-white">{engineData.core}%</span>
                                </div>

                                {/* Legs / Power SAQ */}
                                <div className={`absolute bottom-[25%] -left-8 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(engineData.legs).border} px-4 py-1.5 rounded-xl rounded-tr-none shadow-lg z-10`}>
                                    <span className={`text-lg font-black ${getColorTheme(engineData.legs).text}`}>{engineData.legs}%</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ========================================== */}
                {/* BAGIAN 2: KOTAK KATEGORI (BAR CHARTS)      */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map(category => {
                        const avg = getCategoryAverage(category.id);
                        const periodization = getPeriodization(category.id, avg);
                        const theme = getColorTheme(avg);

                        return (
                            <div key={category.id} className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <div>
                                        <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{category.name}</h3>
                                        <p className={`text-[9px] font-bold mt-0.5 ${theme.text}`}>{periodization}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-white font-black text-xs ${theme.bg}`}>
                                        {avg}%
                                    </div>
                                </div>
                                <div className="p-4 flex gap-4 overflow-x-auto items-end h-40 pb-2">
                                    {category.metrics.map(metric => {
                                        const res = getResult(metric.id);
                                        const pct = res ? Math.min(parseFloat(res.percentage), 100) : 0;
                                        const barTheme = getColorTheme(pct);
                                        return (
                                            <div key={metric.id} className="flex flex-col items-center justify-end h-full min-w-[50px]">
                                                <span className="text-[10px] font-black text-zinc-500 mb-1">{pct}%</span>
                                                <div className="w-8 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-t-sm relative overflow-hidden flex items-end justify-center">
                                                    <div className={`w-full rounded-t-sm transition-all duration-1000 ${barTheme.bg}`} style={{ height: `${pct}%` }}></div>
                                                </div>
                                                <span className="text-[8px] font-bold text-zinc-600 dark:text-zinc-400 mt-2 text-center leading-tight truncate w-12" title={metric.name}>{metric.name.substring(0, 10)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ========================================== */}
                {/* BAGIAN 3: FORM INPUT HASIL TES             */}
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
                        <div className="flex overflow-x-auto border-b border-zinc-100 dark:border-zinc-800">
                            {categories.map(cat => (
                                <button type="button" key={cat.id} onClick={() => setActiveTab(cat.id)} className={`px-6 py-4 text-sm font-black whitespace-nowrap transition-colors border-b-2 ${activeTab === cat.id ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5' : 'border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
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
                                                            <p className="text-[10px] font-bold text-zinc-500 mt-1">Target: {metric.target_value} {metric.unit} {metric.is_lower_better ? '(Makin kecil = bagus)' : ''}</p>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <input type="number" step="0.01" value={currentValue} onChange={e => handleResultChange(metric.id, e.target.value)} className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-600 rounded-lg text-lg font-black py-2.5 pl-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums" placeholder="0.00" />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">{metric.unit}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
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