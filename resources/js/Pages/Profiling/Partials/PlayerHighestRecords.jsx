import React, { useMemo } from 'react';
import { Trophy, Activity, Zap, MapPin, HeartPulse, Flame, Clock } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

export default function PlayerHighestRecords({ highestRecords }) {
    
    // --- FORMATTER CERDAS UNTUK DURASI DAN ANGKA ---
    const formatMetricValue = (val) => {
        if (val === undefined || val === null || val === '') return '0';
        
        // 1. Deteksi Format Waktu (Duration HH:MM:SS atau MM:SS)
        if (typeof val === 'string' && val.includes(':')) {
            if (val === '00:00:00' || val === '0:00') return '0'; // Abaikan jika kosong
            
            const parts = val.split(':').map(Number);
            let timeStr = [];
            
            if (parts.length === 3) {
                const [h, m, s] = parts;
                if (h > 0) timeStr.push(`${h} jam`);
                if (m > 0) timeStr.push(`${m} mnt`);
                if (s > 0) timeStr.push(`${Math.round(s)} dtk`);
            } else if (parts.length === 2) {
                const [m, s] = parts;
                if (m > 0) timeStr.push(`${m} mnt`);
                if (s > 0) timeStr.push(`${Math.round(s)} dtk`);
            }
            
            return timeStr.length > 0 ? timeStr.join(' ') : '0';
        }

        // 2. Jika itu angka biasa (Desimal/Float)
        const num = Number(val);
        if (isNaN(num)) return val; // Kembalikan string asli jika benar-benar teks (bukan angka)
        
        return Number.isInteger(num) ? num.toString() : num.toFixed(2);
    };

    const validMetrics = useMemo(() => {
        let cols = FIXED_EXCEL_COLUMNS.filter(col => 
            !['selected', 'selected_hr4', 'selected_hr5', 'selected_pl', 'sort_order'].includes(col.id)
        );

        // Jangan render top speed lagi karena sudah punya widget raksasa
        cols = cols.filter(col => !['highest_velocity', 'max_velocity', 'velocity_max', 'top_speed'].includes(col.id));

        return cols;
    }, []);

    const hasRecords = Object.keys(highestRecords).filter(k => !['highest_velocity'].includes(k)).length > 0;

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col transition-colors">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg shadow-sm">
                        <Trophy size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white tracking-widest uppercase">Other Highest Records</h3>
                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-widest">Pencapaian Maksimal Parameter Lainnya</p>
                    </div>
                </div>
            </div>
            
            <div className="p-4 md:p-5 flex-1">
                {!hasRecords ? (
                    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                        <Activity size={32} className="text-zinc-300 dark:text-zinc-700 mb-3" />
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Rekor</h4>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">Pemain ini belum memiliki log rekor parameter lainnya yang tercatat.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {validMetrics.map(col => {
                            const rawVal = highestRecords[col.id] || 0;
                            
                            // Abaikan nilai kosong (0 atau 00:00:00) agar layout bersih
                            if (rawVal === 0 || rawVal === "0" || rawVal === "0.00" || rawVal === "00:00:00") return null;

                            // Ikon Cerdas Dinamis
                            let Icon = Activity;
                            if (col.id.includes('speed') || col.id.includes('velocity') || col.id.includes('sprint') || col.id.includes('accel') || col.id.includes('decel')) Icon = Zap;
                            else if (col.id.includes('hr_') || col.id.includes('heart')) Icon = HeartPulse;
                            else if (col.id.includes('distance')) Icon = MapPin;
                            else if (col.id.includes('load') || col.id.includes('strain')) Icon = Flame;
                            else if (col.id.includes('_dur') || col.id.includes('duration') || col.id.includes('time')) Icon = Clock;

                            return (
                                <div key={col.id} className="bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col justify-between shadow-sm hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors group">
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 line-clamp-2">
                                        <Icon size={12} className="text-zinc-400 dark:text-zinc-500 group-hover:text-blue-500 transition-colors shrink-0"/> 
                                        <span className="truncate" title={col.label}>{col.label}</span>
                                    </div>
                                    <div className="text-sm sm:text-base font-black text-zinc-900 dark:text-white tabular-nums truncate" title={rawVal}>
                                        {formatMetricValue(rawVal)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}