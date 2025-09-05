# VirtualSomm Frontend

## 🍷 Description du Projet

VirtualSomm est une application web moderne développée avec Next.js 15 et React 19, conçue pour la gestion intelligente des cartes de vins et des menus de restaurants. L'application utilise l'intelligence artificielle pour fournir des recommandations personnalisées d'accords mets-vins.

## 🚀 Technologies Utilisées

- **Framework** : Next.js 15.5.0 avec App Router
- **Frontend** : React 19.1.0 avec TypeScript 5
- **Styling** : Tailwind CSS 4
- **État** : React Query (@tanstack/react-query) pour la gestion des données
- **HTTP Client** : Axios pour les appels API
- **Icônes** : Lucide React
- **Authentification** : JWT avec gestion automatique des tokens

## 📁 Structure du Projet

```
src/
├── app/                    # Pages de l'application (App Router)
│   ├── home/              # Page d'accueil avec dashboard
│   ├── login/             # Page de connexion
│   ├── menu/              # Gestion des menus
│   ├── vins/              # Gestion de la carte des vins
│   └── test-api/          # Page de test des APIs
├── components/            # Composants réutilisables
│   ├── ModalNouveauPlat.tsx    # Modal d'ajout de plat avec transitions
│   ├── ModalNouveauVin.tsx     # Modal d'ajout de vin avec transitions
│   ├── TableauMenu.tsx         # Tableau de gestion des plats
│   ├── TableauVin.tsx          # Tableau de gestion des vins
│   ├── SideBar.tsx             # Navigation latérale
│   ├── Header.tsx              # En-tête de page
│   ├── Button.tsx              # Composant bouton réutilisable
│   ├── InputField.tsx          # Champ de saisie
│   ├── Checkbox.tsx            # Case à cocher
│   ├── RadioButton.tsx         # Bouton radio
│   ├── Select.tsx              # Liste déroulante
│   ├── List.tsx                # Composant de liste dynamique
│   ├── Card.tsx                # Composant carte
│   ├── AlertCard.tsx           # Cartes d'alertes
│   ├── MenuCard.tsx            # Carte de menu
│   ├── VinsCard.tsx            # Carte des vins
│   ├── RestaurantCard.tsx       # Carte de restaurant
│   ├── MembersCard.tsx         # Carte des membres
│   ├── LoginForm.tsx           # Formulaire de connexion
│   ├── Notification.tsx        # Système de notifications
│   └── ...                     # Autres composants utilitaires
└── lib/                   # Utilitaires et configuration
    ├── api.ts             # Configuration API et services
    ├── auth.ts            # Gestion de l'authentification
    ├── hooks.ts            # Hooks personnalisés React Query
    ├── useNotification.ts  # Hook pour les notifications
    └── tagColors.ts       # Configuration des couleurs des tags
```

## 🎨 Fonctionnalités Principales

### 🏠 Page d'Accueil (Dashboard)
- **Vue d'ensemble** : Statistiques et alertes importantes
- **Cartes d'alertes** : Notifications pour les actions requises
- **Statistiques** : Nombre de vins, membres de l'équipe
- **Navigation rapide** : Accès direct aux principales fonctionnalités

### 🍽️ Gestion des Menus
- **Sections organisées** : Entrées, Plats, Desserts
- **Points de vente multiples** : Gestion de plusieurs restaurants
- **Ajout de plats** : Modal avec formulaire complet
- **Tags d'arômes** : Système de classification des saveurs
- **Validation** : Contrôles de saisie et gestion d'erreurs

### 🍷 Carte des Vins
- **Types de vins** : Blanc, Rouge, Rosé, Mousseux, Orange, Fortifié, Moelleux
- **Informations détaillées** : Domaine, millésime, région, pays
- **Cépages** : Gestion des assemblages avec pourcentages
- **Formats disponibles** : Magnum, Bouteille, Demi-bouteille, Verre
- **Points de vente** : Disponibilité par restaurant

