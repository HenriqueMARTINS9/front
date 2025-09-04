'use client';


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import Sidebar from '@/components/SideBar';
import AlertCard from '@/components/AlertCard';
import VinsCard from '@/components/VinsCard';
import RestaurantCard from '@/components/RestaurantCard';
import Header from '@/components/Header';
import MenuCard from '@/components/MenuCard';
import MembersCard from '@/components/MembersCard';


export default function HomePage() {
    const router = useRouter();


    /*useEffect(() => {
        if (!getToken()) router.push('/login');
    }, []);*/


    return (
        <div className="flex h-screen bg-[#F8F9FC]">
            <Sidebar />


            <main className="flex-1 overflow-y-scroll">
                <Header title='Home'></Header>

                <div className='px-10 py-10 grid grid-cols-12 gap-10'>
                    {/* Alertes */}
                    <div className="mb-0 col-span-8 space-y-10">
                        <div>
                            <AlertCard
                                alerts={[
                                    { type: 'warning', message: '3 plats ne contiennent pas encore de tags d\'arômes.' },
                                    { type: 'error', message: 'Votre menu n\'a pas été mis à jour depuis 30 jours.' },
                                    { type: 'success', message: 'Ajoutez au moins un vin au verre pour activer la suggestion client.' },
                                ]}
                            />

                        </div>
                        <div><MenuCard /></div>

                    </div>



                    {/* Stats principales */}
                    <div className="mb-0 col-span-4 space-y-10">
                        <div>
                            <VinsCard />
                        </div>
                        <div><MembersCard /></div>
                    </div>

                </div>


            </main>
        </div>
    );
}