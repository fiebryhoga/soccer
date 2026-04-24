// Daftar Master Variabel sesuai Excel Anda
const MASTER_VARIABLES = [
    { id: 'total_duration', label: 'Total Duration' },
    { id: 'total_distance', label: 'Total Distance (m)' },
    { id: 'dist_per_min', label: 'Distance/min' },
    { id: 'accels', label: 'Accels >3m/s/s' },
    { id: 'decels', label: 'Decels >3m/s/s' },
    { id: 'hr_band_5_dist', label: 'Heart Rate Band 5 Distance' },
    { id: 'max_velocity', label: 'Max Velocity (km/h)' },
    { id: 'sprint', label: 'SPRINT 24.52 km/h~' },
];

export default function Calendar({ calendar, start_date, benchmarks }) {
    const [selectedDay, setSelectedDay] = useState(null); // Hari yang sedang diklik
    const [showModal, setShowModal] = useState(false);

    // Form menggunakan Inertia
    const { data, setData, post, processing } = useForm({
        date: '', type: 'off', title: '', description: '', 
        benchmark_id: '', selected_variables: []
    });

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setData({
            date: day.date,
            type: day.type || 'off',
            title: day.title || '',
            description: day.description || '',
            benchmark_id: day.benchmark_id || '',
            selected_variables: day.selected_variables || []
        });
        setShowModal(true);
    };

    const toggleVariable = (varId) => {
        let current = [...data.selected_variables];
        if (current.includes(varId)) {
            current = current.filter(i => i !== varId);
        } else {
            current.push(varId);
        }
        setData('selected_variables', current);
    };

    return (
        <AuthenticatedLayout>
            {/* TAMPILAN LIST JADWAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {calendar.map((day) => (
                    <div 
                        key={day.date}
                        onClick={() => handleDayClick(day)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-105 ${
                            day.type === 'match' ? 'bg-emerald-50 border-emerald-200' :
                            day.type === 'training' ? 'bg-blue-50 border-blue-200' : 
                            'bg-zinc-50 border-zinc-200 opacity-60'
                        }`}
                    >
                        <span className="text-xs font-bold text-zinc-500">{day.date}</span>
                        <h4 className="font-bold uppercase mt-1">{day.type}</h4>
                        <p className="text-sm truncate">{day.title || 'No Activity'}</p>
                    </div>
                ))}
            </div>

            {/* MODAL CONFIG SESI */}
            {showModal && (
                <Modal show={showModal} onClose={() => setShowModal(false)}>
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4">Set Jadwal: {data.date}</h2>
                        
                        {/* Pilih Tipe */}
                        <select value={data.type} onChange={e => setData('type', e.target.value)}>
                            <option value="off">Libur / Kosong</option>
                            <option value="training">Training Log</option>
                            <option value="match">Match Log</option>
                        </select>

                        {data.type !== 'off' && (
                            <div className="mt-4 space-y-4">
                                <input placeholder="Judul Sesi" value={data.title} onChange={e => setData('title', e.target.value)} />
                                
                                {/* PILIH VARIABEL (Checkbox ala Excel) */}
                                <div className="bg-zinc-100 p-4 rounded-lg">
                                    <p className="text-sm font-bold mb-2">Pilih Variabel Metrik (seperti di Excel):</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {MASTER_VARIABLES.map(v => (
                                            <label key={v.id} className="flex items-center gap-2 text-xs">
                                                <input 
                                                    type="checkbox" 
                                                    checked={data.selected_variables.includes(v.id)} 
                                                    onChange={() => toggleVariable(v.id)}
                                                />
                                                {v.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Pilih Benchmark */}
                                <select value={data.benchmark_id} onChange={e => setData('benchmark_id', e.target.value)}>
                                    <option value="">-- Pilih Benchmark Target --</option>
                                    {benchmarks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        )}

                        <button onClick={submit} className="mt-6 w-full bg-zinc-900 text-white py-2 rounded-lg">Simpan Sesi</button>
                    </div>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}