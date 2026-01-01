import { GoogleGenAI } from "@google/genai";
import { WeeklyPlanData, UserPreferences, DayPlan, Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.85, // Higher temperature for fresh ideas
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as { dayPlan: DayPlan, recipe: Recipe };
  } catch (error) {
    console.error("Error regenerating day:", error);
    throw error;
  }
}