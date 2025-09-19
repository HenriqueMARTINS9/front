'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isRestaurantLoggedIn, isUserLoggedIn } from '@/lib/auth';
import Sidebar from '@/components/SideBar';
import AlertCard from '@/components/AlertCard';
import VinsCard from '@/components/VinsCard';
import Header from '@/components/Header';
import MenuCard from '@/components/MenuCard';
import MembersCard from '@/components/MembersCard';
import { useTranslation } from '@/lib/useTranslation';
import { useRestaurantInfo } from '@/lib/hooks';


export default function HomePage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { data: restaurantInfo } = useRestaurantInfo();

    useEffect(() => {
        // Vérifier si l'utilisateur ou le restaurant est connecté
        if (!isUserLoggedIn() && !isRestaurantLoggedIn()) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="flex h-screen bg-[#F8F9FC]">
            <Sidebar />

            <main className="flex-1 overflow-y-scroll">
                <Header 
                    title={isRestaurantLoggedIn() && restaurantInfo 
                        ? `${t('home.title')} - ${restaurantInfo.name}` 
                        : t('home.title')
                    }
                ></Header>

                <div className='px-10 py-10 grid grid-cols-12 gap-10'>
                    {/* Alertes */}
                    <div className="mb-0 col-span-8 space-y-10">
                        <div>
                            <AlertCard
                                /*alerts={[
                                    { type: 'warning', message: t('home.alerts.missingAromas') },
                                    { type: 'error', message: t('home.alerts.menuNotUpdated') },
                                    { type: 'success', message: t('home.alerts.addWineByGlass') },
                                ]}*/
                                alerts={[]}
                            />

                        </div>
                        <div><MenuCard /></div>

                    </div>



                    {/* Stats principales */}
                    <div className="mb-0 col-span-4 space-y-10">
                        <div>
                            <VinsCard />
                        </div>
                        {/*<div><MembersCard /></div> */}
                    </div>

                </div>


            </main>
        </div>
    );
}