import React from 'react';
import { X, Loader2 } from 'lucide-react';

export default function BulkPlayerForm({ 
    bulkPlayers, setBulkPlayers, handlePaste, handleBulkChange, 
    addBulkRow, bulkErrors, isBulkProcessing, submitBulkForm, setIsPlayerModalOpen 
}) {
    return (
        <form onSubmit={submitBulkForm} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 p-3 rounded-lg flex flex-col gap-1">
                <p className="text-[12px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                    💡 <strong>Tips:</strong> Anda bisa langsung *Copy* blok kolom dari Excel dan *Paste* (Ctrl+V) ke dalam kotak di bawah.
                </p>
                <p className="text-[11px] text-blue-600 dark:text-blue-500">
                    Urutan kolom Excel Anda harus: <b>Nama Pemain | Nomor | Posisi | Max Velocity</b>
                </p>
            </div>

            {Object.keys(bulkErrors).length > 0 && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 rounded-lg text-[12px] text-red-600 dark:text-red-400">
                    Periksa kembali, ada data yang bentrok atau tidak valid (Nomor ganda atau Posisi salah).
                </div>
            )}

            <div className="max-h-[50vh] overflow-x-auto overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                <table className="w-full text-left text-[12px] min-w-[500px]">
                    <thead className="sticky top-0 bg-white dark:bg-[#121212] z-10 shadow-sm">
                        <tr>
                            <th className="pb-2 font-semibold text-zinc-500 min-w-[75px]">Nama Lengkap</th>
                            <th className="pb-2 font-semibold text-zinc-500 w-16 px-2 text-center">No</th>
                            <th className="pb-2 font-semibold text-zinc-500 w-24">Posisi</th>
                            <th className="pb-2 font-semibold text-emerald-600 dark:text-emerald-500 w-28">Max Vel (Opsional)</th>
                            <th className="pb-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="space-y-2">
                        {bulkPlayers.map((player, index) => {
                            const errorName = bulkErrors[`players.${index}.name`];
                            const errorNum = bulkErrors[`players.${index}.position_number`];
                            const errorPos = bulkErrors[`players.${index}.position`];
                            const errorVel = bulkErrors[`players.${index}.highest_velocity`];

                            return (
                                <tr key={index}>
                                    <td className="py-1 pr-2">
                                        <input 
                                            type="text" placeholder="Nama"
                                            className={`w-full bg-zinc-50 dark:bg-zinc-900 border ${errorName ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'} text-zinc-900 dark:text-zinc-100 rounded-md text-[12px] py-1.5 px-2`} 
                                            value={player.name} onChange={e => handleBulkChange(index, 'name', e.target.value)} onPaste={e => handlePaste(e, index, 'name')}
                                        />
                                    </td>
                                    <td className="py-1 px-1">
                                        <input 
                                            type="number" placeholder="00"
                                            className={`w-full bg-zinc-50 dark:bg-zinc-900 border ${errorNum ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'} text-zinc-900 dark:text-zinc-100 rounded-md text-[12px] py-1.5 px-2 text-center`} 
                                            value={player.position_number} onChange={e => handleBulkChange(index, 'position_number', e.target.value)} onPaste={e => handlePaste(e, index, 'position_number')}
                                        />
                                    </td>
                                    <td className="py-1 px-1">
                                        <input 
                                            type="text" placeholder="FW"
                                            className={`w-full bg-zinc-50 dark:bg-zinc-900 border ${errorPos ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'} text-zinc-900 dark:text-zinc-100 rounded-md text-[12px] py-1.5 px-2 uppercase`} 
                                            value={player.position} onChange={e => handleBulkChange(index, 'position', e.target.value.toUpperCase())} onPaste={e => handlePaste(e, index, 'position')}
                                        />
                                    </td>
                                    <td className="py-1 pl-1">
                                        <input 
                                            type="text" placeholder="32.5"
                                            className={`w-full bg-emerald-50 dark:bg-emerald-950/20 border ${errorVel ? 'border-red-400' : 'border-emerald-200 dark:border-emerald-800'} text-emerald-700 dark:text-emerald-400 font-bold rounded-md text-[12px] py-1.5 px-2`} 
                                            value={player.highest_velocity} onChange={e => handleBulkChange(index, 'highest_velocity', e.target.value)} onPaste={e => handlePaste(e, index, 'highest_velocity')}
                                        />
                                    </td>
                                    <td className="py-1 pl-2 text-center">
                                        <button type="button" onClick={() => setBulkPlayers(bulkPlayers.filter((_, i) => i !== index))} className="text-zinc-400 hover:text-red-500 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <button type="button" onClick={addBulkRow} className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mt-2">
                + Tambah Baris Kosong
            </button>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                <button type="button" onClick={() => setIsPlayerModalOpen(false)} className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Batal</button>
                <button disabled={isBulkProcessing} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-white flex items-center gap-2 transition-all">
                    {isBulkProcessing && <Loader2 size={14} className="animate-spin" />}
                    Upload Massal
                </button>
            </div>
        </form>
    );
}