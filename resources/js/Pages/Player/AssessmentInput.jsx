import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, Activity, Target, CheckCircle2, UserSearch } from 'lucide-react';

export default function AssessmentInput({ auth, player, categories, history }) {
    const [activeTab, setActiveTab] = useState(categories[0]?.id || null);

    // Ambil data yang sudah ada di database untuk ditampilkan
    const initialResults = {};
    history.forEach(record => {
        initialResults[record.assessment_test_item_id] = record.result_value;
    });

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        results: initialResults 
    });

    const handleResultChange = (itemId, value) => {
        setData('results', { ...data.results, [itemId]: value });
    };

    const submitForm = (e) => {
        e.preventDefault();
        post(route('players.assessments.store', player.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle={`Input Fisik : ${player.name}`} headerDescription="Update angka hasil tes atlet.">
            <Head title={`Input Assessment - ${player.name}`} />

            {recentlySuccessful && (
                <div className="fixed bottom-6 right-6 z-[60] bg-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm animate-in fade-in slide-in-from-bottom-5">
                    <CheckCircle2 size={18} /> Data Berhasil Diperbarui!
                </div>
            )}

            <div className="max-w-7xl mx-auto pb-12 flex flex-col gap-6">
                
                {/* Tombol ke Dashboard SVG */}
                <div className="flex justify-end">
                    <Link href={route('profiling.show', player.id)} className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-xl font-black text-sm shadow-md hover:bg-zinc-800 transition-colors">
                        <UserSearch size={16} /> Buka Dashboard Profil SVG
                    </Link>
                </div>

                <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                        <div className="flex items-center gap-2">
                            <Activity className="text-blue-500" size={20} />
                            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-none">Formulir Update Fisik</h3>
                        </div>
                    </div>

                    <form onSubmit={submitForm}>
                        <div className="flex overflow-x-auto border-b border-zinc-100 dark:border-zinc-800 scrollbar-hide">
                            {categories.map(cat => (
                                <button type="button" key={cat.id} onClick={() => setActiveTab(cat.id)} className={`px-6 py-4 text-sm font-black whitespace-nowrap transition-colors border-b-2 ${activeTab === cat.id ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5' : 'border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {categories.map(cat => (
                                <div key={cat.id} className={activeTab === cat.id ? 'block' : 'hidden'}>
                                    {/* MENGGUNAKAN test_items KARENA LARAVEL JSON SERIALIZATION */}
                                    {cat.test_items?.length === 0 ? (
                                        <div className="text-center py-12 text-zinc-500 font-bold text-sm">Belum ada item tes di kategori ini.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {cat.test_items?.map(item => {
                                                const currentValue = data.results[item.id] !== undefined ? data.results[item.id] : '';
                                                return (
                                                    <div key={item.id} className="bg-zinc-50 dark:bg-[#111113] p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <label className="block text-sm font-black text-zinc-900 dark:text-zinc-100">{item.name}</label>
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <Target size={12} className="text-zinc-400"/>
                                                                    <p className="text-[11px] font-bold text-zinc-500">
                                                                        Acuan 100%: <span className="text-emerald-600 dark:text-emerald-400">{item.target_benchmark} {item.parameter_type}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <input type="number" step="0.01" value={currentValue} onChange={e => handleResultChange(item.id, e.target.value)} className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-600 rounded-lg text-lg font-black py-2.5 pl-4 pr-16 outline-none focus:ring-2 focus:ring-blue-500 tabular-nums" placeholder="0.00" />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-widest font-black text-zinc-400">{item.parameter_type}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                            <button type="submit" disabled={processing} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black transition-all shadow-sm disabled:opacity-50">
                                <Save size={18} /> {processing ? 'Menyimpan...' : 'Perbarui Data'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}