// resources/js/Pages/PerformanceLogs/Analysis/StrainMonotony.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
// IMPORT ACTIVITY DITAMBAHKAN DI SINI:
import { Calendar as CalendarIcon, LineChart, Filter, ChevronDown, ChevronRight, Search, Activity } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';
import SelectDropdown from '@/Components/ui/SelectDropdown';

// Import Recharts untuk Grafik
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function StrainMonotony({ auth, weeksData, startDate, endDate }) {
    
    // STATE FILTER
    const [selectedMetric, setSelectedMetric] = useState('total_distance');
    const [filterStart, setFilterStart] = useState(startDate || '');
    const [filterEnd, setFilterEnd] = useState(endDate || '');
    
    // State Tabel Expandable
    const [expandedWeeks, setExpandedWeeks] = useState({});

    // Opsi Metrik untuk Dropdown Grafik (Hapus yang berupa Durasi Waktu)
    const metricOptions = useMemo(() => {
        return FIXED_EXCEL_COLUMNS
            .filter(col => !col.id.includes('_dur') && col.id !== 'total_duration')
            .map(col => ({ value: col.id, label: col.label }));
    }, []);

    // Filter Apply
    const applyDateFilter = () => {
        router.get(route('analysis.strain'), { start_date: filterStart, end_date: filterEnd }, { preserveState: true });
    };

    const toggleWeek = (idx) => {
        setExpandedWeeks(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    // Susun Urutan Kolom Tabel (Tanpa Durasi Waktu)
    const renderColumns = useMemo(() => {
        const cols = [];
        FIXED_EXCEL_COLUMNS.forEach(col => {
            if (col.id.includes('_dur') || col.id === 'total_duration') return;
            cols.push({ id: col.id, label: col.label });
            if (col.hasPercent) {
                let percentLabel = `% ${col.label}`;
                if (col.id === 'total_distance') percentLabel = '% Total Distance Of-MD';
                if (col.id === 'dist_per_min') percentLabel = '% Distance/min Of-MD';
                if (col.id === 'hir_18_24_kmh') percentLabel = '%HIR 18-24.51 Km/h';
                if (col.id === 'sprint_distance') percentLabel = '% SPRINT 24.52 km/h~';
                if (col.id === 'total_18kmh') percentLabel = '% Total 18 Km/h~';
                if (col.id === 'max_velocity') percentLabel = '% Max Velocity Of Highest (km/h)';
                if (col.id === 'player_load') percentLabel = '% Total Player Load Of-MD';
                cols.push({ id: col.id + '_percent', label: percentLabel });
            }
        });
        return cols;
    }, []);

    // FUNGSI KALKULASI DATA PER MINGGU & PER KOLOM METRIK
    const computedWeeks = useMemo(() => {
        if (!weeksData) return []; // Fallback keamanan
        
        return weeksData.map((week, idx) => {
            const stats = {};

            // Hitung statistik untuk SEMUA kolom di minggu ini
            renderColumns.forEach(col => {
                // Ambil 7 hari data (hari libur = 0)
                const values = week.days.map(d => parseFloat(d.averages[col.id]) || 0);
                
                const weeklyLoad = values.reduce((a, b) => a + b, 0);
                const meanDaily = weeklyLoad / 7;
                
                // Variance & StdDev (Dibagi n-1 => 6)
                const variance = values.reduce((a, b) => a + Math.pow(b - meanDaily, 2), 0) / 6;
                const stdDev = Math.sqrt(variance);

                const monotony = stdDev === 0 ? 0 : meanDaily / stdDev;
                const strain = weeklyLoad * monotony;

                stats[col.id] = {
                    weeklyLoad: isNaN(weeklyLoad) ? 0 : weeklyLoad,
                    meanDaily: isNaN(meanDaily) ? 0 : meanDaily,
                    stdDev: isNaN(stdDev) ? 0 : stdDev,
                    monotony: isNaN(monotony) ? 0 : monotony,
                    strain: isNaN(strain) ? 0 : strain,
                };
            });

            return {
                ...week,
                idx,
                stats, // Simpan kalkulasi semua kolom di dalam minggu ini
                
                // Format khusus untuk ditampilkan di Recharts (Hanya metrik yang di-select di dropdown)
                weeklyLoad: stats[selectedMetric]?.weeklyLoad || 0,
                monotony: stats[selectedMetric]?.monotony || 0,
                strain: stats[selectedMetric]?.strain || 0,
                name: week.week_label.split(' ')[0], // Ambil "W1", "W2"
                tooltipName: week.week_label
            };
        });
    }, [weeksData, selectedMetric, renderColumns]);

    const formatNum = (num, isMonotony = false) => {
        if (!num || isNaN(num)) return '0';
        if (isMonotony) return num.toFixed(2); // Monotony selalu 2 desimal
        return Number.isInteger(num) ? num.toString() : num.toFixed(1); // Bilangan bulat tanpa koma
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Strain & Monotony"
            headerDescription="Analisis kelelahan mingguan berdasarkan variabel fisik yang dipilih."
        >
            <Head title="Strain & Monotony Analysis" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* TOOLBAR FILTER */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between z-20 relative">
                    
                    {/* Pilih Variabel */}
                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hidden sm:block">
                            <Filter size={20} strokeWidth={2.5} />
                        </div>
                        <div className="w-full sm:w-72">
                            <SelectDropdown 
                                value={selectedMetric} 
                                onChange={(e) => setSelectedMetric(e.target.value)} 
                                options={metricOptions}
                                icon={Activity}
                            />
                        </div>
                    </div>

                    {/* Filter Rentang Kalender */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full sm:w-auto">
                            <CalendarIcon size={14} className="text-zinc-400 shrink-0" />
                            <input 
                                type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none w-full p-0 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-zinc-400 text-xs font-black">-</span>
                            <input 
                                type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none w-full p-0 focus:ring-0 cursor-pointer"
                            />
                        </div>
                        <button 
                            onClick={applyDateFilter}
                            className="w-full sm:w-auto px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Search size={14} strokeWidth={2.5} /> Terapkan Filter
                        </button>
                    </div>
                </div>

                {/* GRAFIK ANALISIS (RECHARTS) */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                    <div className="mb-6 flex flex-col">
                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                            {metricOptions.find(o => o.value === selectedMetric)?.label} <span className="text-zinc-400">TRENDS</span>
                        </h3>
                        <p className="text-xs font-semibold text-zinc-500">Perbandingan Beban (Load), Strain, dan Monotony dari {computedWeeks.length} Minggu terpilih.</p>
                    </div>
                    
                    <div className="w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={computedWeeks} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                                
                                {/* Sumbu Kiri (Untuk Load & Strain) */}
                                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={-10} />
                                {/* Sumbu Kanan (Untuk Monotony yang nilainya kecil) */}
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={10} />
                                
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipName || label}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                                
                                {/* Komponen Bar & Line */}
                                <Bar yAxisId="left" dataKey="weeklyLoad" name="Weekly Load" barSize={40} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="monotony" name="Monotony" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                                <Line yAxisId="left" type="monotone" dataKey="strain" name="Strain" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TABEL DATA MINGGUAN (EXPANDABLE) */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Rekapitulasi Seluruh Matriks</h3>
                    </div>
                    
                    <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-[#09090b] [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 pb-2">
                        <table className="w-full text-left whitespace-nowrap text-[11px] border-collapse">
                            <thead className="bg-zinc-50 dark:bg-[#09090b]">
                                <tr>
                                    <th className="p-3 border-b-2 border-r border-zinc-200 dark:border-zinc-800 font-black tracking-widest uppercase text-zinc-500 sticky left-0 z-20 bg-zinc-50 dark:bg-[#09090b] shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a] text-center min-w-[150px]">
                                        SESSION
                                    </th>
                                    {renderColumns.map((col, idx) => (
                                        <th key={idx} className="p-3 border-b-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-center text-zinc-700 dark:text-zinc-300 min-w-[100px]">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-[#09090b]">
                                {computedWeeks.map((week) => (
                                    <React.Fragment key={week.idx}>
                                        
                                        {/* BARIS UTAMA (NAMA MINGGU + TOMBOL EXPAND) */}
                                        <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group" onClick={() => toggleWeek(week.idx)}>
                                            <td className="p-3 border-r border-zinc-200 dark:border-zinc-800 font-black tracking-widest text-zinc-900 dark:text-zinc-100 uppercase sticky left-0 z-10 bg-white dark:bg-[#09090b] group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a] flex items-center gap-2">
                                                {expandedWeeks[week.idx] ? <ChevronDown size={14} className="text-zinc-400"/> : <ChevronRight size={14} className="text-zinc-400"/>}
                                                {week.week_label}
                                            </td>
                                            <td colSpan={renderColumns.length} className="bg-zinc-50/50 dark:bg-zinc-900/20"></td>
                                        </tr>

                                        {/* DETAIL 7 HARI (MUNCUL JIKA DI-EXPAND) */}
                                        {expandedWeeks[week.idx] && week.days.map((day, dIdx) => (
                                            <tr key={`day-${dIdx}`} className="bg-zinc-50/30 dark:bg-[#121212] hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors">
                                                <td className={`p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400 uppercase sticky left-0 z-10 shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a] pl-8 bg-zinc-50/80 dark:bg-[#121212] ${day.type === 'off' ? 'italic text-zinc-400 dark:text-zinc-600' : ''}`}>
                                                    {day.title}
                                                </td>
                                                {renderColumns.map((col, cIdx) => {
                                                    const val = day.averages[col.id];
                                                    return (
                                                        <td key={cIdx} className={`p-2 border-r border-zinc-200/50 dark:border-zinc-800/50 text-center font-mono ${!val || val === 0 ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                            {val || '0'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}

                                        {/* JEDA KOSONG PEMBATAS */}
                                        <tr className={expandedWeeks[week.idx] ? '' : 'hidden'}>
                                            <td colSpan={renderColumns.length + 1} className="h-2 bg-zinc-100 dark:bg-[#0a0a0a] border-y border-zinc-200 dark:border-zinc-800 shadow-inner"></td>
                                        </tr>

                                        {/* BARIS HASIL KALKULASI MINGGUAN */}
                                        {[
                                            { key: 'weeklyLoad', label: 'WEEKLY LOAD', bg: 'bg-zinc-100 dark:bg-zinc-900', isMonotony: false },
                                            { key: 'meanDaily', label: 'MEAN DAILY', bg: 'bg-white dark:bg-[#09090b]', isMonotony: false },
                                            { key: 'stdDev', label: 'STANDARD DEV', bg: 'bg-zinc-50 dark:bg-zinc-900/50', isMonotony: false },
                                            { key: 'monotony', label: 'TRAINING MONOTONY', bg: 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300', isMonotony: true },
                                            { key: 'strain', label: 'STRAIN', bg: 'bg-red-50/50 dark:bg-red-900/10 text-red-800 dark:text-red-300', isMonotony: false }
                                        ].map((rowStat) => (
                                            <tr key={`${week.idx}-${rowStat.key}`} className={`${rowStat.bg} ${expandedWeeks[week.idx] ? '' : 'hidden'}`}>
                                                <td className={`p-2.5 border-r border-zinc-200 dark:border-zinc-800 font-black tracking-widest uppercase sticky left-0 z-10 shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a] pl-8 ${rowStat.isMonotony ? 'text-blue-800 dark:text-blue-400' : rowStat.key === 'strain' ? 'text-red-800 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'} ${rowStat.bg}`}>
                                                    {rowStat.label}
                                                </td>
                                                {renderColumns.map((col, cIdx) => (
                                                    <td key={cIdx} className={`p-2 border-r border-zinc-200/50 dark:border-zinc-800/50 text-center font-mono font-bold ${rowStat.key === 'monotony' && week.stats[col.id].monotony > 2 ? 'text-red-600 dark:text-red-400' : ''}`}>
                                                        {formatNum(week.stats[col.id][rowStat.key], rowStat.isMonotony)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}

                                        {/* BORDER BAWAH TEBAL SETIAP MINGGU */}
                                        <tr>
                                            <td colSpan={renderColumns.length + 1} className="h-6 bg-zinc-50/50 dark:bg-[#0a0a0a] border-b-2 border-zinc-300 dark:border-zinc-800"></td>
                                        </tr>

                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}