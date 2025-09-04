'use client';
import Sidebar from '@/components/SideBar';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { Plus } from 'lucide-react';
import TableauVin from '@/components/TableauVin';
import ModalNouveauVin from '@/components/ModalNouveauVin';
import { useState } from 'react';

export default function VinsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    function addNewWine() {
        setIsModalOpen(true);
    }

    function handleSaveWine(wineData: any) {
        // Logique pour sauvegarder le nouveau vin
        console.log('Nouveau vin:', wineData);
        // Ici vous pouvez ajouter la logique pour sauvegarder dans votre état ou API
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
<path d="M10.0001 6.66667V13.3333M6.66675 10H13.3334M18.3334 10C18.3334 14.6024 14.6025 18.3333 10.0001 18.3333C5.39771 18.3333 1.66675 14.6024 1.66675 10C1.66675 5.39763 5.39771 1.66667 10.0001 1.66667C14.6025 1.66667 18.3334 5.39763 18.3334 10Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

                            Ajouter des vins
                        </Button>
                    </div>

                    <div>
                        <TableauVin />
                    </div>
                </div>

                <ModalNouveauVin 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveWine}
                />
            </main>
        </div>
    );
}
