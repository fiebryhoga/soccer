import React, { useMemo } from 'react';
import { Activity, Droplets, Zap, Target, ArrowDown, ArrowUp, Minus, Gauge, Scale, HeartPulse, Dumbbell } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, AreaChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AnalyticsDashboard({ history, athlete, benchmarks }) {
    if (!history || history.length === 0) return null;

    const reversedHistory = [...history].reverse();
    const latest = history[0]; 
    const prev = history.length > 1 ? history[1] : null; 

    const prevDateStr = prev ? new Date(prev.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '';

    // ==========================================
    // 1. COMPONENT: CUSTOM TOOLTIP UNTUK GRAFIK
    // ==========================================
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-3 md:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50">
                    <p className="text-[10px] md:text-xs font-bold text-zinc-500 dark:text-zinc-400 capitalize mb-2 md:mb-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">{label}</p>
                    <div className="space-y-2">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-6 text-xs font-bold">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ backgroundColor: entry.color }} />
                                    <span className="text-zinc-600 dark:text-zinc-400">{entry.name}</span>
                                </div>
                                <span className="text-zinc-900 dark:text-white tabular-nums">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // ==========================================
    // 2. COMPONENT: RENDER DIFFERENCE (TREND)
    // ==========================================
    const renderDiff = (current, previous, isReversedGood = false, unit = '') => {
        if (!previous) return <span className="text-zinc-500 dark:text-zinc-400 text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">Data Perdana</span>;
        
        const diff = (parseFloat(current || 0) - parseFloat(previous || 0)).toFixed(1);
        if (diff == 0) return <span className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold flex items-center bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md shadow-sm uppercase tracking-widest"><Minus className="w-3 h-3 mr-1"/> Tetap</span>;
        
        const isDown = diff < 0;
        const isGood = isReversedGood ? isDown : !isDown;
        
        // Warna Dark Mode Ready
        const color = isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
        const bg = isGood ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50';
        const Icon = isDown ? ArrowDown : ArrowUp;
        
        return (
            <span className={`${color} ${bg} border text-[10px] md:text-xs font-black flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-md shadow-sm tabular-nums`}>
                <Icon className="w-3 h-3 mr-0.5" strokeWidth={3}/> {Math.abs(diff)}{unit}
            </span>
        );
    };

    // ==========================================
    // 3. COMPONENT: LINEAR GAUGE METER
    // ==========================================
    const getPointerPosition = (val, thresholds) => {
        if (!val) return 0;
        if (val < thresholds[0]) {
            const min = thresholds[0] * 0.5; 
            return Math.max(0, (val - min) / (thresholds[0] - min)) * 25;
        } else if (val < thresholds[1]) {
            return 25 + ((val - thresholds[0]) / (thresholds[1] - thresholds[0]) * 25);
        } else if (val < thresholds[2]) {
            return 50 + ((val - thresholds[1]) / (thresholds[2] - thresholds[1]) * 25);
        } else {
            const max = thresholds[2] * 1.5; 
            return Math.min(100, 75 + ((val - thresholds[2]) / (max - thresholds[2]) * 25));
        }
    };

    const LinearGauge = ({ title, value, unit, thresholds, labels, isReverseColor = false }) => {
        const pos = getPointerPosition(parseFloat(value || 0), thresholds);
        
        const colors = isReverseColor 
            ? ['bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-blue-500'] 
            : ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500'];

        return (
            <div className="bg-zinc-50 dark:bg-[#111113] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between relative overflow-hidden group transition-colors">
                <div className="flex justify-between items-end mb-6 relative z-10">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-tight w-1/2">{title}</span>
                    <span className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums">{value || '-'}<span className="text-[10px] font-bold text-zinc-400 ml-1">{unit}</span></span>
                </div>
                
                <div className="relative w-full z-10">
                    <div className="w-full h-2.5 rounded-full overflow-hidden flex shadow-inner border border-zinc-200/50 dark:border-zinc-800">
                        <div className={`h-full ${colors[0]}`} style={{ width: '25%' }}></div>
                        <div className={`h-full ${colors[1]}`} style={{ width: '25%' }}></div>
                        <div className={`h-full ${colors[2]}`} style={{ width: '25%' }}></div>
                        <div className={`h-full ${colors[3]}`} style={{ width: '25%' }}></div>
                    </div>
                    
                    {value && (
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-6 bg-zinc-900 dark:bg-white border-2 border-white dark:border-zinc-900 rounded-full shadow-md transition-all duration-1000 ease-out" style={{ left: `${pos}%` }}>
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black py-0.5 px-2 rounded-md shadow-lg tabular-nums">
                                {value}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-between mt-3 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest z-10">
                    <span className="w-1/4 text-center truncate pr-1">{labels[0]}</span>
                    <span className="w-1/4 text-center truncate pr-1">{labels[1]}</span>
                    <span className="w-1/4 text-center truncate pr-1">{labels[2]}</span>
                    <span className="w-1/4 text-center truncate">{labels[3]}</span>
                </div>
            </div>
        );
    };

    const defaultBenchmarks = {
        bmi: { underweight: 18.5, normal: 23.0, overweight: 25.0, obesity1: 30.0 },
        bodyfat_male: { essential: 5, athlete: 13, fitness: 17, acceptable: 24 },
        bodyfat_female: { essential: 5, athlete: 20, fitness: 24, acceptable: 31 },
        visceral_fat: { standard: 9, high: 14 }
    };

    // Merge benchmarks dari props dengan default (jika props null/undefined, pakai default)
    const b = benchmarks || defaultBenchmarks;

    // Tentukan gender pemain (Pria = 'L' atau 'male', Wanita = 'P' atau 'female')
    const isFemale = athlete?.gender === 'female' || athlete?.gender === 'P';
    
    // Ambil standar body fat dengan fallback aman
    const fatStandars = isFemale 
        ? (b.bodyfat_female || defaultBenchmarks.bodyfat_female)
        : (b.bodyfat_male || defaultBenchmarks.bodyfat_male);
    
    const fatThresholds = [fatStandars.athlete, fatStandars.fitness, fatStandars.acceptable];
    
    // Ambil standar BMI dan Visceral dengan fallback aman
    const safeBmi = b.bmi || defaultBenchmarks.bmi;
    const bmiThresholds = [safeBmi.underweight, safeBmi.normal, safeBmi.overweight];
    
    const safeVisc = b.visceral_fat || defaultBenchmarks.visceral_fat;
    const viscThresholds = [safeVisc.standard - 3, safeVisc.standard, safeVisc.high];

    const trendData = useMemo(() => {
        return reversedHistory.map(item => ({
            date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            dateFull: item.date,
            weight: parseFloat(item.weight || 0),
            muscle: parseFloat(item.muscle_mass || 0),
            fat_percent: parseFloat(item.body_fat_percentage || 0),
            tbw: parseFloat(item.total_body_water || 0),
            visceral: parseFloat(item.visceral_fat || 0)
        }));
    }, [reversedHistory]);

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            
            {/* ========================================== */}
            {/* 4 SUMMARY CARDS (WEIGHT, FAT, MUSCLE, VISC)*/}
            {/* ========================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                
                {/* CARD 1: BERAT BADAN */}
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors flex flex-col h-full justify-between gap-4">
                    <div className="absolute -right-4 -top-4 text-blue-500/5 dark:text-blue-500/10 pointer-events-none">
                        <Scale className="w-32 h-32" strokeWidth={1} />
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-500 border border-blue-100 dark:border-blue-800/50 shadow-inner">
                            <Scale size={16} strokeWidth={2.5}/>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Berat Badan</p>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-3xl font-black text-zinc-900 dark:text-white leading-none tabular-nums">{latest.weight}</span>
                            <span className="text-xs font-bold text-zinc-400 mb-0.5">kg</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {renderDiff(latest.weight, prev?.weight, true)}
                            {prev && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">vs {prevDateStr}</span>}
                        </div>
                    </div>
                </div>

                {/* CARD 2: BODY FAT */}
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors flex flex-col h-full justify-between gap-4">
                    <div className="absolute -right-4 -top-4 text-emerald-500/5 dark:text-emerald-500/10 pointer-events-none">
                        <Activity className="w-32 h-32" strokeWidth={1} />
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-500 border border-emerald-100 dark:border-emerald-800/50 shadow-inner">
                            <Activity size={16} strokeWidth={2.5}/>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Body Fat</p>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-3xl font-black text-zinc-900 dark:text-white leading-none tabular-nums">{latest.body_fat_percentage || '-'}</span>
                            <span className="text-xs font-bold text-zinc-400 mb-0.5">%</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {renderDiff(latest.body_fat_percentage, prev?.body_fat_percentage, true, '%')}
                            {prev && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">vs {prevDateStr}</span>}
                        </div>
                    </div>
                </div>

                {/* CARD 3: MASSA OTOT */}
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors flex flex-col h-full justify-between gap-4">
                    <div className="absolute -right-4 -top-4 text-amber-500/5 dark:text-amber-500/10 pointer-events-none">
                        <Dumbbell className="w-32 h-32" strokeWidth={1} />
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-800/50 shadow-inner">
                            <Dumbbell size={16} strokeWidth={2.5}/>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Massa Otot</p>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-3xl font-black text-zinc-900 dark:text-white leading-none tabular-nums">{latest.muscle_mass || '-'}</span>
                            <span className="text-xs font-bold text-zinc-400 mb-0.5">kg</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {renderDiff(latest.muscle_mass, prev?.muscle_mass, false, 'k')}
                            {prev && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">vs {prevDateStr}</span>}
                        </div>
                    </div>
                </div>

                {/* CARD 4: VISCERAL FAT */}
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-red-500/50 transition-colors flex flex-col h-full justify-between gap-4">
                    <div className="absolute -right-4 -top-4 text-red-500/5 dark:text-red-500/10 pointer-events-none">
                        <HeartPulse className="w-32 h-32" strokeWidth={1} />
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 shadow-inner">
                            <HeartPulse size={16} strokeWidth={2.5}/>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Visceral Fat</p>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-3xl font-black text-zinc-900 dark:text-white leading-none tabular-nums">{latest.visceral_fat || '-'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {renderDiff(latest.visceral_fat, prev?.visceral_fat, true)}
                            {prev && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">vs {prevDateStr}</span>}
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================== */}
            {/* LINEAR GAUGE SECTION */}
            {/* ========================================== */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2 mb-5 uppercase tracking-widest">
                    <Gauge size={18} className="text-blue-500" /> Kondisi Terkini
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <LinearGauge title="Body Mass Index" value={latest.bmi} unit="" thresholds={bmiThresholds} labels={['Under', 'Normal', 'Over', 'Obese']} />
                    <LinearGauge title="Body Fat Percent" value={latest.body_fat_percentage} unit="%" thresholds={fatThresholds} labels={['Athlete', 'Fitness', 'Acceptable', 'Obese']} />
                    <LinearGauge title="Visceral Fat Rating" value={latest.visceral_fat} unit="" thresholds={viscThresholds} labels={['Excellent', 'Normal', 'High', 'Danger']} isReverseColor={true} />
                </div>
            </div>

            {/* ========================================== */}
            {/* RECHARTS TREN KOMPOSISI */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* CHART 1: BODY RECOMPOSITION */}
                <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col h-[400px]">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                                <Target size={18} className="text-blue-500" /> Body Recomposition
                            </h3>
                            <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-widest">Pergerakan massa otot vs persentase lemak</p>
                        </div>
                    </div>
                    <div className="w-full flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800 opacity-50" />
                                
                                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#71717a', fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis yAxisId="left" tick={{fontSize: 10, fill: '#71717a'}} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: '#71717a'}} axisLine={false} tickLine={false} />
                                
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', className: 'text-zinc-200 dark:text-zinc-800 opacity-20'}} />
                                <Legend wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '10px'}} iconType="circle" />
                                
                                <Bar yAxisId="left" dataKey="weight" name="Berat (Kg)" fill="#3f3f46" radius={[4,4,0,0]} barSize={20} opacity={0.3} />
                                <Line yAxisId="left" type="monotone" dataKey="muscle" name="Otot (Kg)" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: 'currentColor', strokeWidth: 2, className: 'fill-white dark:fill-zinc-950'}} activeDot={{r: 6, strokeWidth: 0, fill: '#3b82f6'}} />
                                <Line yAxisId="right" type="monotone" dataKey="fat_percent" name="Lemak (%)" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: 'currentColor', strokeWidth: 2, className: 'fill-white dark:fill-zinc-950'}} activeDot={{r: 6, strokeWidth: 0, fill: '#ef4444'}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CHART 2: TINGKAT HIDRASI */}
                <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col h-[400px]">
                    <div className="mb-4">
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                            <Droplets size={18} className="text-blue-500" /> Tingkat Hidrasi (TBW)
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-widest">Pemantauan persentase air dalam tubuh</p>
                    </div>
                    <div className="w-full flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTbw" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800 opacity-50" />
                                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#71717a', fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{fontSize: 10, fill: '#71717a'}} axisLine={false} tickLine={false} domain={['dataMin - 3', 'dataMax + 3']} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', className: 'text-zinc-200 dark:text-zinc-800 opacity-20'}} />
                                <Legend wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '10px'}} iconType="circle" />
                                <Area type="monotone" dataKey="tbw" name="Kadar Air (%)" stroke="#3b82f6" strokeWidth={3} fill="url(#colorTbw)" activeDot={{r: 6, strokeWidth: 0, fill: '#3b82f6'}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}