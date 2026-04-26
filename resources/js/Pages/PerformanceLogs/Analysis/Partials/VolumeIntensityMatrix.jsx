// resources/js/Pages/PerformanceLogs/Analysis/Partials/VolumeIntensityMatrix.jsx

import React, { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from 'recharts';
import { Target } from 'lucide-react';

export default function VolumeIntensityMatrix({ data }) {
    
    // Ekstraksi data untuk Scatter Plot dengan penanganan duplikat visual
    const chartData = useMemo(() => {
        const overlapMap = {};

        return data.map((s, index) => {
            let volume = parseFloat(s.averages.total_distance) || 0;
            let intensity = parseFloat(s.averages.dist_per_min) || 0;

            // Simpan nilai asli untuk keperluan Tooltip
            const realVolume = volume;
            const realIntensity = intensity;

            // KUNCI DETEKSI TUMPUKAN: Bulatkan jarak per 20m & intensitas per 1 poin
            // Jika ada titik yang beda tipis secara angka tapi menumpuk secara visual, akan dikelompokkan
            const key = `${Math.round(volume / 20) * 20}-${Math.round(intensity)}`;

            if (overlapMap[key] === undefined) {
                overlapMap[key] = 0;
            } else {
                overlapMap[key] += 1;
            }

            const overlapCount = overlapMap[key];

            // OFFSET DETERMINISTIK (Bebas Random, Tidak akan goyang saat direfresh)
            // Memaksa titik-titik yang bertumpuk untuk menyebar ke 4 arah berbeda
            if (overlapCount === 1) { volume += 40; intensity += 1.5; }
            else if (overlapCount === 2) { volume -= 40; intensity -= 1.5; }
            else if (overlapCount === 3) { volume += 40; intensity -= 1.5; }
            else if (overlapCount === 4) { volume -= 40; intensity += 1.5; }

            return {
                id: s.id || index,
                name: s.title,
                date: s.date,
                volume,
                intensity,
                realVolume,      // Nilai sejati untuk dibaca pelatih di tooltip
                realIntensity,   // Nilai sejati untuk dibaca pelatih di tooltip
                z: 100           // Ukuran konstan untuk titik
            };
        });
    }, [data]);

    // Hitung rata-rata dari data ASLI untuk garis silang (Kuadran Tengah)
    const averages = useMemo(() => {
        if (chartData.length === 0) return { volume: 0, intensity: 0 };
        const sumVol = chartData.reduce((acc, curr) => acc + curr.realVolume, 0);
        const sumInt = chartData.reduce((acc, curr) => acc + curr.realIntensity, 0);
        return {
            volume: sumVol / chartData.length,
            intensity: sumInt / chartData.length
        };
    }, [chartData]);

    // Kustomisasi Tooltip Scatter Plot (Memanggil nilai REAL)
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const pointData = payload[0].payload;
            return (
                <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-lg shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)] min-w-[200px] relative overflow-hidden z-50">
                    <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
                    <div className="pl-1">
                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 mb-0.5 truncate">
                            {pointData.name}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-500 mb-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                            {pointData.date}
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-zinc-500">Volume (Jarak):</span>
                                {/* Panggil realVolume agar akurat 100% */}
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{pointData.realVolume.toFixed(0)} m</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-zinc-500">Intensitas (m/min):</span>
                                {/* Panggil realIntensity agar akurat 100% */}
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{pointData.realIntensity.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30rem] h-32 bg-violet-500/5 dark:bg-violet-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-6 flex flex-col relative z-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                        VOLUME VS INTENSITY <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">MATRIX</span>
                    </h3>
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900/50">
                        <Target size={12} /> Kuadran Analisis
                    </div>
                </div>
                <p className="text-xs font-semibold text-zinc-500 mt-1 max-w-2xl">
                    Sebaran sesi berdasarkan <span className="text-blue-500 dark:text-blue-400">Total Distance (Sumbu X)</span> dan <span className="text-emerald-500 dark:text-emerald-400">Distance/Min (Sumbu Y)</span>. Garis tengah mewakili rata-rata sesi.
                </p>
            </div>

            <div className="h-[450px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#52525b" opacity={0.15} />
                        
                        <XAxis 
                            type="number" 
                            dataKey="volume" 
                            name="Total Distance" 
                            unit="m" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} 
                            dy={10} 
                            domain={['auto', 'auto']} 
                        />
                        
                        <YAxis 
                            type="number" 
                            dataKey="intensity" 
                            name="Distance/Min" 
                            unit="m/m" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#a1a1aa' }} 
                            dx={-10} 
                            domain={['auto', 'auto']} 
                        />
                        
                        <ZAxis type="number" dataKey="z" range={[120, 120]} />

                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ strokeDasharray: '3 3', stroke: '#71717a', strokeWidth: 1, opacity: 0.5 }} 
                        />
                        
                        {chartData.length > 0 && (
                            <>
                                <ReferenceLine x={averages.volume} stroke="#52525b" strokeDasharray="5 5" opacity={0.6} />
                                <ReferenceLine y={averages.intensity} stroke="#52525b" strokeDasharray="5 5" opacity={0.6} />
                            </>
                        )}
                        
                        <Scatter name="Sessions" data={chartData}>
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill="#8b5cf6" 
                                    fillOpacity={0.8}
                                    stroke="#ffffff" 
                                    strokeWidth={1.5} 
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-bold text-center">
                <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2 rounded border border-rose-100 dark:border-rose-900/50">Kanan Atas: Sangat Berat</div>
                <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2 rounded border border-amber-100 dark:border-amber-900/50">Kiri Atas: Tajam & Pendek</div>
                <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 p-2 rounded border border-blue-100 dark:border-blue-900/50">Kanan Bawah: Panjang & Ringan</div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 rounded border border-emerald-100 dark:border-emerald-900/50">Kiri Bawah: Recovery (Ringan)</div>
            </div>

        </div>
    );
}