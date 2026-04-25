import React, { useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Activity, Flame, BatteryWarning, BrainCircuit, TrendingUp, Zap } from 'lucide-react';

export default function SessionAnalysis({ playersData, getAutoCalculatedValue }) {
    
    // ==========================================
    // LOGIKA ANALISIS SUPER LENGKAP (REAL-TIME)
    // ==========================================
    const analysis = useMemo(() => {
        // 1. Filter pemain yang memiliki data (mengabaikan baris kosong)
        const activePlayers = playersData.filter(p => {
            const dist = parseFloat(getAutoCalculatedValue(p, 'total_distance'));
            return !isNaN(dist) && dist > 0;
        });

        if (activePlayers.length === 0) return null;

        // 2. Hitung Rata-Rata Tim Sesi Ini
        let totalDist = 0, totalLoad = 0, totalSprint = 0, totalHIR = 0, totalHSR = 0;
        
        const mappedPlayers = activePlayers.map(p => {
            const dist = parseFloat(getAutoCalculatedValue(p, 'total_distance')) || 0;
            const load = parseFloat(getAutoCalculatedValue(p, 'player_load')) || 0;
            const sprint = parseFloat(getAutoCalculatedValue(p, 'sprint_distance')) || 0;
            const hir18 = parseFloat(getAutoCalculatedValue(p, 'hir_18_kmh')) || 0;
            const hsr21 = parseFloat(getAutoCalculatedValue(p, 'hsr_21_kmh')) || 0;
            const maxVel = parseFloat(getAutoCalculatedValue(p, 'max_velocity')) || 0;
            
            totalDist += dist; totalLoad += load; totalSprint += sprint;
            totalHIR += hir18; totalHSR += hsr21;

            return { ...p, dist, load, sprint, hir18, hsr21, maxVel };
        });

        const avgDist = totalDist / activePlayers.length;
        const avgLoad = totalLoad / activePlayers.length;
        const avgSprint = totalSprint / activePlayers.length;

        // 3. Deteksi Anomali Pemain
        const redZone = []; // Fatigue / Kerja keras tapi lari dikit
        const onFire = [];  // Overperforming / Lari jauh & sprint banyak
        const speedDemons = [...mappedPlayers].sort((a, b) => b.maxVel - a.maxVel).slice(0, 5);
        const topDist = [...mappedPlayers].sort((a, b) => b.dist - a.dist).slice(0, 5);

        mappedPlayers.forEach(p => {
            // Logika Red Zone: Player Load tinggi (>10% dr rata2), tapi Jarak lari rendah (<10% dr rata2)
            if (p.load > (avgLoad * 1.1) && p.dist < (avgDist * 0.9)) {
                redZone.push(p);
            }
            // Logika On Fire: Jarak lari tinggi DAN Sprint tinggi (>15% dr rata2)
            if (p.dist > (avgDist * 1.15) && p.sprint > (avgSprint * 1.15)) {
                onFire.push(p);
            }
        });

        // 4. Distribusi Intensitas Tim (Pie Chart)
        const lowIntensity = totalDist - (totalHIR + totalHSR + totalSprint);
        const intensityData = [
            { name: 'Low/Jogging', value: Math.max(0, lowIntensity), color: '#d4d4d8' }, // zinc-300
            { name: 'HIR (18-19.8)', value: totalHIR, color: '#3b82f6' }, // blue-500
            { name: 'HSR (19.8-24.5)', value: totalHSR, color: '#f59e0b' }, // amber-500
            { name: 'Sprint (>24.5)', value: totalSprint, color: '#ef4444' } // red-500
        ];

        // 5. Data untuk Grafik Korelasi Beban vs Jarak (Scatter)
        const scatterData = mappedPlayers.map(p => ({
            name: p.name,
            x: p.dist, // Sumbu X: Jarak (Output)
            y: p.load, // Sumbu Y: Beban (Input)
            z: 1 // Ukuran dot
        }));

        // 6. Generate Rekomendasi AI
        let suggestions = [];
        if (redZone.length > 0) {
            suggestions.push(`Terdapat ${redZone.length} pemain dengan indikasi kelelahan otot (Player Load tinggi namun jarak tempuh rendah). Prioritaskan recovery untuk: ${redZone.map(p=>p.name).join(', ')}.`);
        }
        if (onFire.length > 3) {
            suggestions.push("Intensitas sesi ini sangat baik! Banyak pemain melebihi batas rata-rata. Pastikan nutrisi karbohidrat setelah latihan mencukupi.");
        }
        if (totalSprint > (totalDist * 0.1)) {
            suggestions.push("Volume sprint tim cukup tinggi (>10% dari total jarak). Waspadai risiko cedera hamstring di sesi berikutnya, kurangi lari intensitas maksimal besok.");
        } else {
            suggestions.push("Volume sprint aman. Anda bisa memberikan stimulus kecepatan/akselerasi lebih banyak jika ini adalah fase persiapan (MD-3 atau MD-4).");
        }

        return { avgDist, avgLoad, redZone, onFire, speedDemons, topDist, intensityData, scatterData, suggestions };
    }, [playersData, getAutoCalculatedValue]);

    // ==========================================
    // RENDER UI
    // ==========================================
    if (!analysis) {
        return (
            <div className="mt-8 p-12 bg-zinc-50 dark:bg-[#0a0a0a] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-400">
                <BrainCircuit size={48} className="opacity-20 mb-4" />
                <p className="text-sm font-bold uppercase tracking-wider text-center">Menunggu Data GPS...</p>
                <p className="text-xs mt-1 text-center max-w-md">Silakan paste data dari Excel ke dalam tabel di atas. Analisis super lengkap akan muncul secara otomatis di sini.</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 text-zinc-100 p-3 rounded-lg text-xs font-semibold shadow-xl border border-zinc-700 z-50">
                    <p className="mb-1 text-[10px] text-zinc-400 uppercase">{payload[0].payload.name}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color || '#fff' }}>
                            {entry.name}: {Math.round(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="mt-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="p-2 bg-zinc-900 dark:bg-zinc-100 rounded-lg text-white dark:text-zinc-900">
                    <Activity size={18} strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Session Intelligence</h2>
            </div>

            {/* BARIS 1: ALERT & INSIGHTS KARTU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Red Zone Warning */}
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold mb-3 uppercase text-xs tracking-wider">
                            <BatteryWarning size={16} /> Indikasi Kelelahan / Fatigue
                        </div>
                        {analysis.redZone.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {analysis.redZone.map(p => (
                                    <span key={p.player_id} className="px-2.5 py-1 bg-white dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-md text-[10px] font-bold text-rose-900 dark:text-rose-300">
                                        {p.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[11px] font-semibold text-rose-600/70 dark:text-rose-500/50 italic">Kondisi tim stabil. Tidak ada anomali kelelahan drastis.</p>
                        )}
                    </div>
                </div>

                {/* On Fire */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-3 uppercase text-xs tracking-wider">
                            <Flame size={16} /> Overperforming / On Fire
                        </div>
                        {analysis.onFire.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {analysis.onFire.map(p => (
                                    <span key={p.player_id} className="px-2.5 py-1 bg-white dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-md text-[10px] font-bold text-emerald-900 dark:text-emerald-300">
                                        {p.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[11px] font-semibold text-emerald-600/70 dark:text-emerald-500/50 italic">Belum ada pemain yang melewati batas atas performa.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* BARIS 2: GRAFIK ANALISIS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Grafik Top 5 Distance */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-4 flex items-center gap-2"><TrendingUp size={14}/> Top 5 Daya Jelajah (m)</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analysis.topDist} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3f3f46" opacity={0.2} />
                                <XAxis type="number" fontSize={9} stroke="#71717a" />
                                <YAxis dataKey="name" type="category" fontSize={9} stroke="#71717a" width={80} tickFormatter={(val) => val.split(' ')[0]} />
                                <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                <Bar dataKey="dist" name="Jarak (m)" fill="#18181b" dark:fill="#f4f4f5" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafik Intensitas (Pie) */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-0 flex items-center gap-2"><Activity size={14}/> Distribusi Intensitas Tim</h3>
                    <div className="h-48 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={analysis.intensityData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                                    {analysis.intensityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Custom Legend */}
                        <div className="absolute top-1/2 -translate-y-1/2 right-0 flex flex-col gap-2">
                            {analysis.intensityData.map((d, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    <span className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grafik Efisiensi (Scatter) */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-widest z-10">Advanced</div>
                    <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-4 flex items-center gap-2"><BrainCircuit size={14}/> Beban vs Output (Efisiensi)</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: -10, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.2} />
                                <XAxis dataKey="x" type="number" name="Total Distance" fontSize={9} stroke="#71717a" domain={['dataMin - 500', 'dataMax + 500']} />
                                <YAxis dataKey="y" type="number" name="Player Load" fontSize={9} stroke="#71717a" domain={['auto', 'auto']} />
                                <ZAxis dataKey="z" range={[40, 40]} />
                                <Tooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                                <Scatter data={analysis.scatterData} fill="#3b82f6" fillOpacity={0.6} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* BARIS 3: AI SYSTEM SUGGESTION */}
            <div className="bg-zinc-900 dark:bg-zinc-100 rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-2 text-white dark:text-zinc-900 font-black mb-4 uppercase text-xs tracking-widest">
                    <Zap size={16} className="text-amber-400 dark:text-amber-600" /> System Recommendations
                </div>
                <div className="space-y-3">
                    {analysis.suggestions.map((sug, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-600 mt-1.5 shrink-0"></div>
                            <p className="text-xs font-medium text-zinc-300 dark:text-zinc-800 leading-relaxed">{sug}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}