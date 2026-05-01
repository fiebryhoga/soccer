import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Edit3 } from 'lucide-react';

export default function Show({ auth, player, categories, assessments }) {
    
    // --- FUNGSI MAPPING LOGIKA BIOMEKANIK ---
    // 1. Menghitung rata-rata dari 1 kategori
    const getSingleAvg = (categoryName) => {
        const cat = categories.find(c => c.name === categoryName);
        // CHANGED: testItems to test_items
        if (!cat || !cat.test_items || cat.test_items.length === 0) return 0;
        let total = 0; let count = 0;
        cat.test_items.forEach(item => {
            const asmt = assessments.find(a => a.assessment_test_item_id === item.id);
            if (asmt) { total += parseFloat(asmt.percentage); count++; }
        });
        return count > 0 ? Math.round(total / count) : 0;
    };

    // 2. Menghitung rata-rata gabungan dari BEBERAPA kategori
    const getCombinedAvg = (categoryNames) => {
        let total = 0; let count = 0;
        categories.filter(c => categoryNames.includes(c.name)).forEach(cat => {
            // CHANGED: testItems to test_items
            if (cat.test_items) {
                cat.test_items.forEach(item => {
                    const asmt = assessments.find(a => a.assessment_test_item_id === item.id);
                    if (asmt) { total += parseFloat(asmt.percentage); count++; }
                });
            }
        });
        return count > 0 ? Math.round(total / count) : 0;
    };

    // --- EKSEKUSI MAPPING SVG ---
    const flexData = getSingleAvg('Flexibility');
    const heartData = getSingleAvg('Endurance');
    const coreData = getSingleAvg('Strength Endurance');
    const armsData = getSingleAvg('Strength');
    const legsData = getCombinedAvg(['Speed', 'Agility', 'Power']); // Gabungan 3 kategori kaki

    // --- LOGIKA WARNA (Glowing Neon) ---
    const getColorTheme = (percent) => {
        if (percent >= 90) return { fill: 'fill-fuchsia-500', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-500', glow: 'drop-shadow-[0_0_12px_rgba(217,70,239,0.8)]' }; 
        if (percent >= 80) return { fill: 'fill-blue-500', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500', glow: 'drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]' }; 
        if (percent >= 61) return { fill: 'fill-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500', glow: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]' }; 
        if (percent > 0) return { fill: 'fill-red-500', text: 'text-red-600 dark:text-red-400', border: 'border-red-500', glow: 'drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]' }; 
        return { fill: 'fill-zinc-800 dark:fill-zinc-900', text: 'text-zinc-400', border: 'border-zinc-300 dark:border-zinc-700', glow: '' }; 
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle={`Dashboard Anatomi : ${player.name}`} headerDescription="Analisis performa fisik berdasarkan hasil tes terbaru.">
            <Head title={`Profil Fisik - ${player.name}`} />

            <div className="max-w-5xl mx-auto pb-12">
                <div className="flex justify-end mb-4">
                    <Link href={route('players.assessments.index', player.id)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors">
                        <Edit3 size={14} /> Edit Nilai Tes Fisik
                    </Link>
                </div>

                <div className="bg-zinc-200 dark:bg-[#1a1a1a] rounded-3xl border border-zinc-300 dark:border-zinc-800 shadow-inner p-8 relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto relative">
                        
                        {/* ==================================== */}
                        {/* 1. FLEXIBILITY FUNCTION (FIGUR KIRI) */}
                        {/* ==================================== */}
                        <div className="relative flex flex-col items-center">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-8">Flexibility Function</h3>
                            <div className="relative w-64 h-[400px]">
                                <svg viewBox="0 0 100 220" className="w-full h-full">
                                    <circle cx="50" cy="25" r="16" className="fill-black" />
                                    <path d="M 20 50 Q 50 40 80 50 L 80 70 L 20 70 Z" className={`transition-all duration-1000 ${getColorTheme(flexData).fill} ${getColorTheme(flexData).glow}`} />
                                    <rect x="20" y="70" width="14" height="60" rx="7" className="fill-black" />
                                    <rect x="66" y="70" width="14" height="60" rx="7" className="fill-black" />
                                    <rect x="36" y="70" width="28" height="30" className="fill-black" />
                                    <rect x="36" y="100" width="28" height="35" className={`transition-all duration-1000 ${getColorTheme(flexData).fill} ${getColorTheme(flexData).glow}`} />
                                    <rect x="36" y="135" width="12" height="15" className="fill-black" />
                                    <rect x="52" y="135" width="12" height="15" className="fill-black" />
                                    <rect x="36" y="150" width="12" height="50" rx="6" className={`transition-all duration-1000 ${getColorTheme(flexData).fill} ${getColorTheme(flexData).glow}`} />
                                    <rect x="52" y="150" width="12" height="50" rx="6" className={`transition-all duration-1000 ${getColorTheme(flexData).fill} ${getColorTheme(flexData).glow}`} />
                                </svg>
                                <div className={`absolute top-[15%] -left-8 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(flexData).border} px-4 py-1.5 rounded-xl rounded-br-none shadow-lg`}>
                                    <span className={`text-lg font-black ${getColorTheme(flexData).text}`}>{flexData}%</span>
                                </div>
                                <div className={`absolute bottom-[10%] -right-8 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(flexData).border} px-4 py-1.5 rounded-xl rounded-tl-none shadow-lg`}>
                                    <span className={`text-lg font-black ${getColorTheme(flexData).text}`}>{flexData}%</span>
                                </div>
                            </div>
                        </div>

                        {/* ==================================== */}
                        {/* 2. ENGINE FUNCTION (FIGUR KANAN)     */}
                        {/* ==================================== */}
                        <div className="relative flex flex-col items-center">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-8">Engine Function</h3>
                            <div className="relative w-64 h-[400px]">
                                <svg viewBox="0 0 100 220" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="armGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="black" /><stop offset="100%" stopColor="currentColor" className={getColorTheme(armsData).text} /></linearGradient>
                                        <linearGradient id="legGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="black" /><stop offset="100%" stopColor="currentColor" className={getColorTheme(legsData).text} /></linearGradient>
                                        <linearGradient id="coreGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="black" /><stop offset="100%" stopColor="currentColor" className={getColorTheme(coreData).text} /></linearGradient>
                                    </defs>
                                    
                                    <path d="M 35 45 Q 50 35 65 45 L 80 55 L 80 120 L 65 120 L 65 200 L 35 200 L 35 120 L 20 120 L 20 55 Z" className="fill-transparent drop-shadow-[0_0_20px_rgba(250,204,21,0.2)]" />
                                    <circle cx="50" cy="25" r="16" className="fill-black" />
                                    <path d="M 20 55 Q 50 40 80 55 L 80 80 L 20 80 Z" className="fill-black" />
                                    
                                    <rect x="36" y="80" width="28" height="30" fill="url(#coreGrad)" className={`${getColorTheme(coreData).glow}`} />
                                    <rect x="20" y="80" width="14" height="50" rx="7" fill="url(#armGrad)" className={`${getColorTheme(armsData).glow}`} />
                                    <rect x="66" y="80" width="14" height="50" rx="7" fill="url(#armGrad)" className={`${getColorTheme(armsData).glow}`} />
                                    <rect x="36" y="110" width="28" height="20" className="fill-black" />
                                    <rect x="36" y="130" width="12" height="70" rx="6" fill="url(#legGrad)" className={`${getColorTheme(legsData).glow}`} />
                                    <rect x="52" y="130" width="12" height="70" rx="6" fill="url(#legGrad)" className={`${getColorTheme(legsData).glow}`} />

                                    <path d="M 50 70 C 50 70 43 55 38 60 C 33 65 38 75 50 85 C 62 75 67 65 62 60 C 57 55 50 70 50 70 Z" className={`stroke-white stroke-[1.5] transition-all duration-1000 ${getColorTheme(heartData).fill} ${getColorTheme(heartData).glow}`} />
                                </svg>

                                <div className={`absolute top-[10%] left-0 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(heartData).border} px-4 py-1.5 rounded-xl rounded-br-none shadow-lg z-10`}>
                                    <span className={`text-lg font-black ${getColorTheme(heartData).text}`}>{heartData}%</span>
                                    <div className="absolute -bottom-6 -right-6 w-8 h-px bg-zinc-400 rotate-[45deg] origin-top-left"></div>
                                </div>
                                <div className={`absolute top-[35%] -right-12 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(armsData).border} px-4 py-1.5 rounded-xl shadow-lg z-10`}>
                                    <span className={`text-lg font-black ${getColorTheme(armsData).text}`}>{armsData}%</span>
                                </div>
                                <div className={`absolute top-[52%] left-[38%] translate-x-[-50%] bg-zinc-900/80 backdrop-blur-sm border border-zinc-600 px-3 py-1 rounded-lg z-10`}>
                                    <span className={`text-sm font-black ${getColorTheme(coreData).text}`}>{coreData}%</span>
                                </div>
                                <div className={`absolute bottom-[25%] -left-8 bg-zinc-100 dark:bg-zinc-900 border-2 ${getColorTheme(legsData).border} px-4 py-1.5 rounded-xl rounded-tr-none shadow-lg z-10`}>
                                    <span className={`text-lg font-black ${getColorTheme(legsData).text}`}>{legsData}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}