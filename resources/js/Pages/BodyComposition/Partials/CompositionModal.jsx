import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Scale, Save, X, Calculator, Droplets, Zap, HeartPulse, Dumbbell, Activity, UserCheck, Wand2 } from 'lucide-react';

export default function CompositionModal({ isOpen, onClose, player }) {
    
    // 1. INISIALISASI FORM LENGKAP (Termasuk Variabel Anatomi Baru)
    const { data, setData, post, processing, reset } = useForm({
        player_id: player?.id || '', 
        date: new Date().toISOString().split('T')[0], 
        age: player?.age || '',
        weight: '', 
        height: player?.height ? (player.height / 100) : '', 
        bmi: '',
        body_fat_percentage: '',
        muscle_mass: '', 
        bone_mass: '', 
        visceral_fat: '', 
        bmr: '', 
        total_body_water: '',
        metabolic_age: '', 
        // 3 Variabel Spesifik Anatomi 
        essential_fat_mass: '', 
        storage_fat_mass: '', 
        other_mass: ''
    });

    // 2. STATE UNTUK TOOLS KALKULATOR US NAVY
    const [activeTool, setActiveTool] = useState('bodyfat'); // 'bodyfat', 'bmr', 'mass'
    const [neck, setNeck] = useState('');
    const [waist, setWaist] = useState('');
    const [hip, setHip] = useState('');

    // --- EFEK AUTO BMI ---
    useEffect(() => {
        if (data.weight && data.height && data.height > 0) {
            setData('bmi', (data.weight / (data.height * data.height)).toFixed(2));
        } else {
            setData('bmi', '');
        }
    }, [data.weight, data.height]);

    // ==============================================================
    // LOGIKA KALKULATOR HELPER TOOLS (MANUAL PER TAB)
    // ==============================================================
    const isMale = player?.gender === 'male' || player?.gender === 'L';

    // TAB 1: LEMAK & VISCERAL
    const estimatedBF = (() => {
        if (!data.height || !neck || !waist || (!isMale && !hip)) return null;
        const h = parseFloat(data.height) * 100, n = parseFloat(neck), w = parseFloat(waist), hi = parseFloat(hip);
        let bf = isMale 
            ? 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450
            : 495 / (1.29579 - 0.35004 * Math.log10(w + hi - n) + 0.22100 * Math.log10(h)) - 450;
        return isNaN(bf) ? null : Math.max(2, bf).toFixed(1);
    })();

    const estimatedVisceral = (() => {
        if (!waist) return null;
        return Math.max(1, Math.round((parseFloat(waist) / 10) - (isMale ? 2 : 3)));
    })();

    // Ekstra Tab 1: Pecahan Lemak Esensial & Storage (Berdasarkan Body Fat)
    const estimatedEssFat = data.weight ? (parseFloat(data.weight) * ((isMale ? 3 : 12) / 100)).toFixed(1) : null;
    const estimatedStorFat = (data.weight && estimatedBF) ? Math.max(0, (parseFloat(data.weight) * (parseFloat(estimatedBF) / 100)) - parseFloat(estimatedEssFat)).toFixed(1) : null;

    // TAB 2: BMR & AIR
    const estimatedBMR = (() => {
        if (!data.weight || !data.height || !data.age) return null;
        const w = parseFloat(data.weight), h = parseFloat(data.height) * 100, a = parseFloat(data.age);
        const bmr = isMale ? (10 * w + 6.25 * h - 5 * a + 5) : (10 * w + 6.25 * h - 5 * a - 161);
        return isNaN(bmr) ? null : Math.round(bmr);
    })();

    const estimatedTBW = (() => {
        if (!data.weight || !data.height || !data.age) return null;
        const w = parseFloat(data.weight), h = parseFloat(data.height) * 100, a = parseFloat(data.age);
        let liters = isMale ? 2.447 - (0.09156 * a) + (0.1074 * h) + (0.3362 * w) : -2.097 + (0.1069 * h) + (0.2466 * w);
        return isNaN(liters) ? null : ((liters / w) * 100).toFixed(1);
    })();

    // TAB 3: OTOT, TULANG, ORGAN & METABOLIC AGE
    const estimatedBone = (() => {
        if (!data.weight) return null;
        const w = parseFloat(data.weight);
        if (isMale) return w < 60 ? 2.5 : w <= 75 ? 2.9 : 3.2;
        return w < 45 ? 1.8 : w <= 60 ? 2.2 : 2.5;
    })();

    // Referensi: Organ/Fluida Ekstra mengambil ~25% dari total berat tubuh
    const estimatedOther = (() => {
        if (!data.weight) return null;
        return (parseFloat(data.weight) * 0.25).toFixed(1); 
    })();

    // Rumus Medis: Otot = Berat - Lemak - Tulang - Organ(25%)
    const estimatedMuscle = (() => {
        if (!data.weight || !data.body_fat_percentage) return null;
        const w = parseFloat(data.weight);
        const fatKg = w * (parseFloat(data.body_fat_percentage) / 100);
        const bone = estimatedBone ? parseFloat(estimatedBone) : 2.5;
        const other = estimatedOther ? parseFloat(estimatedOther) : (w * 0.25);
        
        return Math.max(0, w - fatKg - bone - other).toFixed(1);
    })();

    const estimatedMetAge = (() => {
        if (!data.age || !data.body_fat_percentage) return null;
        const met = Math.round(parseFloat(data.age) + (parseFloat(data.body_fat_percentage) - (isMale ? 15 : 23)) / 1.2);
        return isNaN(met) ? null : Math.max(12, met);
    })();


    // ==============================================================
    // FUNGSI SUPER AUTO-ESTIMATE (MENGISI SEMUA FORM SEKALIGUS)
    // ==============================================================
    const handleAutoEstimateAll = () => {
        const isMale = player?.gender === 'male' || player?.gender === 'L';
        const W = parseFloat(data.weight);
        const H = parseFloat(data.height) * 100;
        const A = parseFloat(data.age);
        const BF = parseFloat(data.body_fat_percentage); 

        let up = {};

        // 1. Hitung BMR & Air (Butuh Berat, Tinggi, Usia)
        if (W && H && A) {
            up.bmr = isMale ? Math.round(10 * W + 6.25 * H - 5 * A + 5) : Math.round(10 * W + 6.25 * H - 5 * A - 161);
            
            // TBW (Watson Formula)
            const tbwLiters = isMale ? (2.447 - (0.09156 * A) + (0.1074 * H) + (0.3362 * W)) : (-2.097 + (0.1069 * H) + (0.2466 * W));
            up.total_body_water = ((tbwLiters / W) * 100).toFixed(1);
            
            // Standar Bone Mass (Excel Table)
            up.bone_mass = isMale ? (W < 60 ? 2.5 : W <= 75 ? 2.9 : 3.2) : (W < 45 ? 1.8 : W <= 60 ? 2.2 : 2.5);
        }

        if (W && BF) {
            const fatKg = W * (BF / 100);
            
            // Standar Essential Fat (Pria 3%, Wanita 12%)
            const essPct = isMale ? 3 : 12;
            up.essential_fat_mass = (W * (essPct / 100)).toFixed(1);
            up.storage_fat_mass = Math.max(0, fatKg - parseFloat(up.essential_fat_mass)).toFixed(1);
            
            const bone = parseFloat(up.bone_mass || data.bone_mass || 2.5);
            
            // Kunci perhitungan Organ di angka 25% sesuai standar referensi tubuh manusia
            up.other_mass = (W * 0.25).toFixed(1);
            
            // Hitung Otot secara murni sebagai sisa dari 3 komponen di atas
            up.muscle_mass = Math.max(0, W - fatKg - bone - parseFloat(up.other_mass)).toFixed(1);
        }

        // 3. Hitung Umur Sel
        if (A && BF) {
            up.metabolic_age = Math.max(12, Math.round(A + (BF - (isMale ? 15 : 23)) / 1.2));
        }

        setData(prev => ({ ...prev, ...up }));
    };

    // --- SUBMIT DATA ---
    const submitAction = (e) => {
        e.preventDefault();
        post(route('analysis.composition.store'), {
            onSuccess: () => { onClose(); reset(); },
            preserveScroll: true
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-[85rem] rounded-2xl shadow-2xl flex flex-col xl:flex-row my-auto max-h-[95vh] xl:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
                
                {/* ============================================================== */}
                {/* KOLOM KIRI (FORM INPUT UTAMA) */}
                {/* ============================================================== */}
                <div className="flex-1 xl:w-7/12 border-b xl:border-b-0 xl:border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950">
                    
                    <div className="sticky top-0 z-20 px-5 md:px-8 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800/50">
                                <Scale size={18} strokeWidth={2.5} />
                            </div>
                            <h3 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-widest">
                                Input Komposisi: {player?.name}
                            </h3>
                        </div>
                        <button onClick={onClose} className="p-1.5 md:p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <X size={18} strokeWidth={3}/>
                        </button>
                    </div>

                    <form id="compositionForm" onSubmit={submitAction} className="p-5 md:p-8 flex-1 flex flex-col space-y-6">
                        
                        {/* 1. Identitas & Metrik Krusial */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">Tanggal Tes</label>
                                <input type="date" value={data.date} onChange={e=>setData('date', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm font-bold rounded-lg px-3 py-2.5 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark] transition-all" required/>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">Usia Saat Tes</label>
                                <input type="number" value={data.age} onChange={e=>setData('age', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm font-bold rounded-lg px-3 py-2.5 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" required/>
                            </div>
                            <div className="col-span-1 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2.5">
                                <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 block">Berat (KG)</label>
                                <input type="number" step="0.01" value={data.weight} onChange={e=>setData('weight', e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 text-base font-black rounded-lg px-2 py-1.5 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" required placeholder="0.00"/>
                            </div>
                            <div className="col-span-1 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2.5">
                                <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 block">Tinggi (Meter)</label>
                                <input type="number" step="0.01" value={data.height} onChange={e=>setData('height', e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 text-base font-black rounded-lg px-2 py-1.5 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" required placeholder="1.70"/>
                            </div>
                        </div>

                        {/* Tombol Magic Wand Estimate */}
                        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-5">
                            <div>
                                <h4 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest">Detail Komposisi Tubuh</h4>
                                <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">Isi manual, gunakan helper tools, atau kalkulasi otomatis.</p>
                            </div>
                            <button type="button" onClick={handleAutoEstimateAll} className="flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 px-3 md:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                                <Wand2 size={14}/> Auto Calculate All
                            </button>
                        </div>
                        
                        {/* 2. Grid Komposisi Lengkap */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Baris 1: Core */}
                            <div>
                                <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1.5 block">Bodyfat %</label>
                                <input type="number" step="0.1" value={data.body_fat_percentage} onChange={e=>setData('body_fat_percentage', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"/>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5 block">Muscle Mass (Kg)</label>
                                <input type="number" step="0.1" value={data.muscle_mass} onChange={e=>setData('muscle_mass', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"/>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1.5 block">Bone Mass (Kg)</label>
                                <input type="number" step="0.1" value={data.bone_mass} onChange={e=>setData('bone_mass', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"/>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1.5 block">Visceral Fat Level</label>
                                <input type="number" step="0.1" value={data.visceral_fat} onChange={e=>setData('visceral_fat', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"/>
                            </div>

                            {/* Baris 2: Detailed Anatomy (Variabel Baru) */}
                            <div>
                                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1.5 block">Essential Fat (Kg)</label>
                                <input type="number" step="0.1" value={data.essential_fat_mass} onChange={e=>setData('essential_fat_mass', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all"/>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-1.5 block">Storage Fat (Kg)</label>
                                <input type="number" step="0.1" value={data.storage_fat_mass} onChange={e=>setData('storage_fat_mass', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all"/>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1.5 block">Other (Organ/Fluids) (Kg)</label>
                                <input type="number" step="0.1" value={data.other_mass} onChange={e=>setData('other_mass', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"/>
                            </div>

                            {/* Baris 3: Metabolics */}
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1.5 block">TBW / Air (%)</label>
                                <input type="number" step="0.1" value={data.total_body_water} onChange={e=>setData('total_body_water', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"/>
                            </div>
                            <div className="col-span-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest mb-1.5 block">BMR (Kcal)</label>
                                <input type="number" value={data.bmr} onChange={e=>setData('bmr', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-500 transition-all"/>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1.5 block">Metabolic Age</label>
                                <input type="number" value={data.metabolic_age} onChange={e=>setData('metabolic_age', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
                            </div>
                        </div>

                        {/* Save Button untuk Desktop */}
                        <div className="pt-6 mt-auto hidden xl:block">
                            <button type="submit" disabled={processing} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50">
                                {processing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save size={16} strokeWidth={2.5}/>} 
                                {processing ? 'Menyimpan...' : 'Simpan Database Tes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ============================================================== */}
                {/* KOLOM KANAN (HELPER TOOLS BERDASARKAN TAB) */}
                {/* ============================================================== */}
                <div className="xl:w-5/12 bg-zinc-50/50 dark:bg-[#111113] flex flex-col relative border-t xl:border-t-0 border-zinc-200 dark:border-zinc-800 xl:border-none overflow-y-auto custom-scrollbar">
                    
                    <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111113] sticky top-0 z-10 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                                <Calculator size={16} className="text-emerald-500"/> Helper Tools
                            </h3>
                            <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">Kalkulator parsial per metrik tubuh.</p>
                        </div>
                    </div>

                    {/* TABS HELPER */}
                    <div className="flex px-4 pt-3 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto custom-scrollbar bg-zinc-100/50 dark:bg-zinc-900/50 sticky top-[68px] z-10">
                        <button type="button" onClick={() => setActiveTool('bodyfat')} className={`pb-2.5 px-3 text-[10px] md:text-xs font-bold border-b-2 whitespace-nowrap transition-all uppercase tracking-widest ${activeTool === 'bodyfat' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#111113] rounded-t-lg' : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>Lemak & Visc</button>
                        <button type="button" onClick={() => setActiveTool('bmr')} className={`pb-2.5 px-3 text-[10px] md:text-xs font-bold border-b-2 whitespace-nowrap transition-all uppercase tracking-widest ${activeTool === 'bmr' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#111113] rounded-t-lg' : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>BMR & Air</button>
                        <button type="button" onClick={() => setActiveTool('mass')} className={`pb-2.5 px-3 text-[10px] md:text-xs font-bold border-b-2 whitespace-nowrap transition-all uppercase tracking-widest ${activeTool === 'mass' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#111113] rounded-t-lg' : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>Otot & Tulang</button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col pb-8">
                        
                        {/* --- TAB 1: BODY FAT & VISCERAL --- */}
                        {activeTool === 'bodyfat' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-[10px] md:text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                                    Metode US Navy. Membutuhkan <strong className="font-bold text-blue-900 dark:text-blue-400">Tinggi Badan</strong> dari form utama.
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">Leher (cm)</label>
                                        <input type="number" step="0.1" value={neck} onChange={e=>setNeck(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs md:text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Cth: 38" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">Perut (cm)</label>
                                        <input type="number" step="0.1" value={waist} onChange={e=>setWaist(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs md:text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Pusar" />
                                    </div>
                                    {(!isMale) && (
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">Pinggul (cm)</label>
                                            <input type="number" step="0.1" value={hip} onChange={e=>setHip(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs md:text-sm font-bold rounded-lg px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Bagian terlebar" />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 shadow-sm">
                                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"><Activity size={12} className="text-red-500"/> Body Fat %</div>
                                            <p className="text-xl font-black text-red-600 dark:text-red-400">{estimatedBF ? `${estimatedBF}%` : '-'}</p>
                                        </div>
                                        <button type="button" onClick={() => estimatedBF && setData(prev => ({...prev, body_fat_percentage: estimatedBF, essential_fat_mass: estimatedEssFat, storage_fat_mass: estimatedStorFat}))} disabled={!estimatedBF} className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50">Gunakan & Pecah Anatomi</button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"><HeartPulse size={12} className="text-orange-500"/> Visceral Fat</div>
                                            <p className="text-xl font-black text-orange-600 dark:text-orange-400">{estimatedVisceral || '-'}</p>
                                        </div>
                                        <button type="button" onClick={() => estimatedVisceral && setData('visceral_fat', estimatedVisceral)} disabled={!estimatedVisceral} className="px-4 py-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50">Gunakan</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB 2: BMR & AIR --- */}
                        {activeTool === 'bmr' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-[10px] md:text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                                    Rumus Mifflin-St Jeor & Watson. Membutuhkan <strong className="font-bold text-blue-900 dark:text-blue-400">Usia, Berat, dan Tinggi</strong> dari form.
                                </div>
                                <div className="grid grid-cols-1 gap-3 mt-2">
                                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"><Zap size={12} className="text-amber-500"/> BMR (Kcal)</div>
                                            <p className="text-xl font-black text-amber-600 dark:text-amber-400">{estimatedBMR || '-'}</p>
                                        </div>
                                        <button type="button" onClick={() => estimatedBMR && setData('bmr', estimatedBMR)} disabled={!estimatedBMR} className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50">Gunakan</button>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"><Droplets size={12} className="text-blue-500"/> Air / TBW (%)</div>
                                            <p className="text-xl font-black text-blue-600 dark:text-blue-400">{estimatedTBW ? `${estimatedTBW}%` : '-'}</p>
                                        </div>
                                        <button type="button" onClick={() => estimatedTBW && setData('total_body_water', estimatedTBW)} disabled={!estimatedTBW} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50">Gunakan</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB 3: OTOT, TULANG, ORGAN --- */}
                        {activeTool === 'mass' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-[10px] md:text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                                    Membutuhkan <strong className="font-bold text-blue-900 dark:text-blue-400">Body Fat %</strong> terisi di form agar otot dan tulang dapat dipisahkan secara matematis.
                                </div>
                                <div className="grid grid-cols-1 gap-3 mt-2">
                                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"><Activity size={12} className="text-amber-500"/> Bone Mass (Kg)</div>
                                            <p className="text-xl font-black text-amber-600 dark:text-amber-400">{estimatedBone || '-'}</p>
                                        </div>
                                        <button type="button" onClick={() => estimatedBone && setData('bone_mass', estimatedBone)} disabled={!estimatedBone} className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50">Gunakan</button>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"><Dumbbell size={12} className="text-emerald-500"/> Muscle Mass (Kg)</div>
                                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{estimatedMuscle || '-'}</p>
                                        </div>
                                        <button type="button" onClick={() => estimatedMuscle && setData(prev => ({...prev, muscle_mass: estimatedMuscle, other_mass: estimatedOther}))} disabled={!estimatedMuscle} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50">Gunakan & Set Sisa Organ</button>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"><UserCheck size={12} className="text-indigo-500"/> Metabolic Age</div>
                                            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{estimatedMetAge || '-'}</p>
                                        </div>
                                        <button type="button" onClick={() => estimatedMetAge && setData('metabolic_age', estimatedMetAge)} disabled={!estimatedMetAge} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50">Gunakan</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button khusus Mobile/Tablet yg tertutup kolom kiri */}
                        <div className="xl:hidden mt-auto pt-8">
                            <button 
                                type="button"
                                onClick={submitAction} 
                                disabled={processing} 
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {processing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save size={16}/>} 
                                Simpan Database
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}