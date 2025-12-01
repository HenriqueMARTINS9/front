"use client";
import React, { useMemo } from 'react';
import { convertRestaurantWineToVin, type Vin } from '@/lib/api';
import TableauVin from './TableauVin';
import { useTranslation } from '@/lib/useTranslation';
import { useRestaurantWines } from '@/lib/hooks';
import { getRestaurantId } from '@/lib/auth';

type ApiVinsIntegrationProps = {
    restaurantId?: number;
};

export default function ApiVinsIntegration({ restaurantId }: ApiVinsIntegrationProps) {
    const { t } = useTranslation();
    
    // Utiliser le hook React Query pour récupérer les vins (se met à jour automatiquement)
    const { data: restaurantWines, isLoading, error: queryError } = useRestaurantWines(restaurantId);
    
    // Récupérer le restaurant ID depuis le localStorage si non fourni
    const storedRestaurantId = getRestaurantId();
    const actualRestaurantId = restaurantId ?? storedRestaurantId ?? 1;

    // Conversion des vins de l'API en format local
    const vins = useMemo(() => {
        if (!restaurantWines || restaurantWines.length === 0) {
            return [];
        }
        return restaurantWines.map(wine => convertRestaurantWineToVin(wine, actualRestaurantId));
    }, [restaurantWines, actualRestaurantId]);
    
    const error = queryError ? (queryError instanceof Error ? queryError.message : t('common.error')) : null;

    // Fonctions de gestion (désactivées pour les données API)
    const handleSaveVin = (vin: Vin) => {
        console.log('Modification non disponible pour les données API:', vin);
    };

    const handleDeleteVin = (vinId: string) => {
        console.log('Suppression non disponible pour les données API:', vinId);
    };

    const handleTogglePointDeVente = (vinId: string, pointIndex: number) => {
        console.log('Modification des points de vente non disponible pour les données API:', vinId, pointIndex);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F56D9]"></div>
                    <span className="ml-3 text-gray-600">Chargement</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="text-center">
                    <div className="text-red-600 mb-2">❌ {t('common.error')}</div>
                    <div className="text-sm text-gray-600">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <TableauVin
                vins={vins}
                restaurantId={actualRestaurantId}
            />
        </div>
    );
}
