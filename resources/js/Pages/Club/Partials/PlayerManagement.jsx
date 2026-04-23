import { useState, useRef, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, User, Camera, Loader2, ListPlus, Type, X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

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
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedPlayers = useMemo(() => {
        let sortableItems = [...club.players];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (typeof aValue === 'string') {
                    return sortConfig.direction === 'asc' 
                        ? aValue.localeCompare(bValue) 
                        : bValue.localeCompare(aValue);
                }
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            });
        }
        return sortableItems;
    }, [club.players, sortConfig]);

    // Komponen Reusable untuk Header Tabel yang bisa diklik
    const SortableHeader = ({ label, sortKey, className = "" }) => {
        const isActive = sortConfig.key === sortKey;
        return (
            <th 
                className={`px-6 py-3 text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group select-none ${className}`}
                onClick={() => requestSort(sortKey)}
            >
                <div className="flex items-center gap-1.5">
                    {label}
                    <div className="text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors">
                        {isActive ? (
                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                            <ChevronsUpDown size={14} className="opacity-40" />
                        )}
                    </div>
                </div>
            </th>
        );
    };

    // =====================================
    // STATE & LOGIKA: MANUAL INSERT
    // =====================================
    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        position_number: '',
        position: 'FW',
        profile_photo: null,
        _method: 'post',
    });

    // =====================================
    // STATE & LOGIKA: BULK INSERT (EXCEL)
    // =====================================
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [bulkErrors, setBulkErrors] = useState({});
    
    const initialBulkRows = Array.from({ length: 5 }, () => ({ name: '', position_number: '', position: '' }));
    const [bulkPlayers, setBulkPlayers] = useState(initialBulkRows);

    const handlePaste = (e, rowIndex, colName) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        const rows = pasteData.split('\n').map(row => row.split('\t'));
        let newBulkPlayers = [...bulkPlayers];
        
        rows.forEach((row, i) => {
            if (row.length === 1 && row[0] === "") return; 
            
            const targetRowIndex = rowIndex + i;
            if (!newBulkPlayers[targetRowIndex]) {
                newBulkPlayers[targetRowIndex] = { name: '', position_number: '', position: '' };
            }

            if (row.length > 1) {
                if(row[0] !== undefined) newBulkPlayers[targetRowIndex].name = row[0].trim();
                if(row[1] !== undefined) newBulkPlayers[targetRowIndex].position_number = row[1].trim();
                if(row[2] !== undefined) newBulkPlayers[targetRowIndex].position = row[2].trim().toUpperCase();
            } else {
                newBulkPlayers[targetRowIndex][colName] = row[0].trim().toUpperCase();
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
        setBulkPlayers([...bulkPlayers, { name: '', position_number: '', position: '' }]);
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
                profile_photo: null,
                _method: 'patch',
            });
            setPlayerPhotoPreview(player.photo_url);
        } else {
            setData({ name: '', position_number: '', position: 'FW', profile_photo: null, _method: 'post' });
            setPlayerPhotoPreview(null);
            setBulkPlayers(Array.from({ length: 5 }, () => ({ name: '', position_number: '', position: '' })));
        }
        setIsPlayerModalOpen(true);
    };

    const submitManual = (e) => {
        e.preventDefault();
        const url = editingPlayer ? route('players.update', editingPlayer.id) : route('players.store');
        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                setIsPlayerModalOpen(false);
                reset();
            },
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
            onSuccess: () => {
                setIsPlayerModalOpen(false);
                setIsBulkProcessing(false);
            },
            onError: (errors) => {
                setBulkErrors(errors);
                setIsBulkProcessing(false);
            }
        });
    };

    const deletePlayer = (id) => {
        if (confirm('Yakin ingin menghapus pemain ini?')) {
            router.delete(route('players.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden transition-colors">
            
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

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-zinc-200 dark:border-zinc-800/80">
                        <tr>
                            <SortableHeader label="No" sortKey="position_number" />
                            <SortableHeader label="Pemain" sortKey="name" />
                            <SortableHeader label="Posisi" sortKey="position" />
                            <th className="px-6 py-3 text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {sortedPlayers.map((player) => (
                            <tr key={player.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="p-2 bg-slate-400/10 rounded-lg  dark:bg-white/10 text-xs lg font-bold text-zinc-400 dark:text-zinc-600">
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
                                        <span className="font-semibold capitalize text-zinc-900 dark:text-zinc-100">{player.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors">
                                        {player.position}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openPlayerModal(player)} className="p-1.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 bg-zinc-50 dark:bg-zinc-800 rounded-md transition-colors focus:outline-none" title="Edit Pemain">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => deletePlayer(player.id)} className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 bg-zinc-50 dark:bg-zinc-800 rounded-md transition-colors focus:outline-none" title="Hapus Pemain">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {club.players.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                    Klub ini belum memiliki pemain.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal show={isPlayerModalOpen} onClose={() => setIsPlayerModalOpen(false)} maxWidth={activeTab === 'bulk' ? "2xl" : "sm"}>
                <div className="p-6 bg-white dark:bg-[#121212] transition-colors rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {editingPlayer ? 'Edit Pemain' : 'Tambah Pemain'}
                        </h2>
                        
                        {!editingPlayer && (
                            <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                <button 
                                    onClick={() => setActiveTab('manual')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${activeTab === 'manual' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                >
                                    <Type size={12} /> Satu Persatu
                                </button>
                                <button 
                                    onClick={() => setActiveTab('bulk')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${activeTab === 'bulk' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                >
                                    <ListPlus size={12} /> Dari Excel
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {activeTab === 'manual' && (
                        <form onSubmit={submitManual} className="space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="relative group w-20 h-20 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 transition-colors shadow-sm">
                                    {playerPhotoPreview ? (
                                        <img src={playerPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-zinc-400 dark:text-zinc-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    )}
                                    <button type="button" onClick={() => playerPhotoRef.current.click()} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none">
                                        <Camera size={20} />
                                    </button>
                                </div>
                                <input type="file" ref={playerPhotoRef} onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setData('profile_photo', file);
                                        setPlayerPhotoPreview(URL.createObjectURL(file));
                                    }
                                }} className="hidden" accept="image/*" />
                            </div>
                            <InputError message={errors.profile_photo} className="text-center" />

                            <div>
                                <InputLabel value="Nama Pemain" className="text-zinc-700 dark:text-zinc-300" />
                                <TextInput className="mt-1 block w-full bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <InputLabel value="Nomor Posisi" className="text-zinc-700 dark:text-zinc-300" />
                                    <TextInput type="number" min="1" max="99" className="mt-1 block w-full bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800" value={data.position_number} onChange={e => setData('position_number', e.target.value)} required />
                                    <InputError message={errors.position_number} className="mt-1" />
                                </div>
                                <div className="w-1/2">
                                    <InputLabel value="Posisi" className="text-zinc-700 dark:text-zinc-300" />
                                    <select className="mt-1 block w-full border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 rounded-md shadow-sm bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 py-2" value={data.position} onChange={e => setData('position', e.target.value)}>
                                        <option value="CB">CB (Center Back)</option>
                                        <option value="FB">FB (Full Back)</option>
                                        <option value="MF">MF (Midfielder)</option>
                                        <option value="WF">WF (Wing Forward)</option>
                                        <option value="FW">FW (Forward)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                                <button type="button" onClick={() => setIsPlayerModalOpen(false)} className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Batal</button>
                                <button disabled={processing} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-white flex items-center gap-2">
                                    {processing && <Loader2 size={14} className="animate-spin" />}
                                    Simpan
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'bulk' && (
                        <form onSubmit={submitBulkForm} className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 p-3 rounded-lg">
                                <p className="text-[12px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                                    💡 <strong>Tips:</strong> Anda bisa langsung melakukan *Copy* blok kolom dari Excel/Spreadsheet dan *Paste* (Ctrl+V) ke dalam kotak input di bawah. Sistem akan memisahkan baris dan kolom secara otomatis.
                                </p>
                            </div>

                            {Object.keys(bulkErrors).length > 0 && (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 rounded-lg text-[12px] text-red-600 dark:text-red-400">
                                    Periksa kembali, ada data yang bentrok (nomor posisi sama) atau tidak valid.
                                </div>
                            )}

                            <div className="max-h-[50vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800">
                                <table className="w-full text-left text-[12px]">
                                    <thead className="sticky top-0 bg-white dark:bg-[#121212] z-10">
                                        <tr>
                                            <th className="pb-2 font-semibold text-zinc-500 w-1/2">Nama Lengkap</th>
                                            <th className="pb-2 font-semibold text-zinc-500 w-1/4 px-2">Nomor</th>
                                            <th className="pb-2 font-semibold text-zinc-500 w-1/4">Posisi (CB/FB/MF/WF/FW)</th>
                                            <th className="pb-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="space-y-2">
                                        {bulkPlayers.map((player, index) => {
                                            const errorName = bulkErrors[`players.${index}.name`];
                                            const errorNum = bulkErrors[`players.${index}.position_number`];
                                            const errorPos = bulkErrors[`players.${index}.position`];

                                            return (
                                                <tr key={index}>
                                                    <td className="py-1 pr-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Nama"
                                                            className={`w-full bg-zinc-50 dark:bg-zinc-900 border ${errorName ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'} text-zinc-900 dark:text-zinc-100 rounded-md text-[12px] py-1.5 px-2 focus:ring-1 focus:ring-zinc-400`} 
                                                            value={player.name}
                                                            onChange={e => handleBulkChange(index, 'name', e.target.value)}
                                                            onPaste={e => handlePaste(e, index, 'name')}
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1">
                                                        <input 
                                                            type="number" 
                                                            placeholder="No"
                                                            className={`w-full bg-zinc-50 dark:bg-zinc-900 border ${errorNum ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'} text-zinc-900 dark:text-zinc-100 rounded-md text-[12px] py-1.5 px-2 focus:ring-1 focus:ring-zinc-400`} 
                                                            value={player.position_number}
                                                            onChange={e => handleBulkChange(index, 'position_number', e.target.value)}
                                                            onPaste={e => handlePaste(e, index, 'position_number')}
                                                        />
                                                    </td>
                                                    <td className="py-1 pl-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="FW"
                                                            className={`w-full bg-zinc-50 dark:bg-zinc-900 border ${errorPos ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'} text-zinc-900 dark:text-zinc-100 rounded-md text-[12px] py-1.5 px-2 focus:ring-1 focus:ring-zinc-400 uppercase`} 
                                                            value={player.position}
                                                            onChange={e => handleBulkChange(index, 'position', e.target.value.toUpperCase())}
                                                            onPaste={e => handlePaste(e, index, 'position')}
                                                        />
                                                    </td>
                                                    <td className="py-1 pl-2 text-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setBulkPlayers(bulkPlayers.filter((_, i) => i !== index))}
                                                            className="text-zinc-400 hover:text-red-500 transition-colors focus:outline-none"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <button 
                                type="button" 
                                onClick={addBulkRow}
                                className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mt-2 focus:outline-none"
                            >
                                + Tambah Baris Kosong
                            </button>

                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                                <button type="button" onClick={() => setIsPlayerModalOpen(false)} className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Batal</button>
                                <button disabled={isBulkProcessing} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-white flex items-center gap-2">
                                    {isBulkProcessing && <Loader2 size={14} className="animate-spin" />}
                                    Upload Massal
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
        </div>
    );
}