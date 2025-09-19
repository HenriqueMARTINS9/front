# Guide de Contribution VirtualSomm

Merci de votre intérêt pour contribuer au projet VirtualSomm ! Ce guide vous aidera à comprendre notre processus de développement et nos standards.

## 🤝 Comment contribuer

### 1. Fork et clone

```bash
# Fork le repository sur GitHub
# Puis cloner votre fork
git clone https://github.com/your-username/virtualsomm.git
cd virtualsomm/front

# Ajouter le repository original comme remote
git remote add upstream https://github.com/original-repo/virtualsomm.git
```

### 2. Configuration de l'environnement

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement
nano .env.local
```

### 3. Créer une branche

```bash
# Créer une nouvelle branche pour votre fonctionnalité
git checkout -b feature/ma-nouvelle-fonctionnalite

# Ou pour une correction de bug
git checkout -b fix/correction-bug-important
```

## 📝 Standards de code

### Convention de nommage

- **Branches** : `feature/description`, `fix/description`, `docs/description`
- **Commits** : Format conventionnel (voir section Commits)
- **Fichiers** : kebab-case pour les fichiers, PascalCase pour les composants
- **Variables** : camelCase
- **Constantes** : UPPER_SNAKE_CASE

### Messages de commit

Nous utilisons la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
type(scope): description

# Types autorisés :
feat     # Nouvelle fonctionnalité
fix      # Correction de bug
docs     # Documentation
style    # Formatage, point-virgules manquants, etc.
refactor # Refactoring de code
test     # Ajout ou modification de tests
chore    # Maintenance, dépendances, etc.

# Exemples :
feat(wines): add wine filtering by type
fix(auth): resolve token expiration issue
docs(api): update authentication endpoints
style(ui): improve button spacing
refactor(hooks): simplify data fetching logic
test(components): add VinsCard component tests
chore(deps): update Next.js to latest version
```

### Standards de codage

1. **TypeScript** : Utiliser TypeScript strict
2. **ESLint** : Respecter la configuration ESLint
3. **Prettier** : Formater le code automatiquement
4. **Tests** : Ajouter des tests pour les nouvelles fonctionnalités
5. **Documentation** : Documenter les composants et fonctions complexes

## 🧪 Tests

### Lancer les tests

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage

# Linting
npm run lint

# Vérification des types
npm run type-check
```

### Écrire des tests

```tsx
// Exemple de test pour un composant
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VinsCard from '../VinsCard';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

describe('VinsCard', () => {
  it('should render wine statistics', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <VinsCard />
      </QueryClientProvider>
    );

    expect(screen.getByText('Vins')).toBeInTheDocument();
  });
});
```

## 🔄 Processus de développement

### 1. Développement

```bash
# S'assurer d'être à jour avec la branche principale
git checkout main
git pull upstream main

# Créer et basculer sur votre branche
git checkout -b feature/ma-fonctionnalite

# Développer votre fonctionnalité
# Faire des commits réguliers avec des messages clairs

# Tester votre code
npm run test
npm run lint
npm run type-check
```

### 2. Avant de soumettre

```bash
# Vérifier que tout fonctionne
npm run build

# Mettre à jour avec les derniers changements
git checkout main
git pull upstream main
git checkout feature/ma-fonctionnalite
git rebase main

# Pousser votre branche
git push origin feature/ma-fonctionnalite
```

### 3. Pull Request

1. **Ouvrir une PR** sur GitHub depuis votre fork
2. **Titre descriptif** : Résumer clairement les changements
3. **Description détaillée** : Expliquer le problème résolu et la solution
4. **Captures d'écran** : Pour les changements UI
5. **Tests** : Confirmer que les tests passent
6. **Review** : Répondre aux commentaires constructivement

## 📋 Template de Pull Request

```markdown
## Description
Brief description of the changes

## Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## 🐛 Signaler des bugs

### Avant de signaler

1. **Vérifier** que le bug n'a pas déjà été signalé
2. **Reproduire** le bug de manière consistante
3. **Tester** sur la dernière version

### Template de bug report

```markdown
## Description du bug
Une description claire et concise du bug.

## Étapes pour reproduire
1. Aller à '...'
2. Cliquer sur '....'
3. Faire défiler jusqu'à '....'
4. Voir l'erreur

## Comportement attendu
Description claire de ce qui devrait se passer.

## Captures d'écran
Si applicable, ajouter des captures d'écran.

## Environnement
- OS: [e.g. macOS, Windows, Linux]
- Navigateur: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]
- Node.js: [e.g. 18.17.0]

## Informations supplémentaires
Tout autre contexte utile.
```

## ✨ Proposer des fonctionnalités

### Template de feature request

```markdown
## Résumé de la fonctionnalité
Description claire et concise de la fonctionnalité souhaitée.

## Problème résolu
Quel problème cette fonctionnalité résout-elle ?

## Solution proposée
Description détaillée de la solution envisagée.

## Alternatives considérées
Autres solutions envisagées et pourquoi elles ont été écartées.

## Informations supplémentaires
Contexte, exemples, références, etc.
```

## 📚 Documentation

### Types de documentation à maintenir

1. **README** : Vue d'ensemble du projet
2. **API** : Documentation des endpoints
3. **Composants** : Documentation des composants React
4. **Développement** : Guide pour les développeurs
5. **Déploiement** : Instructions de déploiement

### Standards de documentation

- **Clarté** : Explications simples et directes
- **Exemples** : Code d'exemple fonctionnel
- **Mise à jour** : Garder la documentation synchronisée
- **Français** : Documentation en français (projet francophone)

## 🏷️ Versioning

Nous suivons [Semantic Versioning](https://semver.org/) :

- **MAJOR** : Changements incompatibles
- **MINOR** : Nouvelles fonctionnalités compatibles
- **PATCH** : Corrections de bugs

## 📞 Communication

### Canaux de communication

- **Issues GitHub** : Bugs et demandes de fonctionnalités
- **Pull Requests** : Discussions sur le code
- **Email** : support@virtualsomm.ch pour questions générales

### Code de conduite

- **Respectueux** : Traiter tous les contributeurs avec respect
- **Constructif** : Donner des commentaires constructifs
- **Inclusif** : Accueillir tous les niveaux d'expérience
- **Patient** : Prendre le temps d'expliquer et d'apprendre

## 🎯 Priorités de développement

### High Priority
- Corrections de bugs critiques
- Problèmes de sécurité
- Performance et optimisations

### Medium Priority
- Nouvelles fonctionnalités demandées
- Améliorations UX/UI
- Refactoring de code

### Low Priority
- Documentation améliorée
- Tests supplémentaires
- Optimisations mineures

## 🏆 Reconnaissance

Tous les contributeurs sont reconnus dans notre fichier CONTRIBUTORS.md et dans les notes de version.

## ❓ Questions

Si vous avez des questions sur le processus de contribution :

1. Consultez cette documentation
2. Cherchez dans les issues existantes
3. Ouvrez une nouvelle issue avec le label "question"
4. Contactez l'équipe à support@virtualsomm.ch

---

Merci de contribuer à VirtualSomm ! Votre aide est précieuse pour améliorer l'expérience culinaire avec l'intelligence artificielle. 🍷✨
