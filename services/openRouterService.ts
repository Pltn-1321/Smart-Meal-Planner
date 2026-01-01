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
        "weekPlan": [
          { "day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "...", "dinnerRecipeId": "mon-dinner" },
          ... until Sunday
        ],
        "shoppingList": [
          { "location": "Local Market", "items": [{ "item": "...", "quantity": "..." }] },
          { "location": "Supermarket", "items": [{ "item": "...", "quantity": "..." }] }
        ],
        "batchCooking": [
          { "step": 1, "instruction": "...", "timeEstimate": "..." }
        ],
        "recipes": [
          { "id": "mon-dinner", "name": "...", "prepTime": "...", "ingredients": ["..."], "instructions": ["..."], "tips": "..." }
          ... a detailed recipe for each dinner of the week. Ensure ingredient quantities are sufficient for ${prefs.peopleCount} people.
        ],
        "budgetEstimate": "XXX ${prefs.currency}"
      }
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
        "recipe": { "id": "${day.toLowerCase().substring(0,3)}-dinner", "name": "...", "prepTime": "...", "ingredients": ["..."], "instructions": ["..."], "tips": "..." }
      }
      Ensure recipe ingredients are scaled for ${prefs.peopleCount} people.
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
