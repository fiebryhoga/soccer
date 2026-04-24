import { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Activity, Calendar, UploadCloud, Trash2, CheckCircle2, AlertTriangle, Loader2, Info } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';

export default function Index({ auth, date, metrics, benchmarks, players }) {
    const [selectedDate, setSelectedDate] = useState(date);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // ========================================================
    // LOGIKA PERHITUNGAN PERSENTASE (DYNAMIC BENCHMARKING)
    // ========================================================
    const calcPercent = (actual, target) => {
        if (!actual || !target || target === 0) return "-";
        
        // Ambil angka saja (hilangkan koma/titik jika ada format aneh, lalu parse ke Float)
        const numActual = parseFloat(String(actual).replace(/,/g, '.'));
        const numTarget = parseFloat(String(target).replace(/,/g, '.'));
        
        if (isNaN(numActual) || isNaN(numTarget)) return "-";
        
        const percentage = (numActual / numTarget) * 100;
        return percentage.toFixed(1) + "%";
    };

    // Fungsi ganti tanggal filter
    const handleFilterDate = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        router.get(route('metrics.index'), { date: newDate }, { preserveState: true });
    };

    const resetDailyData = () => {
        if (confirm(`Yakin ingin menghapus SEMUA data latihan pada tanggal ${selectedDate}?`)) {
            router.delete(route('metrics.destroyByDate'), { data: { date: selectedDate } });
        }
    };

    // ========================================================
    // LOGIKA FORM UPLOAD MASSAL (EXCEL SMART PASTE)
    // ========================================================
    const { data, setData, post, processing, errors, reset } = useForm({
        date: date,
        benchmark_id: '',
        players_data: [], // Berisi array objek hasil paste
    });

    const [pastePreview, setPastePreview] = useState([]);
    const [pasteError, setPasteError] = useState("");

    // FUNGSI INTI: Membaca teks dari Excel dan mengubahnya ke JSON
    const handleExcelPaste = (e) => {
        e.preventDefault();
        setPasteError("");
        const pasteText = e.clipboardData.getData('text');
        
        // Pisahkan per baris (Enter) dan per kolom (Tab)
        const rows = pasteText.split('\n').map(row => row.split('\t'));
        
        let extractedData = [];
        let previewData = [];

        rows.forEach((row, index) => {
            if (row.length < 5) return; // Abaikan baris kosong atau tidak valid

            // BACA INDEKS EXCEL (Berdasarkan format klien Anda):
            // Row[2] = NP (Nomor Posisi)
            // Row[3] = Nama
            // Row[4] = Total Duration
            // Row[5] = Total Distance
            // Row[7] = Distance / min
            // Row[10] = Accels >3m/s/s
            // Row[11] = Decels >3m/s/s
            // Row[17] = Max Velocity
            // Row[21] = SPRINT
            // Row[24] = Player Load
            
            const np = parseInt(row[2]?.trim());
            
            // Cari pemain di database berdasarkan NP
            const player = players.find(p => p.position_number === np);

            if (player) {
                // Bungkus data ke format JSON yang kita rancang di backend
                const metricsJson = {
                    total_duration: row[4]?.trim() || "00:00:00",
                    total_distance: row[5]?.trim() || 0,
                    distance_per_min: row[7]?.trim() || 0,
                    accels: row[10]?.trim() || 0,
                    decels: row[11]?.trim() || 0,
                    max_velocity: row[17]?.trim() || 0,
                    sprint_distance: row[21]?.trim() || 0,
                    player_load: row[24]?.trim() || 0,
                };

                extractedData.push({
                    player_id: player.id,
                    metrics: metricsJson
                });

                previewData.push({
                    name: player.name,
                    np: np,
                    ...metricsJson
                });
            }
        });

        if (extractedData.length === 0) {
            setPasteError("Tidak ada data yang cocok! Pastikan kolom 'NP' (Nomor Posisi) pada Excel sesuai dengan data pemain di sistem.");
        } else {
            setData('players_data', extractedData);
            setPastePreview(previewData);
        }
    };

    const submitUpload = (e) => {
        e.preventDefault();
        post(route('metrics.storeBulk'), {
            onSuccess: () => {
                setIsUploadModalOpen(false);
                reset();
                setPastePreview([]);
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle="GPS & Performa Fisik" headerDescription="Analisis performa fisik harian menggunakan Dynamic Benchmarking.">
            <Head title="GPS Metrics" />

            <div className="max-w-7xl pb-12 space-y-6">
                
                {/* TOOLBAR ATAS: Filter Tanggal & Tombol Upload */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={handleFilterDate}
                                className="pl-10 pr-4 py-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:ring-zinc-500"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors"
                        >
                            <UploadCloud size={16} /> Upload GPS Excel
                        </button>
                        {metrics.length > 0 && (
                            <button 
                                onClick={resetDailyData}
                                className="flex items-center justify-center p-2 text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Reset Data Hari Ini"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* TABEL LAPORAN (Tampil jika ada data di tanggal tersebut) */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-zinc-100 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 sticky left-0 bg-zinc-100 dark:bg-[#121212] z-10 shadow-[1px_0_0_rgba(0,0,0,0.1)]">Pemain</th>
                                    <th className="px-4 py-3">Durasi</th>
                                    
                                    {/* Kolom Induk Jarak Total */}
                                    <th className="px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400">Total Distance</th>
                                    <th className="px-4 py-3 bg-blue-100/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 font-bold">% MD</th>
                                    
                                    {/* Kolom Induk Sprint */}
                                    <th className="px-4 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400">Sprint</th>
                                    <th className="px-4 py-3 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 font-bold">% MD</th>

                                    {/* Metrik Lainnya */}
                                    <th className="px-4 py-3">Max Vel</th>
                                    <th className="px-4 py-3">Accels</th>
                                    <th className="px-4 py-3">Decels</th>
                                    <th className="px-4 py-3">Player Load</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {metrics.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-4 py-16 text-center text-zinc-500">
                                            <div className="flex flex-col items-center">
                                                <Activity size={32} className="text-zinc-300 dark:text-zinc-700 mb-2" />
                                                <p>Tidak ada data GPS yang diunggah pada <b>{selectedDate}</b>.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    metrics.map((session) => {
                                        const actual = session.metrics; // Data Mentah JSON
                                        const target = session.benchmark?.metrics; // Data Target (Jika ada benchmark terpilih)

                                        return (
                                            <tr key={session.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                                                <td className="px-4 py-3 sticky left-0 bg-white dark:bg-[#0a0a0a] z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)] flex items-center gap-2">
                                                    <span className="font-mono text-zinc-400">{String(session.player.position_number).padStart(2, '0')}</span>
                                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{session.player.name}</span>
                                                </td>
                                                <td className="px-4 py-3 text-zinc-500 font-mono">{actual.total_duration}</td>
                                                
                                                {/* DATA JARAK TOTAL */}
                                                <td className="px-4 py-3 bg-blue-50/30 dark:bg-blue-900/5 font-medium">{actual.total_distance}</td>
                                                <td className="px-4 py-3 bg-blue-50/60 dark:bg-blue-900/10 font-bold text-blue-600 dark:text-blue-400">
                                                    {target ? calcPercent(actual.total_distance, target.total_distance) : '-'}
                                                </td>

                                                {/* DATA SPRINT */}
                                                <td className="px-4 py-3 bg-emerald-50/30 dark:bg-emerald-900/5 font-medium">{actual.sprint_distance}</td>
                                                <td className="px-4 py-3 bg-emerald-50/60 dark:bg-emerald-900/10 font-bold text-emerald-600 dark:text-emerald-400">
                                                    {target ? calcPercent(actual.sprint_distance, target.sprint_distance) : '-'}
                                                </td>

                                                <td className="px-4 py-3">{actual.max_velocity}</td>
                                                <td className="px-4 py-3">{actual.accels}</td>
                                                <td className="px-4 py-3">{actual.decels}</td>
                                                <td className="px-4 py-3">{actual.player_load}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ========================================================= */}
            {/* MODAL UPLOAD EXCEL (SMART PASTE) */}
            {/* ========================================================= */}
            <Modal show={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} maxWidth="4xl">
                <div className="p-6 bg-white dark:bg-[#121212]">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Upload Data GPS (Excel)</h2>
                    <p className="text-xs text-zinc-500 mb-6">Pilih tanggal dan Benchmark, lalu Copy seluruh baris tabel dari Excel dan Paste di kotak yang disediakan.</p>
                    
                    <form onSubmit={submitUpload} className="space-y-6">
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Pilihan Tanggal */}
                            <div className="w-full md:w-1/3">
                                <InputLabel value="Tanggal Sesi Latihan" />
                                <input 
                                    type="date" 
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    className="mt-1 w-full border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-sm"
                                    required
                                />
                            </div>

                            {/* Pilihan Benchmark / Target */}
                            <div className="w-full md:w-2/3">
                                <InputLabel value="Terapkan Benchmark (Opsional)" />
                                <select 
                                    value={data.benchmark_id}
                                    onChange={e => setData('benchmark_id', e.target.value)}
                                    className="mt-1 w-full border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-sm"
                                >
                                    <option value="">-- Hanya Simpan Data Mentah (Tanpa % Target) --</option>
                                    {benchmarks.map(bm => (
                                        <option key={bm.id} value={bm.id}>{bm.name} ({bm.target_type === 'team' ? 'Target Tim' : 'Target Individu'})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Kotak Ajaib: Smart Paste Area */}
                        <div>
                            <InputLabel value="Area Paste (Ctrl+V / Cmd+V dari Excel)" />
                            {pasteError && (
                                <div className="mb-2 p-2 bg-red-50 text-red-600 text-xs rounded-md flex items-center gap-2">
                                    <AlertTriangle size={14} /> {pasteError}
                                </div>
                            )}
                            <textarea 
                                rows="3"
                                placeholder="Klik di sini, lalu tekan Ctrl+V untuk mem-paste tabel GPS dari Excel..."
                                onPaste={handleExcelPaste}
                                className="w-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                            ></textarea>
                            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                                <Info size={12} /> Sistem akan otomatis mendeteksi kolom berdasarkan Nomor Posisi (NP). Pastikan menyalin dari kolom 'No' hingga 'Total 18Km/h+'.
                            </p>
                        </div>

                        {/* Preview Hasil Ekstrak */}
                        {pastePreview.length > 0 && (
                            <div className="border border-emerald-200 dark:border-emerald-900/30 rounded-xl overflow-hidden">
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 flex items-center justify-between border-b border-emerald-100">
                                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Berhasil Mengekstrak {pastePreview.length} Pemain
                                    </span>
                                </div>
                                <div className="max-h-48 overflow-y-auto bg-white dark:bg-[#0a0a0a]">
                                    <table className="w-full text-left text-[11px]">
                                        <thead className="bg-zinc-50 dark:bg-zinc-900 sticky top-0">
                                            <tr>
                                                <th className="p-2">NP</th>
                                                <th className="p-2">Pemain</th>
                                                <th className="p-2 text-blue-600">Distance</th>
                                                <th className="p-2 text-emerald-600">Sprint</th>
                                                <th className="p-2">Max Vel</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {pastePreview.map((item, i) => (
                                                <tr key={i}>
                                                    <td className="p-2 font-mono">{item.np}</td>
                                                    <td className="p-2 font-semibold">{item.name}</td>
                                                    <td className="p-2 text-blue-600">{item.total_distance}</td>
                                                    <td className="p-2 text-emerald-600">{item.sprint_distance}</td>
                                                    <td className="p-2">{item.max_velocity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg">Batal</button>
                            <button 
                                disabled={processing || data.players_data.length === 0} 
                                className="px-5 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-lg hover:bg-zinc-800 flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing && <Loader2 size={14} className="animate-spin" />}
                                Simpan ke Database
                            </button>
                        </div>

                    </form>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}