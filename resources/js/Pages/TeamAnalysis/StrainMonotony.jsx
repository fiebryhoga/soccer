// resources/js/Pages/PerformanceLogs/Analysis/StrainMonotony.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Search, Activity, LayoutGrid, Columns, Square, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';
import TrendChart from './Partials/TrendChart';
import WeeklyTable from './Partials/WeeklyTable';

export default function StrainMonotony({ auth, weeksData, startDate, endDate }) {
    
    const [filterStart, setFilterStart] = useState(startDate || '');
    const [filterEnd, setFilterEnd] = useState(endDate || '');
    const [gridLayout, setGridLayout] = useState(2);
    const [expandedDetails, setExpandedDetails] = useState({});
    const [selectedMetric, setSelectedMetric] = useState('all');

    const applyDateFilter = () => {
        router.get(route('analysis.strain'), { start_date: filterStart, end_date: filterEnd }, { preserveState: true });
    };

    const toggleDetail = (colId) => {
        setExpandedDetails(prev => ({ ...prev, [colId]: !prev[colId] }));
    };

    // 1. FILTER CERDAS: Buang yang berbau durasi dan 'highest'
    // Gunakan col.header sebagai fallback jika col.label undefined
    const validColumns = useMemo(() => {
        return FIXED_EXCEL_COLUMNS
            .filter(col => {
                const idStr = col.id.toLowerCase();
                const labelStr = (col.label || col.header || '').toLowerCase();
                return !idStr.includes('_dur') && 
                       idStr !== 'total_duration' && 
                       !idStr.includes('highest') && 
                       !labelStr.includes('highest');
            })
            .map(col => ({ 
                id: col.id, 
                label: col.header || col.label || col.id.replace(/_/g, ' ') 
            }));
    }, []);

    const metricOptions = useMemo(() => {
        return [{ value: 'all', label: 'Tampilkan Semua (Grid)' }, ...validColumns.map(c => ({ value: c.id, label: c.label }))];
    }, [validColumns]);

    const renderColumns = useMemo(() => {
        if (selectedMetric === 'all') return validColumns;
        const col = validColumns.find(c => c.id === selectedMetric);
        return col ? [col] : [];
    }, [selectedMetric, validColumns]);

    const formatWeekDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    // Pra-kalkulasi semua data untuk SEMUA metrik
    const computedWeeks = useMemo(() => {
        if (!weeksData) return []; 
        
        return weeksData.map((week, idx) => {
            const stats = {};

            validColumns.forEach(col => {
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
                name: dateRangeStr, 
                dateRange: dateRangeStr, 
                tooltipName: `${week.week_label} (${dateRangeStr})`
            };
        });
    }, [weeksData, validColumns]);

    const gridClass = gridLayout === 1 ? 'grid-cols-1' : gridLayout === 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Strain & Monotony"
            headerDescription="Dashboard analitik kelelahan mingguan seluruh metrik skuad."
        >
            <Head title="Strain & Monotony" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* BANNER EDUKASI */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex items-start sm:items-center gap-3 shadow-sm">
                    <Info className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" size={20} />
                    <div className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                        <strong className="text-blue-900 dark:text-blue-200">Konteks Analisis:</strong> <strong>Monotony</strong> di atas <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded text-xs font-black">2.0</span> menunjukkan kurangnya variasi intensitas latihan yang memicu risiko cedera tinggi.
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full sm:w-auto shadow-sm">
                            <CalendarIcon size={14} className="text-zinc-500 dark:text-zinc-400 shrink-0" strokeWidth={2.5}/>
                            <input 
                                type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-zinc-900 dark:text-white outline-none w-full p-0 focus:ring-0 cursor-pointer tabular-nums dark:[color-scheme:dark]"
                            />
                            <span className="text-zinc-400 dark:text-zinc-600 text-xs font-black">-</span>
                            <input 
                                type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-zinc-900 dark:text-white outline-none w-full p-0 focus:ring-0 cursor-pointer tabular-nums dark:[color-scheme:dark]"
                            />
                        </div>
                        <button 
                            onClick={applyDateFilter}
                            className="w-full sm:w-auto px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Search size={14} strokeWidth={2.5} /> Terapkan
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <div className="relative w-full sm:w-48 group mr-2">
                            <select
                                value={selectedMetric}
                                onChange={e => setSelectedMetric(e.target.value)}
                                className="w-full appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[11px] font-bold py-2 pl-3 pr-8 text-zinc-900 dark:text-white focus:outline-none transition-all shadow-sm cursor-pointer truncate"
                            >
                                {metricOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} strokeWidth={3} />
                        </div>
                        
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-inner w-full sm:w-auto justify-center">
                            <button onClick={() => setGridLayout(1)} className={`p-1.5 flex-1 sm:flex-none rounded flex justify-center transition-all ${gridLayout === 1 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}><Square size={16} strokeWidth={3} /></button>
                            <button onClick={() => setGridLayout(2)} className={`p-1.5 flex-1 sm:flex-none rounded flex justify-center transition-all ${gridLayout === 2 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}><Columns size={16} strokeWidth={3} /></button>
                            <button onClick={() => setGridLayout(3)} className={`p-1.5 flex-1 sm:flex-none rounded flex justify-center transition-all ${gridLayout === 3 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}><LayoutGrid size={16} strokeWidth={3} /></button>
                        </div>
                    </div>
                </div>

                {/* AREA KONTEN GRID */}
                <div className={`grid gap-6 items-start ${gridClass}`}>
                    {renderColumns.map((col) => {
                        const dataForCol = computedWeeks.map(week => ({
                            ...week,
                            weeklyLoad: week.stats[col.id]?.weeklyLoad || 0,
                            meanDaily: week.stats[col.id]?.meanDaily || 0,
                            stdDev: week.stats[col.id]?.stdDev || 0,
                            monotony: week.stats[col.id]?.monotony || 0,
                            strain: week.stats[col.id]?.strain || 0,
                        }));

                        const isDetailOpen = expandedDetails[col.id];

                        return (
                            <div key={col.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all h-full">
                                
                                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-lg shadow-sm">
                                            <Activity size={16} strokeWidth={2.5} />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white truncate">{col.label}</h4>
                                    </div>
                                </div>
                                
                                <div className="p-4 flex-1">
                                    <TrendChart data={dataForCol} metricLabel={col.label} />
                                </div>

                                <button 
                                    onClick={() => toggleDetail(col.id)}
                                    className={`w-full py-3.5 px-5 flex items-center justify-between font-bold text-xs uppercase tracking-widest transition-colors border-t border-zinc-200 dark:border-zinc-800 ${isDetailOpen ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'}`}
                                >
                                    <span>{isDetailOpen ? 'Tutup Detail Mingguan' : 'Lihat Detail Mingguan'}</span>
                                    {isDetailOpen ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
                                </button>

                                {isDetailOpen && (
                                    <div className="bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-300">
                                        <WeeklyTable weeks={dataForCol} activeCol={col} />
                                    </div>
                                )}

                            </div>
                        );
                    })}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}