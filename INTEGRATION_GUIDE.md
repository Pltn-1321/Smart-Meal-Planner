# Guide d'Intégration des Nouveaux Composants

Ce guide explique comment intégrer les nouveaux composants créés (ProgramView, ProgramCard, EditableShoppingList, AdvancedSearchFilter) dans l'application existante.

---

## 📦 Composants Créés

### 1. **ProgramView.tsx**
Vue consolidée complète d'un programme avec 4 onglets.

**Props**:
```typescript
interface ProgramViewProps {
  programId: string;
  programData: WeeklyPlanData;
  onUpdate?: (updatedData: WeeklyPlanData) => void;
  onClose?: () => void;
}
```

**Usage**:
```tsx
<ProgramView
  programId={selectedProgramId}
  programData={programData}
  onUpdate={(updated) => handleProgramUpdate(updated)}
  onClose={() => setSelectedProgramId(null)}
/>
```

### 2. **ProgramCard.tsx**
Carte d'affichage d'un programme dans une liste.

**Props**:
```typescript
interface ProgramCardProps {
  programId: string;
  metadata: ProgramMetadata;
  recipeCount: number;
  hasShoppingList: boolean;
  onView: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}
```

**Usage**:
```tsx
<ProgramCard
  programId={program.id}
  metadata={program.metadata}
  recipeCount={program.recipes.length}
  hasShoppingList={!!program.shoppingListId}
  onView={() => handleViewProgram(program.id)}
  onDuplicate={() => handleDuplicateProgram(program.id)}
  onDelete={() => handleDeleteProgram(program.id)}
/>
```

### 3. **EditableShoppingList.tsx**
Liste de courses éditable avec CRUD complet.

**Props**:
```typescript
interface EditableShoppingListProps {
  listId: string;
  categories: ShoppingListCategory[];
  onUpdate: (updatedCategories: ShoppingListCategory[]) => void;
  editable?: boolean;
}
```

**Usage**:
```tsx
<EditableShoppingList
  listId={shoppingListId}
  categories={shoppingList}
  onUpdate={(updated) => handleListUpdate(updated)}
  editable={true}
/>
```

### 4. **AdvancedSearchFilter.tsx**
Barre de recherche et filtrage avancé pour les programmes.

**Props**:
```typescript
interface AdvancedSearchFilterProps {
  onFilterChange: (criteria: FilterCriteria) => void;
  availableCuisines?: string[];
  availableTags?: string[];
  showFilters?: boolean;
}

interface FilterCriteria {
  search: string;
  cuisines: string[];
  difficulties: string[];
  budgetMin?: number;
  budgetMax?: number;
  tags: string[];
  sortBy: 'date' | 'name' | 'budget' | 'difficulty';
  sortOrder: 'asc' | 'desc';
}
```

**Usage**:
```tsx
<AdvancedSearchFilter
  onFilterChange={(criteria) => handleFilterChange(criteria)}
  availableCuisines={['Italian', 'French', 'Asian']}
  availableTags={['vegetarian', 'budget-friendly']}
  showFilters={false}
/>
```

---

## 🔧 Intégration dans UserDashboard.tsx

### Étape 1 : Ajouter les imports

```typescript
// Ajouter en haut du fichier après les imports existants
import { ProgramView } from './ProgramView';
import { ProgramCard } from './ProgramCard';
import { AdvancedSearchFilter, FilterCriteria } from './AdvancedSearchFilter';
import { ProgramMetadata } from '../types';
```

### Étape 2 : Mettre à jour le type TabType

```typescript
// Remplacer la ligne 20
type TabType = 'my-programs' | 'new-plan' | 'my-recipes' | 'my-lists' | 'settings';
```

### Étape 3 : Ajouter le state pour "My Programs"

```typescript
// Ajouter après les états existants (vers ligne 62)

// My Programs tab state
const [savedPrograms, setSavedPrograms] = useState<SavedPlan[]>([]);
const [loadingPrograms, setLoadingPrograms] = useState(true);
const [programError, setProgramError] = useState<string | null>(null);
const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
  search: '',
  cuisines: [],
  difficulties: [],
  budgetMin: undefined,
  budgetMax: undefined,
  tags: [],
  sortBy: 'date',
  sortOrder: 'desc',
});
const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
const [viewingProgram, setViewingProgram] = useState<{
  id: string;
  data: WeeklyPlanData;
} | null>(null);
```

### Étape 4 : Ajouter la fonction de chargement des programmes

```typescript
// Ajouter après loadSavedLists (vers ligne 97)

// Load saved programs
const loadSavedPrograms = async () => {
  try {
    setLoadingPrograms(true);
    setProgramError(null);
    const result = await PlanStorageService.loadSavedPlans();
    if (result.success && result.plans) {
      setSavedPrograms(result.plans);
    } else {
      setProgramError(result.error || 'Failed to load saved programs');
    }
  } catch (err) {
    setProgramError('Failed to load saved programs');
  } finally {
    setLoadingPrograms(false);
  }
};
```

