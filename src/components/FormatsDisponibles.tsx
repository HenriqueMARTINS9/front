"use client";
import React from 'react';

type Format = {
    id: string;
    nom: string;
    capacite: string;
    prix: number;
};

type FormatsDisponiblesProps = {
    formats: Format[];
};

export default function FormatsDisponibles({ formats }: FormatsDisponiblesProps) {
    return (
        <div className="space-y-3"> 
            <table>
                <thead>
                    <tr>
                        <th className="py-1 font-medium text-left text-sm text-gray-700">Formats disponibles</th>
                        <th className="py-1 font-medium text-left text-sm text-gray-700">Prix</th>
                    </tr>
                </thead>
                <tbody>
                    {formats.map((format) => (
                        <tr key={format.id} className="text-sm">
                            <td className="py-1 pr-12 text-gray-900">{format.nom} ({format.capacite})</td>
                            <td className="py-1 text-gray-900">
                                {format.prix.toFixed(2)} CHF
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
