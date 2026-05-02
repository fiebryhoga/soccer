// resources/js/Pages/BodyComposition/Show.jsx

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, BarChart2 } from 'lucide-react';

import ProfileHeader from './Partials/ProfileHeader';
import SmartInsights from './Partials/SmartInsights';
import AnalyticsDashboard from './Partials/AnalyticsDashboard';
import CompositionAnatomy from './Partials/CompositionAnatomy';
import HistoryTable from './Partials/HistoryTable';
import CompositionModal from './Partials/CompositionModal';

export default function Show({ auth, player, history, benchmarks }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle={`Body Composition: ${player.name}`} 
            headerDescription="Analisis detail komposisi tubuh, riwayat tes, dan AI Smart Insights."
        >
            <Head title={`Composition - ${player.name}`} />
            
            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* Navigasi Kembali */}
                <div className="flex justify-start">
                    <Link href={route('analysis.composition.index')} className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold text-xs transition-colors">
                        <ChevronLeft size={16} strokeWidth={3} /> Kembali ke Daftar Pemain
                    </Link>
                </div>

                {/* Header Profil Singkat & Tombol Tambah Data */}
                <ProfileHeader player={player} onOpenModal={() => setIsModalOpen(true)} />

                {history.length > 0 ? (
                    <div className="space-y-6">
                        {/* WIDGET SMART INSIGHTS (AI) */}
                        <SmartInsights history={history} player={player} benchmarks={benchmarks} />
                        
                        {/* GRAFIK TREND KOMPOSISI */}
                        <AnalyticsDashboard 
                            history={history} 
                            athlete={player} // Pastikan ini juga terkirim! Di komponen dinamai athlete/player
                            benchmarks={benchmarks} 
                        />

                        <CompositionAnatomy history={history} player={player} />
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-16 text-center shadow-sm">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-800">
                            <BarChart2 className="text-zinc-400 dark:text-zinc-500" size={32} />
                        </div>
                        <h3 className="text-zinc-900 dark:text-white font-black uppercase tracking-widest text-sm">Belum Ada Data Tes</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mt-2 max-w-sm mx-auto">
                            Silakan lakukan input data tes komposisi tubuh pertama untuk memunculkan statistik dan analisis otomatis.
                        </p>
                    </div>
                )}

                

                {/* TABEL/LIST RIWAYAT TES */}
                <HistoryTable history={history} player={player} benchmarks={benchmarks} />

            </div>

            {/* MODAL FORM INPUT DATA */}
            <CompositionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                player={player} 
            />

        </AuthenticatedLayout>
    );
}