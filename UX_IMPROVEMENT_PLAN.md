# Plan d'Amélioration UX - Smart Meal Planner

## 🎯 Objectifs

1. **Meilleure organisation** : Lier clairement Plans → Listes de courses → Recettes
2. **Édition intuitive** : Permettre la modification des listes et recettes
3. **Navigation améliorée** : Vue consolidée de chaque programme
4. **Données enrichies** : Prompts LLM améliorés pour générer plus de métadonnées

---

## 📊 Architecture de données améliorée

### Avant (actuel)
```
Plan ━━━ Recettes (non lié visuellement)
  ↓
Liste de courses (sauvegarde séparée, pas de lien)
```

### Après (proposé)
```
Programme (Plan)
  ├── Métadonnées (nom, tags, budget, cuisine)
  ├── 7 jours de repas
  ├── Liste de courses associée (avec prix estimés)
  │   └── Éditable, avec catégories
  └── Recettes détaillées (7 dîners)
      └── Avec nutrition, difficulté, tags
```

---

## 🔄 Modifications des structures de données

### 1. Types TypeScript étendus

```typescript
// types.ts - NOUVEAUX types

export interface ProgramMetadata {
  id: string;                    // UUID du programme
  name: string;                  // Ex: "Semaine Italienne - Budget 50€"
  cuisine: string;               // "Italian", "French", "Mixed"
  difficulty: 'easy' | 'medium' | 'hard';
  totalBudget: number;           // Montant numérique
  currency: string;
  peopleCount: number;
  weekStartDate?: string;        // ISO date
  tags: string[];                // ["vegetarian", "budget-friendly", "quick"]
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  id: string;                    // UUID pour l'édition
  item: string;
  quantity: string;
  estimatedPrice?: number;       // Nouveau
  category?: string;             // "légumes", "viandes", "épices"
  checked?: boolean;             // Pour cocher pendant les courses
}

export interface ShoppingListCategory {
  location: string;              // "Dezerter Bazaar", "Carrefour"
  items: ShoppingListItem[];
  totalEstimated?: number;       // Somme des prix estimés
}

export interface Recipe {
  id: string;
  name: string;
  prepTime: string;
  cookTime?: string;             // Nouveau
  servings: number;              // Nouveau (nombre de personnes)
  difficulty: 'easy' | 'medium' | 'hard';  // Nouveau
  ingredients: Ingredient[];     // Modifié (au lieu de string[])
  instructions: string[];
  tips?: string;
  tags?: string[];               // ["healthy", "kid-friendly", "spicy"]
  nutrition?: NutritionInfo;     // Nouveau
  imageUrl?: string;             // Nouveau (optionnel)
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit?: string;                 // "g", "ml", "pcs"
  optional?: boolean;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number;              // en g
  carbs?: number;                // en g
  fat?: number;                  // en g
}

export interface WeeklyPlanData {
  metadata: ProgramMetadata;     // NOUVEAU
  weekPlan: DayPlan[];
  shoppingList: ShoppingListCategory[];
  shoppingListId?: string;       // NOUVEAU - lien vers saved_lists
  batchCooking: BatchCookingStep[];
  recipes: Recipe[];
  budgetEstimate: string;        // Deprecated, use metadata.totalBudget
}
```

### 2. Schéma de base de données étendu

```sql
-- Migration pour saved_plans
ALTER TABLE saved_plans ADD COLUMN IF NOT EXISTS shopping_list_id UUID REFERENCES saved_lists(id);
ALTER TABLE saved_plans ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE saved_plans ADD COLUMN IF NOT EXISTS cuisine TEXT;
ALTER TABLE saved_plans ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE saved_plans ADD COLUMN IF NOT EXISTS total_budget NUMERIC;
ALTER TABLE saved_plans ADD COLUMN IF NOT EXISTS week_start_date DATE;

-- Migration pour saved_lists
ALTER TABLE saved_lists ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES saved_plans(id);
ALTER TABLE saved_lists ADD COLUMN IF NOT EXISTS is_editable BOOLEAN DEFAULT true;
ALTER TABLE saved_lists ADD COLUMN IF NOT EXISTS total_estimated_price NUMERIC;

-- Migration pour saved_recipes
ALTER TABLE saved_recipes ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE saved_recipes ADD COLUMN IF NOT EXISTS cook_time TEXT;
ALTER TABLE saved_recipes ADD COLUMN IF NOT EXISTS servings INTEGER;
ALTER TABLE saved_recipes ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE saved_recipes ADD COLUMN IF NOT EXISTS nutrition JSONB;

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_plans_tags ON saved_plans USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_plans_cuisine ON saved_plans(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON saved_recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_lists_plan_id ON saved_lists(plan_id);
```

