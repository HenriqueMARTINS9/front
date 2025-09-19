# Guide de Développement VirtualSomm

## 🚀 Configuration de l'environnement de développement

### Prérequis

- **Node.js** : Version 18.x ou supérieure
- **npm** : Version 8.x ou supérieure
- **Git** : Version 2.x ou supérieure
- **VS Code** : Recommandé avec les extensions suggérées

### Installation initiale

```bash
# Cloner le repository
git clone <repository-url>
cd VirtualSomm/front

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement
nano .env.local
```

### Variables d'environnement

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.virtualsomm.ch

# OAuth Configuration
OAUTH_CLIENT_ID=250684173847-7f1vs6bi5852mel1k2ddogijlrffemf8.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=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

# Development
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

## 🛠️ Scripts de développement

```bash
# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Démarrer le serveur de production
npm run start

# Linting et formatage
npm run lint
npm run lint:fix
npm run format

# Tests
npm run test
npm run test:watch
npm run test:coverage

# Vérification des types
npm run type-check
```

## 📁 Architecture du projet

### Structure des dossiers

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── globals.css         # Styles globaux
│   ├── layout.tsx          # Layout racine
│   ├── page.tsx           # Page d'accueil
│   ├── home/              # Page dashboard
│   ├── login/             # Page de connexion
│   ├── menu/              # Gestion des menus
│   └── vins/              # Gestion des vins
├── components/            # Composants réutilisables
│   ├── ui/                # Composants UI de base
│   ├── forms/             # Composants de formulaires
│   ├── modals/            # Composants modaux
│   └── layout/            # Composants de layout
├── lib/                   # Utilitaires et configuration
│   ├── api.ts             # Client API et services
│   ├── auth.ts            # Gestion de l'authentification
│   ├── hooks.ts           # Hooks React Query
│   ├── i18n.ts            # Configuration internationalisation
│   ├── utils.ts           # Fonctions utilitaires
│   └── types.ts           # Types TypeScript globaux
├── hooks/                 # Hooks personnalisés
├── utils/                 # Fonctions utilitaires
└── styles/               # Fichiers de styles
```

### Conventions de nommage

- **Fichiers** : kebab-case (`wine-card.tsx`)
- **Composants** : PascalCase (`WineCard`)
- **Variables** : camelCase (`wineData`)
- **Constantes** : UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types** : PascalCase (`WineData`)

## 🎨 Standards de développement

### ESLint Configuration

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "react/no-unescaped-entities": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🧩 Développement de composants

### Structure d'un composant

```tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';

// Types
interface ComponentProps {
  title: string;
  data?: any[];
  onAction?: (item: any) => void;
  className?: string;
}

// Composant principal
export default function Component({ 
  title, 
  data = [], 
  onAction,
  className = '' 
}: ComponentProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    // Logic here
  }, []);

  // Handlers
  const handleAction = (item: any) => {
    setIsLoading(true);
    try {
      onAction?.(item);
    } finally {
      setIsLoading(false);
    }
  };

  // Early returns
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Main render
  return (
    <div className={`component-base ${className}`}>
      <h2>{title}</h2>
      {data.map((item, index) => (
        <div key={item.id || index}>
          {/* Item content */}
        </div>
      ))}
    </div>
  );
}
```

### Hooks personnalisés

```tsx
// useWineData.ts
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useWineData(restaurantId: number) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.getRestaurantWines(restaurantId);
        setData(response);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  return { data, isLoading, error };
}
```

## 🔄 Gestion d'état avec React Query

### Configuration du client

```tsx
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Hooks de données

```tsx
// lib/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

// Query hook
export const useWines = (restaurantId: number) => {
  return useQuery({
    queryKey: ['wines', restaurantId],
    queryFn: () => api.getRestaurantWines(restaurantId),
    enabled: !!restaurantId,
  });
};

// Mutation hook
export const useCreateWine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (wineData: WineData) => api.createWine(wineData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wines'] });
    },
  });
};
```

## 🎨 Styling avec Tailwind CSS

