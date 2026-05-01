// resources/js/Pages/PerformanceLogs/Partials/AnalysisTab.jsx

import React from 'react';
import { Calendar, Trophy, Target, PlusCircle } from 'lucide-react';
import SummaryCards from './SummaryCards';
import Leaderboard from './Leaderboard';
import CustomChartWrapper from './Chart/CustomChartWrapper';

export default function AnalysisTab({ log, data, setData, calculateTeamPercentage }) {
    const isMatch = log.type === 'match';
    
    // Ambil list grafik dari form data (yang bersumber dari DB)
    const charts = data.custom_charts || [];

    const addChart = () => {
        const newChart = {
            id: Date.now().toString(),
            selectedParams: [],
            paramColors: {},
            chartType: 'bar',
            sortBy: 'position',
            sortOrder: 'desc',
            isZoomed: true,
            customTitle: ''
        };
        // Masukkan grafik baru ke state utama
        setData('custom_charts', [...charts, newChart]);
    };

    const updateChart = (chartId, updatedConfig) => {
        // Update konfigurasi grafik spesifik tanpa mengubah yang lain
        setData('custom_charts', charts.map(c => c.id === chartId ? { ...c, ...updatedConfig } : c));
    };

    const removeChart = (chartId) => {
        setData('custom_charts', charts.filter(c => c.id !== chartId));
    };

    const formattedDate = new Date(log.date).toLocaleDateString('id-ID', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });

    return (
        <div className="flex flex-col p-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-8">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isMatch ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                        {isMatch ? <Trophy size={20} /> : <Target size={20} />}
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                            Analisis Sesi: {log.title}
                        </h2>
                        <p className="text-xs font-semibold text-zinc-500 mt-0.5 flex items-center gap-1">
                            <Calendar size={12} /> {formattedDate}
                        </p>
                    </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${isMatch ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {isMatch ? 'Match Session' : 'Training Session'}
                </span>
            </div>

            {/* --- SUMMARY CARDS --- */}
            <SummaryCards playersData={data.players_data} />

            {/* --- CUSTOM COMPARISON CHARTS SECTION --- */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-zinc-800 dark:text-zinc-100">Kustomisasi Grafik</h3>
                </div>
                
                {/* Looping dari data.custom_charts, bukan dari state lokal */}
                {charts.map((chartConfig) => (
                    <CustomChartWrapper 
                        key={chartConfig.id} 
                        chartConfig={chartConfig} // Oper konfigurasi dari DB
                        log={log} 
                        playersData={data.players_data} 
                        onUpdate={(updatedData) => updateChart(chartConfig.id, updatedData)} // Oper fungsi update
                        onRemove={() => removeChart(chartConfig.id)}
                        calculateTeamPercentage={calculateTeamPercentage}
                    />
                ))}

                <button onClick={addChart} className="w-full py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:border-amber-500 hover:text-amber-600 transition-all hover:bg-amber-50/50 group shadow-sm">
                    <PlusCircle size={28} className="group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-bold tracking-wide">Tambah Grafik Baru</span>
                </button>
            </div>

            {/* --- LEADERBOARD --- */}
            <Leaderboard log={log} playersData={data.players_data} />

        </div>
    );
}