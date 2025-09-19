# Documentation des Composants VirtualSomm

## 🧩 Vue d'ensemble

Cette documentation décrit tous les composants React utilisés dans l'application VirtualSomm Frontend.

## 📁 Structure des composants

```
src/components/
├── UI Components (Base)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── InputField.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── RadioButton.tsx
│   └── Tag.tsx
├── Layout Components
│   ├── Header.tsx
│   ├── SideBar.tsx
│   └── QueryProvider.tsx
├── Feature Components
│   ├── AlertCard.tsx
│   ├── MenuCard.tsx
│   ├── VinsCard.tsx
│   ├── RestaurantCard.tsx
│   └── MembersCard.tsx
├── Data Components
│   ├── TableauVin.tsx
│   ├── TableauMenu.tsx
│   ├── ApiVinsIntegration.tsx
│   └── RestaurantDishes.tsx
├── Modal Components
│   ├── ModalNouveauVin.tsx
│   ├── ModalNouveauPlat.tsx
│   └── FormulaireModification.tsx
└── Specialized Components
    ├── CepageAssemblage.tsx
    ├── FormatsDisponibles.tsx
    ├── MotsCles.tsx
    └── LanguageSelector.tsx
```

## 🎨 Composants UI de base

### Button

Composant de bouton réutilisable avec variants et états.

```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

// Utilisation
<Button 
  variant="primary" 
  size="md" 
  onClick={handleClick}
>
  Sauvegarder
</Button>
```

### Card

Conteneur de base pour organiser le contenu.

```tsx
interface CardProps {
  title: string;
  subtitle?: string;
  number?: string;
  children: React.ReactNode;
  className?: string;
}

// Utilisation
<Card title="Vins" number="45" subtitle="Références">
  <div>Contenu de la carte</div>
</Card>
```

### InputField

Champ de saisie avec label et gestion d'erreurs.

```tsx
interface InputFieldProps {
  type: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Utilisation
<InputField
  type="text"
  value={wineName}
  onChange={setWineName}
  label="Nom du vin"
  placeholder="Château Margaux"
  error={errors.wineName}
/>
```

### Select

Menu déroulant personnalisé.

```tsx
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
  placeholder?: string;
  error?: string;
}

// Utilisation
<Select
  value={selectedType}
  onChange={setSelectedType}
  options={wineTypes}
  label="Type de vin"
  placeholder="Choisir un type"
/>
```

### Tag

Étiquette avec compteur et couleurs personnalisables.

```tsx
interface TagProps {
  label: string;
  count?: number;
  color?: string;
  textColor?: string;
  puce?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Utilisation
<Tag
  label="Rouge"
  count={15}
  color="bg-red-100"
  textColor="text-red-700"
  puce={true}
/>
```

## 🏗️ Composants de layout

### Header

En-tête de page avec titre et actions.

```tsx
interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

// Utilisation
<Header 
  title="Carte des vins"
  subtitle="Gestion des références"
  actions={<Button>Ajouter</Button>}
/>
```

### SideBar

Barre de navigation latérale.

```tsx
// Utilisation
<SideBar />
```

**Fonctionnalités :**
- Navigation entre les pages
- Indicateur de page active
- Icônes Lucide React
- Support de l'internationalisation

### QueryProvider

Provider pour React Query avec configuration.

```tsx
// Utilisation
<QueryProvider>
  <App />
</QueryProvider>
```

## 📊 Composants de données

### TableauVin

Tableau interactif pour la gestion des vins.

```tsx
interface TableauVinProps {
  vins: Vin[];
}

// Utilisation
<TableauVin vins={winesList} />
```

**Fonctionnalités :**
- Affichage en tableau responsive
- Édition inline
- Suppression avec confirmation
- Expansion pour détails
- Points de vente toggleables

### ApiVinsIntegration

Composant d'intégration des vins depuis l'API.

```tsx
interface ApiVinsIntegrationProps {
  restaurantId?: number;
}

// Utilisation
<ApiVinsIntegration restaurantId={0} />
```

**Fonctionnalités :**
- Récupération automatique des données API
- Conversion vers format local
- Gestion des erreurs
- Loading states

### TableauMenu

Tableau pour la gestion des plats de menu.

```tsx
interface TableauMenuProps {
  pointDeVenteId: string;
  restaurantId: number;
}

// Utilisation
<TableauMenu pointDeVenteId="1" restaurantId={0} />
```

## 🎯 Composants spécialisés

### CepageAssemblage

Affichage des cépages avec pourcentages.

```tsx
interface CepageAssemblageProps {
  cepages: Cepage[];
  wineType?: string;
}

// Utilisation
<CepageAssemblage 
  cepages={wineCepages} 
  wineType="Rouge"
/>
```

**Fonctionnalités :**
- Affichage en badges colorés
- Couleurs selon le type de vin
- Pourcentages d'assemblage

### FormatsDisponibles

Gestion des formats et prix des vins.

```tsx
interface FormatsDisponiblesProps {
  formats: Format[];
  onFormatsChange: (formats: Format[]) => void;
  wineType?: string;
}

// Utilisation
<FormatsDisponibles
  formats={wineFormats}
  onFormatsChange={setWineFormats}
  wineType="Blanc"
/>
```

### MotsCles

Gestion des mots-clés avec couleurs.

