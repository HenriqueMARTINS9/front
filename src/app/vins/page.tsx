'use client';
import Sidebar from '@/components/SideBar';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { Plus } from 'lucide-react';
import TableauVin from '@/components/TableauVin';
import ModalNouveauVin from '@/components/ModalNouveauVin';
import { useState } from 'react';
import { useVins, useCreateVin } from '@/lib/hooks';
import { type Vin } from '@/lib/api';
import { useNotification } from '@/lib/useNotification';
import Notification from '@/components/Notification';

export default function VinsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Récupération des vins depuis l'API
    const { data: vins, isLoading, error } = useVins();
    const createVinMutation = useCreateVin();
    const { notifications, showSuccess, showError, removeNotification } = useNotification();

    function addNewWine() {
        setIsModalOpen(true);
    }

    async function handleSaveWine(wineData: Omit<Vin, 'id'>) {
        try {
            await createVinMutation.mutateAsync(wineData);
            setIsModalOpen(false);
            showSuccess('Vin créé avec succès !');
        } catch (error) {
            console.error('Erreur lors de la création du vin:', error);
            showError('Erreur lors de la création du vin');
        }
    }

    function handleCloseModal() {
        setIsModalOpen(false);
    }

    return (
        <div className="flex h-screen bg-[#F8F9FC]">
            <Sidebar />

            <main className="flex-1 overflow-y-scroll">
                <Header title='Carte des vins' />

                <div className="px-10 py-10 space-y-8">
                    <div>
                    <Button 
                            onClick={addNewWine}
                            className="bg-[#4E5BA6] border-[#4E5BA6] text-white hover:bg-[#3D4A8A] hover:border-[#3D4A8A] transition-colors duration-200"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.0001 6.66667V13.3333M6.66675 10H13.3334M18.3334 10C18.3334 14.6024 14.6025 18.3333 10.0001 18.3333C5.39771 18.3333 1.66675 14.6024 1.66675 10C1.66675 5.39763 5.39771 1.66667 10.0001 1.66667C14.6025 1.66667 18.3334 5.39763 18.3334 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

                            Ajouter des vins
                        </Button>
                    </div>

                    <div>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-gray-500">Chargement des vins...</div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-red-500">Erreur lors du chargement des vins</div>
                            </div>
                        ) : (
                            <TableauVin vins={(vins || []) as Vin[]} />
                        )}
                    </div>
                </div>

                <ModalNouveauVin 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveWine}
                />
            </main>
            
            {/* Notifications */}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    type={notification.type}
                    message={notification.message}
                    isVisible={true}
                    onClose={() => removeNotification(notification.id)}
                    duration={notification.duration}
                />
            ))}
        </div>
    );
}
