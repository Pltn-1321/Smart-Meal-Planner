# Migration Supabase → Neon Postgres - Vue d'ensemble

## 📦 Contenu de cette migration

Cette branche contient tout le nécessaire pour migrer Smart Meal Planner de Supabase vers Neon Postgres avec Prisma et une authentification JWT native.

## 📚 Documentation disponible

### 1. QUICK_START.md ⚡
**Pour commencer rapidement (30 minutes)**
- Installation en 5 étapes
- Configuration minimale
- Test local immédiat

👉 **Commencez ici si vous voulez tester rapidement**

### 2. MIGRATION_GUIDE.md 📖
**Guide complet pas-à-pas**
- Configuration détaillée de Neon
- Migration des données depuis Supabase
- Adaptation complète du frontend
- Déploiement en production
- Dépannage

👉 **Suivez ce guide pour une migration complète**

### 3. MIGRATION_PLAN.md 📋
**Plan stratégique**
- Architecture actuelle vs cible
- Phases de migration détaillées
- Timeline estimée (13-20h)
- Gestion des risques

👉 **Pour comprendre la stratégie globale**

### 4. backend/README.md 🔧
**Documentation technique du backend**
- Structure du projet
- Endpoints API
- Schéma de base de données
- Scripts disponibles

👉 **Référence technique pour le backend**

## 🏗️ Structure du projet

```
Smart-Meal-Planner/
├── backend/                    # 🆕 Nouveau backend Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma      # Schéma Prisma (équivalent schema.sql)
│   ├── src/
│   │   ├── config/            # Configuration DB + env
│   │   ├── middleware/        # Auth JWT + error handling
│   │   ├── routes/            # Routes API
│   │   ├── controllers/       # Logique des routes
│   │   ├── services/          # Services métier (auth, tokens)
│   │   └── utils/             # Validateurs Zod + erreurs
│   ├── scripts/
│   │   └── migrate-from-supabase.ts  # Script de migration des données
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── src/                        # Frontend (à adapter)
│   ├── lib/
│   │   ├── api.ts             # 🆕 Client API axios (remplace supabase.ts)
│   │   └── supabase.ts        # ❌ À supprimer
│   ├── contexts/
│   │   └── AuthContext.tsx    # 🔄 À modifier pour utiliser l'API
│   └── services/              # 🔄 À adapter pour l'API REST
│       ├── planStorageService.ts
│       ├── recipeStorageService.ts
│       └── listStorageService.ts
│
├── QUICK_START.md             # Guide rapide 30 min
├── MIGRATION_GUIDE.md         # Guide complet
├── MIGRATION_PLAN.md          # Plan stratégique
└── MIGRATION_README.md        # Ce fichier
```

## 🎯 Que choisir ?

### Vous voulez juste tester ?
→ **QUICK_START.md** (30 min)

### Vous voulez migrer en production ?
→ **MIGRATION_GUIDE.md** (étapes 1 à 7)

### Vous êtes chef de projet ?
→ **MIGRATION_PLAN.md** (vue d'ensemble, timeline, risques)

### Vous développez le backend ?
→ **backend/README.md** (référence API)

## ✨ Nouveautés par rapport à Supabase

| Aspect | Avant (Supabase) | Après (Neon + Prisma) |
|--------|------------------|------------------------|
| **Base de données** | Supabase PostgreSQL | Neon Postgres (serverless) |
| **ORM** | Client Supabase direct | Prisma |
| **Authentification** | Supabase Auth | JWT natif (bcrypt + jsonwebtoken) |
| **Backend** | Supabase Functions | Express.js API REST |
| **Sécurité** | Row Level Security | Middleware + validation Zod |
| **Déploiement** | Supabase (tout-en-un) | Railway (backend) + Vercel (frontend) |

## 🚀 Avantages de la migration

### ✅ Contrôle total
- Vous possédez 100% du code d'authentification
- Personnalisation complète de la logique métier
- Pas de vendor lock-in

### ✅ Performance
- Neon Postgres serverless (mise à l'échelle automatique)
- Connection pooling optimisé
- Latence réduite avec edge deployment

### ✅ Coût
- Neon : 0.5GB gratuit (largement suffisant pour démarrer)
- Railway : $5/mois de crédit gratuit
- Vercel : Gratuit pour les projets hobby

### ✅ Type-safety
- Prisma génère des types TypeScript automatiquement
- Zod pour la validation runtime
- Moins de bugs, meilleure DX

## 📊 Checklist rapide

### Phase de test (local)
- [ ] Lire QUICK_START.md
- [ ] Créer un compte Neon
- [ ] Installer et configurer le backend
- [ ] Créer les tables (prisma migrate)
- [ ] Démarrer le backend
- [ ] Adapter le frontend (AuthContext + services)
- [ ] Tester l'inscription/connexion

### Migration complète (avec données)
- [ ] Backup complet de Supabase
- [ ] Exporter les données Supabase
- [ ] Exécuter le script de migration
- [ ] Tester toutes les fonctionnalités
- [ ] Déployer backend sur Railway
- [ ] Déployer frontend sur Vercel
- [ ] Tests en production
- [ ] Notifier les utilisateurs (reset password)

## 🆘 Besoin d'aide ?

### Problèmes techniques
1. Consulter la section "Dépannage" dans MIGRATION_GUIDE.md
2. Vérifier les logs du backend (`npm run dev`)
3. Utiliser Prisma Studio (`npx prisma studio`) pour inspecter la DB

### Questions sur l'architecture
- Lire MIGRATION_PLAN.md (section "Architecture cible")
- Consulter backend/README.md (schéma de base de données)

### Problèmes de déploiement
- Section 7 de MIGRATION_GUIDE.md
- Vérifier les variables d'environnement en production

## 🎉 C'est parti !

1. **Test rapide** : Ouvrez QUICK_START.md
2. **Migration complète** : Ouvrez MIGRATION_GUIDE.md
3. **Questions stratégiques** : Ouvrez MIGRATION_PLAN.md

Bonne migration ! 🚀
