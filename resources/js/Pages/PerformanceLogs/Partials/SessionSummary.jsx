import React from 'react';
import { Calendar, Tag as TagIcon, Map, Zap, Flame, Activity } from 'lucide-react';

export default function SessionSummary({ sessionData }) {
    return (
        <div className="space-y-6">
            {/* Header Sesi */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {sessionData.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                            <Calendar size={14} className="text-blue-500" />
                            {new Date(sessionData.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {sessionData.tag && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                                <TagIcon size={14} className="text-emerald-500" />
                                <span className="uppercase tracking-wider px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded">{sessionData.tag}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-lg text-center shadow-inner">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Partisipasi</p>
                    <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{sessionData.playerMetrics.length} <span className="text-xs font-semibold text-zinc-500">Pemain</span></p>
                </div>
            </div>

            {/* Rata-Rata Tim (Team Averages) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Jarak Rata-rata</p>
                        <Map size={16} className="text-teal-500" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
                            {sessionData.teamAverages?.total_distance || 0}
                        </h4>
                        <p className="text-xs font-bold text-zinc-400 mt-1">Meter</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Jarak Sprint</p>
                        <Zap size={16} className="text-yellow-500" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
                            {sessionData.teamAverages?.sprint_distance || 0}
                        </h4>
                        <p className="text-xs font-bold text-zinc-400 mt-1">Meter</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Max Velocity</p>
                        <Flame size={16} className="text-orange-500" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
                            {sessionData.teamAverages?.max_velocity || 0}
                        </h4>
                        <p className="text-xs font-bold text-zinc-400 mt-1">km/h</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Player Load</p>
                        <Activity size={16} className="text-purple-500" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
                            {sessionData.teamAverages?.player_load || 0}
                        </h4>
                        <p className="text-xs font-bold text-zinc-400 mt-1">AU</p>
                    </div>
                </div>
            </div>
        </div>
    );
}