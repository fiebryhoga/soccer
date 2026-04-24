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
            <div className="flex py-12">
                <h1 className='font-extrabold text-[110px]'>Nek saranku turuo, Sesok sek ono dino</h1>
            </div>
        </AuthenticatedLayout>
    );
}