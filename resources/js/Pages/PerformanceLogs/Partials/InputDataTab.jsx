// resources/js/Pages/PerformanceLogs/Partials/InputDataTab.jsx

import React from 'react';
import { Target } from 'lucide-react';
import ConfigurationHeader from './ConfigurationHeader';
import TrainingMetricsTable from './TrainingMetricsTable';
import MatchMetricsTable from './MatchMetricsTable';
import PlayerTrainingMetricsTable from './PlayerTrainingMetricsTable';
import PlayerMatchMetricsTable from './PlayerMatchMetricsTable';

export default function InputDataTab({ 
    log, 
    data, 
    setData, 
    errors, 
    team_benchmarks, 
    player_benchmarks, 
    getAutoCalculatedValue, 
    calculateTeamPercentage, 
    calculatePlayerPercentage, 
    handleChange 
}) {
    return (
        <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header Konfigurasi (Termasuk Team Benchmark) */}
            <ConfigurationHeader 
                data={data} 
                setData={setData} 
                benchmarks={team_benchmarks} 
                errors={errors} 
            />

            {/* SELECTOR PLAYER BENCHMARK (WAJIB) */}
            <div className="bg-amber-50/50 dark:bg-amber-900/10 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <Target size={18} /> Acuan Target Personal (Player Benchmark)
                    </h3>
                    <p className="text-[11px] font-semibold text-amber-600/70 mt-0.5">Wajib dipilih agar sistem dapat mengalkulasi persentase pencapaian individu.</p>
                </div>
                <div className="w-full sm:w-1/3">
                    <select 
                        required
                        value={data.player_benchmark_id}
                        onChange={e => setData('player_benchmark_id', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-700/50 rounded-lg text-sm font-bold px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm cursor-pointer"
                    >
                        <option value="" disabled>-- Wajib Pilih Target Individu --</option>
                        {player_benchmarks?.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    {errors.player_benchmark_id && <span className="text-red-500 text-xs mt-1">{errors.player_benchmark_id}</span>}
                </div>
            </div>

            <div className="bg-zinc-50/30 dark:bg-zinc-950 p-4 pb-0">
                {log.type === 'match' ? (
                    <>
                        <MatchMetricsTable 
                            data={data}
                            setData={setData}
                            getAutoCalculatedValue={getAutoCalculatedValue}
                            calculatePercentage={calculateTeamPercentage}
                            handleChange={handleChange}
                        />

                        {data.player_benchmark_id ? (
                            <PlayerMatchMetricsTable 
                                data={data}
                                setData={setData}
                                getAutoCalculatedValue={getAutoCalculatedValue}
                                calculatePercentage={calculatePlayerPercentage} 
                                handleChange={handleChange}
                            />
                        ) : (
                            <EmptyBenchmarkState />
                        )}
                    </>
                ) : (
                    <>
                        <TrainingMetricsTable 
                            data={data}
                            setData={setData}
                            getAutoCalculatedValue={getAutoCalculatedValue}
                            calculatePercentage={calculateTeamPercentage}
                            handleChange={handleChange}
                        />

                        {data.player_benchmark_id ? (
                            <PlayerTrainingMetricsTable 
                                data={data}
                                setData={setData}
                                getAutoCalculatedValue={getAutoCalculatedValue}
                                calculatePercentage={calculatePlayerPercentage} 
                                handleChange={handleChange}
                            />
                        ) : (
                            <EmptyBenchmarkState />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Komponen kecil khusus untuk state kosong
function EmptyBenchmarkState() {
    return (
        <div className="my-10 p-8 border-2 border-dashed border-amber-200 dark:border-amber-900/50 rounded-xl text-center bg-amber-50/30 dark:bg-amber-900/5">
            <Target size={32} className="mx-auto text-amber-400/50 mb-3" />
            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-500">Tabel Kalkulasi Individu Disembunyikan</h4>
            <p className="text-xs text-amber-600/70 mt-1 font-semibold">Tabel kalkulasi individual akan muncul setelah Anda memilih <strong className="text-amber-700 dark:text-amber-400">Acuan Target Personal</strong> di bagian atas.</p>
        </div>
    );
}