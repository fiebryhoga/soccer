// resources/js/Pages/PerformanceLogs/Analysis/ACWR.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Activity, Filter, Search } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';
import SelectDropdown from '@/Components/ui/SelectDropdown';

import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts';

export default function ACWR({ auth, historicalData, startDate, endDate }) {
    
    const [selectedMetric, setSelectedMetric] = useState('total_distance');
    const [filterStart, setFilterStart] = useState(startDate || '');
    const [filterEnd, setFilterEnd] = useState(endDate || '');

    const metricOptions = useMemo(() => {
        return FIXED_EXCEL_COLUMNS
            .filter(col => !col.id.includes('_dur') && col.id !== 'total_duration')
            .map(col => ({ value: col.id, label: col.label }));
    }, []);

    const applyDateFilter = () => {
        router.get(route('analysis.acwr'), { start_date: filterStart, end_date: filterEnd }, { preserveState: true });
    };

    // KALKULASI EWMA (Dihitung dari hari pertama data ada, dipotong hanya untuk filter tampilan)
    const computedACWR = useMemo(() => {
        if (!historicalData || historicalData.length === 0) return [];

        let prevAcute = null;
        let prevChronic = null;

        const dataWithEWMA = historicalData.map((day) => {
            const val = parseFloat(day.averages[selectedMetric]) || 0;
            let acute, chronic, acwr;

            // HARI PERTAMA: Nilai mentah menjadi pijakan Acute & Chronic
            if (prevAcute === null && prevChronic === null) {
                acute = val;
                chronic = val;
            } else {
                // HARI BERIKUTNYA: Rumus EWMA
                acute = (0.25 * val) + (0.75 * prevAcute);
                chronic = (0.069 * val) + (0.931 * prevChronic);
            }

            acwr = chronic > 0 ? (acute / chronic) : 0;

            prevAcute = acute;
            prevChronic = chronic;

            return {
                ...day,
                val,
                acute,
                chronic,
                acwr,
                name: day.title === 'off' ? 'OFF' : day.title,
                // Label sumbu X diperpendek agar grafik rapi
                xLabel: day.day_name.split(',')[1] || day.day_name 
            };
        });

        // FILTER TAMPILAN: Hanya tampilkan array yang masuk rentang tanggal (Start - End)
        return dataWithEWMA.filter(d => d.date >= startDate && d.date <= endDate);
    }, [historicalData, selectedMetric, startDate, endDate]);

    const formatNum = (num, isDec = false) => {
        if (!num || isNaN(num)) return '0';
        if (isDec) return num.toFixed(2);
        return Number.isInteger(num) ? num.toString() : num.toFixed(1);
    };

    // Fungsi untuk Status dan Warna ACWR
    const getACWRStatus = (acwr) => {
        if (acwr < 0.8) return { text: 'UNDERLOAD', color: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800' };
        if (acwr <= 1.3) return { text: 'OPTIMAL (SAFE)', color: 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' };
        if (acwr <= 1.5) return { text: 'CAUTION (CUKUP)', color: 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' };
        return { text: 'DANGER (PARAH)', color: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30' };
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Acute:Chronic Workload Ratio (ACWR)"
            headerDescription="Analisis risiko cedera dengan membandingkan beban kelelahan harian (Acute) terhadap kebugaran (Chronic)."
        >
            <Head title="ACWR Analysis" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* TOOLBAR FILTER */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between z-20 relative">
                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hidden sm:block">
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

                {/* GRAFIK ANALISIS (RECHARTS) DENGAN ZONA WARNA */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                                ACWR TREND: {metricOptions.find(o => o.value === selectedMetric)?.label}
                            </h3>
                            <p className="text-xs font-semibold text-zinc-500 mt-0.5">Pemantauan keseimbangan beban dengan metode EWMA (Exponentially Weighted Moving Average).</p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900/50 px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-800">
                                <span className="text-emerald-500">SAFE (0.8 - 1.3)</span>
                                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                                <span className="text-amber-500">CAUTION (1.3 - 1.5)</span>
                                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                                <span className="text-red-500">DANGER (&gt;1.5)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={computedACWR} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                                <XAxis dataKey="xLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                                
                                {/* Sumbu Kiri: Beban Latihan (Acute/Chronic) */}
                                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={-10} />
                                
                                {/* Sumbu Kanan: ACWR (Rasio) */}
                                <YAxis yAxisId="right" orientation="right" domain={[0, 2.5]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 'bold' }} dx={10} />
                                
                                {/* Latar Belakang Zona ACWR (Terikat di Sumbu Kanan) */}
                                <ReferenceArea yAxisId="right" y1={0.8} y2={1.3} fill="#10b981" fillOpacity={0.05} />
                                <ReferenceArea yAxisId="right" y1={1.3} y2={1.5} fill="#f59e0b" fillOpacity={0.05} />
                                <ReferenceArea yAxisId="right" y1={1.5} y2={2.5} fill="#ef4444" fillOpacity={0.05} />

                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    labelFormatter={(label, payload) => `${payload?.[0]?.payload?.day_name} | ${payload?.[0]?.payload?.name}`}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                                
                                <Bar yAxisId="left" dataKey="acute" name="Acute Workload (Kelelahan)" barSize={25} fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.8} />
                                <Line yAxisId="left" type="monotone" dataKey="chronic" name="Chronic Workload (Kebugaran)" stroke="#a855f7" strokeWidth={3} dot={false} />
                                
                                {/* Garis ACWR - Gunakan warna merah mencolok */}
                                <Line yAxisId="right" type="monotone" dataKey="acwr" name="ACWR (Rasio)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TABEL DETAIL EWMA ACWR */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Rekapitulasi Harian EWMA</h3>
                    </div>
                    
                    <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-[#09090b] [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 pb-2">
                        <table className="w-full text-left whitespace-nowrap text-[11px] border-collapse">
                            <thead className="bg-zinc-50 dark:bg-[#09090b]">
                                <tr>
                                    <th className="p-3 border-b-2 border-r border-zinc-200 dark:border-zinc-800 font-black tracking-widest uppercase text-zinc-500 sticky left-0 z-20 bg-zinc-50 dark:bg-[#09090b] shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a] pl-4">HARI, TANGGAL</th>
                                    <th className="p-3 border-b-2 border-r border-zinc-200 dark:border-zinc-800 font-black text-center text-zinc-500 uppercase">SESSION</th>
                                    <th className="p-3 border-b-2 border-r border-zinc-200 dark:border-zinc-800 font-black text-center text-zinc-500 uppercase">NILAI METRIK</th>
                                    <th className="p-3 border-b-2 border-r border-zinc-200 dark:border-zinc-800 font-black text-center text-zinc-500 uppercase text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10">ACUTE (EWMA)</th>
                                    <th className="p-3 border-b-2 border-r border-zinc-200 dark:border-zinc-800 font-black text-center text-zinc-500 uppercase text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-900/10">CHRONIC</th>
                                    <th className="p-3 border-b-2 border-r border-zinc-200 dark:border-zinc-800 font-black text-center text-zinc-500 uppercase text-zinc-900 dark:text-zinc-100">ACWR</th>
                                    <th className="p-3 border-b-2 border-zinc-200 dark:border-zinc-800 font-black text-center text-zinc-500 uppercase">STATUS</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-[#09090b]">
                                {computedACWR.map((day, idx) => {
                                    const status = getACWRStatus(day.acwr);
                                    return (
                                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                            <td className={`p-3 border-r border-zinc-200 dark:border-zinc-800 font-bold sticky left-0 z-10 shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a] pl-4 ${day.type === 'off' ? 'bg-zinc-50 dark:bg-[#121212] text-zinc-400 dark:text-zinc-600' : 'bg-white dark:bg-[#09090b] text-zinc-700 dark:text-zinc-300'}`}>
                                                {day.day_name}
                                            </td>
                                            <td className={`p-3 border-r border-zinc-200 dark:border-zinc-800 font-black text-center uppercase tracking-wider ${day.type === 'off' ? 'italic text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                {day.name}
                                            </td>
                                            <td className={`p-3 border-r border-zinc-200/50 dark:border-zinc-800/50 text-center font-mono font-semibold ${day.val === 0 ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                {formatNum(day.val)}
                                            </td>
                                            <td className="p-3 border-r border-zinc-200/50 dark:border-zinc-800/50 text-center font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50/10 dark:bg-blue-900/5">
                                                {formatNum(day.acute, false)}
                                            </td>
                                            <td className="p-3 border-r border-zinc-200/50 dark:border-zinc-800/50 text-center font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50/10 dark:bg-purple-900/5">
                                                {formatNum(day.chronic, false)}
                                            </td>
                                            <td className="p-3 border-r border-zinc-200/50 dark:border-zinc-800/50 text-center font-mono font-black text-zinc-900 dark:text-zinc-100 text-[13px]">
                                                {formatNum(day.acwr, true)}
                                            </td>
                                            <td className="p-2 text-center">
                                                {day.type !== 'off' && day.val > 0 && (
                                                    <span className={`inline-block px-2.5 py-1 rounded border border-transparent font-bold tracking-widest text-[9px] ${status.color}`}>
                                                        {status.text}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}