### Étape 5 : Ajouter useEffect pour charger les programmes

```typescript
// Ajouter après les useEffects existants (vers ligne 110)

useEffect(() => {
  if (activeTab === 'my-programs') {
    loadSavedPrograms();
  }
}, [activeTab]);
```

### Étape 6 : Ajouter les fonctions de gestion des programmes

```typescript
// Ajouter après les fonctions existantes (vers ligne 200)

// Handle program actions
const handleViewProgram = async (programId: string) => {
  const program = savedPrograms.find(p => p.id === programId);
  if (!program) return;

  const result = await PlanStorageService.loadPlan(programId);
  if (result.success && result.plan) {
    const planData = PlanStorageService.savedPlanToWeeklyPlan(result.plan);
    setViewingProgram({ id: programId, data: planData });
  } else {
    showToast(result.error || 'Failed to load program', 'error');
  }
};

const handleDuplicateProgram = async (programId: string) => {
  const program = savedPrograms.find(p => p.id === programId);
  if (!program) return;

  const result = await PlanStorageService.loadPlan(programId);
  if (result.success && result.plan) {
    const duplicatedName = `${result.plan.name} (Copie)`;
    const planData = PlanStorageService.savedPlanToWeeklyPlan(result.plan);

    // Mettre à jour metadata avec le nouveau nom
    if (planData.metadata) {
      planData.metadata.name = duplicatedName;
    }

    // Sauvegarder le duplicata
    const saveResult = await PlanStorageService.savePlan(
      duplicatedName,
      result.plan.preferences as any, // Cast to UserPreferences
      planData
    );

    if (saveResult.success) {
      showToast('Programme dupliqué avec succès', 'success');
      loadSavedPrograms();
    } else {
      showToast(saveResult.error || 'Failed to duplicate program', 'error');
    }
  }
};

const handleDeleteProgram = async (programId: string) => {
  const program = savedPrograms.find(p => p.id === programId);
  if (!program) return;

  if (!confirm(`Supprimer le programme "${program.name}" ?`)) return;

  setIsDeleting(true);
  const result = await PlanStorageService.deletePlan(programId);
  setIsDeleting(false);

  if (result.success) {
    showToast('Programme supprimé', 'success');
    loadSavedPrograms();
  } else {
    showToast(result.error || 'Failed to delete program', 'error');
  }
};

const handleProgramUpdate = async (programId: string, updatedData: WeeklyPlanData) => {
  // TODO: Implémenter la mise à jour d'un programme
  // Pour l'instant, on peut juste rafraîchir les données
  showToast('Programme mis à jour', 'success');
  setViewingProgram({ id: programId, data: updatedData });
};
```

### Étape 7 : Ajouter la fonction de filtrage des programmes

```typescript
// Ajouter après handleDeleteProgram

// Filter and sort programs
const filteredPrograms = useMemo(() => {
  let filtered = [...savedPrograms];

  // Search filter
  if (filterCriteria.search) {
    const search = filterCriteria.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search) ||
      (p.cuisine && p.cuisine.toLowerCase().includes(search))
    );
  }

  // Cuisine filter
  if (filterCriteria.cuisines.length > 0) {
    filtered = filtered.filter(p =>
      p.cuisine && filterCriteria.cuisines.includes(p.cuisine)
    );
  }

  // Difficulty filter
  if (filterCriteria.difficulties.length > 0) {
    filtered = filtered.filter(p =>
      p.difficulty && filterCriteria.difficulties.includes(p.difficulty)
    );
  }

  // Budget filter
  if (filterCriteria.budgetMin !== undefined) {
    filtered = filtered.filter(p =>
      p.total_budget && p.total_budget >= filterCriteria.budgetMin!
    );
  }
  if (filterCriteria.budgetMax !== undefined) {
    filtered = filtered.filter(p =>
      p.total_budget && p.total_budget <= filterCriteria.budgetMax!
    );
  }

  // Tags filter
  if (filterCriteria.tags.length > 0) {
    filtered = filtered.filter(p =>
      p.tags && p.tags.some(tag => filterCriteria.tags.includes(tag))
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let compareValue = 0;

    switch (filterCriteria.sortBy) {
      case 'date':
        compareValue = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        break;
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'budget':
        compareValue = (a.total_budget || 0) - (b.total_budget || 0);
        break;
      case 'difficulty':
        const diffOrder = { easy: 1, medium: 2, hard: 3 };
        compareValue = (diffOrder[a.difficulty as keyof typeof diffOrder] || 0) -
                      (diffOrder[b.difficulty as keyof typeof diffOrder] || 0);
        break;
    }

    return filterCriteria.sortOrder === 'asc' ? compareValue : -compareValue;
  });

  return filtered;
}, [savedPrograms, filterCriteria]);
```

