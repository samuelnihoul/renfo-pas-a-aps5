# Configuration de l'authentification et des paiements

## 🎯 Système implémenté

Ce projet utilise maintenant :
- **Authentification JWT** personnalisée (au lieu d'Auth.js pour éviter les problèmes de compatibilité)
- **Stripe** pour les paiements
- **Base de données** avec Drizzle ORM
- **Protection des routes** avec vérification d'accès

## 🔧 Configuration requise

### 1. Variables d'environnement

Créez un fichier `.env.local` avec :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/renfo_pas_a_pas"

# JWT Secret (générez une clé sécurisée)
JWT_SECRET="votre-secret-jwt-super-securise"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

### 2. Configuration Stripe

1. **Créez un compte Stripe** : https://stripe.com
2. **Récupérez vos clés** dans le dashboard Stripe
3. **Configurez le webhook** :
   - URL : `https://votre-domaine.com/api/webhooks/stripe`
   - Événements : `checkout.session.completed`

### 3. Migration de la base de données

```bash
# Générer la migration pour les nouvelles tables Auth.js
npx drizzle-kit generate:pg --out drizzle/

# Appliquer les migrations
npx drizzle-kit push:pg
```

## 🚀 Fonctionnalités

### Authentification
- ✅ Inscription avec email/mot de passe
- ✅ Connexion avec JWT
- ✅ Protection des routes
- ✅ Déconnexion

### Gestion des programmes
- ✅ **Programme 1** : 2 premières semaines gratuites
- ✅ **Tous les programmes** : Achat individuel obligatoire
- ✅ Vérification d'accès automatique
- ✅ Interface d'achat avec Stripe

### Paiements
- ✅ Intégration Stripe Checkout
- ✅ Webhook pour traiter les paiements
- ✅ Enregistrement automatique des achats
- ✅ Protection contre les achats multiples

## 📁 Structure des fichiers

```
app/
├── api/
│   ├── auth/
│   │   ├── signin/route.ts          # Connexion
│   │   ├── signup/route.ts          # Inscription
│   │   ├── signout/route.ts         # Déconnexion
│   │   └── me/route.ts              # Récupérer l'utilisateur
│   ├── programs/
│   │   ├── access/route.ts          # Vérifier l'accès
│   │   ├── checkout/route.ts        # Créer session Stripe
│   │   └── purchased/route.ts       # Programmes achetés
│   └── webhooks/stripe/route.ts     # Webhook Stripe
├── auth/
│   ├── signin/page.tsx              # Page de connexion
│   └── signup/page.tsx              # Page d'inscription
└── programmes/
    ├── page.tsx                     # Liste des programmes
    └── [id]/page.tsx                # Programme individuel

components/
├── program-card.tsx                 # Carte programme avec achat
├── program-access-guard.tsx         # Protection d'accès
└── purchased-programs.tsx           # Programmes achetés

hooks/
├── use-auth.ts                      # Hook d'authentification
└── use-program-access.ts            # Hook de vérification d'accès

lib/
├── auth-middleware.ts               # Middleware JWT
└── stripe.ts                        # Configuration Stripe
```

## 🔒 Logique d'accès

### Programme 1 (ID: 1)
- **Jours 1-14** : Accès gratuit pour tous
- **Jours 15+** : Achat obligatoire

### Autres programmes
- **Tous les jours** : Achat obligatoire

### Vérification automatique
- Chaque page vérifie l'accès avant affichage
- Redirection vers Stripe si achat nécessaire
- Protection des API endpoints

## 💳 Processus d'achat

1. **Utilisateur clique "Acheter"**
2. **Création session Stripe** via `/api/programs/checkout`
3. **Redirection vers Stripe Checkout**
4. **Paiement réussi** → Webhook Stripe
5. **Enregistrement automatique** de l'achat
6. **Redirection vers le programme** avec accès complet

## 🛠️ Développement

### Tester l'authentification
```bash
# Créer un utilisateur
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Se connecter
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Tester les paiements (mode test)
- Utilisez les cartes de test Stripe
- Exemple : `4242 4242 4242 4242`
- Date : n'importe quelle date future
- CVC : n'importe quels 3 chiffres

## 🔧 Dépannage

### Erreurs courantes
1. **"Non authentifié"** : Vérifiez JWT_SECRET et les cookies
2. **Erreur Stripe** : Vérifiez les clés Stripe
3. **Webhook échoue** : Vérifiez STRIPE_WEBHOOK_SECRET

### Logs utiles
- Vérifiez les logs du serveur pour les erreurs d'authentification
- Dashboard Stripe pour les événements de paiement
- Base de données pour vérifier les achats enregistrés

## 🎉 Prochaines étapes

- [ ] Ajouter la gestion des abonnements
- [ ] Implémenter la récupération de mot de passe
- [ ] Ajouter l'authentification sociale (Google, Facebook)
- [ ] Créer un dashboard admin pour gérer les utilisateurs
- [ ] Ajouter des notifications email 