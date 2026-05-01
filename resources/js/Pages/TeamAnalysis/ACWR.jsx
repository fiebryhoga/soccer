// resources/js/Pages/PerformanceLogs/Analysis/ACWR.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Search, Activity, LayoutGrid, Columns, Square, ChevronDown, ChevronUp, ShieldCheck, Info } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';
import ACWRChart from './Partials/ACWRChart';
import ACWRTable from './Partials/ACWRTable';

export default function ACWR({ auth, historicalData, startDate, endDate }) {
    
    const [filterStart, setFilterStart] = useState(startDate || '');
    const [filterEnd, setFilterEnd] = useState(endDate || '');
    
    // Default Grid: 2 Kolom
    const [gridLayout, setGridLayout] = useState(2);
    
    // State Accordion per metrik
    const [expandedDetails, setExpandedDetails] = useState({});
    
    const [selectedMetric, setSelectedMetric] = useState('all');

    const applyDateFilter = () => {
        router.get(route('analysis.acwr'), { start_date: filterStart, end_date: filterEnd }, { preserveState: true });
    };

    const toggleDetail = (colId) => {
        setExpandedDetails(prev => ({ ...prev, [colId]: !prev[colId] }));
    };

    // Filter kolom metrik valid (Abaikan durasi dan 'highest')
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

    // KALKULASI EWMA MASSAL UNTUK SEMUA METRIK SEKALIGUS
    const computedACWR = useMemo(() => {
        if (!historicalData || historicalData.length === 0) return [];

        // Inisialisasi Prev Acute & Chronic untuk masing-masing kolom
        const prevStats = {};
        validColumns.forEach(c => {
            prevStats[c.id] = { acute: null, chronic: null };
        });

        const dataWithEWMA = historicalData.map((day) => {
            const dayStats = {};

            validColumns.forEach(col => {
                const val = parseFloat(day.averages[col.id]) || 0;
                let acute, chronic, acwr;

                if (prevStats[col.id].acute === null && prevStats[col.id].chronic === null) {
                    acute = val;
                    chronic = val;
                } else {
                    acute = (0.25 * val) + (0.75 * prevStats[col.id].acute);
                    chronic = (0.069 * val) + (0.931 * prevStats[col.id].chronic);
                }

                acwr = chronic > 0 ? (acute / chronic) : 0;

                prevStats[col.id].acute = acute;
                prevStats[col.id].chronic = chronic;

                dayStats[col.id] = { val, acute, chronic, acwr };
            });

            return {
                ...day,
                stats: dayStats,
                name: day.title === 'off' ? 'OFF' : day.title,
                xLabel: day.day_name.split(',')[1]?.trim() || day.day_name 
            };
        });

        // Terapkan filter tanggal (jika ada)
        return dataWithEWMA.filter(d => d.date >= startDate && d.date <= endDate);
    }, [historicalData, validColumns, startDate, endDate]);

    const gridClass = gridLayout === 1 ? 'grid-cols-1' : gridLayout === 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Acute:Chronic Workload Ratio (ACWR)"
            headerDescription="Dashboard analitik keseimbangan beban harian seluruh metrik skuad."
        >
            <Head title="ACWR Analysis" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* BANNER EDUKASI */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex items-start sm:items-center gap-3 shadow-sm">
                    <Info className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" size={20} />
                    <div className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                        <strong className="text-blue-900 dark:text-blue-200">Konteks ACWR:</strong> Memantau lonjakan beban dengan metode EWMA. Rasio <strong className="text-emerald-600 dark:text-emerald-400">0.8 - 1.3</strong> adalah zona optimal (Safe Zone). Rasio di atas <strong className="text-red-600 dark:text-red-400">1.5</strong> masuk zona bahaya (Danger Zone) yang meningkatkan risiko cedera.
                    </div>
                </div>

                {/* TOOLBAR: Filter Tanggal & Toggle Grid */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
                    
                    {/* Filter Tanggal & Dropdown Metrik */}
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

                    {/* Pengatur Layout Grid & Metrik Dropdown */}
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

                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hidden lg:block">Grid:</span>
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-inner w-full sm:w-auto justify-center">
                            <button onClick={() => setGridLayout(1)} className={`p-1.5 flex-1 sm:flex-none rounded flex justify-center transition-all ${gridLayout === 1 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`} title="1 Kolom"><Square size={16} strokeWidth={3} /></button>
                            <button onClick={() => setGridLayout(2)} className={`p-1.5 flex-1 sm:flex-none rounded flex justify-center transition-all ${gridLayout === 2 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`} title="2 Kolom"><Columns size={16} strokeWidth={3} /></button>
                            <button onClick={() => setGridLayout(3)} className={`p-1.5 flex-1 sm:flex-none rounded flex justify-center transition-all ${gridLayout === 3 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`} title="3 Kolom"><LayoutGrid size={16} strokeWidth={3} /></button>
                        </div>
                    </div>
                </div>

                {/* AREA KONTEN: MASSIVE GRID */}
                <div className={`grid gap-6 items-start ${gridClass}`}>
                    {renderColumns.map((col) => {
                        
                        // Ekstrak data spesifik per metrik untuk chart & table
                        const dataForCol = computedACWR.map(day => ({
                            ...day,
                            val: day.stats[col.id]?.val || 0,
                            acute: day.stats[col.id]?.acute || 0,
                            chronic: day.stats[col.id]?.chronic || 0,
                            acwr: day.stats[col.id]?.acwr || 0,
                        }));

                        const isDetailOpen = expandedDetails[col.id];

                        return (
                            <div key={col.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all h-full">
                                
                                {/* Header Card Metrik */}
                                <div className="flex items-center justify-between p-4 md:p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-lg shadow-sm">
                                            <Activity size={18} strokeWidth={2.5} />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white truncate">{col.label}</h4>
                                    </div>
                                </div>
                                
                                {/* Area Chart Utama */}
                                <div className="p-4 md:p-5 flex-1">
                                    <ACWRChart data={dataForCol} metricLabel={col.label} />
                                </div>

                                {/* Tombol Expand Detail */}
                                <button 
                                    onClick={() => toggleDetail(col.id)}
                                    className={`w-full py-3.5 px-5 flex items-center justify-between font-bold text-xs uppercase tracking-widest transition-colors border-t border-zinc-200 dark:border-zinc-800 ${isDetailOpen ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'}`}
                                >
                                    <span>{isDetailOpen ? 'Tutup Detail ACWR' : 'Lihat Detail ACWR'}</span>
                                    {isDetailOpen ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
                                </button>

                                {/* Area Tabel Detail (Animasi Collapsible) */}
                                {isDetailOpen && (
                                    <div className="bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-300">
                                        <ACWRTable data={dataForCol} />
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