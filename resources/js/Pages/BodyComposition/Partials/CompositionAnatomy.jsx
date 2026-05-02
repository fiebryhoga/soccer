import React, { useMemo, useState } from 'react';
import { Info, User, BrainCircuit, Zap, HeartPulse, Droplets, Target, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function CompositionAnatomy({ history, player }) {
    const [hoveredSlice, setHoveredSlice] = useState(null);

    if (!history || history.length === 0) return null;

    const latest = history[0];
    const W = parseFloat(latest.weight || 0);

    // Mencegah error render jika berat badan 0 atau data tidak lengkap
    if (W === 0 || !latest.muscle_mass) return null;

    const isFemale = player?.gender === 'female' || player?.gender === 'P';

    // =======================================================
    // 1. DATA MASSA FISIK (DI DALAM SILUET TUBUH)
    // =======================================================
    const anatomyData = useMemo(() => {
        // Standar Referensi Ideal Biologis
        const std = isFemale
            ? { muscle: 36, essFat: 12, storFat: 15, bone: 12, other: 25 }
            : { muscle: 45, essFat: 3,  storFat: 12, bone: 15, other: 25 };

        // Tarik data MURNI DARI DATABASE (Hasil input dari CompositionModal)
        const boneKg = parseFloat(latest.bone_mass || 0);
        const otherKg = parseFloat(latest.other_mass || 0);
        const essFatKg = parseFloat(latest.essential_fat_mass || 0);
        const storFatKg = parseFloat(latest.storage_fat_mass || 0);
        const muscleKg = parseFloat(latest.muscle_mass || 0);

        return {
            totalWeight: W,
            metabolics: {
                bmr: latest.bmr || '-',
                visceral: latest.visceral_fat || '-',
                metAge: latest.metabolic_age || '-',
                tbw: latest.total_body_water || '-'
            },
            // Urutan render tumpukan: Dari bawah (Tulang) ke atas (Otot)
            breakdown: [
                { id: 'bone', name: 'Bone Mass', kg: boneKg, pct: (boneKg / W) * 100, ref: std.bone, color: '#f59e0b', fill: 'bg-amber-500', text: 'text-amber-500' },
                { id: 'other', name: 'Organ & Fluids', kg: otherKg, pct: (otherKg / W) * 100, ref: std.other, color: '#f97316', fill: 'bg-orange-500', text: 'text-orange-500' },
                { id: 'essential_fat', name: 'Essential Fat', kg: essFatKg, pct: (essFatKg / W) * 100, ref: std.essFat, color: '#0ea5e9', fill: 'bg-cyan-500', text: 'text-cyan-500' },
                { id: 'storage_fat', name: 'Storage Fat', kg: storFatKg, pct: (storFatKg / W) * 100, ref: std.storFat, color: '#14b8a6', fill: 'bg-teal-500', text: 'text-teal-500' },
                { id: 'muscle', name: 'Muscle Tissue', kg: muscleKg, pct: (muscleKg / W) * 100, ref: std.muscle, color: '#4f46e5', fill: 'bg-indigo-600', text: 'text-indigo-500' },
            ]
        };
    }, [latest, W, isFemale]);

    if (!anatomyData) return null;

    // Menghitung koordinat Y untuk tumpukan tubuh (Maksimal tinggi SVG = 220px)
    let currentY = 220;
    const stackedRects = anatomyData.breakdown.map(item => {
        const height = (item.pct / 100) * 220;
        currentY -= height; // Bergerak ke atas
        return { ...item, y: currentY, h: height, textY: currentY + (height / 2) };
    });

    // =======================================================
    // 2. KARTU METRIK SCANNER (UNTUK BMR, TBW, DLL)
    // =======================================================
    const ScannerCard = ({ title, value, unit, icon: Icon, color, borderColor }) => (
        <div className={`p-3 md:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur-sm relative overflow-hidden group hover:${borderColor} transition-colors shadow-sm`}>
             <div className="flex items-center gap-2 mb-2">
                 <Icon size={14} className={color} />
                 <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{title}</span>
             </div>
             <div className="flex items-end gap-1">
                 <span className={`text-xl md:text-2xl font-black ${color} tabular-nums leading-none`}>{value}</span>
                 <span className="text-[10px] font-bold text-zinc-400 mb-0.5 uppercase tracking-widest">{unit}</span>
             </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors mb-6 md:mb-8 animate-in fade-in duration-500">
            
            {/* CSS Animasi Scanner Laser & Text Outline */}
            <style>{`
                @keyframes scan-vertical {
                    0% { transform: translateY(0px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(220px); opacity: 0; }
                }
                .animate-scan { animation: scan-vertical 3s linear infinite; }
                .text-stroke { text-shadow: 0px 1px 3px rgba(0,0,0,0.8), 0px 0px 2px rgba(0,0,0,0.5); }
            `}</style>

            {/* --- HEADER --- */}
            <div className="p-4 md:p-6 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800/50">
                        <User size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-sm md:text-base font-black text-zinc-900 dark:text-white tracking-widest uppercase">Anatomy Scanner HUD</h3>
                        <p className="text-[10px] md:text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-widest">
                            Proporsi Massa vs Indeks Metabolik ({isFemale ? 'Wanita' : 'Pria'})
                        </p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm uppercase tracking-widest">
                    <Info size={14} className="text-blue-500" /> Pengukuran Real-Time
                </div>
            </div>

            {/* --- MAIN HUD AREA --- */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center bg-zinc-50/30 dark:bg-[#0a0a0c] relative">
                
                {/* 1. KOLOM KIRI (Indeks Metabolik & Air) */}
                <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1">
                    <ScannerCard title="Metabolic Age" value={anatomyData.metabolics.metAge} unit="Tahun" icon={BrainCircuit} color="text-indigo-500" borderColor="border-indigo-500/50" />
                    <ScannerCard title="Basal Metabolic (BMR)" value={anatomyData.metabolics.bmr} unit="Kcal" icon={Zap} color="text-amber-500" borderColor="border-amber-500/50" />
                    <ScannerCard title="Visceral Fat" value={anatomyData.metabolics.visceral} unit="Level" icon={HeartPulse} color="text-rose-500" borderColor="border-rose-500/50" />
                    <ScannerCard title="Total Body Water" value={anatomyData.metabolics.tbw} unit="%" icon={Droplets} color="text-blue-500" borderColor="border-blue-500/50" />
                </div>

                {/* 2. KOLOM TENGAH (Hologram Siluet & Persentase) */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center order-1 lg:order-2 py-4">
                    <div className="h-[300px] md:h-[350px] w-[150px] md:w-[180px] relative">
                        <svg viewBox="0 0 100 220" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                            <defs>
                                <mask id="humanMaskHolo">
                                    <circle cx="50" cy="16" r="14" fill="white" />
                                    <path d="M 35 38 C 45 33, 55 33, 65 38 C 75 43, 82 50, 82 60 L 77 115 C 76 120, 70 120, 69 115 L 71 65 L 65 65 L 62 130 L 62 210 C 62 215, 52 215, 52 210 L 52 130 L 48 130 L 48 210 C 48 215, 38 215, 38 210 L 38 130 L 35 65 L 29 65 L 31 115 C 30 120, 24 120, 23 115 L 18 60 C 18 50, 25 43, 35 38 Z" fill="white" />
                                </mask>
                                <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
                                </pattern>
                            </defs>

                            <rect x="0" y="0" width="100" height="220" className="fill-zinc-200 dark:fill-zinc-800" mask="url(#humanMaskHolo)" />

                            {/* Tumpukan Warna Anatomi */}
                            <g mask="url(#humanMaskHolo)">
                                {stackedRects.map((item) => (
                                    <rect 
                                        key={item.id} x="0" y={item.y} width="100" height={item.h} fill={item.color}
                                        className="transition-all duration-500 cursor-pointer"
                                        style={{ opacity: hoveredSlice && hoveredSlice.id !== item.id ? 0.3 : 1 }}
                                        onMouseEnter={() => setHoveredSlice(item)}
                                        onMouseLeave={() => setHoveredSlice(null)}
                                    />
                                ))}
                                {/* Overlay Jaring/Grid HUD */}
                                <rect x="0" y="0" width="100" height="220" fill="url(#gridPattern)" className="pointer-events-none" />
                                
                                {/* Garis Animasi Scanner Laser */}
                                <rect x="0" y="0" width="100" height="3" fill="#ffffff" className="animate-scan pointer-events-none" style={{ filter: 'drop-shadow(0px 0px 4px #ffffff)' }} />
                            </g>

                            {/* Teks Persentase Di Dalam Tubuh (Terpisah dari mask agar jelas) */}
                            {stackedRects.map((item) => (
                                item.h > 12 && ( // Hanya tampilkan teks jika segmen warnanya cukup tinggi
                                    <text 
                                        key={`text-${item.id}`} 
                                        x="50" y={item.textY} 
                                        fill="#ffffff" 
                                        fontSize="11" 
                                        fontWeight="900" 
                                        textAnchor="middle" 
                                        dominantBaseline="middle" 
                                        className="text-stroke pointer-events-none transition-all duration-300"
                                        style={{ opacity: hoveredSlice && hoveredSlice.id !== item.id ? 0 : 1 }}
                                    >
                                        {item.pct.toFixed(1)}%
                                    </text>
                                )
                            ))}
                        </svg>
                    </div>

                    <div className="mt-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-2.5 rounded-full shadow-sm">
                        {hoveredSlice ? (
                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                <span className={`text-xl md:text-2xl font-black tabular-nums ${hoveredSlice.text}`}>{hoveredSlice.kg.toFixed(1)} <span className="text-xs text-zinc-400">kg</span></span>
                                <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{hoveredSlice.name}</span>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-200">
                                <span className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tabular-nums">{anatomyData.totalWeight} <span className="text-xs text-zinc-400">kg</span></span>
                                <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Berat Total Tubuh</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. KOLOM KANAN (Distribusi Massa & Referensi Ideal) */}
                <div className="lg:col-span-4 flex flex-col justify-center space-y-4 order-3">
                    <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 border-b border-zinc-100 dark:border-zinc-800/80 pb-2 flex items-center gap-2">
                        <Target size={14}/> Breakdown Massa (Kg)
                    </h4>
                    
                    {[...anatomyData.breakdown].reverse().map((item) => {
                        const diff = item.pct - item.ref;
                        const isProporsional = Math.abs(diff) <= 3; // Toleransi +/- 3%
                        const isHovered = hoveredSlice?.id === item.id;

                        return (
                            <div key={item.id} 
                                className={`group p-3 rounded-xl transition-all duration-200 border cursor-default ${isHovered ? 'bg-zinc-50 dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-700 scale-[1.02]' : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-200 dark:hover:border-zinc-800'}`}
                                onMouseEnter={() => setHoveredSlice(item)}
                                onMouseLeave={() => setHoveredSlice(null)}
                            >
                                <div className="flex justify-between items-end mb-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-3 h-3 rounded shadow-sm ${item.fill}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isHovered ? item.text : 'text-zinc-700 dark:text-zinc-300'}`}>{item.name}</span>
                                    </div>
                                    <div className="text-right flex items-end gap-2">
                                        <span className="text-[10px] font-bold text-zinc-400">({item.kg.toFixed(1)} kg)</span>
                                        <span className="text-base font-black text-zinc-900 dark:text-white tabular-nums leading-none">{item.pct.toFixed(1)}%</span>
                                    </div>
                                </div>
                                
                                {/* Progress Bar & Indikator Target */}
                                <div className="relative w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                                    <div className={`h-full ${item.fill} transition-all duration-1000`} style={{ width: `${item.pct}%` }} />
                                    {/* Garis Vertikal Target Referensi */}
                                    <div className="absolute top-0 bottom-0 w-1 bg-zinc-900 dark:bg-white z-10 shadow-sm" style={{ left: `${item.ref}%` }} title={`Standar Ideal: ${item.ref}%`} />
                                </div>
                                
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                        Target: {item.ref}%
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isProporsional ? 'text-emerald-500' : (diff > 0 ? 'text-amber-500' : 'text-blue-500')}`}>
                                        {isProporsional ? <><CheckCircle2 size={10}/> Proporsional</> : <><AlertTriangle size={10}/> {diff > 0 ? `+${diff.toFixed(1)}% Berlebih` : `${Math.abs(diff).toFixed(1)}% Kurang`}</>}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}