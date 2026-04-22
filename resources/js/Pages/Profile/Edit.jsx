import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Shield, AlertTriangle } from 'lucide-react';

// Pastikan menambahkan 'auth' di parameter agar bisa dipassing ke Layout
export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            headerTitle="Profile Settings"
            headerDescription="Manage your coach profile, credentials, and security preferences."
        >
            <Head title="Profile" />

            {/* Container dibatasi max-w-4xl agar form tidak terlalu melebar */}
            <div className="max-w-4xl space-y-6 pb-12">
                
                {/* 1. Profile Information Card */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden group">
                    <div className="border-b border-zinc-200 dark:border-zinc-800/80 px-6 py-4 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                            <User size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Personal Information</h3>
                            <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Update your account's profile information and username.</p>
                        </div>
                    </div>
                    <div className="p-6 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>
                </div>

                {/* 2. Update Password Card */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden group">
                    <div className="border-b border-zinc-200 dark:border-zinc-800/80 px-6 py-4 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                            <Shield size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Security</h3>
                            <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Ensure your account is using a long, random password to stay secure.</p>
                        </div>
                    </div>
                    <div className="p-6 sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                </div>

                {/* 3. Danger Zone (Delete Account) Card */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/30 rounded-2xl shadow-sm overflow-hidden relative">
                    {/* Garis merah penanda bahaya di sisi kiri */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    
                    <div className="border-b border-red-100 dark:border-red-900/20 px-6 py-4 flex items-center gap-3 bg-red-50/50 dark:bg-red-500/5">
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                            <AlertTriangle size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                            <p className="text-[12px] text-red-500/80 dark:text-red-400/80">Permanently remove your personal data and account.</p>
                        </div>
                    </div>
                    <div className="p-6 sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}