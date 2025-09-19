# VirtualSomm Frontend

Application web moderne pour la gestion de cartes de vins et menus de restaurants avec recommandations intelligentes.

## 🚀 Fonctionnalités

- **Gestion des vins** : Ajout, modification et organisation de la carte des vins
- **Gestion des menus** : Interface complète pour gérer les plats et sections du menu
- **Recommandations intelligentes** : Suggestions de vins basées sur l'analyse des plats
- **Interface multilingue** : Support français et anglais
- **Authentification OAuth2** : Connexion sécurisée avec tokens JWT
- **API intégrée** : Communication avec l'API VirtualSomm
- **Design moderne** : Interface utilisateur intuitive avec Tailwind CSS

## 🛠️ Technologies utilisées

- **Framework** : Next.js 14 avec App Router
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **State Management** : React Query (TanStack Query)
- **Authentification** : OAuth2 avec JWT
- **HTTP Client** : Axios
- **Internationalisation** : react-i18next
- **Icons** : Lucide React

## 📦 Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd VirtualSomm/front
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   ```bash
   cp .env.example .env.local
   ```
   
   Configurer les variables d'environnement dans `.env.local` :
   ```env
   NEXT_PUBLIC_API_URL=https://api.virtualsomm.ch
   OAUTH_CLIENT_ID=your_client_id
   OAUTH_CLIENT_SECRET=your_client_secret
   ```

4. **Lancer en développement**
   ```bash
   npm run dev
   ```

5. **Accéder à l'application**
   Ouvrir [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── home/              # Page d'accueil
│   ├── login/             # Page de connexion
│   ├── menu/              # Gestion des menus
│   └── vins/              # Gestion des vins
├── components/            # Composants réutilisables
│   ├── AlertCard.tsx      # Carte d'alertes
│   ├── ApiVinsIntegration.tsx # Intégration API vins
│   ├── Button.tsx         # Bouton personnalisé
│   ├── Card.tsx           # Carte de base
│   ├── Header.tsx         # En-tête
│   ├── SideBar.tsx        # Barre latérale
│   ├── TableauVin.tsx     # Tableau des vins
│   ├── ModalNouveauVin.tsx # Modal d'ajout de vin
│   └── ...
├── lib/                   # Utilitaires et configuration
│   ├── api.ts             # Configuration API et services
│   ├── auth.ts            # Gestion de l'authentification
│   ├── hooks.ts           # Hooks React Query personnalisés
│   ├── i18n.ts            # Configuration internationalisation
│   └── ...
└── public/
    └── locales/           # Fichiers de traduction
        ├── fr/common.json # Traductions françaises
        └── en/common.json # Traductions anglaises
```

## 🔧 Scripts disponibles

- `npm run dev` - Lancement en mode développement
- `npm run build` - Build de production
- `npm run start` - Démarrage du serveur de production
- `npm run lint` - Vérification ESLint
- `npm run type-check` - Vérification TypeScript

## 🌐 API Integration

L'application communique avec l'API VirtualSomm via :

### Endpoints principaux
- **Authentification** : `POST /token`
- **Informations utilisateur** : `GET /users_infos`
- **Vins du restaurant** : `POST /recommendations/restaurant_wines`
- **Plats du restaurant** : `POST /recommendations/dishes`
- **Recommandations** : `POST /recommendations/wines`

### Configuration du proxy
Le fichier `next.config.ts` configure un proxy pour éviter les problèmes CORS :
```typescript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'https://api.virtualsomm.ch/:path*',
    },
  ];
}
```

## 🔐 Authentification

L'application utilise OAuth2 avec le flow "password grant" :

1. **Connexion** avec username/password
2. **Récupération du token** JWT
3. **Stockage sécurisé** dans localStorage
4. **Auto-refresh** du token si nécessaire

## 🌍 Internationalisation

Support de deux langues :
- **Français** (par défaut)
- **Anglais**

Les traductions sont stockées dans `public/locales/` et gérées via react-i18next.

## 🎨 Types de vins supportés

- **Mousseux / Sparkling** (Pétillants)
- **Blanc / White** (Blancs)
- **Rouge / Red** (Rouges)
- **Rosé** (Rosés)
- **Sweet** (Doux/Moelleux/Liquoreux)
- **Old White** (Blancs vieux)
- **Fortifié** (Vins fortifiés)
- **Orange** (Vins orange)

## 🧪 Tests et qualité

- **ESLint** : Configuration stricte pour la qualité du code
- **TypeScript** : Typage fort pour réduire les erreurs
- **Prettier** : Formatage automatique du code

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 🖥️ Desktop (1920px+)
- 💻 Laptop (1024px+)
- 📱 Tablet (768px+)
- 📱 Mobile (320px+)

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Déploiement avec Docker
```bash
docker build -t virtualsomm-frontend .
docker run -p 3000:3000 virtualsomm-frontend
```

### Variables d'environnement de production
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.virtualsomm.ch
OAUTH_CLIENT_ID=production_client_id
OAUTH_CLIENT_SECRET=production_client_secret
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés.

## 📞 Support

Pour toute question ou support technique :
- 📧 Email : support@virtualsomm.ch
- 📱 Téléphone : +41 XX XXX XX XX

---

**VirtualSomm** - Révolutionnez votre expérience culinaire avec l'intelligence artificielle 🍷✨