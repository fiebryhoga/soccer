import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Camera, Loader2, UploadCloud } from 'lucide-react';

export default function UpdateProfileInformation({ className = '' }) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);

    // Fungsi pembantu untuk memuat preview gambar awal
    const getInitialAvatar = () => {
        if (user.profile_photo && user.profile_photo.startsWith('http')) return user.profile_photo;
        if (user.profile_photo) return `/storage/${user.profile_photo}`;
        return `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&bold=true`;
    };

    const [previewImage, setPreviewImage] = useState(getInitialAvatar());

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        username: user.username, // <--- MENGGUNAKAN USERNAME
        profile_photo: null,
        _method: 'patch', // Inertia butuh ini untuk mengirim File dengan metode mirip PATCH
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_photo', file);
            setPreviewImage(URL.createObjectURL(file)); 
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                
                {/* Area Upload Foto */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="relative group shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                        <div className="w-full h-full rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm">
                            <img 
                                src={previewImage} 
                                alt="Profile Preview" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {/* Tombol Overlay Hover untuk Klik Ubah */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full focus:outline-none"
                        >
                            <Camera size={20} className="mb-1" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Ubah</span>
                        </button>

                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePhotoChange}
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                        />
                    </div>

                    <div className="flex-1">
                        <InputLabel value="Foto Profil" className="mb-1 text-zinc-900 dark:text-zinc-100" />
                        <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed max-w-sm">
                            Format yang disarankan: JPG, PNG, atau GIF. Ukuran maksimal file adalah 2MB.
                        </p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 text-[12px] font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm flex items-center gap-2 w-fit"
                        >
                            <UploadCloud size={14} />
                            Pilih Gambar
                        </button>
                        <InputError className="mt-2" message={errors.profile_photo} />
                    </div>
                </div>

                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800/80 my-2"></div>

                {/* Input Nama */}
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="text-zinc-700 dark:text-zinc-300" />
                    <TextInput
                        id="name"
                        className="mt-1.5 dark:text-white block w-full bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Input Username */}
                <div>
                    <InputLabel htmlFor="username" value="Username" className="text-zinc-700 dark:text-zinc-300" />
                    <div className="relative mt-1.5 flex items-center">
                        {/* Opsional: Tambahkan '@' di sebelah kiri agar terlihat identitas username */}
                        <span className="absolute left-3 text-zinc-400 dark:text-zinc-500 font-medium">@</span>
                        <TextInput
                            id="username"
                            type="text"
                            className="block  dark:text-white w-full pl-8 bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <InputError className="mt-2" message={errors.username} />
                </div>

                {/* Tombol Simpan */}
                <div className="flex items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                    <button 
                        disabled={processing}
                        className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {processing && <Loader2 size={16} className="animate-spin" />}
                        Simpan Perubahan
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Tersimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}