### Étape 8 : Ajouter le rendu du tab "My Programs"

```typescript
// Ajouter dans la fonction de rendu, après le rendu de "My Lists" (vers ligne 600)

// Render My Programs Tab
const renderMyPrograms = () => {
  if (viewingProgram) {
    return (
      <ProgramView
        programId={viewingProgram.id}
        programData={viewingProgram.data}
        onUpdate={(updated) => handleProgramUpdate(viewingProgram.id, updated)}
        onClose={() => setViewingProgram(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Programmes</h2>
          <p className="text-gray-600 mt-1">
            {filteredPrograms.length} programme{filteredPrograms.length !== 1 ? 's' : ''}
            {savedPrograms.length !== filteredPrograms.length && (
              <span className="text-gray-500"> (sur {savedPrograms.length})</span>
            )}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('new-plan')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau Programme
        </button>
      </div>

      {/* Search and Filters */}
      <AdvancedSearchFilter
        onFilterChange={setFilterCriteria}
        availableCuisines={Array.from(new Set(savedPrograms.map(p => p.cuisine).filter(Boolean)))}
        availableTags={Array.from(new Set(savedPrograms.flatMap(p => p.tags || [])))}
      />

      {/* Programs Grid */}
      {loadingPrograms ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 mt-4">Chargement des programmes...</p>
        </div>
      ) : programError ? (
        <div className="text-center py-12 text-red-600">
          <p>Erreur: {programError}</p>
          <button
            onClick={loadSavedPrograms}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">
            {savedPrograms.length === 0
              ? 'Aucun programme sauvegardé'
              : 'Aucun programme ne correspond aux filtres'}
          </p>
          {savedPrograms.length === 0 && (
            <button
              onClick={() => setActiveTab('new-plan')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Créer votre premier programme
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => {
            // Extract metadata from program
            const metadata: ProgramMetadata = {
              id: program.id,
              name: program.name,
              cuisine: program.cuisine,
              difficulty: program.difficulty as 'easy' | 'medium' | 'hard',
              totalBudget: program.total_budget ? Number(program.total_budget) : undefined,
              currency: (program.preferences as any)?.currency,
              peopleCount: (program.preferences as any)?.peopleCount,
              weekStartDate: program.week_start_date,
              tags: program.tags || [],
              createdAt: program.created_at,
              updatedAt: program.updated_at,
            };

            return (
              <ProgramCard
                key={program.id}
                programId={program.id}
                metadata={metadata}
                recipeCount={Array.isArray(program.recipes) ? program.recipes.length : 0}
                hasShoppingList={!!program.shopping_list_id}
                onView={() => handleViewProgram(program.id)}
                onDuplicate={() => handleDuplicateProgram(program.id)}
                onDelete={() => handleDeleteProgram(program.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
```

### Étape 9 : Mettre à jour la navigation par tabs

```typescript
// Trouver la section de rendu des tabs (vers ligne 650) et modifier pour inclure "Mes Programmes"

<div className="flex border-b border-gray-200 mb-6">
  <button
    onClick={() => setActiveTab('my-programs')}
    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
      activeTab === 'my-programs'
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
    }`}
  >
    <FolderOpen className="w-5 h-5" />
    Mes Programmes
  </button>

  <button
    onClick={() => setActiveTab('new-plan')}
    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
      activeTab === 'new-plan'
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
    }`}
  >
    <Plus className="w-5 h-5" />
    Nouveau Plan
  </button>

  {/* Autres tabs existants... */}
</div>
```

### Étape 10 : Ajouter le switch pour rendre le bon tab

```typescript
// Dans le return du composant, modifier le switch pour inclure my-programs

{activeTab === 'my-programs' && renderMyPrograms()}
{activeTab === 'new-plan' && (
  // Contenu existant du tab new-plan
)}
{/* Autres tabs... */}
```

---

## 🔄 Mise à jour du service PlanStorageService

Le service actuel ne sauvegarde pas toutes les nouvelles métadonnées. Voici les modifications à apporter:

### Modifier `savePlan` dans planStorageService.ts

