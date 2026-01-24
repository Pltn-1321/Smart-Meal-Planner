# Guide de Migration Complet : Supabase → Neon Postgres

## 🎯 Vue d'ensemble

Ce guide vous accompagne pas à pas dans la migration de Smart Meal Planner de Supabase vers Neon Postgres avec Prisma et une authentification JWT native.

---

## 📋 Prérequis

- Node.js 18+ installé
- Un compte Neon (https://neon.tech - gratuit)
- Accès administrateur à votre projet Supabase
- Git installé

---

## 🚀 Étape 1 : Configuration de Neon Postgres

### 1.1 Créer un projet Neon

1. Aller sur https://console.neon.tech
2. Cliquer sur "New Project"
3. Choisir un nom (ex: "smart-meal-planner")
4. Sélectionner une région proche de vos utilisateurs
5. Cliquer sur "Create Project"

### 1.2 Récupérer les URLs de connexion

Dans le dashboard Neon, vous verrez deux URLs :

```env
# Connection pooling URL (pour l'application)
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"

# Direct connection URL (pour les migrations)
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### 1.3 Configurer les variables d'environnement backend

```bash
cd backend
cp .env.example .env
```

Éditer `.env` :

```env
# Neon URLs (copiées du dashboard)
DATABASE_URL="votre_pooling_url"
DIRECT_URL="votre_direct_url"

# JWT Secrets (générer des clés fortes!)
JWT_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
```

---

## 🔧 Étape 2 : Installation du backend

### 2.1 Installer les dépendances

```bash
cd backend
npm install
```

### 2.2 Générer le client Prisma

```bash
npx prisma generate
```

### 2.3 Créer la base de données

```bash
npx prisma migrate dev --name init
```

Cette commande :
- Crée toutes les tables dans Neon
- Génère les fichiers de migration
- Met à jour le client Prisma

### 2.4 Vérifier la base de données

```bash
npx prisma studio
```

Cela ouvre une interface web pour visualiser votre base de données.

---

## 📦 Étape 3 : Migration des données depuis Supabase

### 3.1 Exporter les données de Supabase

#### Option A : Via l'interface Supabase (recommandé)

1. Aller dans votre projet Supabase
2. Table Editor → Chaque table → Export → JSON
3. Sauvegarder les fichiers JSON

#### Option B : Via le script de migration

1. Récupérer votre clé service Supabase :
   - Dashboard Supabase → Settings → API
   - Copier "service_role key" (pas "anon key"!)

2. Configurer les variables d'environnement :

```bash
# Dans backend/.env, ajouter:
SUPABASE_URL="https://votre-projet.supabase.co"
SUPABASE_SERVICE_KEY="votre_service_role_key"
```

3. Exécuter le script de migration :

```bash
npm run migrate:data
```

**⚠️ IMPORTANT** : Ce script :
- Migre tous les utilisateurs avec des mots de passe temporaires
- Les utilisateurs devront reset leur mot de passe
- Envoyer un email à tous les utilisateurs pour les informer!

### 3.2 Vérifier la migration

```bash
npx prisma studio
```

Vérifier que toutes les données sont présentes :
- Users
- User Preferences
- Saved Plans
- Saved Recipes
- Saved Lists

---

## 🖥️ Étape 4 : Démarrer le backend

### 4.1 Lancer en mode développement

```bash
cd backend
npm run dev
```

Le serveur démarre sur http://localhost:3001

### 4.2 Tester les endpoints

```bash
# Health check
curl http://localhost:3001/health

# Inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## ⚛️ Étape 5 : Adapter le frontend

### 5.1 Installer les nouvelles dépendances

```bash
cd ..  # retour à la racine
npm install axios
npm uninstall @supabase/supabase-js
```

### 5.2 Créer le client API

Créer `src/lib/api.ts` :

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour rafraîchir le token si expiré
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 5.3 Modifier AuthContext

Remplacer le contenu de `contexts/AuthContext.tsx` :

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: { message: string } }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser({
            id: data.data.userId,
            email: data.data.email,
            created_at: new Date().toISOString(),
          });
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/register', { email, password });

      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);

      setUser(data.data.user);
      return {};
    } catch (error: any) {
      return { error: { message: error.response?.data?.error || 'Registration failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);

      setUser(data.data.user);
      return {};
    } catch (error: any) {
      return { error: { message: error.response?.data?.error || 'Login failed' } };
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await api.post('/auth/request-reset', { email });
      return {};
    } catch (error: any) {
      return { error: { message: error.response?.data?.error || 'Reset failed' } };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 5.4 Supprimer l'ancien fichier Supabase

```bash
rm lib/supabase.ts
```

### 5.5 Mettre à jour les variables d'environnement frontend

Éditer `.env.local` :

```env
# Supprimer les anciennes variables Supabase
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Ajouter l'URL de l'API
VITE_API_URL=http://localhost:3001/api

# Garder OpenRouter
OPENROUTER_API_KEY=votre_clé
```

### 5.6 Mettre à jour les services

Il faut adapter chaque service pour utiliser l'API au lieu de Supabase.

Exemple pour `services/planStorageService.ts` :

```typescript
import api from '../lib/api';
import { WeeklyPlanData, UserPreferences } from '../types';

export interface SavedPlan {
  id: string;
  userId: string;
  name: string;
  preferences: UserPreferences;
  weekPlan: any;
  recipes: any[];
  batchCooking: any[];
  budgetEstimate: string;
  shoppingList: any[];
  createdAt: string;
  updatedAt: string;
}

export class PlanStorageService {
  static async savePlan(
    planName: string,
    preferences: UserPreferences,
    planData: WeeklyPlanData
  ): Promise<{ success: boolean; planId?: string; error?: string }> {
    try {
      const { data } = await api.post('/plans', {
        name: planName,
        preferences,
        weekPlan: planData.weekPlan,
        recipes: planData.recipes,
        batchCooking: planData.batchCooking,
        budgetEstimate: planData.budgetEstimate,
        shoppingList: planData.shoppingList,
      });

      return { success: true, planId: data.data.id };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to save plan'
      };
    }
  }

  static async loadSavedPlans(): Promise<{ success: boolean; plans?: SavedPlan[]; error?: string }> {
    try {
      const { data } = await api.get('/plans');
      return { success: true, plans: data.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load plans'
      };
    }
  }

  static async loadPlan(planId: string): Promise<{ success: boolean; plan?: SavedPlan; error?: string }> {
    try {
      const { data } = await api.get(`/plans/${planId}`);
      return { success: true, plan: data.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load plan'
      };
    }
  }

  static async deletePlan(planId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.delete(`/plans/${planId}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete plan'
      };
    }
  }

  static savedPlanToWeeklyPlan(savedPlan: SavedPlan): WeeklyPlanData {
    return {
      weekPlan: savedPlan.weekPlan,
      recipes: savedPlan.recipes,
      batchCooking: savedPlan.batchCooking,
      budgetEstimate: savedPlan.budgetEstimate,
      shoppingList: savedPlan.shoppingList,
    };
  }
}
```

Répéter pour `recipeStorageService.ts` et `listStorageService.ts`.

---

## ✅ Étape 6 : Tests

### 6.1 Tester l'authentification

1. Démarrer le backend : `cd backend && npm run dev`
2. Démarrer le frontend : `cd .. && npm run dev`
3. Ouvrir http://localhost:3000
4. Tester :
   - Inscription
   - Connexion
   - Déconnexion
   - Reset password

### 6.2 Tester les fonctionnalités

- [ ] Créer un nouveau plan de repas
- [ ] Sauvegarder le plan
- [ ] Charger les plans sauvegardés
- [ ] Supprimer un plan
- [ ] Sauvegarder des recettes
- [ ] Créer des listes de courses

---

## 🚀 Étape 7 : Déploiement

### 7.1 Backend sur Railway

1. Créer un compte sur https://railway.app
2. Nouveau projet → Deploy from GitHub
3. Sélectionner votre repository
4. Configurer les variables d'environnement :
   - `DATABASE_URL` (copier depuis Neon)
   - `DIRECT_URL` (copier depuis Neon)
   - `JWT_SECRET` (générer avec `openssl rand -base64 32`)
   - `JWT_REFRESH_SECRET` (générer avec `openssl rand -base64 32`)
   - `FRONTEND_URL` (URL Vercel de votre frontend)
   - `NODE_ENV=production`
5. Déployer

### 7.2 Frontend sur Vercel

1. Aller sur https://vercel.com
2. Import project depuis GitHub
3. Configurer les variables d'environnement :
   - `VITE_API_URL` (URL Railway de votre backend)
   - `OPENROUTER_API_KEY`
4. Déployer

---

## 📊 Checklist de migration

### Préparation
- [ ] Backup complet de Supabase
- [ ] Projet Neon créé
- [ ] Variables d'environnement configurées

### Backend
- [ ] Dépendances installées
- [ ] Prisma configuré
- [ ] Base de données créée
- [ ] Données migrées
- [ ] API testée localement

### Frontend
- [ ] AuthContext mis à jour
- [ ] Services adaptés
- [ ] Variables d'environnement mises à jour
- [ ] Tests locaux réussis

### Déploiement
- [ ] Backend déployé
- [ ] Frontend déployé
- [ ] Tests en production
- [ ] Monitoring actif

---

## 🆘 Dépannage

### Erreur : "JWT token expired"
- Normal après 15 minutes
- Le refresh automatique devrait fonctionner
- Sinon, se reconnecter

### Erreur : "Database connection failed"
- Vérifier DATABASE_URL dans .env
- Vérifier que Neon est accessible
- Essayer avec DIRECT_URL

### Erreur de CORS
- Vérifier FRONTEND_URL dans backend/.env
- Vérifier que le backend est démarré

---

## 📚 Ressources

- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Neon](https://neon.tech/docs)
- [JWT.io](https://jwt.io)
- [Express.js Guide](https://expressjs.com)

---

## 🎉 Félicitations !

Votre application Smart Meal Planner est maintenant migrée vers Neon Postgres avec une authentification native !
