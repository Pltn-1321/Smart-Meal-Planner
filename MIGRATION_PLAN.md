# Plan de Migration : Supabase → Neon Postgres + Prisma

## Vue d'ensemble

Ce document décrit la migration complète de l'application Smart Meal Planner de Supabase vers Neon Postgres avec Prisma ORM et une authentification native basée sur JWT.

## 📋 Table des matières

1. [Architecture actuelle](#architecture-actuelle)
2. [Architecture cible](#architecture-cible)
3. [Étapes de migration](#étapes-de-migration)
4. [Risques et mitigation](#risques-et-mitigation)
5. [Timeline estimée](#timeline-estimée)

---

## Architecture actuelle

### Stack technologique
- **Frontend**: React 19 + TypeScript + Vite
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **ORM**: Client Supabase direct
- **Sécurité**: Row Level Security (RLS) de Supabase

### Composants à migrer

#### 1. Authentification
- **Fichiers impactés**:
  - `contexts/AuthContext.tsx` - Gestion de l'état d'authentification
  - `lib/supabase.ts` - Client Supabase
  - `components/AuthModal.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`

#### 2. Base de données (4 tables)
- `saved_plans` - Plans de repas complets
- `saved_recipes` - Recettes individuelles
- `saved_lists` - Listes de courses
- `user_preferences` - Préférences utilisateur

#### 3. Services de stockage
- `services/planStorageService.ts`
- `services/recipeStorageService.ts`
- `services/listStorageService.ts`

---

## Architecture cible

### Stack technologique
- **Frontend**: React 19 + TypeScript + Vite (inchangé)
- **Backend**: API Express.js avec TypeScript
- **Database**: Neon Postgres (serverless)
- **ORM**: Prisma
- **Auth**: JWT natif avec bcrypt
- **Sécurité**: Middleware d'authentification + validation Zod

### Nouveaux composants

```
smart-meal-planner/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Point d'entrée Express
│   │   ├── config/
│   │   │   ├── database.ts       # Configuration Prisma
│   │   │   └── env.ts            # Variables d'environnement
│   │   ├── middleware/
│   │   │   ├── auth.ts           # Middleware JWT
│   │   │   └── errorHandler.ts  # Gestion d'erreurs
│   │   ├── routes/
│   │   │   ├── auth.ts           # Routes d'authentification
│   │   │   ├── plans.ts          # CRUD plans
│   │   │   ├── recipes.ts        # CRUD recettes
│   │   │   ├── lists.ts          # CRUD listes
│   │   │   └── preferences.ts    # CRUD préférences
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── plansController.ts
│   │   │   ├── recipesController.ts
│   │   │   ├── listsController.ts
│   │   │   └── preferencesController.ts
│   │   ├── services/
│   │   │   ├── authService.ts    # Logique métier auth
│   │   │   └── tokenService.ts   # Gestion JWT
│   │   └── utils/
│   │       ├── validators.ts     # Schémas Zod
│   │       └── errors.ts         # Classes d'erreurs
│   ├── prisma/
│   │   ├── schema.prisma         # Schéma Prisma
│   │   └── migrations/           # Migrations
│   ├── package.json
│   └── tsconfig.json
│
├── src/ (frontend - modifié)
│   ├── lib/
│   │   ├── api.ts                # Client API axios
│   │   └── auth.ts               # Helpers auth (remplace supabase.ts)
│   ├── contexts/
│   │   └── AuthContext.tsx       # Modifié pour API
│   └── services/                 # Modifiés pour API
│       ├── planService.ts
│       ├── recipeService.ts
│       └── listService.ts
```

---

## Étapes de migration

### Phase 1: Configuration de l'infrastructure (1-2h)

#### 1.1 Créer un projet Neon Postgres
```bash
# Sur neon.tech
1. Créer un nouveau projet
2. Récupérer la connection string
3. Activer le pooling (recommandé pour serverless)
```

#### 1.2 Initialiser le backend
```bash
# Créer le dossier backend
mkdir backend && cd backend
npm init -y

# Installer les dépendances
npm install express cors dotenv
npm install prisma @prisma/client
npm install bcryptjs jsonwebtoken
npm install zod
npm install express-async-handler

# Dépendances de développement
npm install -D typescript @types/node @types/express
npm install -D @types/bcryptjs @types/jsonwebtoken @types/cors
npm install -D tsx nodemon
```

#### 1.3 Initialiser Prisma
```bash
npx prisma init
```

---

### Phase 2: Configuration Prisma (1h)

#### 2.1 Configurer le schéma Prisma
Voir `prisma/schema.prisma` (créé ci-dessous)

#### 2.2 Créer la migration initiale
```bash
npx prisma migrate dev --name init
```

#### 2.3 Générer le client Prisma
```bash
npx prisma generate
```

---

### Phase 3: Implémentation du backend (4-6h)

#### 3.1 Système d'authentification
- Implémentation JWT avec refresh tokens
- Hashage bcrypt (10 rounds)
- Endpoints: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/reset-password`

#### 3.2 API REST
- CRUD complet pour chaque ressource
- Middleware d'authentification
- Validation avec Zod
- Gestion d'erreurs centralisée

#### 3.3 Sécurité
- Rate limiting (express-rate-limit)
- CORS configuré
- Helmet.js pour headers de sécurité
- Validation des inputs

---

### Phase 4: Migration des données (1-2h)

#### 4.1 Script de migration
```typescript
// scripts/migrate-data.ts
// Exporter de Supabase → Importer dans Neon via Prisma
```

#### 4.2 Mappage des utilisateurs
- Exporter les utilisateurs de `auth.users` (Supabase)
- Hasher les mots de passe (si disponibles) ou forcer reset
- Créer dans la table `users` (Neon)

#### 4.3 Migration des données métier
- Exporter toutes les tables
- Mapper les `user_id` vers les nouveaux IDs
- Importer via Prisma

---

### Phase 5: Adaptation du frontend (3-4h)

#### 5.1 Remplacer le client Supabase
```typescript
// Avant: lib/supabase.ts avec @supabase/supabase-js
// Après: lib/api.ts avec axios
```

#### 5.2 Modifier AuthContext
- Remplacer les appels Supabase par appels API
- Gérer les tokens JWT (localStorage)
- Implémenter refresh token automatique

#### 5.3 Adapter les services
- `planStorageService.ts` → appels API REST
- `recipeStorageService.ts` → appels API REST
- `listStorageService.ts` → appels API REST

#### 5.4 Mettre à jour les variables d'environnement
```env
# Avant
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Après
VITE_API_URL=http://localhost:3001/api
```

---

### Phase 6: Tests et validation (2-3h)

#### 6.1 Tests manuels
- [ ] Inscription utilisateur
- [ ] Connexion
- [ ] Déconnexion
- [ ] Reset password
- [ ] CRUD plans
- [ ] CRUD recettes
- [ ] CRUD listes
- [ ] Préférences utilisateur

#### 6.2 Tests de sécurité
- [ ] Accès non autorisé rejeté
- [ ] Tokens invalides rejetés
- [ ] Expiration des tokens
- [ ] CORS fonctionnel

---

### Phase 7: Déploiement (1-2h)

#### 7.1 Backend
**Options recommandées**:
- **Railway.app** (facile, gratuit jusqu'à 5$)
- **Render.com** (gratuit avec limitations)
- **Vercel** (avec API routes - attention aux limitations)

#### 7.2 Base de données
- Neon Postgres (déjà configuré, 0.5GB gratuit)

#### 7.3 Frontend
- Vercel (configuration existante)
- Mettre à jour `VITE_API_URL` avec l'URL de production

---

## Risques et mitigation

### Risque 1: Perte de données pendant la migration
**Mitigation**:
- Backup complet de Supabase avant migration
- Migration en plusieurs étapes avec validation
- Garder Supabase actif pendant la période de test

### Risque 2: Problèmes d'authentification
**Mitigation**:
- Implémenter un système de reset password robuste
- Permettre aux utilisateurs de récupérer leur compte
- Logs détaillés des tentatives d'authentification

### Risque 3: Incompatibilités de schéma
**Mitigation**:
- Mapper exactement le schéma Supabase
- Tester avec des données réelles
- Script de validation des données migrées

### Risque 4: Performance
**Mitigation**:
- Utiliser le connection pooling de Neon
- Indexer les colonnes fréquemment interrogées
- Implémenter du caching côté API si nécessaire

---

## Timeline estimée

| Phase | Durée | Description |
|-------|-------|-------------|
| Phase 1 | 1-2h | Infrastructure |
| Phase 2 | 1h | Prisma setup |
| Phase 3 | 4-6h | Backend API |
| Phase 4 | 1-2h | Migration données |
| Phase 5 | 3-4h | Frontend |
| Phase 6 | 2-3h | Tests |
| Phase 7 | 1-2h | Déploiement |
| **TOTAL** | **13-20h** | **~2-3 jours** |

---

## Checklist finale

### Avant de commencer
- [ ] Backup complet de Supabase
- [ ] Créer un projet Neon
- [ ] Préparer l'environnement de développement

### Pendant la migration
- [ ] Toutes les phases complétées
- [ ] Tests passés
- [ ] Documentation à jour

### Après la migration
- [ ] Monitoring actif (24-48h)
- [ ] Support utilisateurs
- [ ] Cleanup ancien code Supabase (après validation)

---

## Support

Pour toute question pendant la migration:
- Documentation Prisma: https://www.prisma.io/docs
- Documentation Neon: https://neon.tech/docs
- Guide JWT: https://jwt.io/introduction
