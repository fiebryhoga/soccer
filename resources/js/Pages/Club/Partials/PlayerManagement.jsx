import { useState, useRef, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, ListPlus, Type, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Modal from '@/Components/Modal';

// IMPORT PARTIALS BARU
import ManualPlayerForm from './ManualPlayerForm';
import BulkPlayerForm from './BulkPlayerForm';

export default function PlayerManagement({ club }) {
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const playerPhotoRef = useRef(null);
    const [playerPhotoPreview, setPlayerPhotoPreview] = useState(null);
    
    const [activeTab, setActiveTab] = useState('manual');

    // =====================================
    // STATE & LOGIKA: SORTING TABEL
    // =====================================
    const [sortConfig, setSortConfig] = useState({ key: 'position_number', direction: 'asc' });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const sortedPlayers = useMemo(() => {
        let sortableItems = [...club.players];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                
                // Handle null values
                if (aValue === null) return 1;
                if (bValue === null) return -1;

                if (typeof aValue === 'string') {
                    return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            });
        }
        return sortableItems;
    }, [club.players, sortConfig]);

    const SortableHeader = ({ label, sortKey, className = "" }) => {
        const isActive = sortConfig.key === sortKey;
        return (
            <th className={`px-6 py-3 text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group select-none ${className}`} onClick={() => requestSort(sortKey)}>
                <div className="flex items-center gap-1.5">
                    {label}
                    <div className="text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300">
                        {isActive ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={14} className="opacity-40" />}
                    </div>
                </div>
            </th>
        );
    };

    // =====================================
    // STATE & LOGIKA: MANUAL INSERT
    // =====================================
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        position_number: '',
        position: 'FW',
        highest_velocity: '',
        age: '',
        gender: 'male',
        height: '',
        weight: '',
        dominant_limb: '',
        profile_photo: null,
        _method: 'post',
    });

    // =====================================
    // STATE & LOGIKA: BULK INSERT (EXCEL)
    // =====================================
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [bulkErrors, setBulkErrors] = useState({});
    
    // Inisialisasi baris kosong untuk bulk lengkap dengan atribut fisik
    const initialRowData = { 
        name: '', position_number: '', position: '', highest_velocity: '',
        age: '', gender: '', height: '', weight: '', dominant_limb: '' 
    };
    const [bulkPlayers, setBulkPlayers] = useState(Array.from({ length: 5 }, () => ({ ...initialRowData })));

    const handlePaste = (e, rowIndex, colName) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        const rows = pasteData.split('\n').map(row => row.split('\t'));
        let newBulkPlayers = [...bulkPlayers];
        
        rows.forEach((row, i) => {
            if (row.length === 1 && row[0] === "") return; 
            
            const targetRowIndex = rowIndex + i;
            if (!newBulkPlayers[targetRowIndex]) {
                newBulkPlayers[targetRowIndex] = { ...initialRowData };
            }

            if (row.length > 1) {
                if(row[0] !== undefined) newBulkPlayers[targetRowIndex].name = row[0].trim();
                if(row[1] !== undefined) newBulkPlayers[targetRowIndex].position_number = row[1].trim();
                if(row[2] !== undefined) newBulkPlayers[targetRowIndex].position = row[2].trim().toUpperCase();
                if(row[3] !== undefined) newBulkPlayers[targetRowIndex].highest_velocity = row[3].trim();
                if(row[4] !== undefined) newBulkPlayers[targetRowIndex].age = row[4].trim();
                if(row[5] !== undefined) newBulkPlayers[targetRowIndex].gender = row[5].trim().toLowerCase();
                if(row[6] !== undefined) newBulkPlayers[targetRowIndex].height = row[6].trim();
                if(row[7] !== undefined) newBulkPlayers[targetRowIndex].weight = row[7].trim();
                if(row[8] !== undefined) newBulkPlayers[targetRowIndex].dominant_limb = row[8].trim().toLowerCase();
            } else {
                // Jika hanya paste satu sel/kolom ke bawah
                let val = row[0].trim();
                if (colName === 'position') val = val.toUpperCase();
                if (colName === 'gender' || colName === 'dominant_limb') val = val.toLowerCase();
                newBulkPlayers[targetRowIndex][colName] = val;
            }
        });
        setBulkPlayers(newBulkPlayers);
    };

    const handleBulkChange = (index, field, value) => {
        const newData = [...bulkPlayers];
        newData[index][field] = value;
        setBulkPlayers(newData);
    };

    const addBulkRow = () => {
        setBulkPlayers([...bulkPlayers, { ...initialRowData }]);
    };

    // =====================================
    // FUNGSI UMUM MODAL & SUBMIT
    // =====================================
    const openPlayerModal = (player = null) => {
        setEditingPlayer(player);
        clearErrors();
        setBulkErrors({});
        
        if (player) {
            setActiveTab('manual');
            setData({
                name: player.name,
                position_number: player.position_number,
                position: player.position,
                highest_velocity: player.highest_metrics?.highest_velocity || '', 
                age: player.age || '',
                gender: player.gender || 'male',
                height: player.height || '',
                weight: player.weight || '',
                dominant_limb: player.dominant_limb || '',
                profile_photo: null,
                _method: 'patch',
            });
            setPlayerPhotoPreview(player.photo_url);
        } else {
            setData({ 
                name: '', position_number: '', position: 'FW', highest_velocity: '', 
                age: '', gender: 'male', height: '', weight: '', dominant_limb: '',
                profile_photo: null, _method: 'post' 
            });
            setPlayerPhotoPreview(null);
            setBulkPlayers(Array.from({ length: 5 }, () => ({ ...initialRowData })));
        }
        setIsPlayerModalOpen(true);
    };

    const submitManual = (e) => {
        e.preventDefault();
        const url = editingPlayer ? route('players.update', editingPlayer.id) : route('players.store');
        post(url, {
            preserveScroll: true,
            onSuccess: () => { setIsPlayerModalOpen(false); reset(); },
        });
    };

    const submitBulkForm = (e) => {
        e.preventDefault();
        setBulkErrors({});
        const validPlayers = bulkPlayers.filter(p => p.name || p.position_number || p.position);
        if (validPlayers.length === 0) return;

        setIsBulkProcessing(true);
        router.post(route('players.storeBulk'), { players: validPlayers }, {
            preserveScroll: true,
            onSuccess: () => { setIsPlayerModalOpen(false); setIsBulkProcessing(false); },
            onError: (errors) => { setBulkErrors(errors); setIsBulkProcessing(false); }
        });
    };

    const deletePlayer = (id) => {
        if (confirm('Yakin ingin menghapus pemain ini? Data performa & tes fisiknya juga akan ikut terhapus.')) {
            router.delete(route('players.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden transition-colors">
            
            {/* Header Tabel */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20 transition-colors">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Daftar Pemain</h3>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Total {club.players.length} pemain terdaftar.</p>
                </div>
                <button 
                    onClick={() => openPlayerModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
                >
                    <Plus size={14} /> Tambah Pemain
                </button>
            </div>

            {/* Konten Tabel */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-zinc-200 dark:border-zinc-800/80">
                        <tr>
                            <SortableHeader label="No" sortKey="position_number" />
                            <SortableHeader label="Pemain" sortKey="name" />
                            <SortableHeader label="Posisi" sortKey="position" />
                            <SortableHeader label="Umur" sortKey="age" />
                            <SortableHeader label="Tinggi" sortKey="height" />
                            <SortableHeader label="Berat" sortKey="weight" />
                            <th className="px-6 py-3 text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {sortedPlayers.map((player) => (
                            <tr key={player.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="p-2 bg-slate-400/10 rounded-lg dark:bg-white/10 text-xs font-bold text-zinc-400 dark:text-zinc-600">
                                        {String(player.position_number).padStart(2, '0')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={player.photo_url || `https://ui-avatars.com/api/?name=${player.name}&background=787b80&color=fff&bold=true&font-size=0.33`} 
                                            alt={player.name} 
                                            className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-semibold capitalize text-zinc-900 dark:text-zinc-100">{player.name}</span>
                                            {player.dominant_limb && (
                                                <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
                                                    Dominan: {player.dominant_limb === 'both' ? 'Keduanya' : player.dominant_limb === 'left' ? 'Kiri' : 'Kanan'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                        {player.position}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {player.age ? <span className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">{player.age} thn</span> : <span className="text-zinc-300 dark:text-zinc-700">-</span>}
                                </td>
                                <td className="px-6 py-4">
                                    {player.height ? <span className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">{player.height} cm</span> : <span className="text-zinc-300 dark:text-zinc-700">-</span>}
                                </td>
                                <td className="px-6 py-4">
                                    {player.weight ? <span className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">{player.weight} kg</span> : <span className="text-zinc-300 dark:text-zinc-700">-</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openPlayerModal(player)} className="p-1.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 bg-zinc-50 dark:bg-zinc-800 rounded-md transition-colors" title="Edit Pemain">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => deletePlayer(player.id)} className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 bg-zinc-50 dark:bg-zinc-800 rounded-md transition-colors" title="Hapus Pemain">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {club.players.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                    Klub ini belum memiliki pemain.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Wrapper yang memanggil Partials */}
            <Modal show={isPlayerModalOpen} onClose={() => setIsPlayerModalOpen(false)} maxWidth={activeTab === 'bulk' ? "5xl" : "md"}>
                <div className="p-6 bg-white dark:bg-[#121212] transition-colors rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {editingPlayer ? 'Edit Pemain' : 'Tambah Pemain'}
                        </h2>
                        
                        {!editingPlayer && (
                            <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                <button onClick={() => setActiveTab('manual')} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${activeTab === 'manual' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                    <Type size={12} /> Satu Persatu
                                </button>
                                <button onClick={() => setActiveTab('bulk')} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${activeTab === 'bulk' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                    <ListPlus size={12} /> Dari Excel
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Render Form Berdasarkan Tab */}
                    {activeTab === 'manual' ? (
                        <ManualPlayerForm 
                            data={data} setData={setData} errors={errors} processing={processing}
                            submitManual={submitManual} setIsPlayerModalOpen={setIsPlayerModalOpen}
                            playerPhotoRef={playerPhotoRef} playerPhotoPreview={playerPhotoPreview} setPlayerPhotoPreview={setPlayerPhotoPreview}
                        />
                    ) : (
                        <BulkPlayerForm 
                            bulkPlayers={bulkPlayers} setBulkPlayers={setBulkPlayers} 
                            handlePaste={handlePaste} handleBulkChange={handleBulkChange} addBulkRow={addBulkRow} 
                            bulkErrors={bulkErrors} isBulkProcessing={isBulkProcessing} 
                            submitBulkForm={submitBulkForm} setIsPlayerModalOpen={setIsPlayerModalOpen}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
}