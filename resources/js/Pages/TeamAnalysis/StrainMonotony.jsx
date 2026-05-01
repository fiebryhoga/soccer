// resources/js/Pages/PerformanceLogs/Analysis/StrainMonotony.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Search, Activity, ChevronDown, ListFilter } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';
import TrendChart from './Partials/TrendChart';
import WeeklyTable from './Partials/WeeklyTable';

export default function StrainMonotony({ auth, weeksData, startDate, endDate }) {
    
    // Default metric 'all' agar otomatis memuat semua variabel
    const [selectedMetric, setSelectedMetric] = useState('all');
    const [filterStart, setFilterStart] = useState(startDate || '');
    const [filterEnd, setFilterEnd] = useState(endDate || '');

    const metricOptions = useMemo(() => {
        const options = FIXED_EXCEL_COLUMNS
            .filter(col => !col.id.includes('_dur') && col.id !== 'total_duration')
            .map(col => ({ value: col.id, label: col.label }));
        return [{ value: 'all', label: 'Tampilkan Semua (Grid)' }, ...options];
    }, []);

    const applyDateFilter = () => {
        router.get(route('analysis.strain'), { start_date: filterStart, end_date: filterEnd }, { preserveState: true });
    };

    // Tentukan kolom mana yang akan di-render
    const renderColumns = useMemo(() => {
        if (selectedMetric === 'all') {
            return FIXED_EXCEL_COLUMNS
                .filter(col => !col.id.includes('_dur') && col.id !== 'total_duration')
                .map(col => ({ id: col.id, label: col.label }));
        }
        const col = FIXED_EXCEL_COLUMNS.find(c => c.id === selectedMetric);
        if (!col) return [];
        return [{ id: col.id, label: col.label }];
    }, [selectedMetric]);

    // Format Date Helper (DD/MM/YYYY)
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

            const startD = week.start_date || (week.days && week.days[0]?.date);
            const endD = week.end_date || (week.days && week.days[week.days.length - 1]?.date);
            const dateRangeStr = (startD && endD) ? `${formatWeekDate(startD)} - ${formatWeekDate(endD)}` : week.week_label;

            return {
                ...week,
                idx,
                stats,
                weeklyLoad: selectedMetric === 'all' ? (stats[renderColumns[0]?.id]?.weeklyLoad || 0) : (stats[selectedMetric]?.weeklyLoad || 0),
                monotony: selectedMetric === 'all' ? (stats[renderColumns[0]?.id]?.monotony || 0) : (stats[selectedMetric]?.monotony || 0),
                strain: selectedMetric === 'all' ? (stats[renderColumns[0]?.id]?.strain || 0) : (stats[selectedMetric]?.strain || 0),
                name: dateRangeStr, 
                dateRange: dateRangeStr, 
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
                            <ListFilter size={18} strokeWidth={2.5} />
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
                            className="w-full sm:w-auto px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Search size={14} strokeWidth={2.5} /> Terapkan
                        </button>
                    </div>
                </div>

                {/* AREA KONTEN (TAMPILAN 2 KOLOM GRID BILA 'ALL' DIPILIH) */}
                {selectedMetric === 'all' ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {renderColumns.map((col) => {
                            // Extract data spesifik untuk masing-masing kolom
                            const dataForCol = computedWeeks.map(week => ({
                                ...week,
                                weeklyLoad: week.stats[col.id]?.weeklyLoad || 0,
                                monotony: week.stats[col.id]?.monotony || 0,
                                strain: week.stats[col.id]?.strain || 0,
                            }));

                            return (
                                <div key={col.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-5 overflow-hidden">
                                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                        <Activity size={18} className="text-orange-500" />
                                        <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{col.label}</h4>
                                    </div>
                                    
                                    {/* Grafik Mini untuk variabel ini */}
                                    <TrendChart 
                                        data={dataForCol} 
                                        metricLabel={col.label} 
                                    />
                                    
                                    {/* Tabel Analisis khusus untuk variabel ini */}
                                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                                        <WeeklyTable 
                                            weeks={dataForCol} 
                                            columns={[col]} 
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // TAMPILAN SINGLE (Jika User memilih 1 Metrik Saja)
                    <div className="space-y-6">
                        <TrendChart 
                            data={computedWeeks} 
                            metricLabel={metricOptions.find(o => o.value === selectedMetric)?.label} 
                        />
                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm bg-white dark:bg-zinc-950 p-1">
                            <WeeklyTable 
                                weeks={computedWeeks} 
                                columns={renderColumns} 
                            />
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}