### Configuration Tailwind

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F4F3FF',
          500: '#7F56D9',
          600: '#7C3AED',
          700: '#5925DC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### Classes utilitaires personnalisées

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors;
  }
  
  .card-base {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
  
  .input-base {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500;
  }
}

@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

## 🌐 Internationalisation

### Configuration i18n

```tsx
// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
```

### Utilisation des traductions

```tsx
// Dans un composant
const { t, i18n } = useTranslation();

// Traduction simple
const title = t('home.wines.title');

// Traduction avec variables
const message = t('wines.count', { count: wineCount });

// Changement de langue
const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
};
```

### Structure des fichiers de traduction

```json
// public/locales/fr/common.json
{
  "navigation": {
    "home": "Accueil",
    "wines": "Carte des vins",
    "menu": "Menu(s)"
  },
  "home": {
    "wines": {
      "title": "Vins",
      "total": "Total",
      "sparkling": "Mousseux",
      "white": "Blanc",
      "red": "Rouge"
    }
  },
  "common": {
    "loading": "Chargement...",
    "error": "Erreur",
    "save": "Sauvegarder",
    "cancel": "Annuler"
  }
}
```

## 🔐 Authentification et sécurité

### Service d'authentification

```tsx
// lib/auth.ts
class AuthService {
  private getLocalStorage() {
    return typeof window !== 'undefined' ? localStorage : null;
  }

  async login(username: string, password: string) {
    const response = await authApi.post('/token', {
      grant_type: 'password',
      username,
      password,
      client_id: OAUTH_CONFIG.client_id,
      client_secret: OAUTH_CONFIG.client_secret,
    });

    const { access_token } = response.data;
    this.getLocalStorage()?.setItem('access_token', access_token);
    return access_token;
  }

  logout() {
    this.getLocalStorage()?.removeItem('access_token');
  }

  getToken() {
    return this.getLocalStorage()?.getItem('access_token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
```

### Protection des routes

```tsx
// components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!authService.isAuthenticated()) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
```

## 🧪 Tests

### Configuration Jest

```js
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

### Setup des tests

```js
// jest.setup.js
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));
```

### Exemple de test

```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## 🐛 Debugging

### Outils de développement

1. **React Developer Tools** : Extension navigateur
2. **TanStack Query DevTools** : Pour React Query
3. **Redux DevTools** : Si utilisation de Redux
4. **VS Code Debugger** : Configuration pour Next.js

### Configuration VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Logging

```tsx
// lib/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`ℹ️ ${message}`, ...args);
    }
  },
  
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(`❌ ${message}`, error);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  },
};
```

## 📈 Performance

### Optimisations React

```tsx
// Memoization des composants
const MemoizedComponent = React.memo(Component);

// Memoization des valeurs calculées
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Callbacks mémorisés
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### Code splitting

```tsx
// Lazy loading des composants
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Utilisation avec Suspense
<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>
```

### Bundle analysis

```bash
# Analyser la taille du bundle
npm run build
npx @next/bundle-analyzer
```

## 🚀 Bonnes pratiques

### 1. Structure des commits

```bash
# Format des messages de commit
type(scope): description

# Exemples
feat(wines): add wine type filter
fix(auth): resolve token refresh issue
docs(api): update authentication guide
style(ui): improve button hover states
refactor(hooks): simplify wine data fetching
test(components): add Button component tests
```

### 2. Gestion des branches

```bash
# Branches principales
main          # Production
develop       # Développement
feature/*     # Nouvelles fonctionnalités
hotfix/*      # Corrections urgentes
release/*     # Préparation des releases
```

### 3. Code review

- **Lisibilité** : Code clair et bien commenté
- **Performance** : Éviter les re-renders inutiles
- **Accessibilité** : Respecter les standards a11y
- **Tests** : Couverture suffisante des cas d'usage
- **Types** : TypeScript strict activé

### 4. Documentation

- **Composants** : Props et usage documentés
- **Hooks** : Paramètres et valeurs de retour
- **API** : Endpoints et formats de données
- **Deployment** : Instructions de déploiement

---

Cette documentation évolue avec le projet. N'hésitez pas à contribuer aux améliorations !
