// resources/js/Pages/Formula/StrengthRatio.jsx

import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Dumbbell, ActivitySquare, Scale, Settings2, Save, X, User, Calendar, CheckCircle2 } from 'lucide-react';

const RATIO_MODELS = {
    'bench_press': {
        name: 'Bench Press (100%)',
        exercises: [
            { name: 'Decline press', ratio: 1.05 }, { name: 'Incline press', ratio: 0.80 },
            { name: 'Narrow grip BP', ratio: 0.90 }, { name: 'Close grip BP', ratio: 0.80 },
            { name: 'DB bench press', ratio: 0.33 }, { name: 'Push press', ratio: 0.66 },
            { name: 'Front/military press', ratio: 0.55 }, { name: 'DB shoulder press', ratio: 0.20 },
        ]
    },
    'supinated_chin': {
        name: 'Supinated Chin (100%)',
        exercises: [
            { name: 'Pronated chin', ratio: 0.90 }, { name: 'CG pulldown', ratio: 0.95 },
            { name: 'Wide RG pulldown', ratio: 0.90 }, { name: 'Wide B Neck PLD', ratio: 0.75 },
            { name: 'Seated row', ratio: 0.75 }, { name: 'Bench pull', ratio: 0.65 },
            { name: '1-arm DB row', ratio: 0.33 }, { name: 'Upright row', ratio: 0.50 },
        ]
    },
    'front_squat': {
        name: 'Front Squat (100%)',
        exercises: [
            { name: 'Back squat', ratio: 1.20 }, { name: 'Lunge', ratio: 0.60 },
            { name: 'Step-ups', ratio: 0.60 }, { name: '1 leg-squats', ratio: 0.60 },
            { name: 'Lateral lunge', ratio: 0.40 }, { name: 'Power Clean', ratio: 0.75 },
            { name: 'Deadlift', ratio: 1.20 }, { name: 'Romanian DL', ratio: 0.90 },
        ]
    }
};

const MULTIPLIERS = {
    stage3: { 1: 1, 2: 1.04, 3: 1.06, 4: 1.08, 5: 1.11, 6: 1.13, 7: 1.16, 8: 1.19, 9: 1.22, 10: 1.25 },
    stage4: { 1: 1, 2: 1.05, 3: 1.08, 4: 1.12, 5: 1.16, 6: 1.20, 7: 1.23, 8: 1.26, 9: 1.29, 10: 1.33 }
};

