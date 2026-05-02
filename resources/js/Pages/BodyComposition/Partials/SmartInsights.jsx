import React, { useMemo } from 'react';
import { BrainCircuit, Droplets, Dumbbell, HeartPulse, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

export default function SmartInsights({ history, player, benchmarks }) {
    
    const insights = useMemo(() => {
        if (!history || history.length === 0) return [];
        const latest = history[0];
        const results = [];

        // 1. FAT-FREE MASS (FFM)
        if (latest.weight && latest.body_fat_percentage) {
            const ffm = latest.weight - (latest.weight * (latest.body_fat_percentage / 100));
            results.push({ 
                icon: Dumbbell, 
                color: 'text-orange-500', 
                bg: 'bg-orange-50 dark:bg-orange-900/20', 
                border: 'border-orange-200 dark:border-orange-800/50',
                title: 'Fat-Free Mass (FFM)', 
                desc: `Massa tubuh bebas lemak berada di angka ${ffm.toFixed(1)} kg. Fokus pertahankan atau tingkatkan angka ini.` 
            });
        }

        // 2. HYDRATION (TOTAL BODY WATER)
        if (latest.total_body_water) {
            const isFemale = player?.gender === 'female' || player?.gender === 'P';
            const minTbw = isFemale ? 45 : 50;
            const maxTbw = isFemale ? 60 : 65;

            if (latest.total_body_water < minTbw) {
                results.push({ 
                    icon: Droplets, 
                    color: 'text-amber-500', 
                    bg: 'bg-amber-50 dark:bg-amber-900/20', 
                    border: 'border-amber-200 dark:border-amber-800/50',
                    title: 'Indikasi Dehidrasi', 
                    desc: `Kadar air ${latest.total_body_water}% (Di bawah standar ${minTbw}%). Perbanyak asupan cairan harian Anda.` 
                });
            } else if (latest.total_body_water <= maxTbw) {
                results.push({ 
                    icon: Droplets, 
                    color: 'text-blue-500', 
                    bg: 'bg-blue-50 dark:bg-blue-900/20', 
                    border: 'border-blue-200 dark:border-blue-800/50',
                    title: 'Hidrasi Optimal', 
                    desc: `Tingkat cairan tubuh (${latest.total_body_water}%) sangat baik. Pertahankan pola minum Anda.` 
                });
            }
        }

        // 3. VISCERAL FAT RISK
        if (latest.visceral_fat) {
            const highLimit = benchmarks?.visceral_fat?.high || 10; 
            if (latest.visceral_fat >= highLimit) {
                results.push({ 
                    icon: HeartPulse, 
                    color: 'text-red-500', 
                    bg: 'bg-red-50 dark:bg-red-900/20', 
                    border: 'border-red-200 dark:border-red-800/50',
                    title: 'Risiko Metabolik!', 
                    desc: `Lemak visceral menyentuh angka ${latest.visceral_fat}. Evaluasi defisit kalori dan kardio.` 
                });
            }
        }

        // 4. RECOMPOSITION TRACKING
        if (history.length > 1) {
            const prev = history[1];
            if (latest.muscle_mass > prev.muscle_mass && latest.body_fat_percentage < prev.body_fat_percentage) {
                results.push({ 
                    icon: TrendingUp, 
                    color: 'text-emerald-500', 
                    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
                    border: 'border-emerald-200 dark:border-emerald-800/50',
                    title: 'Rekomposisi Sukses', 
                    desc: `Luar biasa! Otot Anda naik dan lemak menyusut dibandingkan tes sebelumnya.` 
                });
            } else if (latest.muscle_mass < prev.muscle_mass && latest.body_fat_percentage > prev.body_fat_percentage) {
                results.push({ 
                    icon: TrendingDown, 
                    color: 'text-rose-500', 
                    bg: 'bg-rose-50 dark:bg-rose-900/20', 
                    border: 'border-rose-200 dark:border-rose-800/50',
                    title: 'Peringatan Penyusutan', 
                    desc: `Massa otot turun & lemak naik. Cek kembali asupan protein dan intensitas latihan.` 
                });
            }
        }

        return results;
    }, [history, player, benchmarks]);

    if (insights.length === 0) return null;

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mt-10 -mr-10"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800/50 text-amber-500 shadow-inner">
                    <BrainCircuit size={18} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-1.5 tracking-widest uppercase">
                        Smart Insights <Sparkles size={14} className="text-amber-500"/>
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-widest">
                        Analisis otomatis berbasis data komposisi tubuh terbaru
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
                {insights.map((insight, i) => (
                    <div key={i} className={`p-4 rounded-xl border flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow group bg-zinc-50 dark:bg-[#111113] ${insight.border} hover:border-zinc-300 dark:hover:border-zinc-700`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${insight.bg} ${insight.color} ${insight.border}`}>
                                <insight.icon size={18} strokeWidth={2.5} />
                            </div>
                            <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                {insight.title}
                            </h4>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            {insight.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}