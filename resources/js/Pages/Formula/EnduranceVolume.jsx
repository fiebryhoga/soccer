// resources/js/Pages/Formula/EnduranceVolume.jsx

import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Timer, Wind, Footprints, ActivitySquare, Zap, Target, TrendingUp, Calendar, Activity, Save, X, User, CheckCircle2 } from 'lucide-react';

export default function EnduranceVolume({ auth, players }) {
    const [testType, setTestType] = useState('cooper');
    
    // --- STATE TES ---
    const [cooperDist, setCooperDist] = useState(2.05); 
    const [cooperTime, setCooperTime] = useState(12);   
    const [balkeDist, setBalkeDist] = useState(4000); 
    const [balkeTime, setBalkeTime] = useState(15);   
    const [masDist, setMasDist] = useState(1300); 
    const [masMin, setMasMin] = useState(5);      
    const [masSec, setMasSec] = useState(0);      
    const [mftLevel, setMftLevel] = useState(12);
    const [mftAge, setMftAge] = useState(18);

    const [targetVo2, setTargetVo2] = useState(50);

    // --- STATE UI (MODAL & TOAST) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // --- KALKULASI ---
    const activeResult = useMemo(() => {
        let vo2max = 0; let mas = 0; let inputs = {};

        if (testType === 'cooper') {
            const distKm = parseFloat(cooperDist) || 0;
            const timeSec = (parseFloat(cooperTime) || 0) * 60;
            vo2max = (22.351 * distKm) - 11.288;
            mas = timeSec > 0 ? (distKm * 1000) / timeSec : 0;
            inputs = { distance_km: distKm, time_min: cooperTime };
        } 
        else if (testType === 'balke') {
            const distM = parseFloat(balkeDist) || 0;
            const timeSec = (parseFloat(balkeTime) || 0) * 60;
            vo2max = (((distM / 15) - 133) * 0.172) + 33.3; 
            mas = timeSec > 0 ? distM / timeSec : 0;
            inputs = { distance_m: distM, time_min: balkeTime };
        } 
        else if (testType === 'mas') {
            const distM = parseFloat(masDist) || 0;
            const timeSec = (parseFloat(masMin || 0) * 60) + parseFloat(masSec || 0);
            mas = timeSec > 0 ? distM / timeSec : 0;
            vo2max = mas > 0 ? (22.351 * ((mas * 720) / 1000)) - 11.288 : 0;
            inputs = { distance_m: distM, time_min: masMin, time_sec: masSec };
        }
        else if (testType === 'mft') {
            const level = parseFloat(mftLevel) || 1;
            const speedKmh = 8.5 + ((level - 1) * 0.5);
            vo2max = (speedKmh * 6.0) - 27.4;
            mas = (speedKmh * 1000) / 3600;
            inputs = { level: level, age: mftAge, speed_kmh: speedKmh };
        }
        return { vo2max, mas, inputs };
    }, [testType, cooperDist, cooperTime, balkeDist, balkeTime, masDist, masMin, masSec, mftLevel]);

    const volumeCalc = useMemo(() => {
        const gap = parseFloat(targetVo2 || 0) - activeResult.vo2max;
        if (gap <= 0 || activeResult.vo2max <= 0) return { gap: 0, totalVolume: 0, vol3x: [0,0,0], vol2x: [0,0] };
        const cooperDistKm = (activeResult.vo2max + 11.288) / 22.351;
        const totalVolume = (cooperDistKm * 1000) * (gap * 0.35);
        return { 
            gap, totalVolume, 
            vol3x: [Math.round(totalVolume * 0.25), Math.round(totalVolume * 0.35), Math.round(totalVolume * 0.40)], 
            vol2x: [Math.round(totalVolume * 0.40), Math.round(totalVolume * 0.60)] 
        };
    }, [activeResult.vo2max, targetVo2]);

    // --- FORM SIMPAN ---
    const { data, setData, post, processing, reset } = useForm({
        player_id: '', date: new Date().toISOString().split('T')[0], category: 'endurance', test_name: testType, results: {}
    });

    const openSaveModal = () => {
        setData('test_name', testType);
        setData('results', { vo2max: activeResult.vo2max.toFixed(2), mas: activeResult.mas.toFixed(2), raw_inputs: activeResult.inputs });
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        post(route('formula.saveTest'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset('player_id');
                setToastMessage('Data tes Endurance berhasil disimpan!');
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Endurance & Volume Prescription" headerDescription="Konversi tes lari ke VO2Max dan hitung resep volume latihan mingguan secara otomatis.">
            <Head title="Endurance & Volume" />

            {/* --- CUSTOM TOAST NOTIFICATION --- */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[60] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm transform transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    {toastMessage}
                </div>
            )}

            <div className="max-w-6xl mx-auto pb-12 space-y-6 relative">
                
                {/* --- HEADER TOMBOL TES & SIMPAN --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
                        {[
                            { id: 'cooper', label: 'Cooper Test', icon: Timer },
                            { id: 'balke', label: 'Balke Test', icon: Wind },
                            { id: 'mas', label: 'MAS Run Test', icon: Footprints },
                            { id: 'mft', label: 'MFT / Beep Test', icon: Activity }
                        ].map(type => (
                            <button key={type.id} onClick={() => setTestType(type.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${testType === type.id ? 'bg-blue-500 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                <type.icon size={16} /> {type.label}
                            </button>
                        ))}
                    </div>

                    <button onClick={openSaveModal} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm">
                        <Save size={16} /> Simpan Hasil Tes
                    </button>
                </div>

                {/* --- AREA KALKULATOR TES --- */}
                <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-5 flex flex-col justify-center min-h-[140px]">
                        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                            <ActivitySquare size={16} className="text-blue-500"/> Parameter {testType.toUpperCase()}
                        </h3>
                        
                        {testType === 'cooper' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-zinc-500 mb-2">Jarak Tempuh (KM)</label><input type="number" step="0.01" value={cooperDist} onChange={e => setCooperDist(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums text-zinc-900 dark:text-zinc-100" /></div>
                                <div><label className="block text-xs font-bold text-zinc-500 mb-2">Waktu (Menit)</label><input type="number" value={cooperTime} onChange={e => setCooperTime(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums text-zinc-900 dark:text-zinc-100" /></div>
                            </div>
                        )}
                        {testType === 'balke' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-zinc-500 mb-2">Jarak Tempuh (Meter)</label><input type="number" value={balkeDist} onChange={e => setBalkeDist(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums text-zinc-900 dark:text-zinc-100" /></div>
                                <div><label className="block text-xs font-bold text-zinc-500 mb-2">Waktu (Menit)</label><input type="number" value={balkeTime} onChange={e => setBalkeTime(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums text-zinc-900 dark:text-zinc-100" /></div>
                            </div>
                        )}
                        {testType === 'mas' && (
                            <div className="space-y-4">
                                <div><label className="block text-xs font-bold text-zinc-500 mb-2">Jarak Tempuh (Meter)</label><input type="number" value={masDist} onChange={e => setMasDist(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums text-zinc-900 dark:text-zinc-100" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-zinc-500 mb-2">Menit</label><input type="number" value={masMin} onChange={e => setMasMin(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums text-zinc-900 dark:text-zinc-100" /></div>
                                    <div><label className="block text-xs font-bold text-zinc-500 mb-2">Detik</label><input type="number" value={masSec} onChange={e => setMasSec(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums text-zinc-900 dark:text-zinc-100" /></div>
                                </div>
                            </div>
                        )}
                        {testType === 'mft' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-zinc-500 mb-2">Pencapaian Level</label><input type="number" step="0.1" value={mftLevel} onChange={e => setMftLevel(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums text-zinc-900 dark:text-zinc-100" /></div>
                                <div><label className="block text-xs font-bold text-zinc-500 mb-2">Usia Atlet (Tahun)</label><input type="number" value={mftAge} onChange={e => setMftAge(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums text-zinc-900 dark:text-zinc-100" /></div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-blue-500 p-5 rounded-xl shadow-sm text-white flex flex-col justify-between relative overflow-hidden h-36">
                            <Wind className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10" />
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-200 z-10">VO2Max Saat Ini</h4>
                            <div className="flex items-end gap-1.5 z-10 mt-auto"><span className="text-4xl font-black tabular-nums tracking-tighter leading-none">{activeResult.vo2max > 0 ? activeResult.vo2max.toFixed(2) : '0'}</span><span className="text-xs font-bold text-blue-200 mb-1">ml/kg</span></div>
                        </div>
                        <div className="bg-blue-600 p-5 rounded-xl shadow-sm text-white flex flex-col justify-between relative overflow-hidden h-36">
                            <Zap className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10" />
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-200 z-10">MAS</h4>
                            <div className="flex items-end gap-1.5 z-10 mt-auto"><span className="text-4xl font-black tabular-nums tracking-tighter leading-none">{activeResult.mas > 0 ? activeResult.mas.toFixed(2) : '0'}</span><span className="text-xs font-bold text-blue-200 mb-1">m/s</span></div>
                        </div>
                    </div>
                </div>

                {/* --- AREA TARGET & VOLUME --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="text-emerald-500" size={20} />
                            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">Tetapkan Target</h3>
                        </div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2">Target VO2Max Pemain</label>
                        <input type="number" value={targetVo2} onChange={e => setTargetVo2(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-2xl font-black py-4 px-4 outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums text-emerald-600 dark:text-emerald-400" />
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">GAP Terdeteksi</span>
                            <span className="text-sm font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-3 py-1 rounded-md">{volumeCalc.gap > 0 ? volumeCalc.gap.toFixed(2) : 0}</span>
                        </div>
                    </div>

                    <div className="bg-emerald-500 dark:bg-emerald-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center relative overflow-hidden lg:col-span-2">
                        <TrendingUp className="absolute -right-6 -bottom-6 w-48 h-48 opacity-10" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-200 mb-2">Total Kebutuhan Volume Lari (Mingguan)</h4>
                        <div className="flex items-end gap-2 mb-8">
                            <span className="text-5xl font-black tabular-nums tracking-tighter leading-none z-10">{volumeCalc.totalVolume.toLocaleString('id-ID')}</span>
                            <span className="text-lg font-bold text-emerald-200 mb-1 z-10">meter</span>
                        </div>

                        {volumeCalc.gap > 0 ? (
                            <div className="grid grid-cols-2 gap-6 z-10">
                                <div>
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-3 flex items-center gap-1.5"><Calendar size={12}/> Opsi 3x Seminggu</h5>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-sm"><span className="text-emerald-100">Sesi 1 (25%)</span><span className="font-bold">{volumeCalc.vol3x[0].toLocaleString('id-ID')} m</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-emerald-100">Sesi 2 (35%)</span><span className="font-bold">{volumeCalc.vol3x[1].toLocaleString('id-ID')} m</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-emerald-100">Sesi 3 (40%)</span><span className="font-bold">{volumeCalc.vol3x[2].toLocaleString('id-ID')} m</span></div>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-3 flex items-center gap-1.5"><Zap size={12}/> Opsi 2x Seminggu</h5>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-sm"><span className="text-emerald-100">Sesi 1 (40%)</span><span className="font-bold">{volumeCalc.vol2x[0].toLocaleString('id-ID')} m</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-emerald-100">Sesi 2 (60%)</span><span className="font-bold">{volumeCalc.vol2x[1].toLocaleString('id-ID')} m</span></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm font-medium text-emerald-100 z-10 bg-emerald-700/30 p-3 rounded-lg border border-emerald-400/20 text-center">Target telah tercapai. Tingkatkan target VO2Max untuk melihat resep volume.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODAL POPUP SIMPAN DATABASE --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#111113]">
                            <h3 className="font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Save size={18} className="text-emerald-500"/> Simpan Hasil Tes</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-5 space-y-5">
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-500/20 flex justify-between items-center">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Hasil {testType.toUpperCase()}</span>
                                <div className="text-right">
                                    <div className="text-sm font-black text-emerald-800 dark:text-emerald-300">VO2Max: {activeResult.vo2max.toFixed(2)}</div>
                                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500">MAS: {activeResult.mas.toFixed(2)}</div>
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-2"><User size={14}/> Pilih Pemain</label>
                                <select required value={data.player_id} onChange={e => setData('player_id', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100 cursor-pointer">
                                    <option value="" disabled>-- Pilih Atlet --</option>
                                    {players && players.map(p => (<option key={p.id} value={p.id}>[{String(p.position_number).padStart(2,'0')}] {p.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-2"><Calendar size={14}/> Tanggal Tes</label>
                                <input type="date" required value={data.date} onChange={e => setData('date', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100 cursor-pointer" />
                            </div>
                            <button type="submit" disabled={processing} className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-black transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 mt-2">
                                {processing ? 'Menyimpan...' : 'Simpan ke Database'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}