export default function StrengthRatio({ auth, players }) {
    // --- STATE INPUT ---
    const [method, setMethod] = useState('epley');
    const [weight, setWeight] = useState(60); 
    const [reps, setReps] = useState(5);     
    const [baseExercise, setBaseExercise] = useState('bench_press');

    // --- STATE UI (MODAL & TOAST) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // --- KALKULASI 1RM ---
    const estimated1RM = useMemo(() => {
        if (!weight || !reps) return 0;
        const w = parseFloat(weight);
        const r = parseInt(reps);
        if (r === 1) return w; 
        if (method === 'epley') return w * (1 + (0.0333 * r));
        else if (method === 'stage3') return w * (MULTIPLIERS.stage3[r] || (1 + (0.0333 * r)));
        else if (method === 'stage4') return w * (MULTIPLIERS.stage4[r] || (1 + (0.0333 * r)));
        return 0;
    }, [weight, reps, method]);

    const activeRatioData = RATIO_MODELS[baseExercise];

    // --- FORM SIMPAN ---
    const { data, setData, post, processing, reset } = useForm({
        player_id: '', date: new Date().toISOString().split('T')[0], category: 'strength', test_name: method, results: {}
    });

    const openSaveModal = () => {
        setData('test_name', method);
        setData('results', { 
            estimated_1rm: Math.round(estimated1RM), 
            base_exercise: baseExercise, 
            raw_inputs: { weight, reps } 
        });
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        post(route('formula.saveTest'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset('player_id');
                setToastMessage('Data tes Strength berhasil disimpan!');
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Strength & Ratio Calculator" headerDescription="Estimasi 1RM dan pemodelan rasio keseimbangan struktural otot atlet.">
            <Head title="Strength Formula Calculator" />

            {/* --- CUSTOM TOAST NOTIFICATION --- */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[60] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm transform transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">
                    <CheckCircle2 size={18} className="text-orange-500" />
                    {toastMessage}
                </div>
            )}

            <div className="max-w-6xl mx-auto pb-12 space-y-6 relative">
                
                {/* --- HEADER TOMBOL SIMPAN --- */}
                <div className="flex justify-end bg-transparent">
                    <button onClick={openSaveModal} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm">
                        <Save size={16} /> Simpan Hasil 1RM
                    </button>
                </div>

                {/* --- BAGIAN ATAS: INPUT & ESTIMASI 1RM --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Dumbbell className="text-orange-500" size={20} />
                            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">Parameter Angkatan</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1.5"><Settings2 size={12} /> Rumus Estimasi 1RM</label>
                                <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-lg text-sm font-black py-2.5 px-3 text-orange-700 dark:text-orange-400 focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer">
                                    <option value="epley">Formula Epley (Standar)</option>
                                    <option value="stage3">Stage 3 (Koefisien Atlet)</option>
                                    <option value="stage4">Stage 4 (Koefisien Elite)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Pilih Base Exercise</label>
                                <select value={baseExercise} onChange={(e) => setBaseExercise(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer">
                                    <option value="bench_press">Bench Press</option>
                                    <option value="supinated_chin">Supinated Chin</option>
                                    <option value="front_squat">Front Squat</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Beban (Kg)</label>
                                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all tabular-nums" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Repetisi (Reps)</label>
                                <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all tabular-nums" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-500 dark:bg-orange-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center relative overflow-hidden">
                        <ActivitySquare className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-orange-200 mb-2">Estimasi 1RM</h4>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl lg:text-6xl font-black tabular-nums tracking-tighter leading-none">{estimated1RM ? Math.round(estimated1RM) : '0'}</span>
                            <span className="text-lg font-bold text-orange-200 mb-1">kg</span>
                        </div>
                        <p className="text-xs font-medium text-orange-100 mt-4 leading-relaxed">
                            Berdasarkan angkatan {weight || 0}kg x {reps || 0} reps <br/>
                            <span className="font-bold border-b border-orange-300">({method === 'epley' ? 'Epley' : method === 'stage3' ? 'Stage 3' : 'Stage 4'})</span>.
                        </p>
                    </div>
                </div>

                {/* --- BAGIAN BAWAH: RATIO MODELLING TABLE --- */}
                <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
                        <div className="flex items-center gap-2">
                            <Scale className="text-blue-500" size={20} />
                            <div>
                                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-none">Ratio Modelling</h3>
                                <p className="text-[11px] font-medium text-zinc-500 mt-1.5">Acuan: {activeRatioData.name}</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
                        {activeRatioData.exercises.map((exercise, idx) => {
                            const targetWeight = parseFloat(weight) * exercise.ratio;
                            return (
                                <div key={idx} className="p-5 flex flex-col gap-1 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{exercise.name}</span>
                                        <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full">{Math.round(exercise.ratio * 100)}%</span>
                                    </div>
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">{targetWeight ? Math.round(targetWeight) : '0'}</span>
                                        <span className="text-xs font-bold text-zinc-400 mb-0.5">kg</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-zinc-500 mt-2">Target untuk <span className="font-bold">{reps || 0} reps</span>.</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- MODAL POPUP SIMPAN DATABASE --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#111113]">
                            <h3 className="font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Save size={18} className="text-orange-500"/> Simpan Hasil 1RM</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-5 space-y-5">
                            <div className="bg-orange-50 dark:bg-orange-500/10 p-3 rounded-lg border border-orange-100 dark:border-orange-500/20 flex justify-between items-center">
                                <span className="text-xs font-bold text-orange-700 dark:text-orange-400">Estimasi 1RM</span>
                                <div className="text-right">
                                    <div className="text-lg font-black text-orange-800 dark:text-orange-300">{Math.round(estimated1RM)} kg</div>
                                    <div className="text-[10px] font-bold text-orange-600 dark:text-orange-500">{activeRatioData.name}</div>
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-2"><User size={14}/> Pilih Pemain</label>
                                <select required value={data.player_id} onChange={e => setData('player_id', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-orange-500 text-zinc-900 dark:text-zinc-100 cursor-pointer">
                                    <option value="" disabled>-- Pilih Atlet --</option>
                                    {players && players.map(p => (<option key={p.id} value={p.id}>[{String(p.position_number).padStart(2,'0')}] {p.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-2"><Calendar size={14}/> Tanggal Tes</label>
                                <input type="date" required value={data.date} onChange={e => setData('date', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-orange-500 text-zinc-900 dark:text-zinc-100 cursor-pointer" />
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