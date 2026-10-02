import { getSupabase } from "./supabase";
import type { DbAdapter, Profile } from "./db";
import type { MealRecord, SavedMeal } from "./types";

function toMeal(row: Record<string, unknown>): MealRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    loggedAt: String(row.logged_at),
    source: row.source as MealRecord["source"],
    savedMealId: row.saved_meal_id ? String(row.saved_meal_id) : undefined,
    analysis: {
      calories: {
        min: Number(row.calories_min ?? 0),
        max: Number(row.calories_max ?? 0),
      },
      proteinGrams: Number(row.protein_grams ?? 0),
      carbsGrams: Number(row.carbs_grams ?? 0),
      fatGrams: Number(row.fat_grams ?? 0),
      confidence: (row.confidence ?? "medium") as MealRecord["analysis"]["confidence"],
      assumptions: Array.isArray(row.assumptions) ? row.assumptions.map(String) : [],
    },
  };
}

function toSavedMeal(row: Record<string, unknown>): SavedMeal {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    analysis: row.analysis as SavedMeal["analysis"],
    useCount: Number(row.use_count ?? 0),
    lastUsedAt: row.last_used_at ? String(row.last_used_at) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export const supabaseDb: DbAdapter = {
  async getProfile(userId) {
    const { data, error } = await getSupabase()
      .from("profiles")
      .select("id, first_name, age, weight_kg, height_cm, goal, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      userId: data.id,
      firstName: data.first_name,
      age: data.age ?? undefined,
      weightKg: data.weight_kg ?? undefined,
      heightCm: data.height_cm ?? undefined,
      goal: data.goal as Profile["goal"],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async saveProfile(profile) {
    const { error } = await getSupabase().from("profiles").upsert({
      id: profile.userId,
      first_name: profile.firstName,
      age: profile.age ?? null,
      weight_kg: profile.weightKg ?? null,
      height_cm: profile.heightCm ?? null,
      goal: profile.goal,
    });
    if (error) throw error;
  },

  async listMeals(userId) {
    const { data, error } = await getSupabase()
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toMeal);
  },

  async createMeal(meal) {
    const { error } = await getSupabase().from("meals").insert({
      id: meal.id,
      user_id: meal.userId,
      name: meal.name,
      logged_at: meal.loggedAt,
      source: meal.source,
      calories_min: meal.analysis.calories.min,
      calories_max: meal.analysis.calories.max,
      protein_grams: meal.analysis.proteinGrams,
      carbs_grams: meal.analysis.carbsGrams,
      fat_grams: meal.analysis.fatGrams,
      confidence: meal.analysis.confidence,
      assumptions: meal.analysis.assumptions,
      saved_meal_id: meal.savedMealId ?? null,
    });
    if (error) throw error;
  },

  async listSavedMeals(userId) {
    const { data, error } = await getSupabase()
      .from("saved_meals")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toSavedMeal);
  },

  async saveMeal(savedMeal) {
    const { error } = await getSupabase().from("saved_meals").insert({
      id: savedMeal.id,
      user_id: savedMeal.userId,
      name: savedMeal.name,
      analysis: savedMeal.analysis,
      use_count: savedMeal.useCount,
      last_used_at: savedMeal.lastUsedAt ?? null,
    });
    if (error) throw error;
  },

  async updateSavedMeal(savedMeal) {
    const { error } = await getSupabase()
      .from("saved_meals")
      .update({
        name: savedMeal.name,
        analysis: savedMeal.analysis,
        use_count: savedMeal.useCount,
        last_used_at: savedMeal.lastUsedAt ?? null,
      })
      .eq("id", savedMeal.id)
      .eq("user_id", savedMeal.userId);

    if (error) throw error;
  },
};
