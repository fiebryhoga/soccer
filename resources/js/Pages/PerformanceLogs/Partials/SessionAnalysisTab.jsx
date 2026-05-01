// resources/js/Pages/PerformanceLogs/Partials/SessionAnalysisTab.jsx
import React, { useState } from 'react';
import { Activity, Plus } from 'lucide-react';
// Import komponen analisis yang sudah ada (Pastikan path-nya benar!)

import SessionSummary from './SessionSummary'; 
import PlayerMetricsTable from './PlayerMetricsTable';
import CustomSessionChart from './CustomSessionChart';

export default function SessionAnalysisTab({ sessionData }) {
    // State untuk menampung Diagram Custom
    const [customCharts, setCustomCharts] = useState([]);

    const addNewChart = () => {
        setCustomCharts([...customCharts, { id: Date.now() }]);
    };

    const removeChart = (idToRemove) => {
        setCustomCharts(customCharts.filter(c => c.id !== idToRemove));
    };

    // Jika data tidak valid, cegah render
    if (!sessionData || !sessionData.playerMetrics) {
        return (
            <div className="p-12 text-center text-zinc-500">
                Data analisis tidak tersedia atau belum disimpan.
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Ringkasan Sesi (Rata-rata Tim) */}
            <SessionSummary sessionData={sessionData} />
            
            {/* 2. Custom Analytics Section */}
            <div className="mt-10 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-zinc-200 dark:border-zinc-800 pb-3 gap-4">
                <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                        <Activity size={20} className="text-blue-500"/> Custom Analytics
                    </h3>
                    <p className="text-xs font-semibold text-zinc-500 mt-1">
                        Buat grafik kustom interaktif untuk melihat korelasi antar variabel pemain.
                    </p>
                </div>
                <button 
                    type="button" // Penting: type="button" agar tidak men-trigger submit form di halaman utama
                    onClick={addNewChart}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                    <Plus size={16} strokeWidth={2.5}/> Add Diagram
                </button>
            </div>

            {/* Merender Array Custom Charts */}
            {customCharts.length === 0 && (
                <div className="mt-6 p-10 flex flex-col items-center text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
                    <Activity size={32} className="text-zinc-300 dark:text-zinc-700 mb-3" />
                    <p className="text-sm font-black text-zinc-700 dark:text-zinc-300">Area Custom Diagram</p>
                    <p className="text-xs font-semibold text-zinc-500 mt-1 max-w-sm">Klik tombol <strong>"Add Diagram"</strong> di atas untuk membuat visualisasi metrik secara kustom.</p>
                </div>
            )}
            
            <div className="space-y-6">
                {customCharts.map(chart => (
                    <CustomSessionChart 
                        key={chart.id} 
                        sessionData={sessionData} 
                        onRemove={() => removeChart(chart.id)} 
                    />
                ))}
            </div>

            {/* 3. Tabel Detail Metrik Pemain */}
            <PlayerMetricsTable playerMetrics={sessionData.playerMetrics} />
        </div>
    );
}