import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ClubForm from './Partials/ClubForm';
import PlayerManagement from './Partials/PlayerManagement';

export default function Index({ auth, club }) {
    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Club Configuration" 
            headerDescription={club ? "Kelola identitas klub dan skuad pemain Anda." : "Lakukan setup awal untuk klub Anda."}
        >
            <Head title="Club Configuration" />

            <div className="max-w-6xl pb-12 space-y-8">
                {/* Komponen Form Identitas Klub */}
                <ClubForm club={club} />

                {/* Komponen Manajemen Pemain (Hanya muncul jika Klub sudah dibuat) */}
                {club && <PlayerManagement club={club} />}
            </div>
        </AuthenticatedLayout>
    );
}