---

## 🎨 Nouveaux composants UI

### 1. ProgramView (Nouvelle vue consolidée)

**Fichier**: `components/ProgramView.tsx`

**Fonctionnalités** :
- Affiche un programme complet (plan + liste + recettes)
- Navigation par onglets : Overview / Recipes / Shopping List / Batch Cooking
- Édition en ligne de la liste de courses
- Export PDF/Print du programme complet
- Partage du programme (future)

**Layout** :
```
┌────────────────────────────────────────────────┐
│  🍽️ Semaine Italienne - Budget 50€            │
│  Italian • Medium • 4 personnes • 12 Jan 2025  │
│  [vegetarian] [budget-friendly] [quick]        │
├────────────────────────────────────────────────┤
│  [Overview] [Recettes] [Liste] [Batch Cook]   │
├────────────────────────────────────────────────┤
│                                                │
│  OVERVIEW TAB:                                 │
│  - Carte de la semaine (7 jours)              │
│  - Budget breakdown                            │
│  - Quick actions (Edit, Duplicate, Delete)     │
│                                                │
│  RECETTES TAB:                                 │
│  - Grid de 7 recettes avec preview             │
│  - Filtres : difficulté, tags                  │
│                                                │
│  LISTE TAB:                                    │
│  - Liste éditable avec checkboxes              │
│  - Ajouter/supprimer des items                 │
│  - Prix estimés par catégorie                  │
│                                                │
└────────────────────────────────────────────────┘
```

### 2. EditableShoppingList

**Fichier**: `components/EditableShoppingList.tsx`

**Fonctionnalités** :
- Affichage par catégories (locations)
- Checkboxes pour cocher les items achetés
- Bouton "+" pour ajouter un item
- Bouton "✏️" pour éditer un item
- Bouton "🗑️" pour supprimer un item
- Prix estimé par ligne et total par catégorie
- Auto-save au backend

### 3. ProgramCard (Liste des programmes)

**Fichier**: `components/ProgramCard.tsx`

**Affichage** :
```
┌──────────────────────────────────┐
│ 🍝 Semaine Italienne             │
│ 12-18 Jan 2025 • 4 personnes     │
│                                  │
│ Budget: 50€ / 50€ ✅             │
│ [italian] [vegetarian] [quick]   │
│                                  │
│ 📋 Liste de courses: ✅ Sauvée   │
│ 🍽️ 7 recettes incluses           │
│                                  │
│ [Voir] [Éditer] [Dupliquer] [🗑️]│
└──────────────────────────────────┘
```

### 4. AdvancedSearchFilter

**Fichier**: `components/AdvancedSearchFilter.tsx`

**Filtres** :
- Recherche textuelle (nom)
- Tri : Date, Nom, Budget, Difficulté
- Filtres :
  - Cuisine type (checkboxes multi-select)
  - Budget range (slider)
  - Difficulté (easy/medium/hard)
  - Tags (multi-select avec autocomplete)
  - Date range picker

---

## 🔧 Modifications des composants existants

### UserDashboard.tsx

**Changements** :
1. Renommer "New Plan" → "Créer un Programme"
2. Renommer "My Recipes" → "Mes Recettes"
3. Renommer "My Lists" → "Mes Listes"
4. **NOUVEAU TAB** : "Mes Programmes" (vue principale)

**Nouvelle structure de tabs** :
```typescript
type TabType = 'my-programs' | 'new-plan' | 'my-recipes' | 'my-lists' | 'settings';
```

**Tab "Mes Programmes"** :
- Grid de ProgramCard
- AdvancedSearchFilter
- Statistiques : X programmes, Budget moyen, etc.
- Quick action : "Créer un nouveau programme"

### SavedPlansModal.tsx → ProgramListView.tsx

**Migration** :
- Convertir le modal en composant full-page
- Utiliser ProgramCard au lieu de cards simples
- Intégrer AdvancedSearchFilter
- Ajouter pagination (12 programmes par page)

### ShoppingListView.tsx

