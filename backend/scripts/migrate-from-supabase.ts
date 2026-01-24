/**
 * Script de migration des données de Supabase vers Neon Postgres
 *
 * Utilisation:
 * 1. Configurer les variables d'environnement SUPABASE_URL et SUPABASE_KEY
 * 2. S'assurer que DATABASE_URL pointe vers Neon
 * 3. Exécuter: npm run migrate:data
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration Supabase (source)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // Clé service, pas anon!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
}

interface UserIdMapping {
  [supabaseId: string]: string; // supabaseId -> neonId
}

async function migrateUsers(): Promise<UserIdMapping> {
  console.log('📊 Migrating users...');

  const userMapping: UserIdMapping = {};

  // Récupérer tous les utilisateurs de Supabase
  // Note: Nécessite l'API admin de Supabase ou un export manuel
  const { data: authUsers, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error fetching users from Supabase:', error);
    throw error;
  }

  console.log(`Found ${authUsers.users.length} users to migrate`);

  for (const supabaseUser of authUsers.users) {
    try {
      // Générer un mot de passe temporaire (l'utilisateur devra le reset)
      const tempPassword = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Créer l'utilisateur dans Neon
      const neonUser = await prisma.user.create({
        data: {
          email: supabaseUser.email!,
          password: hashedPassword,
          createdAt: new Date(supabaseUser.created_at),
        },
      });

      userMapping[supabaseUser.id] = neonUser.id;

      console.log(`✅ Migrated user: ${supabaseUser.email}`);
    } catch (error) {
      console.error(`❌ Error migrating user ${supabaseUser.email}:`, error);
    }
  }

  console.log(`✅ Migrated ${Object.keys(userMapping).length} users\n`);
  return userMapping;
}

async function migrateUserPreferences(userMapping: UserIdMapping): Promise<void> {
  console.log('📊 Migrating user preferences...');

  const { data: preferences, error } = await supabase
    .from('user_preferences')
    .select('*');

  if (error) {
    console.error('❌ Error fetching preferences:', error);
    return;
  }

  console.log(`Found ${preferences?.length || 0} preferences to migrate`);

  for (const pref of preferences || []) {
    try {
      const neonUserId = userMapping[pref.user_id];
      if (!neonUserId) {
        console.warn(`⚠️  No user mapping found for ${pref.user_id}, skipping preference`);
        continue;
      }

      await prisma.userPreference.create({
        data: {
          userId: neonUserId,
          dietaryRestrictions: pref.dietary_restrictions || [],
          cuisinePreferences: pref.cuisine_preferences || [],
          budgetPerDay: pref.budget_per_day,
          peopleCount: pref.people_count || 4,
          location: pref.location,
          currency: pref.currency || 'USD',
          createdAt: new Date(pref.created_at),
          updatedAt: new Date(pref.updated_at),
        },
      });

      console.log(`✅ Migrated preferences for user ${neonUserId}`);
    } catch (error) {
      console.error(`❌ Error migrating preference:`, error);
    }
  }

  console.log('✅ Preferences migration complete\n');
}

async function migratePlans(userMapping: UserIdMapping): Promise<void> {
  console.log('📊 Migrating saved plans...');

  const { data: plans, error } = await supabase
    .from('saved_plans')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching plans:', error);
    return;
  }

  console.log(`Found ${plans?.length || 0} plans to migrate`);

  for (const plan of plans || []) {
    try {
      const neonUserId = userMapping[plan.user_id];
      if (!neonUserId) {
        console.warn(`⚠️  No user mapping found for ${plan.user_id}, skipping plan`);
        continue;
      }

      await prisma.savedPlan.create({
        data: {
          userId: neonUserId,
          name: plan.name,
          preferences: plan.preferences,
          weekPlan: plan.week_plan,
          recipes: plan.recipes,
          batchCooking: plan.batch_cooking,
          budgetEstimate: plan.budget_estimate,
          shoppingList: plan.shopping_list,
          createdAt: new Date(plan.created_at),
          updatedAt: new Date(plan.updated_at),
        },
      });

      console.log(`✅ Migrated plan: ${plan.name}`);
    } catch (error) {
      console.error(`❌ Error migrating plan ${plan.name}:`, error);
    }
  }

  console.log('✅ Plans migration complete\n');
}

async function migrateRecipes(userMapping: UserIdMapping): Promise<void> {
  console.log('📊 Migrating saved recipes...');

  const { data: recipes, error } = await supabase
    .from('saved_recipes')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching recipes:', error);
    return;
  }

  console.log(`Found ${recipes?.length || 0} recipes to migrate`);

  for (const recipe of recipes || []) {
    try {
      const neonUserId = userMapping[recipe.user_id];
      if (!neonUserId) {
        console.warn(`⚠️  No user mapping found for ${recipe.user_id}, skipping recipe`);
        continue;
      }

      // Note: On ne peut pas mapper plan_id ici car les plans sont créés avec de nouveaux IDs
      // Il faudrait créer un mapping de plan_id aussi si nécessaire
      await prisma.savedRecipe.create({
        data: {
          userId: neonUserId,
          planId: null, // On pourrait mapper si on avait un mapping de plans
          recipe: recipe.recipe,
          createdAt: new Date(recipe.created_at),
          updatedAt: new Date(recipe.updated_at),
        },
      });

      console.log(`✅ Migrated recipe`);
    } catch (error) {
      console.error(`❌ Error migrating recipe:`, error);
    }
  }

  console.log('✅ Recipes migration complete\n');
}

async function migrateLists(userMapping: UserIdMapping): Promise<void> {
  console.log('📊 Migrating saved lists...');

  const { data: lists, error } = await supabase
    .from('saved_lists')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching lists:', error);
    return;
  }

  console.log(`Found ${lists?.length || 0} lists to migrate`);

  for (const list of lists || []) {
    try {
      const neonUserId = userMapping[list.user_id];
      if (!neonUserId) {
        console.warn(`⚠️  No user mapping found for ${list.user_id}, skipping list`);
        continue;
      }

      await prisma.savedList.create({
        data: {
          userId: neonUserId,
          name: list.name,
          list: list.list,
          createdAt: new Date(list.created_at),
          updatedAt: new Date(list.updated_at),
        },
      });

      console.log(`✅ Migrated list: ${list.name}`);
    } catch (error) {
      console.error(`❌ Error migrating list ${list.name}:`, error);
    }
  }

  console.log('✅ Lists migration complete\n');
}

async function main() {
  console.log('🚀 Starting migration from Supabase to Neon Postgres\n');

  try {
    // 1. Migrer les utilisateurs
    const userMapping = await migrateUsers();

    // 2. Migrer les préférences
    await migrateUserPreferences(userMapping);

    // 3. Migrer les plans
    await migratePlans(userMapping);

    // 4. Migrer les recettes
    await migrateRecipes(userMapping);

    // 5. Migrer les listes
    await migrateLists(userMapping);

    console.log('✅ Migration completed successfully!');
    console.log('\n⚠️  IMPORTANT: All users have been assigned temporary passwords.');
    console.log('   Users will need to use the "Forgot Password" feature to reset their passwords.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
