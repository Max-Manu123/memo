export type Goal = "lose" | "maintain" | "gain";

export type MealAnalysis = {
  calories: { min: number; max: number };
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  confidence: "high" | "medium" | "low";
  assumptions: string[];
};

export type MealRecord = {
  id: string;
  userId: string;
  name: string;
  loggedAt: string;
  analysis: MealAnalysis;
  source: "text" | "photo" | "saved";
  savedMealId?: string;
};