**Ajouts** :
- Mode "Read-only" (affichage actuel)
- Mode "Editable" (avec EditableShoppingList)
- Toggle switch pour passer entre les deux modes
- Bouton "Save changes" si modifications

---

## 🤖 Amélioration des prompts LLM

### 1. Prompt generateWeeklyPlan amélioré

**Fichier**: `services/openRouterService.ts`

**Ajouts au système** :
```typescript
const systemInstruction = `
  You are a nutritionist and budget optimization expert living in ${prefs.location}.

  // ... existing instructions ...

  ENHANCED OUTPUT FORMAT (JSON ONLY):
  {
    "metadata": {
      "suggestedName": "Week Plan Name (e.g., 'Italian Week - Budget 50€')",
      "cuisine": "${prefs.cuisine || 'Mixed'}",
      "difficulty": "easy|medium|hard",
      "totalBudget": ${prefs.budget},
      "currency": "${prefs.currency}",
      "peopleCount": ${prefs.peopleCount},
      "tags": ["tag1", "tag2"]  // E.g., ["vegetarian", "budget-friendly", "quick"]
    },
    "weekPlan": [
      {
        "day": "Monday",
        "breakfast": "...",
        "lunch": "...",
        "dinner": "...",
        "dinnerRecipeId": "mon-dinner"
      },
      ... until Sunday
    ],
    "shoppingList": [
      {
        "location": "Local Market",
        "items": [
          {
            "id": "uuid-1",
            "item": "Tomatoes",
            "quantity": "1kg",
            "estimatedPrice": 3.50,
            "category": "vegetables"
          }
        ],
        "totalEstimated": 15.50
      }
    ],
    "batchCooking": [...],
    "recipes": [
      {
        "id": "mon-dinner",
        "name": "...",
        "prepTime": "20 min",
        "cookTime": "30 min",
        "servings": ${prefs.peopleCount},
        "difficulty": "easy|medium|hard",
        "ingredients": [
          {
            "id": "ing-1",
            "name": "Tomatoes",
            "quantity": "500",
            "unit": "g",
            "optional": false
          }
        ],
        "instructions": ["..."],
        "tips": "...",
        "tags": ["italian", "vegetarian"],
        "nutrition": {
          "calories": 450,
          "protein": 20,
          "carbs": 50,
          "fat": 15
        }
      }
    ],
    "budgetEstimate": "XXX ${prefs.currency}"
  }

  IMPORTANT REQUIREMENTS:
  1. Generate unique UUIDs for all items in shopping list and ingredients
  2. Provide realistic price estimates based on ${prefs.location} market prices
  3. Ensure total shopping list price ≤ budget
  4. Add relevant tags for filtering (max 5 tags)
  5. Calculate basic nutrition info (approximate values are OK)
  6. Suggest a catchy, descriptive name for the plan
`;
```

### 2. Nouveau service : suggestPlanName

**Fonction** :
```typescript
export const suggestPlanName = async (
  cuisine: string,
  budget: number,
  currency: string
): Promise<string> => {
  // Génère un nom accrocheur pour le plan
  // Ex: "Semaine Méditerranéenne - 45€", "Budget Étudiant Italien"
}
```

### 3. Nouveau service : enrichRecipe

**Fonction** :
```typescript
export const enrichRecipe = async (recipe: Recipe): Promise<Recipe> => {
  // Ajoute des infos manquantes : nutrition, tags, difficulty
  // Utilise un prompt court pour enrichir une recette existante
}
```

---

## 📱 Flux utilisateur amélioré

### Scénario 1 : Créer un programme complet

```
1. User → Tab "Créer un Programme"
2. Remplit InputSection (comme avant)
3. Clique "Générer"
4. → AI génère plan avec métadonnées enrichies
5. → Affichage preview avec :
   - Nom suggéré (éditable)
   - Tags (éditables)
   - 7 jours de repas
   - Liste de courses avec prix
   - 7 recettes détaillées
6. User clique "Sauvegarder le Programme"
   → Sauvegarde :
     - Le plan dans saved_plans
     - La liste dans saved_lists (avec plan_id)
     - Les 7 recettes dans saved_recipes (avec plan_id)
7. → Redirection vers "Mes Programmes"
8. → Affichage du nouveau programme avec ProgramCard
```

### Scénario 2 : Voir et éditer un programme

