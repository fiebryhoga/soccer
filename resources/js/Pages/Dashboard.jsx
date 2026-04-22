import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        // Memanggil Layout Utama (Otomatis membawa Sidebar & Navbar beserta state-nya)
        <AuthenticatedLayout
            user={auth.user}
            headerTitle="Dashboard Overview"
            headerDescription="Monitor team performance and upcoming matches."
        >
            <Head title="Dashboard" />

            {/* Konten Halaman Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Matches</h3>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">24</p>
                </div>
                <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Win Rate</h3>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">68%</p>
                </div>
                <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Players</h3>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">18</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}