### 🔐 Authentification
- **Connexion sécurisée** : JWT avec gestion automatique des tokens
- **Protection des routes** : Redirection automatique si non connecté
- **Gestion des sessions** : Persistance des tokens en localStorage

### 🎯 Système de Recommandations IA
- **API VirtualSomm** : Intégration avec le backend d'IA
- **Questions personnalisées** : Questionnaire adaptatif
- **Recommandations intelligentes** : Accords mets-vins optimisés
- **Support multi-utilisateurs** : Gestion des préférences individuelles

## 🎭 Animations et Transitions

### Modales avec Transitions Smooth
Les modales `ModalNouveauPlat` et `ModalNouveauVin` incluent des animations fluides :

- **Apparition** : Fade-in avec zoom depuis 95% et mouvement depuis le bas
- **Disparition** : Fade-out avec les mêmes effets en sens inverse
- **Durée** : 300ms pour une expérience utilisateur optimale
- **Gestion d'état** : États `isAnimating` et `shouldRender` pour un contrôle précis

## 🔧 Configuration et Installation

### Prérequis
- Node.js 18+ 
- npm, yarn, pnpm ou bun

### Installation
```bash
# Cloner le repository
git clone [url-du-repo]

# Installer les dépendances
npm install
# ou
yarn install
# ou
pnpm install
```

### Développement
```bash
# Démarrer le serveur de développement
npm run dev
# ou
yarn dev
# ou
pnpm dev

# Ouvrir http://localhost:3000
```

### Build de Production
```bash
# Construire l'application
npm run build
# ou
yarn build

# Démarrer en production
npm start
# ou
yarn start
```

## 🌐 Configuration API

L'application se connecte à l'API VirtualSomm :
- **Base URL** : `http://vps.virtualsomm.ch:8081`
- **Authentification** : Bearer Token automatique
- **Gestion d'erreurs** : Intercepteurs Axios pour la gestion des erreurs 401

### Endpoints Principaux
- `/token` - Authentification
- `/register` - Inscription
- `/questions` - Questions IA
- `/answers` - Réponses utilisateur
- `/recommendations/wines` - Recommandations de vins
- `/foods` - Base de données des aliments

## 🎨 Design System

### Couleurs Principales
- **Primaire** : `#363F72` (Sidebar)
- **Secondaire** : `#3E4784` (Boutons)
- **Accent** : `#7F56D9` (Éléments interactifs)
- **Fond** : `#F8F9FC` (Arrière-plan principal)

### Composants Réutilisables
- **Button** : Boutons avec états hover et focus
- **InputField** : Champs de saisie avec validation
- **Card** : Cartes avec ombres et bordures arrondies
- **Modal** : Modales avec overlay et animations

## 📱 Responsive Design

L'application est entièrement responsive avec :
- **Desktop** : Layout en grille avec sidebar fixe
- **Tablet** : Adaptation des colonnes et espacement
- **Mobile** : Navigation optimisée et composants adaptés

## 🔍 Fonctionnalités Avancées

### React Query Integration
- **Cache intelligent** : Mise en cache des données API
- **Refetch automatique** : Actualisation des données
- **Gestion des états** : Loading, error, success states
- **Optimistic updates** : Mises à jour optimistes

### Système de Notifications
- **Notifications toast** : Messages de succès/erreur
- **Auto-dismiss** : Disparition automatique
- **Queue** : Gestion de plusieurs notifications

### Validation de Formulaires
- **Validation en temps réel** : Contrôles pendant la saisie
- **Messages d'erreur** : Feedback utilisateur clair
- **Focus automatique** : Navigation vers les champs en erreur

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Autres Plateformes
L'application peut être déployée sur :
- **Netlify** : Build statique
- **Railway** : Déploiement Node.js
- **Docker** : Containerisation possible

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

**VirtualSomm** - Révolutionnez l'art de l'accord mets-vins avec l'intelligence artificielle 🍷✨