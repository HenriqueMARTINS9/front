// Fonction pour déterminer les couleurs des tags selon les catégories
export function getTagColors(label: string): { bg: string; puce: string; text: string } {
    const lowerLabel = label.toLowerCase();
    
    // Catégorie 1: Fromages (Orange/Yellowish)
    if (lowerLabel.includes('fromage') || lowerLabel.includes('crème') || lowerLabel.includes('faisselle')) {
        return {
            bg: 'bg-[#FFFAEB]',
            puce: '#F79009',
            text: 'text-[#B54708]'
        };
    }
    
    // Catégorie 2: Viandes et produits de la mer (Red/Pinkish)
    if (lowerLabel.includes('viande') || lowerLabel.includes('poisson') || lowerLabel.includes('crustacé') || 
        lowerLabel.includes('mollusque') || lowerLabel.includes('marinade') || lowerLabel.includes('piment')) {
        return {
            bg: 'bg-[#FEF3F2]',
            puce: '#F04438',
            text: 'text-[#B42318]'
        };
    }
    
    // Catégorie 3: Légumes et champignons (Green)
    if (lowerLabel.includes('légume') || lowerLabel.includes('solanacée') || lowerLabel.includes('légumineuse') || 
        lowerLabel.includes('champignon') || lowerLabel.includes('crucifère') || lowerLabel.includes('alliacé') || 
        lowerLabel.includes('racine') || lowerLabel.includes('vert')) {
        return {
            bg: 'bg-[#ECFDF3]',
            puce: '#12B76A',
            text: 'text-[#027A48]'
        };
    }
    
    // Catégorie 4: Herbes et épices (Purple/Violet)
    if (lowerLabel.includes('herbe') || lowerLabel.includes('épice') || lowerLabel.includes('résineuse') || 
        lowerLabel.includes('aromati') || lowerLabel.includes('pâtissier') || lowerLabel.includes('exotique') || 
        lowerLabel.includes('umami')) {
        return {
            bg: 'bg-[#F4F3FF]',
            puce: '#7A5AF8',
            text: 'text-[#5925DC]'
        };
    }
    
    // Catégorie 5: Types de vins (Orange/Yellowish, Red/Pinkish, Pink)
    if (lowerLabel.includes('vin')) {
        if (['orange', 'moelleux', 'liquoreux'].some(type => lowerLabel.includes(type))) {
            return {
                bg: 'bg-[#FFF6ED]',
                puce: '#FB6514',
                text: 'text-[#C4320A]'
            };
        } else if (['mousseux', 'blanc'].some(type => lowerLabel.includes(type))) {
            return {
                bg: 'bg-[#FFFAEB]',
                puce: '#F79009',
                text: 'text-[#B54708]'
            };
        } else if (['rouge'].some(type => lowerLabel.includes(type))) {
            return {
                bg: 'bg-[#FEF3F2]',
                puce: '#F04438',
                text: 'text-[#B42318]'
            };
        } else if (['rosé', 'fortifié'].some(type => lowerLabel.includes(type))) {
            return {
                bg: 'bg-[#FDF2FA]',
                puce: '#EE46BC',
                text: 'text-[#C11574]'
            };
        }
    }
    
    // Types de vins simples (sans "vin" dans le nom)
    if (['blanc', 'rouge', 'rosé', 'mousseux', 'fortifié', 'moelleux', 'liquoreux', 'orange'].includes(lowerLabel)) {
        if (['orange', 'moelleux', 'liquoreux'].includes(lowerLabel)) {
            return {
                bg: 'bg-[#FFF6ED]',
                puce: '#FB6514',
                text: 'text-[#C4320A]'
            };
        } else if (['mousseux', 'blanc'].includes(lowerLabel)) {
            return {
                bg: 'bg-[#FFFAEB]',
                puce: '#F79009',
                text: 'text-[#B54708]'
            };
        } else if (['rouge'].includes(lowerLabel)) {
            return {
                bg: 'bg-[#FEF3F2]',
                puce: '#F04438',
                text: 'text-[#B42318]'
            };
        } else if (['rosé', 'fortifié'].includes(lowerLabel)) {
            return {
                bg: 'bg-[#FDF2FA]',
                puce: '#EE46BC',
                text: 'text-[#C11574]'
            };
        }
    }
    
    // Par défaut: Gris
    return {
        bg: 'bg-gray-100',
        puce: '#6B7280',
        text: 'text-gray-700'
    };
}
