import { WeeklyPlanData, UserPreferences, DayPlan, Recipe } from "../types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "mistralai/ministral-8b"; // More reliable free model

const makeOpenRouterRequest = async (systemMessage: string, userMessage: string, temperature: number = 0.7) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error("OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env.local with your actual API key from https://openrouter.ai/keys");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "Smart-Meal-Planner",
      "X-Title": "Smart Meal Planner",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`OpenRouter API error (${response.status}): ${response.statusText}. ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || data.choices[0]?.text;
};

export const generateWeeklyPlan = async (prefs: UserPreferences): Promise<WeeklyPlanData> => {
  try {
    const systemInstruction = `
      You are a nutritionist and budget optimization expert living in ${prefs.location}.
      Your mission is to create a weekly meal plan for ${prefs.peopleCount} people.

      USER PREFERENCES:
      - Location: ${prefs.location} (Prioritize local ingredients and markets).
      - Budget: ${prefs.budget} ${prefs.currency} per week (Total for ${prefs.peopleCount} people).
      - Cuisine Style: ${prefs.cuisine || "Local & Modern European Mix"}.
      - Kitchen Equipment Available: ${prefs.equipment.join(', ')}.
      - Dietary Restrictions/Dislikes: ${prefs.restrictions || "None"}.

      MEAL STRUCTURE:
      - Morning: Light and healthy.
      - Noon: Quick snack or leftovers.
      - Evening: Complete, warm, generous dinner.

      OUTPUT FORMAT (JSON ONLY):
      You must return a valid JSON object following exactly this structure, without markdown:
      {
        "metadata": {
          "suggestedName": "Catchy plan name (e.g., 'Italian Week - 50€', 'Budget Student French')",
          "cuisine": "${prefs.cuisine || 'Mixed'}",
          "difficulty": "easy|medium|hard",
          "totalBudget": ${parseFloat(prefs.budget) || 0},
          "currency": "${prefs.currency}",
          "peopleCount": ${prefs.peopleCount},
          "tags": ["tag1", "tag2", "tag3"]
        },
        "weekPlan": [
          { "day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "...", "dinnerRecipeId": "mon-dinner" },
          ... until Sunday
        ],
        "shoppingList": [
          {
            "location": "Local Market",
            "items": [
              {
                "id": "item-1",
                "item": "Tomatoes",
                "quantity": "1kg",
                "estimatedPrice": 3.50,
                "category": "vegetables"
              }
            ],
            "totalEstimated": 15.50
          }
        ],
        "batchCooking": [
          { "step": 1, "instruction": "...", "timeEstimate": "..." }
        ],
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
            "tags": ["cuisine-type", "diet-type"],
            "nutrition": {
              "calories": 450,
              "protein": 20,
              "carbs": 50,
              "fat": 15
            }
          }
          ... a detailed recipe for each dinner of the week.
        ],
        "budgetEstimate": "${prefs.budget} ${prefs.currency}"
      }

      CRITICAL REQUIREMENTS:
      1. Generate unique sequential IDs for shopping list items (item-1, item-2, etc.)
      2. Generate unique sequential IDs for recipe ingredients (ing-1, ing-2, etc.)
      3. Provide realistic price estimates based on ${prefs.location} market prices in ${prefs.currency}
      4. Ensure total shopping list price stays within budget
      5. Add 3-5 relevant tags: cuisine, dietary, characteristics (e.g., ["italian", "vegetarian", "budget-friendly", "quick"])
      6. Calculate approximate nutrition per serving (calories, protein/carbs/fat in g)
      7. Suggest a catchy plan name with cuisine and budget
      8. Use proper units: g, kg, ml, l, pcs, tbsp, tsp, cup
      9. Estimate cooking time separately from prep time
      10. Determine overall difficulty based on recipe complexity
    `;

    const prompt = `
      Create a meal plan for the upcoming week based on the system instructions.
      Target Audience: ${prefs.peopleCount} people.

      Additional Context / Leftovers from previous week:
      "${prefs.context || "No specific leftovers."}"

      Important:
      1. Strictly respect the budget of ${prefs.budget} ${prefs.currency} (Total for the group).
      2. Strictly respect the available equipment: ${prefs.equipment.join(', ')}. Do NOT suggest recipes requiring missing equipment.
      3. Focus on ${prefs.cuisine || "balanced"} cuisine while using local ingredients available in ${prefs.location}.
      4. Avoid: ${prefs.restrictions || "No restrictions"}.
      5. Respond entirely in ENGLISH.
    `;

    const text = await makeOpenRouterRequest(systemInstruction, prompt, 0.7);
    if (!text) throw new Error("No response from OpenRouter");

    return JSON.parse(text) as WeeklyPlanData;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const regenerateDayPlan = async (prefs: UserPreferences, day: string): Promise<{ dayPlan: DayPlan, recipe: Recipe }> => {
  try {
    const systemInstruction = `
      You are a nutritionist expert in ${prefs.location}.
      Regenerate the meal plan for ONE specific day (${day}) for ${prefs.peopleCount} people.

      PREFERENCES:
      - Cuisine Style: ${prefs.cuisine || "General"}.
      - Restrictions: ${prefs.restrictions || "None"}.
      - Equipment: ${prefs.equipment.join(', ')}.

      OUTPUT JSON:
      {
        "dayPlan": { "day": "${day}", "breakfast": "...", "lunch": "...", "dinner": "...", "dinnerRecipeId": "${day.toLowerCase().substring(0,3)}-dinner" },
        "recipe": {
          "id": "${day.toLowerCase().substring(0,3)}-dinner",
          "name": "...",
          "prepTime": "20 min",
          "cookTime": "30 min",
          "servings": ${prefs.peopleCount},
          "difficulty": "easy|medium|hard",
          "ingredients": [
            {
              "id": "ing-1",
              "name": "ingredient name",
              "quantity": "amount",
              "unit": "g|ml|pcs|...",
              "optional": false
            }
          ],
          "instructions": ["..."],
          "tips": "...",
          "tags": ["cuisine-type", "characteristic"],
          "nutrition": {
            "calories": 450,
            "protein": 20,
            "carbs": 50,
            "fat": 15
          }
        }
      }
      Ensure recipe ingredients are scaled for ${prefs.peopleCount} people and include enriched metadata.
    `;

    const prompt = `
      Suggest a NEW menu for ${day}. Different from generic suggestions.
      Make it strictly fit the ${prefs.cuisine} style.
    `;

    const text = await makeOpenRouterRequest(systemInstruction, prompt, 0.85); // Higher temperature for fresh ideas
    if (!text) throw new Error("No response from OpenRouter");

    return JSON.parse(text) as { dayPlan: DayPlan, recipe: Recipe };
  } catch (error) {
    console.error("Error regenerating day:", error);
    throw error;
  }
}
