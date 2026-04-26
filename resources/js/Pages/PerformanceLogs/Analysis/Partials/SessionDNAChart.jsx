// resources/js/Pages/PerformanceLogs/Analysis/Partials/SessionDNAChart.jsx

import React, { useMemo } from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import { Fingerprint } from 'lucide-react';

// Palet warna estetik untuk membedakan tiap sesi
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function SessionDNAChart({ data }) {
    
    // 5 Dimensi Fisik Utama yang akan membentuk "DNA"
    const radarMetrics = useMemo(() => [
        { key: 'total_distance', label: 'Volume (Jarak)' },
        { key: 'dist_per_min', label: 'Intensity (Jarak/Min)' },
        { key: 'sprint_distance', label: 'Explosiveness (Sprint)' },
        { key: 'accels', label: 'Acceleration (Accels)' },
        { key: 'max_velocity', label: 'Top Speed (Max Vel)' },
    ], []);

    // Transformasi Data: Normalisasi ke 100% agar bentuk jaring proporsional
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        return radarMetrics.map(metric => {
            const row = { subject: metric.label };
            
            // Cari nilai tertinggi dari metrik ini di antara semua sesi terpilih
            const maxVal = Math.max(...data.map(d => parseFloat(d.averages[metric.key]) || 0));

            data.forEach(s => {
                const rawVal = parseFloat(s.averages[metric.key]) || 0;
                // Hitung persentase relatif terhadap nilai tertinggi (0 - 100)
                row[s.title] = maxVal === 0 ? 0 : (rawVal / maxVal) * 100;
                // Simpan nilai asli untuk ditampilkan di Tooltip
                row[`${s.title}_raw`] = rawVal; 
            });

            return row;
        });
    }, [data, radarMetrics]);

    // Kustomisasi Tooltip agar rapi dan menampilkan nilai ASLI (Bukan persentase)
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] min-w-[220px]">
                    <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-2 uppercase tracking-wider">
                        {label}
                    </p>
                    <div className="space-y-2">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-xs">
                                <div className="flex items-center gap-1.5 font-bold" style={{ color: entry.color }}>
                                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></span> 
                                    {entry.name}
                                </div>
                                <span className="font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                                    {/* Ambil nilai asli dari property _raw yang kita simpan tadi */}
                                    {entry.payload[`${entry.name}_raw`]?.toFixed(1) || '0.0'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            {/* Ambient Glow Khas Enterprise */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-2 flex flex-col relative z-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                        SESSION DNA <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">FOOTPRINT</span>
                    </h3>
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-900/50 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20">
                        <Fingerprint size={12} /> Radar Analysis
                    </div>
                </div>
                <p className="text-xs font-semibold text-zinc-500 mt-1 max-w-2xl">
                    Karakteristik fisik sesi berdasarkan 5 dimensi utama. Bentuk jaring yang lebih lebar menandakan dominasi beban pada dimensi tersebut.
                </p>
            </div>

            <div className="h-[450px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                        
                        {/* Jaring Laba-laba */}
                        <PolarGrid stroke="#52525b" opacity={0.2} />
                        
                        {/* Sumbu Label (Teks Ujung Jaring) */}
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} 
                        />
                        
                        {/* Batas Nilai 0 - 100% */}
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3f3f46', opacity: 0.1 }} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold', color: '#71717a' }} />
                        
                        {/* Render Polygon Radar untuk masing-masing sesi */}
                        {data.map((s, idx) => {
                            const color = COLORS[idx % COLORS.length];
                            return (
                                <Radar
                                    key={s.id}
                                    name={s.title}
                                    dataKey={s.title}
                                    stroke={color}
                                    strokeWidth={1}
                                    fill={color}
                                    fillOpacity={0.15}
                                    dot={{ r: 3, fill: color, strokeWidth: 0 }}
                                    activeDot={{ r: 5, strokeWidth: 0 }}
                                />
                            );
                        })}
                        
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}