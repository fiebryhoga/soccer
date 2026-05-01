// resources/js/Pages/PerformanceLogs/Partials/AnalysisTab.jsx

import React, { useMemo } from 'react';
import { Calendar, Trophy, Target, PlusCircle, Users, Activity, BarChart2 } from 'lucide-react';
import SummaryCards from './SummaryCards';
import Leaderboard from './Leaderboard';
import CustomChartWrapper from './Chart/CustomChartWrapper';

export default function AnalysisTab({ log, data, setData, calculateTeamPercentage }) {
    const isMatch = log.type === 'match';
    const charts = data.custom_charts || [];

    const quickStats = useMemo(() => {
        const total = data.players_data.length;
        const active = data.players_data.filter(p => p.is_playing !== false).length;
        const hasData = data.players_data.filter(p => {
            return Object.entries(p.metrics).some(([key, val]) => 
                !['selected', 'selected_hr4', 'selected_hr5', 'selected_pl'].includes(key) && 
                val !== '' && val !== null && !isNaN(val)
            );
        }).length;
        return { total, active, hasData };
    }, [data.players_data]);

    const addChart = () => {
        const newChart = { id: Date.now().toString(), selectedParams: [], paramColors: {}, chartType: 'bar', sortBy: 'position', sortOrder: 'desc', isZoomed: true, customTitle: '' };
        setData('custom_charts', [...charts, newChart]);
    };

    const updateChart = (chartId, updatedConfig) => setData('custom_charts', charts.map(c => c.id === chartId ? { ...c, ...updatedConfig } : c));
    const removeChart = (chartId) => setData('custom_charts', charts.filter(c => c.id !== chartId));

    const formattedDate = new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col w-full space-y-8 pb-10">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none text-zinc-900 dark:text-white">
                    {isMatch ? <Trophy size={150} strokeWidth={1} /> : <Target size={150} strokeWidth={1} />}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm">
                            {isMatch ? <Trophy size={24} /> : <Target size={24} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                                    Analisis: {log.title}
                                </h2>
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                    {isMatch ? 'Match' : 'Training'}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                <Calendar size={14} /> {formattedDate}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1"><Users size={12} /> Skuad</span>
                            <span className="text-lg font-black text-zinc-900 dark:text-white">{quickStats.total} <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pemain</span></span>
                        </div>
                        <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1"><Activity size={12} /> Aktif</span>
                            <span className="text-lg font-black text-zinc-900 dark:text-white">{quickStats.active} <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Terlibat</span></span>
                        </div>
                        <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1"><BarChart2 size={12} /> Terekam</span>
                            <span className="text-lg font-black text-zinc-900 dark:text-white">{quickStats.hasData} <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Data</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Ringkasan Metrik Top</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Highlight pencapaian tertinggi dari seluruh skuad pada sesi ini.</p>
                </div>
                <SummaryCards playersData={data.players_data} isMatch={isMatch} />
            </div>

            <div className="pt-4">
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2"><BarChart2 size={18} /> Visualisasi & Komparasi</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Buat grafik perbandingan khusus untuk membedah data pemain lebih dalam.</p>
                    </div>
                    <button onClick={addChart} type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-bold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all">
                        <PlusCircle size={16} /> Tambah Grafik
                    </button>
                </div>
                
                <div className="space-y-8">
                    {charts.length === 0 ? (
                        <div className="w-full py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/20">
                            <BarChart2 size={32} className="text-zinc-400 dark:text-zinc-600" />
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Belum ada grafik kustom yang ditambahkan.</p>
                            <button onClick={addChart} type="button" className="text-sm font-bold text-zinc-900 dark:text-white underline decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-zinc-900 dark:hover:decoration-white underline-offset-4">Buat Grafik Pertama</button>
                        </div>
                    ) : (
                        charts.map((chartConfig) => (
                            <CustomChartWrapper key={chartConfig.id} chartConfig={chartConfig} log={log} playersData={data.players_data} onUpdate={(updatedData) => updateChart(chartConfig.id, updatedData)} onRemove={() => removeChart(chartConfig.id)} calculateTeamPercentage={calculateTeamPercentage} />
                        ))
                    )}
                </div>
            </div>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-8">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2"><Trophy size={18} /> Papan Peringkat Sesi</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Peringkat performa pemain berdasarkan indikator kunci.</p>
                </div>
                <Leaderboard log={log} playersData={data.players_data} />
            </div>
        </div>
    );
}