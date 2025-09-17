"use client";
import React, { useState, useEffect } from 'react';
import { recommendationsService } from '@/lib/api';
import { RestaurantWine } from '@/lib/api';
import Card from './Card';
import { useTranslation } from '@/lib/useTranslation';

type VinsStatsProps = {
    restaurantId: number;
};

export default function VinsStats({ restaurantId }: VinsStatsProps) {
    const { t } = useTranslation();
    const [vins, setVins] = useState<RestaurantWine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVins = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await recommendationsService.getRestaurantWines(restaurantId);
                setVins(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : t('common.error'));
                console.error('Erreur API vins:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVins();
    }, [restaurantId]);

    if (isLoading) {
        return (
            <Card title="Statistiques des vins" number={`${t('common.restaurant')} ${restaurantId}`}>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F56D9]"></div>
                    <span className="ml-3 text-gray-600">{t('test.wines.loading')}</span>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Statistiques des vins" number={`${t('common.restaurant')} ${restaurantId}`}>
                <div className="text-center py-8">
                    <div className="text-red-600 mb-2">❌ {t('common.error')}</div>
                    <div className="text-sm text-gray-600">{error}</div>
                </div>
            </Card>
        );
    }

    // Calculer les statistiques
    const totalVins = vins.length;
    const typesVins = new Set<string>();
    const paysVins = new Set<string>();
    const domainesVins = new Set<string>();
    const prixMoyen = vins.length > 0 ? vins.reduce((sum, vin) => sum + vin.price, 0) / vins.length : 0;

    vins.forEach(vin => {
        // Extraire le type de vin (fr ou en-US)
        const wineType = vin.wine_type?.fr || vin.wine_type?.['en-US'] || '';
        if (wineType) typesVins.add(wineType);

        // Extraire le pays (fr ou en-US)
        const country = vin.country?.fr || vin.country?.['en-US'] || '';
        if (country) paysVins.add(country);

        // Extraire le domaine (fr ou en-US)
        const domain = vin.domain?.fr || vin.domain?.['en-US'] || '';
        if (domain) domainesVins.add(domain);
    });

    return (
        <Card title="Statistiques des vins" number={`Restaurant ${restaurantId}`}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{totalVins}</div>
                        <div className="text-sm text-blue-800">{t('test.wines.totalWines')}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{typesVins.size}</div>
                        <div className="text-sm text-green-800">{t('test.wines.differentTypes')}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{paysVins.size}</div>
                        <div className="text-sm text-purple-800">{t('test.wines.differentCountries')}</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{domainesVins.size}</div>
                        <div className="text-sm text-orange-800">{t('test.wines.differentDomains')}</div>
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-gray-800">{t('test.wines.averagePrice')}</div>
                    <div className="text-2xl font-bold text-gray-900">{prixMoyen.toFixed(2)} CHF</div>
                </div>

                {totalVins > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">{t('test.wines.availableTypes')}</h4>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(typesVins).map((type, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {totalVins > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">{t('test.wines.representedCountries')}</h4>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(paysVins).map((pays, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    {pays}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