```typescript
static async savePlan(
  planName: string,
  preferences: UserPreferences,
  planData: WeeklyPlanData
): Promise<{ success: boolean; planId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Extract metadata
    const metadata = planData.metadata || {};

    // Save plan with metadata
    const { data, error } = await supabase
      .from('saved_plans')
      .insert({
        user_id: user.id,
        name: metadata.name || planName,
        preferences: preferences,
        week_plan: planData.weekPlan,
        recipes: planData.recipes,
        batch_cooking: planData.batchCooking,
        budget_estimate: planData.budgetEstimate,
        shopping_list: planData.shoppingList,
        // NEW FIELDS
        tags: metadata.tags || [],
        cuisine: metadata.cuisine || preferences.cuisine,
        difficulty: metadata.difficulty,
        total_budget: metadata.totalBudget,
        week_start_date: metadata.weekStartDate,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving plan:', error);
      return { success: false, error: error.message };
    }

    const planId = data.id;

    // Optionally save the shopping list separately
    if (planData.shoppingList && planData.shoppingList.length > 0) {
      const listResult = await ListStorageService.saveList(
        `Liste - ${metadata.name || planName}`,
        planData.shoppingList
      );

      if (listResult.success && listResult.listId) {
        // Update plan with shopping_list_id
        await supabase
          .from('saved_plans')
          .update({ shopping_list_id: listResult.listId })
          .eq('id', planId);
      }
    }

    // Save each recipe individually
    if (planData.recipes && planData.recipes.length > 0) {
      const recipeInserts = planData.recipes.map(recipe => ({
        user_id: user.id,
        plan_id: planId,
        recipe: recipe,
        // NEW FIELDS
        difficulty: recipe.difficulty,
        cook_time: recipe.cookTime,
        servings: recipe.servings,
        tags: recipe.tags || [],
        nutrition: recipe.nutrition,
      }));

      const { error: recipeError } = await supabase
        .from('saved_recipes')
        .insert(recipeInserts);

      if (recipeError) {
        console.warn('Warning: Failed to save individual recipes:', recipeError);
      }
    }

    return { success: true, planId: planId };
  } catch (error) {
    console.error('Error saving plan:', error);
    return { success: false, error: 'Failed to save plan' };
  }
}
```

---

## ✅ Checklist d'Intégration

- [ ] Importer les nouveaux composants dans UserDashboard.tsx
- [ ] Mettre à jour le type `TabType` pour inclure 'my-programs'
- [ ] Ajouter les états pour le tab "My Programs"
- [ ] Ajouter `loadSavedPrograms` fonction
- [ ] Ajouter useEffect pour charger les programmes
- [ ] Ajouter les handlers: `handleViewProgram`, `handleDuplicateProgram`, `handleDeleteProgram`
- [ ] Ajouter la fonction `filteredPrograms` avec useMemo
- [ ] Ajouter la fonction `renderMyPrograms`
- [ ] Mettre à jour la navigation par tabs pour inclure "Mes Programmes"
- [ ] Mettre à jour le switch de rendu pour inclure le nouveau tab
- [ ] Mettre à jour `PlanStorageService.savePlan` pour sauvegarder les métadonnées
- [ ] Tester le flux complet: créer → sauvegarder → voir → éditer → dupliquer

---

## 🧪 Tests Suggérés

1. **Créer un nouveau programme**:
   - Générer un plan avec InputSection
   - Vérifier que metadata est bien rempli
   - Sauvegarder le plan
   - Vérifier qu'il apparaît dans "Mes Programmes"

2. **Filtrer les programmes**:
   - Recherche par nom
   - Filtre par cuisine
   - Filtre par difficulté
   - Filtre par budget
   - Filtre par tags

3. **Voir un programme**:
   - Cliquer sur "Voir"
   - Vérifier les 4 tabs (Overview, Recipes, Shopping, Batch)
   - Vérifier que toutes les données s'affichent correctement

4. **Éditer la liste de courses**:
   - Ouvrir un programme
   - Aller dans l'onglet "Liste de courses"
   - Cocher un item
   - Ajouter un nouvel item
   - Éditer un item existant
   - Supprimer un item
   - Vérifier que les totaux se mettent à jour

5. **Dupliquer un programme**:
   - Cliquer sur le bouton dupliquer
   - Vérifier que le nouveau programme a "(Copie)" dans le nom
   - Vérifier que toutes les données sont copiées

6. **Supprimer un programme**:
   - Cliquer sur supprimer
   - Confirmer
   - Vérifier que le programme disparaît de la liste

---

## 🚀 Prochaines Étapes (Post-Intégration)

1. **Backend API** (si migration vers Neon/Prisma):
   - Créer les routes CRUD pour programs
   - Mettre à jour les services frontend pour appeler l'API

2. **Features Avancées**:
   - Calendrier pour planifier les programmes dans le temps
   - Partage de programmes entre utilisateurs
   - Export/Import de programmes en JSON
   - Statistiques et insights (budget moyen, cuisines favorites, etc.)

3. **Optimisations**:
   - Pagination pour les listes de programmes
   - Lazy loading des images de recettes
   - Cache des programmes récemment consultés

4. **Tests**:
   - Tests unitaires pour les composants
   - Tests d'intégration pour les flux complets
   - Tests E2E avec Playwright ou Cypress

---

Bon courage pour l'intégration ! 🎉
