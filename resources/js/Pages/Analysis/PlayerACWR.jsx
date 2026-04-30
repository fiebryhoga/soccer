import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Search, Percent, ChevronDown, ListFilter, User } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

import PlayerACWRChart from './Partials/PlayerACWRChart';
import PlayerACWRTable from './Partials/PlayerACWRTable';

export default function PlayerACWR({ auth, players, selectedPlayerId, dailyLogs, startDate, endDate }) {
    
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
        router.get(route('analysis.player.acwr'), { 
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

    const formatDayDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };
    // LOGIKA EWMA ACWR HARIAN (Exponentially Weighted Moving Average)
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

        // PERBAIKAN KRUSIAL: Titik mulai EWMA adalah TANGGAL LOG PERTAMA yang tersedia!
        // Bukan dipaksa mundur 28 hari yang mungkin kosong (0).
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
                metrics: existingLog ? existingLog.metrics : {}
            });
        }

        // Rumus Lambda EWMA
        const lambdaAcute = 2 / (7 + 1);      // 0.25
        const lambdaChronic = 2 / (28 + 1);   // ~0.069

        const results = [];
        let prevEWMA = {}; 

        allDays.forEach((day, index) => {
            const stats = {};

            renderColumns.forEach(col => {
                const dailyLoad = day.metrics ? parseFloat(day.metrics[col.id]) || 0 : 0;
                
                let acuteEWMA = 0;
                let chronicEWMA = 0;

                // Hari Pertama (Index 0) DIPASTIKAN adalah log performa nyata, bukan 0
                if (index === 0) {
                    acuteEWMA = dailyLoad;
                    chronicEWMA = dailyLoad;
                } else {
                    const prevAcute = prevEWMA[col.id]?.acute || 0;
                    const prevChronic = prevEWMA[col.id]?.chronic || 0;

                    // Kalkulasi EWMA sesuai standar formula
                    acuteEWMA = (dailyLoad * lambdaAcute) + ((1 - lambdaAcute) * prevAcute);
                    chronicEWMA = (dailyLoad * lambdaChronic) + ((1 - lambdaChronic) * prevChronic);
                }

                if (!prevEWMA[col.id]) prevEWMA[col.id] = {};
                prevEWMA[col.id].acute = acuteEWMA;
                prevEWMA[col.id].chronic = chronicEWMA;

                const acwr = chronicEWMA > 0 ? (acuteEWMA / chronicEWMA) : 0;

                stats[col.id] = { dailyLoad, acuteLoad: acuteEWMA, chronicLoad: chronicEWMA, acwr };
            });

            // Hanya tampilkan data di rentang filter startDate user
            if (day.date >= startDate) {
                const activeColId = renderColumns.length > 0 ? renderColumns[0].id : null;
                results.push({
                    ...day,
                    idx: index,
                    stats,
                    dailyLoad: activeColId ? (stats[activeColId]?.dailyLoad || 0) : 0,
                    acuteLoad: activeColId ? (stats[activeColId]?.acuteLoad || 0) : 0,
                    chronicLoad: activeColId ? (stats[activeColId]?.chronicLoad || 0) : 0,
                    acwr: activeColId ? (stats[activeColId]?.acwr || 0) : 0,
                    name: formatDayDate(day.date),
                    tooltipName: `${day.title} (${formatDayDate(day.date)})`
                });
            }
        });

        return results;
    }, [dailyLogs, selectedMetric, renderColumns, startDate, endDate]);

    const activePlayer = players.find(p => p.id === parseInt(selectedPlayer));
    const playerName = activePlayer ? activePlayer.name : 'Pilih Pemain';

    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Daily ACWR" headerDescription="Rasio Beban Akut:Kronik bergulir (Rolling Daily) untuk memantau zona cedera.">
            <Head title={`ACWR - ${playerName}`} />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                {/* TOOLBAR FILTER */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col xl:flex-row gap-4 justify-between relative transition-colors">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto flex-1">
                        <div className="relative w-full sm:w-72 group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 z-10 pointer-events-none">
                                <User size={18} strokeWidth={2.5}/>
                            </div>
                            <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} className="w-full appearance-none bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-sm font-black py-2.5 pl-10 pr-10 text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm cursor-pointer">
                                {players.map(p => (<option key={p.id} value={p.id}>[{String(p.position_number).padStart(2, '0')}] {p.name}</option>))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" size={16} strokeWidth={2.5} />
                        </div>
                        <div className="relative w-full sm:w-64 group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none">
                                <ListFilter size={16} strokeWidth={2.5}/>
                            </div>
                            <select value={selectedMetric} onChange={e => setSelectedMetric(e.target.value)} className="w-full appearance-none bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold py-2.5 pl-10 pr-10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm cursor-pointer">
                                {metricOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto xl:pl-6 xl:border-l border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-lg w-full sm:w-auto shadow-sm">
                            <CalendarIcon size={14} className="text-zinc-400 shrink-0" strokeWidth={2.5}/>
                            <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none w-full p-0 focus:ring-0 cursor-pointer tabular-nums dark:[color-scheme:dark]" />
                            <span className="text-zinc-300 dark:text-zinc-600 text-xs font-black">-</span>
                            <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none w-full p-0 focus:ring-0 cursor-pointer tabular-nums dark:[color-scheme:dark]" />
                        </div>
                        <button onClick={applyFilters} className="w-full sm:w-auto px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <Search size={14} strokeWidth={2.5} /> Update ACWR
                        </button>
                    </div>
                </div>

                {/* AREA TAMPILAN DATA HARIAN */}
                <div className="space-y-6">
                    {selectedMetric === 'all' ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {renderColumns.map((col) => {
                                const dataForCol = computedDays.map(day => ({
                                    ...day,
                                    dailyLoad: day.stats[col.id]?.dailyLoad || 0,
                                    acwr: day.stats[col.id]?.acwr || 0,
                                }));
                                return (
                                    <div key={col.id} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-5 overflow-hidden">
                                        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                            <Percent size={18} className="text-emerald-500" />
                                            <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{col.label}</h4>
                                        </div>
                                        <PlayerACWRChart data={dataForCol} metricLabel={col.label} />
                                        <PlayerACWRTable days={computedDays} columns={[col]} playerName={playerName} />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <PlayerACWRChart data={computedDays} metricLabel={metricOptions.find(o => o.value === selectedMetric)?.label} />
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm bg-white dark:bg-[#0a0a0a] p-1">
                                <PlayerACWRTable days={computedDays} columns={renderColumns} playerName={playerName} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}