import React from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function ManualPlayerForm({ 
    data, setData, errors, processing, submitManual, 
    setIsPlayerModalOpen, playerPhotoRef, playerPhotoPreview, setPlayerPhotoPreview 
}) {
    return (
        <form onSubmit={submitManual} className="space-y-4">
            {/* Foto Profil */}
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

            {/* Nama Pemain */}
            <div>
                <InputLabel value="Nama Pemain" className="text-zinc-700 dark:text-zinc-300" />
                <TextInput className="mt-1 block w-full bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800" value={data.name} onChange={e => setData('name', e.target.value)} required />
                <InputError message={errors.name} className="mt-1" />
            </div>

            {/* Nomor & Posisi */}
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
                    <InputError message={errors.position} className="mt-1" />
                </div>
            </div>

            {/* HIGHEST METRICS (BARU) */}
            <div className="pt-2">
                <InputLabel value="Rekor Max Velocity (km/h) - Opsional" className="text-zinc-700 dark:text-zinc-300" />
                <TextInput 
                    type="number" 
                    step="0.01" 
                    placeholder="Contoh: 32.50"
                    className="mt-1 block w-full bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 font-bold border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500" 
                    value={data.highest_velocity} 
                    onChange={e => setData('highest_velocity', e.target.value)} 
                />
                <p className="text-[10px] text-zinc-500 mt-1">Kosongkan jika pemain belum memiliki rekor historis.</p>
                <InputError message={errors.highest_velocity} className="mt-1" />
            </div>

            {/* Tombol Aksi */}
            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                <button type="button" onClick={() => setIsPlayerModalOpen(false)} className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Batal</button>
                <button disabled={processing} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-white flex items-center gap-2 transition-all">
                    {processing && <Loader2 size={14} className="animate-spin" />}
                    Simpan
                </button>
            </div>
        </form>
    );
}