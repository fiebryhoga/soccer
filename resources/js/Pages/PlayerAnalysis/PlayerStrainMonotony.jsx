// resources/js/Pages/Analysis/PlayerStrainMonotony.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Search, Activity, User, LayoutGrid, Columns, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

import TrendChart from './Partials/TrendChart';
import PlayerWeeklyTable from './Partials/PlayerWeeklyTable';

export default function PlayerStrainMonotony({ auth, players, selectedPlayerId, weeksData, startDate, endDate }) {
    
    const [selectedPlayer, setSelectedPlayer] = useState(selectedPlayerId || '');
    const [filterStart, setFilterStart] = useState(startDate || '');
    const [filterEnd, setFilterEnd] = useState(endDate || '');

    // State Pengaturan Grid (Default 2 Kolom)
    const [gridLayout, setGridLayout] = useState(2);
    
    // State Accordion per metrik
    const [expandedDetails, setExpandedDetails] = useState({});

    const applyFilters = () => {
        router.get(route('analysis.player.strain'), { 
            player_id: selectedPlayer,
            start_date: filterStart, 
            end_date: filterEnd 
        }, { preserveState: true });
    };

    const toggleDetail = (colId) => {
        setExpandedDetails(prev => ({ ...prev, [colId]: !prev[colId] }));
    };

    // Filter kolom metrik valid (Abaikan durasi, total, dan highest)
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

    const formatWeekDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    // KALKULASI MUTLAK PER-PEMAIN UNTUK SEMUA METRIK SEKALIGUS
    const computedWeeks = useMemo(() => {
        if (!weeksData) return []; 
        
        return weeksData.map((week, idx) => {
            const stats = {};

            validColumns.forEach(col => {
                // MURNI AMBIL DATA INDIVIDU DARI d.metrics
                const values = week.days.map(d => {
                    const val = d.metrics ? parseFloat(d.metrics[col.id]) : 0;
                    return isNaN(val) ? 0 : val;
                });

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

    const activePlayer = players.find(p => p.id === parseInt(selectedPlayer));
    const playerName = activePlayer ? activePlayer.name : 'Pilih Pemain';

    const gridClass = gridLayout === 1 ? 'grid-cols-1' : gridLayout === 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Player Strain & Monotony"
            headerDescription="Pantau perkembangan beban fisik, kelelahan, dan risiko cedera per individu."
        >
            <Head title={`Player Analysis - ${playerName}`} />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* TOOLBAR KHUSUS PLAYER */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col xl:flex-row gap-4 justify-between transition-colors">
                    
                    {/* Pilih Pemain */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto flex-1">
                        <div className="relative w-full sm:w-80 group">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500 z-10 pointer-events-none">
                                <User size={18} strokeWidth={2.5}/>
                            </div>
                            <select
                                value={selectedPlayer}
                                onChange={e => setSelectedPlayer(e.target.value)}
                                className="w-full appearance-none bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-lg text-sm font-black py-2.5 pl-10 pr-10 text-orange-700 dark:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm cursor-pointer truncate"
                            >
                                <option value="">-- Pilih Pemain --</option>
                                {players.map(p => (
                                    <option key={p.id} value={p.id}>[{String(p.position_number).padStart(2, '0')}] {p.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" size={16} strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Filter Tanggal & Pengatur Grid */}
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
                            onClick={applyFilters}
                            className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Search size={14} strokeWidth={2.5} /> Terapkan
                        </button>

                        {/* Pengatur Layout Grid */}
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
                                
                                <div className="flex items-center justify-between p-4 md:p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 rounded-lg shadow-sm">
                                            <Activity size={18} strokeWidth={2.5} />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white truncate">{col.label}</h4>
                                    </div>
                                </div>
                                
                                <div className="p-4 md:p-5 flex-1">
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
                                        <PlayerWeeklyTable weeks={dataForCol} activeCol={col} playerName={playerName} />
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