```
1. User → Tab "Mes Programmes"
2. Voit la liste filtrée/triée des programmes
3. Clique sur un ProgramCard → "Voir"
4. → Ouverture de ProgramView
5. Tabs disponibles :
   - Overview : Vue d'ensemble, stats, actions
   - Recettes : Grid des 7 recettes
   - Liste : EditableShoppingList (peut cocher items, ajouter, supprimer)
   - Batch Cooking : Instructions de préparation
6. User édite la liste :
   - Coche "Tomates ✅"
   - Ajoute "Pain - 2 baguettes - 3€"
   - Supprime "Épinards"
7. → Auto-save vers saved_lists
8. User clique "Dupliquer le Programme"
   → Crée une copie pour la semaine suivante
```

### Scénario 3 : Rechercher un programme

```
1. User → Tab "Mes Programmes"
2. Utilise AdvancedSearchFilter :
   - Cuisine : ✅ Italian, ✅ French
   - Budget : 30-60€
   - Difficulté : Easy
   - Tags : "vegetarian"
3. → Résultats filtrés en temps réel
4. Tri par : Budget (croissant)
5. → Trouve "Semaine Italienne Végétarienne - 45€"
```

---

## 🏗️ Plan d'implémentation

### Phase 1 : Structures de données (2-3h)
- [ ] Mettre à jour `types.ts` avec nouveaux types
- [ ] Créer migrations SQL pour Supabase
- [ ] Mettre à jour les services de stockage

### Phase 2 : Prompts LLM (1-2h)
- [ ] Améliorer `generateWeeklyPlan` prompt
- [ ] Ajouter génération UUID dans les réponses
- [ ] Ajouter `suggestPlanName` service
- [ ] Ajouter `enrichRecipe` service
- [ ] Tester avec API OpenRouter

### Phase 3 : Composants UI (4-6h)
- [ ] Créer `ProgramCard.tsx`
- [ ] Créer `ProgramView.tsx` avec tabs
- [ ] Créer `EditableShoppingList.tsx`
- [ ] Créer `AdvancedSearchFilter.tsx`
- [ ] Mettre à jour `ShoppingListView.tsx`

### Phase 4 : Dashboard (2-3h)
- [ ] Ajouter tab "Mes Programmes" dans `UserDashboard.tsx`
- [ ] Migrer logique de `SavedPlansModal` vers `ProgramListView`
- [ ] Intégrer ProgramView pour la navigation
- [ ] Ajouter statistiques (nombre de programmes, budget moyen)

### Phase 5 : Services backend (2-3h)
- [ ] Mettre à jour `planStorageService.ts` pour sauvegarder métadonnées
- [ ] Mettre à jour `listStorageService.ts` pour édition
- [ ] Ajouter `updateShoppingList` fonction
- [ ] Ajouter `duplicateProgram` fonction

### Phase 6 : Tests et polish (2-3h)
- [ ] Tester flux complet de création
- [ ] Tester édition de listes
- [ ] Tester filtrage avancé
- [ ] Responsive design
- [ ] Corrections bugs

**Total estimé : 13-20h (2-3 jours)**

---

## 🎯 Résultat attendu

### Avant
- Plans, recettes, listes = 3 entités séparées
- Pas de lien visuel clair
- Impossible d'éditer une liste sauvegardée
- Tri/filtrage basique (nom, date uniquement)
- Prompts LLM basiques

### Après
- **Programme** = unité cohérente (plan + liste + recettes)
- Navigation intuitive avec ProgramView
- Édition en temps réel des listes de courses
- Filtrage avancé (cuisine, budget, tags, difficulté, date)
- Prompts LLM enrichis (métadonnées, nutrition, prix estimés)
- Statistiques et insights sur les programmes
- Possibilité de dupliquer un programme

---

## 📈 Métriques de succès

1. ✅ 100% des programmes ont une liste de courses associée
2. ✅ Users peuvent éditer leurs listes après sauvegarde
3. ✅ Filtrage avancé utilisable (≥3 critères simultanés)
4. ✅ Temps de création d'un programme : <3 minutes
5. ✅ Navigation intuitive (≤2 clics pour voir un détail)

---

## 🔄 Évolutions futures

- [ ] Calendrier visuel pour planifier les programmes
- [ ] Partage de programmes entre utilisateurs
- [ ] Import/export de programmes en JSON
- [ ] Suggestions IA basées sur l'historique
- [ ] Tracking des courses (cocher items via mobile)
- [ ] Intégration avec APIs de supermarchés pour prix réels
- [ ] Recettes communautaires (fork et amélioration)
