"use client";
import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTranslation } from '@/lib/useTranslation';
import { getRestaurantId } from '@/lib/auth';
import { useRestaurantInfo } from '@/lib/hooks';
import { Download, Printer } from 'lucide-react';

export default function QRCodeCard() {
    const { t } = useTranslation();
    const { data: restaurantInfo } = useRestaurantInfo();
    const storedRestaurantId = getRestaurantId();
    const actualRestaurantId = restaurantInfo?.id ?? storedRestaurantId ?? 0;
    
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // URL avec le restaurant ID
    const qrCodeUrl = `https://virtualsomm.ophelievalentine.fr/?restaurantId=${actualRestaurantId}`;

    // Fonction pour télécharger le QR code en PNG
    const handleDownloadPNG = () => {
        if (!qrCodeRef.current) return;

        // Créer un canvas pour convertir le SVG en PNG
        const svgElement = qrCodeRef.current.querySelector('svg');
        if (!svgElement) return;

        // Cloner le SVG pour éviter de modifier l'original
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Définir la taille du canvas (avec padding blanc)
        const padding = 40;
        const qrSize = 256;
        const size = qrSize + (padding * 2);
        canvas.width = size;
        canvas.height = size;

        img.onload = () => {
            if (!ctx) {
                URL.revokeObjectURL(img.src);
                return;
            }
            
            // Remplir le canvas avec un fond blanc
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, size, size);
            
            // Dessiner le QR code au centre
            ctx.drawImage(img, padding, padding, qrSize, qrSize);
            
            // Télécharger l'image
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(img.src);
                if (!blob) return;
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `qrcode-restaurant-${actualRestaurantId}.png`;
                link.href = downloadUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
            }, 'image/png');
        };

        img.onerror = () => {
            console.error('Erreur lors du chargement de l\'image SVG');
        };

        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.src = url;
    };

    // Fonction pour imprimer le QR code
    const handlePrint = () => {
        if (!qrCodeRef.current) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const svgElement = qrCodeRef.current.querySelector('svg');
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        
        // Obtenir la date et l'heure actuelles
        const now = new Date();
        const dateString = now.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeString = now.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateTimeString = `${dateString} ${timeString}`;
        
        // Obtenir le titre depuis les traductions
        const title = t('home.qrcode.title') || 'QR Code';
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${title} - Restaurant ${actualRestaurantId}</title>
                    <style>
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            margin: 0;
                            padding: 20px;
                            background: white;
                            height: 100vh;
                            display: flex;
                            flex-direction: column;
                            font-family: Arial, sans-serif;
                        }
                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 20px;
                            width: 100%;
                        }
                        .time {
                            font-size: 14px;
                            color: #111827;
                            font-weight: 400;
                        }
                        .title {
                            font-size: 18px;
                            font-weight: 600;
                            color: #111827;
                            text-align: right;
                        }
                        .qr-container {
                            flex: 1;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: white;
                        }
                        .qr-container svg {
                            width: 400px;
                            height: 400px;
                        }
                        @media print {
                            body {
                                height: 100vh;
                                overflow: hidden;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="time">${dateTimeString}</div>
                        <div class="title">${title}</div>
                    </div>
                    <div class="qr-container">
                        ${svgData}
                    </div>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Attendre que le contenu soit chargé avant d'imprimer
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    if (!mounted) {
        return (
            <Card title={t('home.qrcode.title') || 'QR Code'}>
                <div className="animate-pulse space-y-4">
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card title={t('home.qrcode.title') || 'QR Code'}>
            <div className="flex flex-col items-center gap-6">
                {/* QR Code */}
                <div 
                    ref={qrCodeRef}
                    className="bg-white rounded-lg"
                >
                    <QRCodeSVG
                        value={qrCodeUrl}
                        size={128}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 w-full">
                    <Button
                        onClick={handleDownloadPNG}
                        className="flex-1 !bg-[#7F56D9] !text-white hover:!bg-[#6941C6] focus:!outline-none focus:!ring-2 focus:!ring-purple-100 focus:!border-purple-300 focus:!shadow-xs transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        {t('home.qrcode.download') || 'Télécharger PNG'}
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="flex-1 !bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-50 focus:!outline-none focus:!ring-2 focus:!ring-gray-100 focus:!border-gray-300 focus:!shadow-xs transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        {t('home.qrcode.print') || 'Imprimer'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

