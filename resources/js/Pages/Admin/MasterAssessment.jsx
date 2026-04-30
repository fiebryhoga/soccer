// resources/js/Pages/Admin/MasterAssessment.jsx

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Settings, Plus, Edit2, Trash2, Save, X, Activity, Target } from 'lucide-react';

export default function MasterAssessment({ auth, categories }) {
    const [selectedCat, setSelectedCat] = useState(categories[0] || null);
    
    // --- STATE & FORM UNTUK KATEGORI ---
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const catForm = useForm({
        id: null, name: '', body_part: 'legs',
        periodization_rules: [
            { min: 90, max: 100, label: '' },
            { min: 80, max: 89, label: '' },
            { min: 61, max: 79, label: '' },
            { min: 0, max: 60, label: '' }
        ]
    });

    const openCatModal = (cat = null) => {
        if (cat) {
            catForm.setData({
                id: cat.id, name: cat.name, body_part: cat.body_part || 'legs',
                periodization_rules: cat.periodization_rules || []
            });
        } else {
            catForm.reset();
        }
        setIsCatModalOpen(true);
    };

    const saveCategory = (e) => {
        e.preventDefault();
        catForm.post(route('master.assessment.storeCategory'), {
            onSuccess: () => {
                setIsCatModalOpen(false);
                // Refresh data kategori yang terpilih jika sedang diedit
                router.reload({ only: ['categories'] });
            }
        });
    };

    const deleteCategory = (id) => {
        if(confirm('Yakin ingin menghapus Kategori ini beserta seluruh Item Tes di dalamnya?')) {
            router.delete(route('master.assessment.destroyCategory', id));
        }
    };

    const updateRuleLabel = (index, value) => {
        const newRules = [...catForm.data.periodization_rules];
        newRules[index].label = value;
        catForm.setData('periodization_rules', newRules);
    };

    const updateRuleRange = (index, field, value) => {
        const newRules = [...catForm.data.periodization_rules];
        newRules[index][field] = parseInt(value) || 0;
        catForm.setData('periodization_rules', newRules);
    };


    // --- STATE & FORM UNTUK ITEM TES (METRIK) ---
    const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
    const metricForm = useForm({
        id: null, category_id: null, name: '', unit: '', target_value: '', is_lower_better: false
    });

    const openMetricModal = (metric = null) => {
        if (metric) {
            metricForm.setData({
                id: metric.id, category_id: selectedCat.id, name: metric.name, 
                unit: metric.unit, target_value: metric.target_value, is_lower_better: metric.is_lower_better
            });
        } else {
            metricForm.reset();
            metricForm.setData('category_id', selectedCat.id);
        }
        setIsMetricModalOpen(true);
    };

    const saveMetric = (e) => {
        e.preventDefault();
        metricForm.post(route('master.assessment.storeMetric'), {
            onSuccess: () => setIsMetricModalOpen(false)
        });
    };

    const deleteMetric = (id) => {
        if(confirm('Yakin ingin menghapus Item Tes ini?')) {
            router.delete(route('master.assessment.destroyMetric', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Master Assessment CMS" headerDescription="Atur seluruh konfigurasi kategori, periodisasi, dan item tes dari sini.">
            <Head title="Master Assessment" />

            <div className="max-w-7xl mx-auto pb-12 flex flex-col md:flex-row gap-6">
                
                {/* --- BAGIAN KIRI: DAFTAR KATEGORI --- */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Settings size={16} className="text-blue-500"/> Kategori Tes</h3>
                            <button onClick={() => openCatModal()} className="text-blue-500 hover:text-blue-600 transition-colors"><Plus size={20}/></button>
                        </div>
                        <div className="p-2 flex flex-col gap-1 overflow-y-auto max-h-[600px]">
                            {categories.map(cat => (
                                <div key={cat.id} 
                                    onClick={() => setSelectedCat(cat)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center group ${selectedCat?.id === cat.id ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent'}`}>
                                    <div>
                                        <h4 className={`text-sm font-bold ${selectedCat?.id === cat.id ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{cat.name}</h4>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{cat.metrics.length} Item Tes</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); openCatModal(cat); }} className="text-zinc-400 hover:text-orange-500"><Edit2 size={14}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} className="text-zinc-400 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- BAGIAN KANAN: DETAIL & ITEM TES --- */}
                <div className="w-full md:w-2/3 flex flex-col gap-6">
                    {selectedCat ? (
                        <>
                            {/* Panel Info & Periodisasi */}
                            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <div>
                                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{selectedCat.name}</h3>
                                        <p className="text-[11px] font-bold text-zinc-500 mt-1">Area Mapping: <span className="text-blue-500 uppercase">{selectedCat.body_part}</span></p>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Aturan Tahapan Periodisasi</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedCat.periodization_rules?.map((rule, idx) => (
                                            <div key={idx} className="bg-zinc-50 dark:bg-[#111113] p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                                                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 w-16">{rule.min}% - {rule.max}%</span>
                                                <span className="text-xs font-bold text-zinc-500 text-right">{rule.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Panel Item Tes (Metrics) */}
                            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Activity size={18} className="text-emerald-500"/> Daftar Item Tes</h3>
                                    <button onClick={() => openMetricModal()} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                                        <Plus size={14}/> Tambah Tes
                                    </button>
                                </div>
                                <div className="p-5 divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {selectedCat.metrics.length === 0 && <p className="text-sm text-zinc-500 text-center py-4">Belum ada item tes di kategori ini.</p>}
                                    {selectedCat.metrics.map(metric => (
                                        <div key={metric.id} className="py-4 flex justify-between items-center group">
                                            <div>
                                                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">{metric.name}</h4>
                                                <div className="flex gap-3 mt-1.5">
                                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1"><Target size={10}/> Target: {metric.target_value} {metric.unit}</span>
                                                    <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded">Logic: {metric.is_lower_better ? 'Waktu (Makin kecil makin bagus)' : 'Beban/Jarak (Makin besar makin bagus)'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openMetricModal(metric)} className="p-2 text-zinc-400 hover:text-orange-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg"><Edit2 size={16}/></button>
                                                <button onClick={() => deleteMetric(metric.id)} className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg"><Trash2 size={16}/></button>
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
                            <p className="text-sm font-bold text-zinc-500 mt-2">Pilih kategori di sebelah kiri untuk melihat detail atau klik + untuk membuat kategori baru.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL KATEGORI & PERIODISASI */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#111113]">
                            <h3 className="font-black text-zinc-900 dark:text-zinc-100">{catForm.data.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
                            <button onClick={() => setIsCatModalOpen(false)} className="text-zinc-400 hover:text-red-500"><X size={20}/></button>
                        </div>
                        <form onSubmit={saveCategory} className="p-5 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-2">Nama Kategori</label>
                                    <input type="text" required value={catForm.data.name} onChange={e => catForm.setData('name', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cth: Flexibility"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-2">Mapping SVG Tubuh</label>
                                    <select value={catForm.data.body_part} onChange={e => catForm.setData('body_part', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="legs">Kaki (Legs)</option>
                                        <option value="arms">Lengan (Arms)</option>
                                        <option value="core">Inti (Core/Perut)</option>
                                        <option value="heart">Jantung (Endurance)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">Aturan Periodisasi</label>
                                <div className="space-y-3">
                                    {catForm.data.periodization_rules.map((rule, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input type="number" value={rule.min} onChange={e => updateRuleRange(idx, 'min', e.target.value)} className="w-16 bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold py-2 px-2 text-center tabular-nums"/>
                                            <span className="text-zinc-400 font-bold">% s/d</span>
                                            <input type="number" value={rule.max} onChange={e => updateRuleRange(idx, 'max', e.target.value)} className="w-16 bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold py-2 px-2 text-center tabular-nums"/>
                                            <span className="text-zinc-400 font-bold">% :</span>
                                            <input type="text" value={rule.label} onChange={e => updateRuleLabel(idx, e.target.value)} className="flex-1 bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold py-2 px-3" placeholder="Nama Tahapan (Cth: Hypertrophy)"/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={catForm.processing} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black transition-colors disabled:opacity-50">
                                {catForm.processing ? 'Menyimpan...' : 'Simpan Kategori'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ITEM TES (METRIK) */}
            {isMetricModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#111113]">
                            <h3 className="font-black text-zinc-900 dark:text-zinc-100">{metricForm.data.id ? 'Edit Item Tes' : 'Tambah Item Tes Baru'}</h3>
                            <button onClick={() => setIsMetricModalOpen(false)} className="text-zinc-400 hover:text-red-500"><X size={20}/></button>
                        </div>
                        <form onSubmit={saveMetric} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2">Nama Tes</label>
                                <input type="text" required value={metricForm.data.name} onChange={e => metricForm.setData('name', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Cth: 20m Sprint"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-2">Satuan (Unit)</label>
                                    <input type="text" required value={metricForm.data.unit} onChange={e => metricForm.setData('unit', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Cth: sec, cm, kg"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-2">Target Acuan</label>
                                    <input type="number" step="0.01" required value={metricForm.data.target_value} onChange={e => metricForm.setData('target_value', e.target.value)} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums" placeholder="Cth: 3.20"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2">Logika Penilaian</label>
                                <select value={metricForm.data.is_lower_better ? 'true' : 'false'} onChange={e => metricForm.setData('is_lower_better', e.target.value === 'true')} className="w-full bg-zinc-50 dark:bg-[#111113] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500">
                                    <option value="false">Makin BESAR makin bagus (Beban/Jarak)</option>
                                    <option value="true">Makin KECIL makin bagus (Waktu/Sprint)</option>
                                </select>
                            </div>
                            <button type="submit" disabled={metricForm.processing} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-black transition-colors disabled:opacity-50 mt-4">
                                {metricForm.processing ? 'Menyimpan...' : 'Simpan Item Tes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}