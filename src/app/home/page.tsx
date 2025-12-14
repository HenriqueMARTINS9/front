'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isRestaurantLoggedIn, isUserLoggedIn } from '@/lib/auth';
import Sidebar from '@/components/layout/SideBar';
import AlertCard from '@/components/home/AlertCard';
import VinsCard from '@/components/home/VinsCard';
import Header from '@/components/layout/Header';
import MenuCard from '@/components/home/MenuCard';
import MembersCard from '@/components/home/MembersCard';
import QRCodeCard from '@/components/home/QRCodeCard';
import { useTranslation } from '@/lib/useTranslation';
import { useRestaurantInfo, useAlerts } from '@/lib/hooks';


export default function HomePage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { data: restaurantInfo } = useRestaurantInfo();
    const { alerts, isLoading: isLoadingAlerts } = useAlerts();

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
                                alerts={isLoadingAlerts ? [] : alerts}
                            />

                        </div>
                        <div><MenuCard /></div>

                    </div>



                    {/* Stats principales */}
                    <div className="mb-0 col-span-4 space-y-10">
                        <div>
                            <VinsCard />
                        </div>
                        <div>
                            <QRCodeCard />
                        </div>
                        {/*<div><MembersCard /></div> */}
                    </div>

                </div>


            </main>
        </div>
    );
}