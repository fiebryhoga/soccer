import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Shield, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function ClubForm({ club }) {
    const clubLogoRef = useRef(null);
    const [clubLogoPreview, setClubLogoPreview] = useState(club?.logo_url || null);

    const { data, setData, post, processing, errors } = useForm({
        name: club?.name || '',
        logo: null,
        _method: club ? 'patch' : 'post',
    });

    const handleClubLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setClubLogoPreview(URL.createObjectURL(file));
        }
    };

    const submitClub = (e) => {
        e.preventDefault();
        const url = club ? route('club.update', club.id) : route('club.store');
        post(url, { preserveScroll: true });
    };

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden transition-colors">
            <div className="border-b border-zinc-200 dark:border-zinc-800/80 px-6 py-4 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                    <Shield size={16} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{club ? 'Identitas Klub' : 'Setup Klub Baru'}</h3>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Atur nama dan logo klub utama.</p>
                </div>
            </div>
            
            <div className="p-6">
                <form onSubmit={submitClub} className="flex flex-col sm:flex-row gap-8 items-start">
                    
                    {/* Upload Logo Klub */}
                    <div className="shrink-0 flex flex-col items-center">
                        <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center transition-colors">
                            {clubLogoPreview ? (
                                <img src={clubLogoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <ImageIcon size={32} className="text-zinc-400 dark:text-zinc-500" />
                            )}
                            <button
                                type="button"
                                onClick={() => clubLogoRef.current.click()}
                                className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                            >
                                <Camera size={24} className="mb-2" />
                                <span className="text-xs font-semibold">Upload Logo</span>
                            </button>
                        </div>
                        <input type="file" ref={clubLogoRef} onChange={handleClubLogoChange} className="hidden" accept="image/*" />
                        <InputError message={errors.logo} className="mt-2 text-center" />
                    </div>

                    {/* Input Nama Klub */}
                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <InputLabel value="Nama Klub" className="text-zinc-700 dark:text-zinc-300" />
                            <TextInput
                                className="mt-1.5 block w-full max-w-md bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Contoh: Garuda FC"
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <button 
                            disabled={processing}
                            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        >
                            {processing && <Loader2 size={16} className="animate-spin" />}
                            {club ? 'Simpan Perubahan' : 'Buat Klub Sekarang'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}