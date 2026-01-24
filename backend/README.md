# Smart Meal Planner - Backend API

Backend API REST pour Smart Meal Planner, utilisant Neon Postgres, Prisma et authentification JWT.

## 🚀 Quick Start

### Prérequis

- Node.js 18+
- Un compte Neon (https://neon.tech)

### Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Générer le client Prisma
npx prisma generate

# Créer la base de données
npx prisma migrate dev

# Démarrer le serveur de développement
npm run dev
```

Le serveur démarre sur http://localhost:3001

## 📁 Structure du projet

```
backend/
├── prisma/
│   └── schema.prisma          # Schéma de la base de données
├── src/
│   ├── config/
│   │   ├── database.ts        # Configuration Prisma
│   │   └── env.ts             # Variables d'environnement
│   ├── middleware/
│   │   ├── auth.ts            # Middleware JWT
│   │   └── errorHandler.ts   # Gestion d'erreurs
│   ├── routes/
│   │   └── auth.ts            # Routes d'authentification
│   ├── controllers/
│   │   └── authController.ts # Contrôleurs auth
│   ├── services/
│   │   ├── authService.ts    # Logique métier auth
│   │   └── tokenService.ts   # Gestion JWT
│   ├── utils/
│   │   ├── validators.ts     # Schémas Zod
│   │   └── errors.ts         # Classes d'erreurs
│   └── index.ts              # Point d'entrée
├── scripts/
│   └── migrate-from-supabase.ts
└── package.json
```

## 🔐 API Endpoints

### Authentification

#### POST /api/auth/register
Créer un nouveau compte utilisateur.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### POST /api/auth/login
Se connecter avec un compte existant.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### POST /api/auth/refresh
Rafraîchir l'access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

#### POST /api/auth/logout
Se déconnecter (révoque le refresh token).

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

#### POST /api/auth/request-reset
Demander un reset de mot de passe.

**Request:**
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password
Réinitialiser le mot de passe avec un token.

**Request:**
```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

#### GET /api/auth/me
Récupérer les informations de l'utilisateur connecté (protégé).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com"
  }
}
```

## 🔑 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Utilisation

1. **S'inscrire ou se connecter** pour obtenir un `accessToken` et un `refreshToken`
2. **Inclure le token** dans les requêtes protégées :
   ```
   Authorization: Bearer {accessToken}
   ```
3. **Rafraîchir le token** quand il expire (15 minutes par défaut)

### Tokens

- **Access Token**: Expire après 15 minutes, utilisé pour l'authentification
- **Refresh Token**: Expire après 7 jours, utilisé pour obtenir un nouveau access token

## 🗄️ Schéma de base de données

### Users
- `id` (UUID, PK)
- `email` (String, unique)
- `password` (String, hashé avec bcrypt)
- `createdAt`, `updatedAt`

### RefreshTokens
- `id` (UUID, PK)
- `token` (String, unique)
- `userId` (FK → Users)
- `expiresAt`

### UserPreferences
- `id` (UUID, PK)
- `userId` (FK → Users, unique)
- `dietaryRestrictions`, `cuisinePreferences` (String[])
- `budgetPerDay`, `peopleCount`, `location`, `currency`

### SavedPlans
- `id` (UUID, PK)
- `userId` (FK → Users)
- `name`, `preferences` (JSON)
- `weekPlan`, `recipes`, `batchCooking`, `shoppingList` (JSON)
- `budgetEstimate`

### SavedRecipes
- `id` (UUID, PK)
- `userId` (FK → Users)
- `planId` (FK → SavedPlans, nullable)
- `recipe` (JSON)

### SavedLists
- `id` (UUID, PK)
- `userId` (FK → Users)
- `name`, `list` (JSON)

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev              # Démarrer avec hot reload

# Production
npm run build            # Compiler TypeScript
npm start                # Démarrer le serveur compilé

# Prisma
npm run prisma:generate  # Générer le client Prisma
npm run prisma:migrate   # Créer une migration
npm run prisma:studio    # Ouvrir Prisma Studio
npm run prisma:reset     # Reset la base de données

# Migration
npm run migrate:data     # Migrer depuis Supabase
```

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- JWT avec secrets forts
- Rate limiting (100 requêtes / 15 minutes)
- Helmet.js pour les headers de sécurité
- CORS configuré
- Validation des inputs avec Zod
- Gestion sécurisée des erreurs

## 📦 Déploiement

### Railway (recommandé)

1. Créer un nouveau projet sur Railway
2. Connecter votre repository GitHub
3. Configurer les variables d'environnement
4. Déployer

### Variables d'environnement en production

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=strong-secret-key
JWT_REFRESH_SECRET=strong-refresh-secret-key
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

## 📝 TODO

Routes à implémenter :
- [ ] `/api/plans` - CRUD pour les plans
- [ ] `/api/recipes` - CRUD pour les recettes
- [ ] `/api/lists` - CRUD pour les listes
- [ ] `/api/preferences` - CRUD pour les préférences

Améliorations :
- [ ] Tests unitaires et d'intégration
- [ ] Documentation OpenAPI/Swagger
- [ ] Envoi d'emails pour reset password
- [ ] Pagination pour les listes
- [ ] Cache avec Redis

## 📄 Licence

MIT