```tsx
interface MotsClesProps {
  motsCles: MotCle[];
  wineType?: string;
  editable?: boolean;
  onMotsClesChange?: (motsCles: MotCle[]) => void;
}

// Utilisation
<MotsCles
  motsCles={keywords}
  wineType="Rouge"
  editable={true}
  onMotsClesChange={setKeywords}
/>
```

## 🎭 Composants modaux

### ModalNouveauVin

Modal pour ajouter un nouveau vin.

```tsx
interface ModalNouveauVinProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wineData: any) => void;
}

// Utilisation
<ModalNouveauVin
  isOpen={isModalOpen}
  onClose={closeModal}
  onSave={handleSaveWine}
/>
```

**Fonctionnalités :**
- Formulaire complet de vin
- Validation des champs
- Types de vins multiples
- Gestion des cépages et formats

### FormulaireModification

Formulaire d'édition de vin existant.

```tsx
interface FormulaireModificationProps {
  wine: Vin;
  onSave: (wine: Vin) => void;
  onCancel: () => void;
  onDelete: () => void;
}

// Utilisation
<FormulaireModification
  wine={selectedWine}
  onSave={handleSave}
  onCancel={handleCancel}
  onDelete={handleDelete}
/>
```

## 🌐 Composants d'internationalisation

### LanguageSelector

Sélecteur de langue.

```tsx
// Utilisation
<LanguageSelector />
```

**Fonctionnalités :**
- Basculement FR/EN
- Persistance du choix
- Icônes de drapeaux

### I18nProvider

Provider d'internationalisation.

```tsx
// Utilisation
<I18nProvider>
  <App />
</I18nProvider>
```

## 📱 Composants responsive

### Breakpoints utilisés

```css
/* Mobile first approach */
sm: '640px',   /* Tablettes portrait */
md: '768px',   /* Tablettes paysage */
lg: '1024px',  /* Desktop petit */
xl: '1280px',  /* Desktop standard */
2xl: '1536px'  /* Desktop large */
```

### Patterns responsive

```tsx
// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Texte responsive
<h1 className="text-xl md:text-2xl lg:text-3xl">

// Espacement responsive
<div className="p-4 md:p-6 lg:p-8">

// Visibilité responsive
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

## 🎨 Système de couleurs

### Palette principale

```tsx
// Couleurs primaires
const colors = {
  primary: {
    50: '#F4F3FF',
    500: '#7F56D9',
    600: '#7C3AED',
    700: '#5925DC'
  },
  
  // Types de vins
  wine: {
    rouge: { bg: 'bg-[#FEF3F2]', text: 'text-[#B42318]' },
    blanc: { bg: 'bg-[#FFFAEB]', text: 'text-[#B54708]' },
    rose: { bg: 'bg-[#FDF2FA]', text: 'text-[#C11574]' },
    mousseux: { bg: 'bg-[#FFFAEB]', text: 'text-[#B54708]' }
  }
};
```

## 🔧 Hooks personnalisés

### useTranslation

Hook d'internationalisation.

```tsx
const { t, changeLanguage, currentLanguage } = useTranslation();

// Utilisation
const title = t('home.wines.title');
```

### Hooks React Query

```tsx
// Vins
const { data: wines, isLoading, error } = useRestaurantWines(restaurantId);

// Plats
const { data: dishes } = useAllRestaurantDishes(restaurantId);

// Statistiques
const { data: stats } = useWineStats();
```

## ⚡ Performance

### Optimisations

1. **Lazy loading** des composants lourds
2. **Memoization** avec React.memo
3. **Virtualisation** des listes longues
4. **Debouncing** des recherches
5. **Code splitting** par route

### Exemple d'optimisation

```tsx
// Composant mémorisé
const MemoizedWineCard = React.memo(WineCard);

// Lazy loading
const HeavyModal = lazy(() => import('./HeavyModal'));

// Debounced search
const debouncedSearch = useMemo(
  () => debounce((value: string) => setSearch(value), 300),
  []
);
```

## 🧪 Tests

### Structure des tests

```
src/components/
├── __tests__/
│   ├── Button.test.tsx
│   ├── Card.test.tsx
│   └── TableauVin.test.tsx
└── __mocks__/
    └── api.ts
```

### Exemple de test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📚 Bonnes pratiques

### 1. Structure des composants

```tsx
// 1. Imports
import React from 'react';
import { useTranslation } from '@/lib/useTranslation';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// 3. Composant
export default function Component({ title, onAction }: ComponentProps) {
  // 4. Hooks
  const { t } = useTranslation();
  
  // 5. State
  const [isOpen, setIsOpen] = useState(false);
  
  // 6. Handlers
  const handleClick = () => {
    onAction?.();
  };
  
  // 7. Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>{t('common.action')}</button>
    </div>
  );
}
```

### 2. Conventions de nommage

- **Composants** : PascalCase (`TableauVin`)
- **Props** : camelCase (`isOpen`, `onClose`)
- **Handlers** : `handle` + Action (`handleSave`)
- **Hooks** : `use` + Function (`useWineStats`)

### 3. Gestion des erreurs

```tsx
// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
```

---

Cette documentation est maintenue à jour avec l'évolution des composants. Pour toute question ou suggestion d'amélioration, consultez l'équipe de développement.
