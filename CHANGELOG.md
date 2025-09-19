# Changelog VirtualSomm Frontend

Toutes les modifications importantes de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Non publié]

### Ajouté
- Documentation complète du projet
- Guide de contribution
- Guide de déploiement
- Documentation des composants

## [1.2.0] - 2025-01-19

### Ajouté
- Nouveaux types de vins : Sparkling, Sweet, Old White
- Support des équivalences anglais/français pour les types de vins
- Couleurs distinctives pour chaque type de vin
- Gestion des couleurs de bordure dans CepageAssemblage

### Modifié
- Mise à jour des statistiques de vins pour inclure les nouveaux types
- Amélioration de la logique de filtrage des vins
- Mise à jour des types TypeScript pour les nouveaux types de vins

### Corrigé
- Erreur TypeScript dans les propriétés de statistiques de vins
- Syntaxe des commentaires dans les boutons d'import/export
- Affichage "Aucune notification" dans AlertCard

## [1.1.0] - 2025-01-18

### Ajouté
- Intégration complète de l'API VirtualSomm
- Authentification OAuth2 avec tokens JWT
- Gestion automatique des tokens et refresh
- Système de fallback pour les endpoints API
- Support de l'internationalisation (FR/EN)
- Composants d'intégration API pour vins et plats

### Modifié
- Migration vers Next.js 14 avec App Router
- Remplacement des données statiques par l'API
- Amélioration de la gestion des erreurs
- Optimisation des hooks React Query

### Corrigé
- Problèmes de CORS avec configuration du proxy Next.js
- Erreurs de connexion API avec stratégie de retry
- Problèmes de types TypeScript
- Gestion des données manquantes de l'API

### Supprimé
- Toutes les pages de test et debug
- Données de démonstration statiques
- Mode hors ligne

## [1.0.0] - 2025-01-15

### Ajouté
- Interface utilisateur complète pour la gestion des vins
- Interface utilisateur pour la gestion des menus
- Système d'authentification de base
- Composants réutilisables (Button, Card, Modal, etc.)
- Tableaux interactifs pour vins et plats
- Formulaires de création et modification
- Système de tags avec couleurs
- Gestion des cépages et assemblages
- Formats de vins disponibles
- Points de vente configurables

### Fonctionnalités principales
- **Gestion des vins** : Ajout, modification, suppression des vins
- **Gestion des menus** : Organisation des plats par sections
- **Interface responsive** : Compatible mobile, tablette, desktop
- **Design moderne** : Interface intuitive avec Tailwind CSS
- **Composants modulaires** : Architecture réutilisable

## Types de changements

- `Ajouté` pour les nouvelles fonctionnalités
- `Modifié` pour les changements dans les fonctionnalités existantes
- `Déprécié` pour les fonctionnalités bientôt supprimées
- `Supprimé` pour les fonctionnalités supprimées
- `Corrigé` pour les corrections de bugs
- `Sécurité` pour les vulnérabilités

## Notes de migration

### Migration vers v1.2.0

Si vous utilisez des types de vins personnalisés, vérifiez que vos données sont compatibles avec les nouveaux types supportés :
- `Sparkling` (équivalent à `Mousseux`)
- `Sweet` (équivalent à `Moelleux ou liquoreux`)
- `Old White` (nouveau type)
- `Red` (équivalent à `Rouge`)
- `White` (équivalent à `Blanc`)

### Migration vers v1.1.0

**⚠️ Changements majeurs :**

1. **Authentification requise** : L'application nécessite maintenant une authentification OAuth2
2. **Variables d'environnement** : Configurer les nouvelles variables dans `.env.local`
3. **API endpoints** : Toutes les données proviennent maintenant de l'API VirtualSomm
4. **Suppression du mode hors ligne** : Plus de données de démonstration

**Actions requises :**

1. Configurer les variables d'environnement :
   ```env
   NEXT_PUBLIC_API_URL=https://api.virtualsomm.ch
   OAUTH_CLIENT_ID=your_client_id
   OAUTH_CLIENT_SECRET=your_client_secret
   ```

2. S'assurer que l'API VirtualSomm est accessible

3. Configurer les credentials OAuth2

### Migration vers v1.0.0

Première version stable - pas de migration nécessaire.

## Roadmap

### v1.3.0 (Prévu)
- Recommandations intelligentes de vins
- Système de favoris
- Export/Import de données
- Amélioration des performances

### v1.4.0 (Prévu)
- Mode collaboratif multi-utilisateurs
- Historique des modifications
- Système de notifications
- API publique

### v2.0.0 (Futur)
- Refonte complète de l'UI
- Application mobile native
- Intelligence artificielle avancée
- Intégration avec systèmes POS

## Support

Pour obtenir de l'aide avec les migrations ou signaler des problèmes :

- **Issues GitHub** : [Créer une issue](https://github.com/your-repo/virtualsomm/issues)
- **Email** : support@virtualsomm.ch
- **Documentation** : Consulter le [README.md](README.md)

---

**Note** : Ce changelog est généré automatiquement à partir des commits et des pull requests. Pour plus de détails sur un changement spécifique, consultez les commits correspondants dans l'historique Git.
