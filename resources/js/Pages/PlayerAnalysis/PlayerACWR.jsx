// resources/js/Pages/PerformanceLogs/Analysis/PlayerACWR.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Search, Percent, ChevronDown, ChevronUp, User, LayoutGrid, Columns, Square } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

import PlayerACWRChart from './Partials/PlayerACWRChart';
import PlayerACWRTable from './Partials/PlayerACWRTable';

export default function PlayerACWR({ auth, players, selectedPlayerId, dailyLogs, startDate, endDate }) {
    
    const [selectedPlayer, setSelectedPlayer] = useState(selectedPlayerId || '');
    const [filterStart, setFilterStart] = useState(startDate || '');
    const [filterEnd, setFilterEnd] = useState(endDate || '');

    // State Grid & Accordion
    const [gridLayout, setGridLayout] = useState(2);
    const [expandedDetails, setExpandedDetails] = useState({});

    const applyFilters = () => {
        router.get(route('analysis.player.acwr'), { 
            player_id: selectedPlayer,
            start_date: filterStart, 
            end_date: filterEnd 
        }, { preserveState: true });
    };

    const toggleDetail = (colId) => {
        setExpandedDetails(prev => ({ ...prev, [colId]: !prev[colId] }));
    };

    // Filter Kolom: Buang _dur, total_duration, dan highest
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

    const formatDayDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    // LOGIKA EWMA ACWR HARIAN UNTUK SEMUA METRIK SEKALIGUS
    const computedDays = useMemo(() => {
        if (!dailyLogs || dailyLogs.length === 0) return []; 
        
        const logDict = {};
        dailyLogs.forEach(log => {
            if (!logDict[log.date]) {
                logDict[log.date] = { ...log, metrics: { ...log.metrics } };
            } else {
                Object.keys(log.metrics).forEach(key => {
                    logDict[log.date].metrics[key] = (parseFloat(logDict[log.date].metrics[key]) || 0) + parseFloat(log.metrics[key]);
                });
                logDict[log.date].title += ` & ${log.title}`;
            }
        });

        const firstLogDate = dailyLogs[0].date; 
        const startD = new Date(firstLogDate);
        const endD = new Date(endDate);
        
        const allDays = [];
        for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const existingLog = logDict[dateStr];
            allDays.push({
                date: dateStr,
                title: existingLog ? existingLog.title : 'Rest / Off',
                type: existingLog ? existingLog.type : 'off',
                metrics: existingLog ? existingLog.metrics : {},
                day_name: existingLog ? existingLog.day_name : new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long' })
            });
        }

        const lambdaAcute = 2 / (7 + 1);      
        const lambdaChronic = 2 / (28 + 1);   

        const results = [];
        let prevEWMA = {}; 

        allDays.forEach((day, index) => {
            const stats = {};

            validColumns.forEach(col => {
                const dailyLoad = day.metrics ? parseFloat(day.metrics[col.id]) || 0 : 0;
                
                let acuteEWMA = 0;
                let chronicEWMA = 0;

                if (index === 0) {
                    acuteEWMA = dailyLoad;
                    chronicEWMA = dailyLoad;
                } else {
                    const prevAcute = prevEWMA[col.id]?.acute || 0;
                    const prevChronic = prevEWMA[col.id]?.chronic || 0;

                    acuteEWMA = (dailyLoad * lambdaAcute) + ((1 - lambdaAcute) * prevAcute);
                    chronicEWMA = (dailyLoad * lambdaChronic) + ((1 - lambdaChronic) * prevChronic);
                }

                if (!prevEWMA[col.id]) prevEWMA[col.id] = {};
                prevEWMA[col.id].acute = acuteEWMA;
                prevEWMA[col.id].chronic = chronicEWMA;

                const acwr = chronicEWMA > 0 ? (acuteEWMA / chronicEWMA) : 0;

                stats[col.id] = { dailyLoad, acuteLoad: acuteEWMA, chronicLoad: chronicEWMA, acwr };
            });

            if (day.date >= startDate) {
                results.push({
                    ...day,
                    idx: index,
                    stats,
                    name: formatDayDate(day.date),
                    tooltipName: `${day.title} (${formatDayDate(day.date)})`
                });
            }
        });

        return results;
    }, [dailyLogs, validColumns, startDate, endDate]);

    const activePlayer = players.find(p => p.id === parseInt(selectedPlayer));
    const playerName = activePlayer ? activePlayer.name : 'Pilih Pemain';

    const gridClass = gridLayout === 1 ? 'grid-cols-1' : gridLayout === 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';

    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Daily ACWR" headerDescription="Rasio Beban Akut:Kronik bergulir (Rolling Daily) per pemain.">
            <Head title={`ACWR - ${playerName}`} />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* TOOLBAR FILTER */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col xl:flex-row gap-4 justify-between transition-colors">
                    
                    {/* Pemilihan Pemain */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto flex-1">
                        <div className="relative w-full sm:w-80 group">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 z-10 pointer-events-none">
                                <User size={18} strokeWidth={2.5}/>
                            </div>
                            <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} className="w-full appearance-none bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-sm font-black py-2.5 pl-10 pr-10 text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm cursor-pointer truncate">
                                <option value="">-- Pilih Pemain --</option>
                                {players.map(p => (<option key={p.id} value={p.id}>[{String(p.position_number).padStart(2, '0')}] {p.name}</option>))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" size={16} strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Filter Tanggal & Pengatur Grid */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto xl:pl-6 xl:border-l border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full sm:w-auto shadow-sm">
                            <CalendarIcon size={14} className="text-zinc-400 shrink-0" strokeWidth={2.5}/>
                            <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none w-full p-0 focus:ring-0 cursor-pointer tabular-nums dark:[color-scheme:dark]" />
                            <span className="text-zinc-300 dark:text-zinc-600 text-xs font-black">-</span>
                            <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none w-full p-0 focus:ring-0 cursor-pointer tabular-nums dark:[color-scheme:dark]" />
                        </div>
                        <button onClick={applyFilters} className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <Search size={14} strokeWidth={2.5} /> Update ACWR
                        </button>

                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-inner w-full sm:w-auto justify-center ml-0 sm:ml-2">
                            <button onClick={() => setGridLayout(1)} className={`p-1.5 flex-1 sm:flex-none rounded flex justify-center transition-all ${gridLayout === 1 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`} title="1 Kolom"><Square size={16} strokeWidth={3} /></button>
                            <button onClick={() => setGridLayout(2)} className={`p-1.5 flex-1 sm:flex-none rounded flex justify-center transition-all ${gridLayout === 2 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`} title="2 Kolom"><Columns size={16} strokeWidth={3} /></button>
                            <button onClick={() => setGridLayout(3)} className={`p-1.5 flex-1 sm:flex-none rounded flex justify-center transition-all ${gridLayout === 3 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`} title="3 Kolom"><LayoutGrid size={16} strokeWidth={3} /></button>
                        </div>
                    </div>
                </div>

                {/* AREA HASIL: MASSIVE GRID */}
                <div className={`grid gap-6 items-start ${gridClass}`}>
                    {validColumns.map((col) => {
                        
                        // Ekstrak data spesifik per metrik untuk chart & table
                        const dataForCol = computedDays.map(day => ({
                            ...day,
                            dailyLoad: day.stats[col.id]?.dailyLoad || 0,
                            acuteLoad: day.stats[col.id]?.acuteLoad || 0,
                            chronicLoad: day.stats[col.id]?.chronicLoad || 0,
                            acwr: day.stats[col.id]?.acwr || 0,
                        }));

                        const isDetailOpen = expandedDetails[col.id];

                        return (
                            <div key={col.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all h-full">
                                
                                <div className="flex items-center justify-between p-4 md:p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-lg shadow-sm">
                                            <Percent size={18} strokeWidth={2.5} />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white truncate">{col.label}</h4>
                                    </div>
                                </div>
                                
                                <div className="p-4 md:p-5 flex-1">
                                    <PlayerACWRChart data={dataForCol} metricLabel={col.label} />
                                </div>

                                <button 
                                    onClick={() => toggleDetail(col.id)}
                                    className={`w-full py-3.5 px-5 flex items-center justify-between font-bold text-xs uppercase tracking-widest transition-colors border-t border-zinc-200 dark:border-zinc-800 ${isDetailOpen ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'}`}
                                >
                                    <span>{isDetailOpen ? 'Tutup Detail ACWR' : 'Lihat Detail ACWR'}</span>
                                    {isDetailOpen ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
                                </button>

                                {isDetailOpen && (
                                    <div className="bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-300">
                                        <PlayerACWRTable days={dataForCol} activeCol={col} playerName={playerName} />
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