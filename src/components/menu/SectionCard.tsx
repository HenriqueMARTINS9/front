import Link from 'next/link';
import { ArrowRight } from 'lucide-react';


export default function SectionCard({ title, description, href }: { title: string; description: string; href: string }) {
    return (
        <Link href={href} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
            <div className="text-indigo-600 text-sm font-medium flex items-center gap-1">
                Accéder <ArrowRight className="w-4 h-4" />
            </div>
        </Link>
    );
}