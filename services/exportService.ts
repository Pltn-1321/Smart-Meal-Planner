import { WeeklyPlanData, Recipe, DayPlan, ShoppingListCategory, UserPreferences } from "../types";

// --- Markdown Generation ---

export const generateMarkdown = (data: WeeklyPlanData, prefs: UserPreferences | null): string => {
  const date = new Date().toLocaleDateString();
  let md = `# 📅 Weekly Meal Plan - ${prefs?.location || 'Custom'}\n`;
  md += `**Budget:** ${data.budgetEstimate} | **Generated:** ${date}\n\n`;

  md += `## 🥦 Shopping List\n`;
  data.shoppingList.forEach(cat => {
    md += `### ${cat.location}\n`;
    cat.items.forEach(item => {
      md += `- [ ] ${item.item} (${item.quantity})\n`;
    });
    md += `\n`;
  });

  md += `## 🥘 Batch Cooking (Sunday)\n`;
  data.batchCooking.forEach(step => {
    md += `1. **${step.timeEstimate}**: ${step.instruction}\n`;
  });
  md += `\n`;

  md += `## 🗓 Weekly Schedule\n`;
  data.weekPlan.forEach(day => {
    md += `### ${day.day}\n`;
    md += `- ☕ **Breakfast**: ${day.breakfast}\n`;
    md += `- ☀️ **Lunch**: ${day.lunch}\n`;
    md += `- 🌙 **Dinner**: ${day.dinner}\n`;
  });

  md += `\n## 👨‍🍳 Recipes\n`;
  data.recipes.forEach(recipe => {
    md += `### ${recipe.name}\n`;
    md += `*Prep: ${recipe.prepTime}*\n\n`;
    md += `**Ingredients:**\n`;
    recipe.ingredients.forEach(ing => md += `- ${ing}\n`);
    md += `\n**Instructions:**\n`;
    recipe.instructions.forEach((inst, i) => md += `${i + 1}. ${inst}\n`);
    md += `\n---\n`;
  });

  return md;
};

// --- Print / PDF Generation ---

const getPrintStyles = () => `
  <style>
    body { font-family: 'Helvetica', sans-serif; line-height: 1.5; color: #1c1917; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { border-bottom: 2px solid #059669; padding-bottom: 15px; color: #064e3b; font-size: 24px; margin-bottom: 24px; }
    h2 { margin-top: 30px; color: #065f46; font-size: 18px; border-bottom: 1px solid #e7e5e4; padding-bottom: 8px; }
    h3 { margin-top: 20px; color: #047857; font-size: 16px; font-weight: bold; }
    p { margin-bottom: 12px; font-size: 14px; }
    ul, ol { margin-bottom: 16px; padding-left: 24px; }
    li { margin-bottom: 6px; font-size: 14px; }
    .meta { color: #57534e; font-size: 13px; font-style: italic; margin-bottom: 24px; background: #f5f5f4; padding: 12px; border-radius: 8px; }
    .checkbox { display: inline-block; width: 14px; height: 14px; border: 1px solid #a8a29e; margin-right: 10px; position: relative; top: 2px; border-radius: 3px; }
    .highlight { color: #059669; font-weight: bold; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
`;

const openPrintWindow = (title: string, content: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          ${getPrintStyles()}
        </head>
        <body>
          ${content}
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

export const printRecipe = (recipe: Recipe) => {
  const content = `
    <h1>${recipe.name}</h1>
    <div class="meta">
      <strong>Prep Time:</strong> ${recipe.prepTime} <br/>
    </div>
    
    <h2>Ingredients</h2>
    <ul>
      ${recipe.ingredients.map(ing => `<li><span class="checkbox"></span>${ing}</li>`).join('')}
    </ul>

    <h2>Instructions</h2>
    <ol>
      ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
    </ol>

    ${recipe.tips ? `<div class="meta"><strong>💡 Chef's Tip:</strong> ${recipe.tips}</div>` : ''}
  `;
  openPrintWindow(recipe.name, content);
};

export const printDayPlan = (day: DayPlan, recipe: Recipe | undefined) => {
  const content = `
    <h1>Meal Plan: ${day.day}</h1>
    
    <h2>Schedule</h2>
    <ul>
      <li><strong>☕ Breakfast:</strong> ${day.breakfast}</li>
      <li><strong>☀️ Lunch:</strong> ${day.lunch}</li>
      <li><strong>🌙 Dinner:</strong> ${day.dinner}</li>
    </ul>

    ${recipe ? `
      <hr style="margin: 30px 0; border: 0; border-top: 2px dashed #e7e5e4;" />
      <h1>Dinner Recipe: ${recipe.name}</h1>
      <div class="meta">Prep Time: ${recipe.prepTime}</div>
      <h3>Ingredients</h3>
      <ul>
        ${recipe.ingredients.map(ing => `<li><span class="checkbox"></span>${ing}</li>`).join('')}
      </ul>
      <h3>Instructions</h3>
      <ol>
        ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
      </ol>
    ` : '<p><em>No detailed recipe found for this dinner.</em></p>'}
  `;
  openPrintWindow(`Plan - ${day.day}`, content);
};

export const printShoppingList = (lists: ShoppingListCategory[], budget: string) => {
  const content = `
    <h1>🛒 Shopping List</h1>
    <div class="meta"><strong>Estimated Budget:</strong> ${budget}</div>

    ${lists.map(cat => `
      <h2>📍 ${cat.location}</h2>
      <ul>
        ${cat.items.map(item => `
          <li>
            <span class="checkbox"></span>
            <strong>${item.item}</strong>
            <span style="color: #57534e;">(${item.quantity})</span>
          </li>
        `).join('')}
      </ul>
    `).join('')}
  `;
  openPrintWindow('Shopping List', content);
};

// --- CSV & JSON Export ---

// Helper function to download files
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Export shopping list as CSV
export const exportShoppingListToCSV = (lists: ShoppingListCategory[], name: string = 'shopping-list') => {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${name}-${date}.csv`;

  // CSV Header
  let csv = 'Category,Item,Quantity,Notes\n';

  // Add rows
  lists.forEach(category => {
    category.items.forEach(item => {
      const row = [
        `"${category.location}"`,
        `"${item.item}"`,
        `"${item.quantity}"`,
        `"${item.notes || ''}"`
      ].join(',');
      csv += row + '\n';
    });
  });

  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

// Export plan to JSON
export const exportPlanToJSON = (
  planData: WeeklyPlanData,
  preferences: UserPreferences | null,
  name: string = 'meal-plan'
) => {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${name}-${date}.json`;

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
      planName: name,
    },
    preferences,
    plan: planData,
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, filename, 'application/json');
};

// Export single recipe to JSON
export const exportRecipeToJSON = (recipe: Recipe, name?: string) => {
  const date = new Date().toISOString().split('T')[0];
  const recipeName = name || recipe.name.toLowerCase().replace(/\s+/g, '-');
  const filename = `recipe-${recipeName}-${date}.json`;

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
    },
    recipe,
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, filename, 'application/json');
};

// Export multiple recipes to JSON
export const exportMultipleRecipesToJSON = (recipes: Recipe[], name: string = 'recipes') => {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${name}-${date}.json`;

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
      recipeCount: recipes.length,
    },
    recipes,
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, filename, 'application/json');
};

// Export shopping list to JSON
export const exportListToJSON = (list: ShoppingListCategory[], name: string = 'shopping-list') => {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${name}-${date}.json`;

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
      name,
    },
    shoppingList: list,
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, filename, 'application/json');
};