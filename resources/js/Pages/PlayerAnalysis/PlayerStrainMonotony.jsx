// resources/js/Pages/Analysis/PlayerStrainMonotony.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Search, Activity, ChevronDown, ListFilter, User } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

import TrendChart from './Partials/TrendChart';
import PlayerWeeklyTable from './Partials/PlayerWeeklyTable'; // Kita buat komponen baru khusus Player

export default function PlayerStrainMonotony({ auth, players, selectedPlayerId, weeksData, startDate, endDate }) {
    
    const [selectedPlayer, setSelectedPlayer] = useState(selectedPlayerId || '');
    const [selectedMetric, setSelectedMetric] = useState('all');
    const [filterStart, setFilterStart] = useState(startDate || '');
    const [filterEnd, setFilterEnd] = useState(endDate || '');

    const metricOptions = useMemo(() => {
        const options = FIXED_EXCEL_COLUMNS
            .filter(col => !col.id.includes('_dur') && col.id !== 'total_duration')
            .map(col => ({ value: col.id, label: col.label }));
        return [{ value: 'all', label: 'Tampilkan Semua Metrik' }, ...options];
    }, []);

    const applyFilters = () => {
        router.get(route('analysis.player.strain'), { 
            player_id: selectedPlayer,
            start_date: filterStart, 
            end_date: filterEnd 
        }, { preserveState: true });
    };

    const renderColumns = useMemo(() => {
        if (selectedMetric === 'all') {
            return FIXED_EXCEL_COLUMNS
                .filter(col => !col.id.includes('_dur') && col.id !== 'total_duration')
                .map(col => ({ id: col.id, label: col.label }));
        }
        const col = FIXED_EXCEL_COLUMNS.find(c => c.id === selectedMetric);
        return col ? [{ id: col.id, label: col.label }] : [];
    }, [selectedMetric]);

    const formatWeekDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    // KALKULASI MUTLAK PER-PEMAIN
    const computedWeeks = useMemo(() => {
        if (!weeksData) return []; 
        
        return weeksData.map((week, idx) => {
            const stats = {};

            renderColumns.forEach(col => {
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
                weeklyLoad: selectedMetric === 'all' ? (stats[renderColumns[0]?.id]?.weeklyLoad || 0) : (stats[selectedMetric]?.weeklyLoad || 0),
                monotony: selectedMetric === 'all' ? (stats[renderColumns[0]?.id]?.monotony || 0) : (stats[selectedMetric]?.monotony || 0),
                strain: selectedMetric === 'all' ? (stats[renderColumns[0]?.id]?.strain || 0) : (stats[selectedMetric]?.strain || 0),
                name: dateRangeStr, 
                dateRange: dateRangeStr, 
                tooltipName: `${week.week_label} (${dateRangeStr})`
            };
        });
    }, [weeksData, selectedMetric, renderColumns]);

    const activePlayer = players.find(p => p.id === parseInt(selectedPlayer));
    const playerName = activePlayer ? activePlayer.name : 'Pilih Pemain';

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Player Strain & Monotony"
            headerDescription="Pantau perkembangan beban fisik, kelelahan, dan risiko cedera per individu."
        >
            <Head title={`Player Analysis - ${playerName}`} />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* TOOLBAR KHUSUS PLAYER */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col xl:flex-row gap-4 justify-between relative transition-colors">
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto flex-1">
                        
                        {/* Dropdown Nama Pemain */}
                        <div className="relative w-full sm:w-72 group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 z-10 pointer-events-none">
                                <User size={18} strokeWidth={2.5}/>
                            </div>
                            <select
                                value={selectedPlayer}
                                onChange={e => setSelectedPlayer(e.target.value)}
                                className="w-full appearance-none bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-lg text-sm font-black py-2.5 pl-10 pr-10 text-orange-700 dark:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm cursor-pointer"
                            >
                                {players.map(p => (
                                    <option key={p.id} value={p.id}>[{String(p.position_number).padStart(2, '0')}] {p.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" size={16} strokeWidth={2.5} />
                        </div>

                        {/* Dropdown Metrik */}
                        <div className="relative w-full sm:w-64 group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none">
                                <ListFilter size={16} strokeWidth={2.5}/>
                            </div>
                            <select
                                value={selectedMetric}
                                onChange={e => setSelectedMetric(e.target.value)}
                                className="w-full appearance-none bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold py-2.5 pl-10 pr-10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm cursor-pointer"
                            >
                                {metricOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto xl:pl-6 xl:border-l border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-lg w-full sm:w-auto shadow-sm">
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
                            className="w-full sm:w-auto px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Search size={14} strokeWidth={2.5} /> Analisis Pemain
                        </button>
                    </div>
                </div>

                {/* AREA HASIL: Identitas Pemain & Konten */}
                <div className="space-y-6">
                    {selectedMetric === 'all' ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {renderColumns.map((col) => {
                                const dataForCol = computedWeeks.map(week => ({
                                    ...week,
                                    weeklyLoad: week.stats[col.id]?.weeklyLoad || 0,
                                    monotony: week.stats[col.id]?.monotony || 0,
                                    strain: week.stats[col.id]?.strain || 0,
                                }));

                                return (
                                    <div key={col.id} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-5 overflow-hidden">
                                        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                            <Activity size={18} className="text-orange-500" />
                                            <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{col.label}</h4>
                                        </div>
                                        <TrendChart data={dataForCol} metricLabel={col.label} />
                                        <PlayerWeeklyTable weeks={dataForCol} columns={[col]} playerName={playerName} />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <TrendChart 
                                data={computedWeeks} 
                                metricLabel={metricOptions.find(o => o.value === selectedMetric)?.label} 
                            />
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm bg-white dark:bg-[#0a0a0a] p-1">
                                <PlayerWeeklyTable 
                                    weeks={computedWeeks} 
                                    columns={renderColumns} 
                                    playerName={playerName}
                                />
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}