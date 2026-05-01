// resources/js/Pages/Benchmarks/AssessmentMaster.jsx

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Settings, Plus, Edit2, Trash2, Save, X, Activity, Target, Layers } from 'lucide-react';

export default function AssessmentMaster({ auth, categories }) {
    const [selectedCat, setSelectedCat] = useState(categories[0] || null);
    
    // Perbarui selectedCat jika ada respons dari server (setelah save)
    useEffect(() => {
        if (selectedCat) {
            const updated = categories.find(c => c.id === selectedCat.id);
            if (updated) setSelectedCat(updated);
        }
    }, [categories]);

    // ==========================================
    // FORM 1: TAHAPAN BIOMOTORIK
    // ==========================================
    const biomotorForm = useForm({ biomotor_stages: [] });

    // Set data saat kategori berubah
    useEffect(() => {
        if (selectedCat) {
            biomotorForm.setData('biomotor_stages', selectedCat.biomotor_stages || []);
        }
    }, [selectedCat]);

    const addBiomotorStage = () => {
        biomotorForm.setData('biomotor_stages', [
            ...biomotorForm.data.biomotor_stages, 
            { min: 0, max: 0, label: '' }
        ]);
    };

    const removeBiomotorStage = (index) => {
        const newStages = [...biomotorForm.data.biomotor_stages];
        newStages.splice(index, 1);
        biomotorForm.setData('biomotor_stages', newStages);
    };

    const updateBiomotorRule = (index, field, value) => {
        const newStages = [...biomotorForm.data.biomotor_stages];
        newStages[index][field] = field === 'label' ? value : (parseInt(value) || 0);
        biomotorForm.setData('biomotor_stages', newStages);
    };

    const saveBiomotor = (e) => {
        e.preventDefault();
        biomotorForm.put(route('benchmarks.assessments.updateBiomotor', selectedCat.id), {
            preserveScroll: true
        });
    };

    // ==========================================
    // FORM 2: ITEM TES (METRIK)
    // ==========================================
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const itemForm = useForm({
        id: null, category_id: null, name: '', parameter_type: 'reps', target_benchmark: '', is_lower_better: false
    });

    const openItemModal = (item = null) => {
        if (item) {
            itemForm.setData({
                id: item.id, category_id: selectedCat.id, name: item.name, 
                parameter_type: item.parameter_type, target_benchmark: item.target_benchmark, is_lower_better: item.is_lower_better
            });
        } else {
            itemForm.reset();
            itemForm.setData({ category_id: selectedCat.id, parameter_type: 'reps', is_lower_better: false });
        }
        setIsItemModalOpen(true);
    };

    const saveTestItem = (e) => {
        e.preventDefault();
        itemForm.post(route('benchmarks.assessments.storeTestItem'), {
            onSuccess: () => setIsItemModalOpen(false),
            preserveScroll: true
        });
    };

    const deleteTestItem = (id) => {
        if(confirm('Yakin ingin menghapus Item Tes ini?')) {
            router.delete(route('benchmarks.assessments.destroyTestItem', id), { preserveScroll: true });
        }
    };

    // Helper untuk label unit
    const getUnitLabel = (type) => {
        const labels = { points: 'Points', reps: 'Reps', cm: 'cm', s: 'Detik (s)', vo2max: 'ml/kg/min', m: 'Meter (m)', min: 'Menit (min)', kg: 'kg' };
        return labels[type] || type;
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Benchmark Assessment Config" headerDescription="Atur parameter item tes fisik dan tahapan biomotorik per kategori.">
            <Head title="Assessment Configuration" />

            <div className="max-w-7xl mx-auto pb-12 flex flex-col md:flex-row gap-6">
                
                {/* --- KIRI: DAFTAR KATEGORI --- */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Layers size={16} className="text-blue-500"/> Kategori Tes</h3>
                        </div>
                        <div className="p-2 flex flex-col gap-1 overflow-y-auto max-h-[700px]">
                            {categories.map(cat => (
                                <div key={cat.id} onClick={() => setSelectedCat(cat)} className={`p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center group ${selectedCat?.id === cat.id ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent'}`}>
                                    <div>
                                        <h4 className={`text-sm font-bold ${selectedCat?.id === cat.id ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{cat.name}</h4>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{cat.test_items.length} Item Tes</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- KANAN: KONFIGURASI DETAIL --- */}
                <div className="w-full md:w-2/3 flex flex-col gap-6">
                    {selectedCat ? (
                        <>
                            {/* PANEL 1: TAHAPAN BIOMOTORIK */}
                            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{selectedCat.name} - Biomotor Stages</h3>
                                </div>
                                <form onSubmit={saveBiomotor} className="p-5">
                                    <p className="text-xs text-zinc-500 mb-4">Tambahkan rentang persentase untuk menentukan tahapan atlet pada kategori ini. Kosongkan jika kategori ini tidak memiliki tahapan.</p>
                                    
                                    <div className="space-y-3 mb-5">
                                        {biomotorForm.data.biomotor_stages.map((stage, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-zinc-50 dark:bg-[#111113] p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                                <input type="number" value={stage.min} onChange={e => updateBiomotorRule(idx, 'min', e.target.value)} className="w-16 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-600 rounded-md text-xs font-bold py-1.5 text-center tabular-nums" required placeholder="Min"/>
                                                <span className="text-zinc-400 font-bold text-[10px]">% s/d</span>
                                                <input type="number" value={stage.max} onChange={e => updateBiomotorRule(idx, 'max', e.target.value)} className="w-16 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-600 rounded-md text-xs font-bold py-1.5 text-center tabular-nums" required placeholder="Max"/>
                                                <span className="text-zinc-400 font-bold text-[10px]">% :</span>
                                                <input type="text" value={stage.label} onChange={e => updateBiomotorRule(idx, 'label', e.target.value)} className="flex-1 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-600 rounded-md text-xs font-bold py-1.5 px-3" required placeholder="Cth: Hypertrophy / Speed Dev"/>
                                                <button type="button" onClick={() => removeBiomotorStage(idx)} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md bg-white dark:bg-zinc-800"><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button type="button" onClick={addBiomotorStage} className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors">+ Tambah Tahapan</button>
                                        <button type="submit" disabled={biomotorForm.processing} className="px-6 py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg shadow-sm disabled:opacity-50 hover:bg-zinc-800 transition-colors">
                                            {biomotorForm.processing ? 'Menyimpan...' : 'Simpan Tahapan'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* PANEL 2: ITEM TES (METRIK) */}
                            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Activity size={18} className="text-emerald-500"/> Daftar Item Tes</h3>
                                    <button onClick={() => openItemModal()} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                                        <Plus size={14}/> Tambah Tes
                                    </button>
                                </div>
                                <div className="p-5 divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {selectedCat.test_items.length === 0 && <p className="text-sm text-zinc-500 text-center py-6">Belum ada item tes. Klik 'Tambah Tes' untuk membuat.</p>}
                                    {selectedCat.test_items.map(item => (
                                        <div key={item.id} className="py-4 flex justify-between items-center group">
                                            <div>
                                                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">{item.name}</h4>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded">
                                                        Sistem: {item.is_lower_better ? 'Makin KECIL makin bagus' : 'Makin BESAR makin bagus'}
                                                    </span>
                                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Target size={10}/> Target 100%: {item.target_benchmark} {getUnitLabel(item.parameter_type)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openItemModal(item)} className="p-2 text-zinc-400 hover:text-orange-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg transition-colors"><Edit2 size={16}/></button>
                                                <button onClick={() => deleteTestItem(item.id)} className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-12 flex flex-col items-center justify-center h-full text-center">
                            <Settings size={48} className="text-zinc-200 dark:text-zinc-800 mb-4" />
                            <h3 className="text-lg font-black text-zinc-400">Pilih Kategori</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL TAMBAH/EDIT ITEM TES */}
            {isItemModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#111113]">
                            <h3 className="font-black text-zinc-900 dark:text-zinc-100">{itemForm.data.id ? 'Edit Item Tes' : 'Tambah Item Tes'}</h3>
                            <button onClick={() => setIsItemModalOpen(false)} className="text-zinc-400 hover:text-red-500"><X size={20}/></button>
                        </div>
                        <form onSubmit={saveTestItem} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2">Nama Tes</label>
                                <input type="text" required value={itemForm.data.name} onChange={e => itemForm.setData('name', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Cth: 20m Sprint / Bench Press"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-2">Parameter (Satuan)</label>
                                    <select value={itemForm.data.parameter_type} onChange={e => itemForm.setData('parameter_type', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500">
                                        <option value="points">Points (Score)</option>
                                        <option value="reps">Repetitions (Reps)</option>
                                        <option value="cm">Centimeters (cm)</option>
                                        <option value="s">Seconds (s)</option>
                                        <option value="min">Minutes (min)</option>
                                        <option value="m">Meters (m)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="vo2max">VO2Max (ml/kg/min)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-2">Target Acuan (100%)</label>
                                    <input type="number" step="0.01" required value={itemForm.data.target_benchmark} onChange={e => itemForm.setData('target_benchmark', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums" placeholder="Cth: 100 / 3.2"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2">Logika Pencapaian (Penting!)</label>
                                <select value={itemForm.data.is_lower_better ? 'true' : 'false'} onChange={e => itemForm.setData('is_lower_better', e.target.value === 'true')} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500 text-blue-600 dark:text-blue-400">
                                    <option value="false">Makin BESAR angkanya, makin BAGUS nilainya (Contoh: Beban kg, Jarak cm, Reps)</option>
                                    <option value="true">Makin KECIL angkanya, makin BAGUS nilainya (Contoh: Waktu lari sprint detik)</option>
                                </select>
                            </div>
                            <button type="submit" disabled={itemForm.processing} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-black transition-colors disabled:opacity-50 mt-4 shadow-sm">
                                {itemForm.processing ? 'Menyimpan...' : 'Simpan Item Tes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}