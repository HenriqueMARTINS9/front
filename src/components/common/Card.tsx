import { ReactNode } from 'react';


export default function Card({ title, number, subtitle, children }: { title: string, number?: string, subtitle?: string, children: ReactNode }) {
    return <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_#F4EBFF,_0px_1px_2px_0px_#0A0D1206,_0px_1px_3px_0px_#0A0D121A] p-6 text-sm flex flex-col gap-6">
        <div className={`flex flex-col ${number ? 'gap-6' : ''}`}>
            <h4>{title}</h4>
            <div className={`flex flex-col ${number ? 'gap-3' : ''}`}>
                <div className="text-3xl font-bold text-gray-900">{number}</div>
                <div className="text-gray-900 text-lg">{subtitle}</div>
            </div>
        </div>
        {children}
    </div>;
}