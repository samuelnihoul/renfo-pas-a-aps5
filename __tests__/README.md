# Test Suite Documentation

Cette suite de tests couvre l'ensemble du système d'authentification et de paiements implémenté.

## Structure des Tests

```
__tests__/
├── setup.ts                           # Configuration globale des tests
├── hooks/
│   ├── use-auth.test.tsx             # Tests du hook d'authentification
│   └── use-program-access.test.tsx   # Tests du hook de vérification d'accès
├── components/
│   ├── program-card.test.tsx         # Tests du composant de carte de programme
│   └── program-access-guard.test.tsx # Tests du composant de protection d'accès
├── api/
│   └── programs/
│       └── access.test.ts            # Tests de l'API de vérification d'accès
├── lib/
│   └── stripe.test.ts                # Tests des utilitaires Stripe
└── integration/
    └── auth-flow.test.tsx            # Tests d'intégration du flux d'authentification
```

## Configuration

### Jest Configuration
- **Environnement** : jsdom pour les tests React
- **Setup** : `__tests__/setup.ts` pour les mocks globaux
- **Coverage** : 80% minimum requis pour branches, fonctions, lignes et statements
- **Patterns ignorés** : `.next/`, `node_modules/`

### Mocks Globaux
- **Next.js** : Router, headers, cookies
- **Stripe** : Instance et méthodes de paiement
- **bcryptjs** : Hachage et comparaison de mots de passe
- **jsonwebtoken** : Génération et vérification de tokens
- **uuid** : Génération d'identifiants uniques
- **fetch** : Requêtes HTTP

## Types de Tests

### 1. Tests de Hooks (`hooks/`)

#### `use-auth.test.tsx`
Teste le hook d'authentification avec :
- État initial et chargement
- Connexion réussie et échouée
- Inscription réussie et échouée
- Déconnexion
- Gestion des erreurs réseau

#### `use-program-access.test.tsx`
Teste le hook de vérification d'accès avec :
- Accès aux programmes achetés
- Accès gratuit aux 2 premières semaines du programme 1
- Refus d'accès aux programmes non achetés
- Re-fetch lors des changements de paramètres
- Gestion des erreurs

### 2. Tests de Composants (`components/`)

#### `program-card.test.tsx`
Teste le composant de carte de programme avec :
- Affichage des informations du programme
- Badges d'état (acheté, essai gratuit, non acheté)
- Boutons d'action (commencer, acheter)
- Fonctionnalité d'achat avec Stripe
- États de chargement et d'erreur
- Messages d'essai gratuit

#### `program-access-guard.test.tsx`
Teste le composant de protection d'accès avec :
- Rendu des enfants quand l'accès est autorisé
- États de chargement
- Redirection vers la connexion
- Messages d'accès refusé
- Gestion des erreurs

### 3. Tests d'API (`api/`)

#### `programs/access.test.ts`
Teste l'API de vérification d'accès avec :
- Accès aux programmes achetés
- Accès gratuit aux 2 premières semaines du programme 1
- Refus d'accès aux programmes non achetés
- Validation des paramètres
- Gestion des erreurs d'authentification et de base de données

### 4. Tests d'Utilitaires (`lib/`)

#### `stripe.test.ts`
Teste les utilitaires Stripe avec :
- Configuration de l'instance Stripe
- Création de sessions de checkout
- Construction d'événements webhook
- Gestion des erreurs

### 5. Tests d'Intégration (`integration/`)

#### `auth-flow.test.tsx`
Teste le flux d'authentification complet avec :
- Inscription et connexion d'utilisateur
- Vérification d'accès aux programmes
- Processus d'achat
- Gestion des erreurs
- Gestion des sessions

## Exécution des Tests

### Commandes Disponibles

```bash
# Exécuter tous les tests
pnpm test

# Exécuter les tests en mode watch
pnpm test:watch

# Exécuter les tests avec couverture
pnpm test:coverage
```

### Filtrage des Tests

```bash
# Tests spécifiques
pnpm test -- --testNamePattern="useAuth"
pnpm test -- --testPathPattern="hooks"

# Tests avec verbose
pnpm test -- --verbose

# Tests avec timeout personnalisé
pnpm test -- --testTimeout=10000
```

## Couverture de Code

La suite de tests vise une couverture de 80% minimum sur :
- **Branches** : Tous les chemins conditionnels
- **Fonctions** : Toutes les fonctions exportées
- **Lignes** : Toutes les lignes de code
- **Statements** : Tous les statements exécutables

### Fichiers Couverts
- `app/api/auth/*` : Routes d'authentification
- `app/api/programs/*` : Routes de programmes
- `components/*` : Composants React
- `hooks/*` : Hooks personnalisés
- `lib/*` : Utilitaires

## Bonnes Pratiques

### 1. Isolation des Tests
- Chaque test est indépendant
- Nettoyage des mocks entre les tests
- Pas de dépendances entre les tests

### 2. Mocks Appropriés
- Mock des dépendances externes (Stripe, base de données)
- Mock des hooks React pour les tests de composants
- Mock de fetch pour les tests d'API

### 3. Assertions Claires
- Tests descriptifs avec `describe` et `it`
- Assertions spécifiques et vérifiables
- Messages d'erreur informatifs

### 4. Gestion des Erreurs
- Tests des cas d'erreur
- Tests des erreurs réseau
- Tests des erreurs de validation

## Maintenance

### Ajout de Nouveaux Tests
1. Créer le fichier de test dans le bon répertoire
2. Suivre la convention de nommage `*.test.ts` ou `*.test.tsx`
3. Importer les mocks nécessaires
4. Ajouter les tests pour tous les cas d'usage
5. Vérifier la couverture

### Mise à Jour des Tests
1. Mettre à jour les mocks si les dépendances changent
2. Adapter les tests aux nouvelles fonctionnalités
3. Vérifier que tous les tests passent
4. Maintenir la couverture de code

### Debugging
```bash
# Mode debug avec console.log
pnpm test -- --verbose --no-coverage

# Tests spécifiques en mode watch
pnpm test -- --watch --testNamePattern="specific test"
```

## Troubleshooting

### Erreurs Communes

1. **Erreurs de types TypeScript**
   - Vérifier les imports et exports
   - Mettre à jour les types de mocks

2. **Tests qui échouent de manière intermittente**
   - Vérifier l'isolation des tests
   - Nettoyer les mocks entre les tests

3. **Problèmes de couverture**
   - Ajouter des tests pour les branches manquantes
   - Vérifier les conditions edge cases

4. **Erreurs de mocks**
   - Vérifier la configuration des mocks
   - Mettre à jour les mocks pour les nouvelles dépendances
``` 