// resources/js/Pages/PerformanceLogs/Analysis/StrainMonotony.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Search, Activity, ChevronDown } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';
import TrendChart from './Partials/TrendChart';
import WeeklyTable from './Partials/WeeklyTable';

export default function StrainMonotony({ auth, weeksData, startDate, endDate }) {
    
    const [selectedMetric, setSelectedMetric] = useState('total_distance');
    const [filterStart, setFilterStart] = useState(startDate || '');
    const [filterEnd, setFilterEnd] = useState(endDate || '');

    const metricOptions = useMemo(() => {
        return FIXED_EXCEL_COLUMNS
            .filter(col => !col.id.includes('_dur') && col.id !== 'total_duration')
            .map(col => ({ value: col.id, label: col.label }));
    }, []);

    const applyDateFilter = () => {
        router.get(route('analysis.strain'), { start_date: filterStart, end_date: filterEnd }, { preserveState: true });
    };

    // HANYA TAMPILKAN 1 KOLOM YANG DIPILIH
    const renderColumns = useMemo(() => {
        const col = FIXED_EXCEL_COLUMNS.find(c => c.id === selectedMetric);
        if (!col) return [];
        return [{ id: col.id, label: col.label }];
    }, [selectedMetric]);

    // Fungsi Pembantu Format Tanggal (DD/MM/YYYY)
    const formatWeekDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const computedWeeks = useMemo(() => {
        if (!weeksData) return []; 
        
        return weeksData.map((week, idx) => {
            const stats = {};

            renderColumns.forEach(col => {
                const values = week.days.map(d => parseFloat(d.averages[col.id]) || 0);
                const weeklyLoad = values.reduce((a, b) => a + b, 0);
                const meanDaily = weeklyLoad / 7;
                
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

            // Ekstrak Tanggal Awal & Akhir Minggu
            const startD = week.start_date || (week.days && week.days[0]?.date);
            const endD = week.end_date || (week.days && week.days[week.days.length - 1]?.date);
            const dateRangeStr = (startD && endD) ? `${formatWeekDate(startD)} - ${formatWeekDate(endD)}` : week.week_label;

            return {
                ...week,
                idx,
                stats,
                weeklyLoad: stats[selectedMetric]?.weeklyLoad || 0,
                monotony: stats[selectedMetric]?.monotony || 0,
                strain: stats[selectedMetric]?.strain || 0,
                name: dateRangeStr, // Dipakai di X-Axis Grafik
                dateRange: dateRangeStr, // Dipakai di Tabel
                tooltipName: `${week.week_label} (${dateRangeStr})`
            };
        });
    }, [weeksData, selectedMetric, renderColumns]);

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Strain & Monotony"
            headerDescription="Analisis rasio kelelahan mingguan berdasarkan variabel fisik tim."
        >
            <Head title="Strain & Monotony Analysis" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* TOOLBAR FILTER */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 lg:p-4 rounded-xl shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between relative transition-colors">
                    
                    <div className="flex items-center gap-3 w-full xl:w-auto flex-1">
                        <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg hidden sm:block shadow-sm">
                            <Activity size={18} strokeWidth={2.5} />
                        </div>
                        <div className="relative w-full sm:w-80 group">
                            <select
                                value={selectedMetric}
                                onChange={e => setSelectedMetric(e.target.value)}
                                className="w-full appearance-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 pl-3.5 pr-10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-1 dark:focus:ring-offset-zinc-950 transition-all shadow-sm cursor-pointer"
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
                        <CalendarIcon size={14} className="text-zinc-400 shrink-0" strokeWidth={2.5}/>
                        <input 
                            type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)}
                            className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none w-full p-0 focus:ring-0 cursor-pointer tabular-nums dark:[color-scheme:dark]"
                        />
                        <span className="text-zinc-300 dark:text-zinc-600 text-xs font-black">-</span>
                        <input 
                            type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)}
                            className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none w-full p-0 focus:ring-0 cursor-pointer tabular-nums dark:[color-scheme:dark]"
                        />
                    </div>
                        <button 
                            onClick={applyDateFilter}
                            className="w-full sm:w-auto px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-zinc-950 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                        >
                            <Search size={14} strokeWidth={2.5} /> Terapkan
                        </button>
                    </div>
                </div>

                <TrendChart 
                    data={computedWeeks} 
                    metricLabel={metricOptions.find(o => o.value === selectedMetric)?.label} 
                />
                <TrendChart 
                    data={computedWeeks} 
                    metricLabel={metricOptions.find(o => o.value === selectedMetric)?.label} 
                />
                <TrendChart 
                    data={computedWeeks} 
                    metricLabel={metricOptions.find(o => o.value === selectedMetric)?.label} 
                />
                <TrendChart 
                    data={computedWeeks} 
                    metricLabel={metricOptions.find(o => o.value === selectedMetric)?.label} 
                />

                <WeeklyTable 
                    weeks={computedWeeks} 
                    columns={renderColumns} 
                />

            </div>
        </AuthenticatedLayout>
    );
}