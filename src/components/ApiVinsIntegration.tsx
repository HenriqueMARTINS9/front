"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { recommendationsService } from '@/lib/api';
import { RestaurantWine } from '@/lib/api';
import { type Vin } from '@/lib/api';
import TableauVin from './TableauVin';
import { useTranslation } from '@/lib/useTranslation';

type ApiVinsIntegrationProps = {
    restaurantId?: number;
};

export default function ApiVinsIntegration({ restaurantId = 0 }: ApiVinsIntegrationProps) {
    const { t } = useTranslation();
    const [apiVins, setApiVins] = useState<RestaurantWine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fonction pour convertir un vin de l'API en format Vin local
    const convertApiVinToVin = (vin: any): Vin => {
        // Extraire le nom du vin (fr ou en-US ou direct)
        const wineName = vin.wine_name?.fr || vin.wine_name?.['en-US'] || vin.wine_name || vin.name || 'Vin sans nom';
        
        // Extraire le domaine (fr ou en-US ou direct)
        const domain = vin.domain?.fr || vin.domain?.['en-US'] || vin.domain || vin.domaine || '';
        
        // Extraire le type de vin (fr ou en-US ou direct)
        const wineType = vin.wine_type?.fr || vin.wine_type?.['en-US'] || vin.wine_type || vin.type || vin.wineType || '';
        
        // Extraire le pays (fr ou en-US ou direct)
        const country = vin.country?.fr || vin.country?.['en-US'] || vin.country || vin.pays || '';
        
        // Extraire l'appellation (fr ou en-US ou direct)
        const appellation = vin.appellation?.fr || vin.appellation?.['en-US'] || vin.appellation || vin.appellation_name || '';
        
        // Construire le cépage à partir des variétés de raisins
        const cepage = vin.grapes_varieties
            ?.map((gv: any) => gv.variety_name?.fr || gv.variety_name?.['en-US'] || gv.variety_name || gv.name || '')
            .filter(Boolean)
            .join(', ') || vin.cepage || vin.grape_varieties || '';

        // Construire la région (appellation + pays)
        const region = [appellation, country].filter(Boolean).join(', ') || vin.region || '';

        // Extraire l'année (millesime)
        const year = vin.year || vin.vintage || vin.millesime || vin.year_production || 0;
        
        // Extraire le prix
        const price = vin.price || vin.prix || 0;
        
        // Extraire le format
        const format = vin.format_cl || vin.format || vin.size || '';

        return {
            id: `api-${vin.wine_id || vin.id || Math.random().toString(36).substr(2, 9)}`,
            nom: wineName,
            subname: domain,
            type: wineType,
            cepage: cepage,
            region: region,
            pays: country,
            millesime: year,
            prix: price,
            restaurant: `Restaurant ${restaurantId}`,
            pointsDeVente: [true] as [boolean], // Par défaut disponible
            motsCles: [
                // Créer des mots-clés basés sur les informations disponibles
                ...(wineType ? [{ id: 'type', label: wineType, color: 'bg-blue-100', textColor: 'text-blue-700' }] : []),
                ...(country ? [{ id: 'pays', label: country, color: 'bg-green-100', textColor: 'text-green-700' }] : []),
                ...(format ? [{ id: 'format', label: `${format}cl`, color: 'bg-purple-100', textColor: 'text-purple-700' }] : []),
                ...(cepage ? [{ id: 'cepage', label: cepage, color: 'bg-orange-100', textColor: 'text-orange-700' }] : []),
                ...(appellation ? [{ id: 'appellation', label: appellation, color: 'bg-indigo-100', textColor: 'text-indigo-700' }] : [])
            ]
        };
    };

    // Effet pour récupérer les vins de l'API
    useEffect(() => {
        const fetchVins = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await recommendationsService.getRestaurantWines(restaurantId);
                setApiVins(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : t('common.error'));
                console.error('Erreur API vins:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVins();
    }, [restaurantId, t]);

    // Conversion des vins de l'API en format local
    const vins = useMemo(() => {
        return apiVins.map(convertApiVinToVin);
    }, [apiVins, convertApiVinToVin]);

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
                    <span className="ml-3 text-gray-600">{t('test.wines.loading')}</span>
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
            />
        </div>
    );
}
