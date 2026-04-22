import { useState } from 'react'; // Tambahkan ini
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Search, Plus, Edit2, Trash2, ShieldCheck } from 'lucide-react';

export default function Index({ auth, admins }) {
    const { delete: destroy } = useForm();
    
    // State untuk menyimpan teks pencarian
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this admin?')) {
            destroy(route('admins.destroy', id));
        }
    };

    // Logika filter: Cek apakah nama atau username mengandung teks pencarian (case-insensitive)
    const filteredAdmins = admins.filter((admin) => {
        const query = searchQuery.toLowerCase();
        return (
            admin.name.toLowerCase().includes(query) ||
            admin.username.toLowerCase().includes(query)
        );
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            headerTitle="Admin Management"
            headerDescription="Manage coach accounts, access credentials, and profile photos."
        >
            <Head title="Admins" />

            <div className="max-w-7xl pb-12 space-y-6">
                
                {/* Toolbar (Search & Add Button) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input 
                            type="text" 
                            value={searchQuery} // Hubungkan ke state
                            onChange={(e) => setSearchQuery(e.target.value)} // Update state saat mengetik
                            placeholder="Search by name or username..." 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 transition-colors shadow-sm"
                        />
                    </div>
                    
                    <Link 
                        href={route('admins.create')}
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 h-9 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[13px] font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        Add New Admin
                    </Link>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-zinc-200 dark:border-zinc-800/80">
                                <tr>
                                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Profile</th>
                                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Role</th>
                                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Joined Date</th>
                                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {/* Gunakan filteredAdmins, BUKAN admins */}
                                {filteredAdmins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={admin.profile_photo || `https://ui-avatars.com/api/?name=${admin.name}&background=random&color=fff&bold=true`} 
                                                    alt={admin.name} 
                                                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm"
                                                />
                                                <div>
                                                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{admin.name}</div>
                                                    <div className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">@{admin.username}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/50">
                                                <ShieldCheck size={12} className="text-zinc-500" />
                                                Coach / Admin
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-[13px]">
                                            {new Date(admin.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    href={route('admins.edit', admin.id)}
                                                    className="p-1.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-zinc-200 dark:border-zinc-800 rounded-md transition-colors focus:outline-none"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </Link>
                                                
                                                {auth.user.id !== admin.id && (
                                                    <button 
                                                        onClick={() => handleDelete(admin.id)}
                                                        className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-900/20 border border-zinc-200 dark:border-zinc-800 rounded-md transition-colors focus:outline-none"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* Ubah deteksi kosong agar sesuai dengan hasil pencarian */}
                                {filteredAdmins.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-3">
                                                    <Search size={24} className="text-zinc-300 dark:text-zinc-700" />
                                                </div>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                                    {searchQuery ? `Tidak ada admin yang cocok dengan "${searchQuery}".` : 'Belum ada data admin.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}