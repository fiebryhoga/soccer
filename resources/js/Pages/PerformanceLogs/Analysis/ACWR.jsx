// resources/js/Pages/PerformanceLogs/Analysis/ACWR.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Activity, Search, ChevronDown } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';
import ACWRChart from './Partials/ACWRChart';
import ACWRTable from './Partials/ACWRTable';

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

    // KALKULASI EWMA (Secara Kronologis: Lama -> Baru)
    const computedACWR = useMemo(() => {
        if (!historicalData || historicalData.length === 0) return [];

        let prevAcute = null;
        let prevChronic = null;

        const dataWithEWMA = historicalData.map((day) => {
            const val = parseFloat(day.averages[selectedMetric]) || 0;
            let acute, chronic, acwr;

            if (prevAcute === null && prevChronic === null) {
                acute = val;
                chronic = val;
            } else {
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
                xLabel: day.day_name.split(',')[1]?.trim() || day.day_name 
            };
        });

        // Filter tampilan
        return dataWithEWMA.filter(d => d.date >= startDate && d.date <= endDate);
    }, [historicalData, selectedMetric, startDate, endDate]);

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Acute:Chronic Workload Ratio (ACWR)"
            headerDescription="Analisis risiko cedera dengan membandingkan beban kelelahan harian (Acute) terhadap kebugaran (Chronic)."
        >
            <Head title="ACWR Analysis" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* TOOLBAR FILTER (Enterprise Style) */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 lg:p-4 rounded-xl shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between z-20 relative transition-colors">
                    
                    <div className="flex items-center gap-3 w-full xl:w-auto flex-1">
                        <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg hidden sm:block shadow-sm">
                            <Activity size={18} strokeWidth={2.5} />
                        </div>
                        <div className="relative w-full sm:w-80 group">
                            <select
                                value={selectedMetric}
                                onChange={e => setSelectedMetric(e.target.value)}
                                className="w-full appearance-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 pl-3.5 pr-10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-sm cursor-pointer"
                            >
                                {metricOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 pointer-events-none transition-colors" size={16} strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto xl:pl-6 xl:border-l border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full sm:w-auto shadow-sm">
                        <CalendarIcon size={14} className="text-zinc-400 dark:text-zinc-400 shrink-0" strokeWidth={2.5}/>
                        
                        <input 
                            type="date" 
                            value={filterStart} 
                            onChange={e => setFilterStart(e.target.value)}
                            // Tambahkan dark:[color-scheme:dark] di sini
                            className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none w-full p-0 focus:ring-0 cursor-pointer tabular-nums dark:[color-scheme:dark]"
                        />
                        
                        <span className="text-zinc-300 dark:text-zinc-600 text-xs font-black">-</span>
                        
                        <input 
                            type="date" 
                            value={filterEnd} 
                            onChange={e => setFilterEnd(e.target.value)}
                            // Tambahkan dark:[color-scheme:dark] di sini juga
                            className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none w-full p-0 focus:ring-0 cursor-pointer tabular-nums dark:[color-scheme:dark]"
                        />
                    </div>
                        <button 
                            onClick={applyDateFilter}
                            className="w-full sm:w-auto px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                        >
                            <Search size={14} strokeWidth={2.5} /> Terapkan
                        </button>
                    </div>
                </div>

                {/* GRAFIK ANALISIS (PARTIAL) */}
                <ACWRChart 
                    data={computedACWR} 
                    metricLabel={metricOptions.find(o => o.value === selectedMetric)?.label} 
                />

                {/* TABEL DATA HARIAN EWMA (PARTIAL) */}
                <ACWRTable data={computedACWR} />

            </div>
        </AuthenticatedLayout>
    );
}