# 🚀 Quick Start - Migration Neon Postgres

Guide de démarrage rapide pour migrer vers Neon Postgres en moins de 30 minutes.

## 📋 Ce dont vous avez besoin

- ✅ Un compte Neon (gratuit sur https://neon.tech)
- ✅ Node.js 18+ installé
- ✅ 30 minutes de votre temps

---

## ⚡ Installation Express (5 étapes)

### 1️⃣ Créer votre base de données Neon (5 min)

1. Aller sur https://console.neon.tech
2. Cliquer "New Project" → Nommer "smart-meal-planner"
3. Copier les deux URLs de connexion affichées

### 2️⃣ Configurer le backend (5 min)

```bash
cd backend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
```

Éditer `backend/.env` et coller vos URLs Neon :

```env
DATABASE_URL="votre_pooling_url_copiee"
DIRECT_URL="votre_direct_url_copiee"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
```

### 3️⃣ Créer la base de données (2 min)

```bash
# Générer le client Prisma
npx prisma generate

# Créer toutes les tables
npx prisma migrate dev --name init
```

### 4️⃣ Démarrer le backend (1 min)

```bash
npm run dev
```

✅ Le backend tourne sur http://localhost:3001

### 5️⃣ Adapter le frontend (10 min)

```bash
cd ..  # retour à la racine

# Installer axios
npm install axios

# Supprimer Supabase
npm uninstall @supabase/supabase-js
```

Créer le fichier `.env.local` :

```env
VITE_API_URL=http://localhost:3001/api
OPENROUTER_API_KEY=votre_clé_actuelle
```

**Ensuite, suivre les étapes du MIGRATION_GUIDE.md section 5.2 à 5.6**

---

## ✅ Test rapide

Terminal 1 :
```bash
cd backend
npm run dev
```

Terminal 2 :
```bash
npm run dev
```

Ouvrir http://localhost:3000 et tester l'inscription !

---

## 🆘 Problème ?

### Le backend ne démarre pas
```bash
# Vérifier que DATABASE_URL est configuré
cat backend/.env | grep DATABASE_URL
```

### Erreur "Table does not exist"
```bash
cd backend
npx prisma migrate dev
```

### Le frontend ne se connecte pas
```bash
# Vérifier que l'API tourne
curl http://localhost:3001/health

# Vérifier VITE_API_URL
cat .env.local | grep VITE_API_URL
```

---

## 📚 Prochaines étapes

1. ✅ L'app fonctionne localement
2. 📖 Lire MIGRATION_GUIDE.md pour la migration des données
3. 🚀 Déployer sur Railway + Vercel (section 7 du guide)

---

## 💡 Commandes utiles

```bash
# Voir la base de données
cd backend && npx prisma studio

# Réinitialiser la base
cd backend && npx prisma migrate reset

# Voir les logs du backend
cd backend && npm run dev

# Tester l'API
curl http://localhost:3001/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

---

Besoin d'aide ? Consultez MIGRATION_GUIDE.md pour les détails complets !
