import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { User, AtSign, Lock, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

export default function Form({ auth, admin = null }) {
    const isEdit = !!admin;

    const { data, setData, post, put, processing, errors } = useForm({
        name: admin?.name || '',
        username: admin?.username || '',
        password: '',
        profile_photo: null, // Untuk upload file
    });

    const [previewPhoto, setPreviewPhoto] = useState(admin?.profile_photo || null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_photo', file);
            setPreviewPhoto(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (isEdit) {
            post(route('admins.update', admin.id), {
                forceFormData: true, 
            });
        } else {
            post(route('admins.store'), {
                forceFormData: true, // Tambahkan ini juga di store untuk berjaga-jaga
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            headerTitle={isEdit ? "Edit Admin" : "Add New Admin"}
            headerDescription={isEdit ? "Update coach credentials and profile details." : "Create a new coach/admin account for the platform."}
        >
            <Head title={isEdit ? "Edit Admin" : "Add Admin"} />

            <div className="max-w-2xl pb-12">
                
                <div className="mb-6">
                    <Link href={route('admins.index')} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <ArrowLeft size={14} /> Back to list
                    </Link>
                </div>

                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* Photo Upload Area */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                                <div className="relative shrink-0 group">
                                    <img 
                                        src={previewPhoto || `https://ui-avatars.com/api/?name=${data.name || 'New'}&background=random&color=fff`} 
                                        alt="Profile Preview" 
                                        className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700 shadow-sm"
                                    />
                                    <label htmlFor="photo_upload" className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <ImageIcon size={20} />
                                    </label>
                                    <input 
                                        id="photo_upload" 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handlePhotoChange}
                                    />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Profile Photo</h4>
                                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1 mb-2 max-w-xs">Recommended size is 256x256px. Max file size is 2MB (JPG/PNG).</p>
                                    <label htmlFor="photo_upload" className="inline-flex items-center justify-center h-8 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-[12px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors shadow-sm">
                                        Choose File
                                    </label>
                                    <InputError message={errors.profile_photo} className="mt-1" />
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={16} className="text-zinc-400" />
                                        </div>
                                        <input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="block w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 shadow-sm"
                                            required
                                            placeholder="Coach Shin"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="username" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <AtSign size={16} className="text-zinc-400" />
                                        </div>
                                        <input
                                            id="username"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            className="block w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 shadow-sm"
                                            required
                                            placeholder="coach_shin"
                                        />
                                    </div>
                                    <InputError message={errors.username} />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                                        {isEdit ? "New Password (Leave blank to keep current)" : "Password"}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={16} className="text-zinc-400" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="block w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 shadow-sm"
                                            required={!isEdit}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/50">
                                <Link 
                                    href={route('admins.index')}
                                    className="px-4 py-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center items-center h-9 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {processing ? 'Saving...' : (isEdit ? 'Update Admin' : 'Create Admin')}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}