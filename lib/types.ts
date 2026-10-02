export type Goal = "lose" | "maintain" | "gain";

export type MealSource = "text" | "photo" | "saved";
export type ConfidenceLevel = "high" | "medium" | "low";

export type MealAnalysis = {
  calories: { min: number; max: number };
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  confidence: ConfidenceLevel;
  assumptions: string[];
};

export type MealRecord = {
  id: string;
  userId: string;
  name: string;
  loggedAt: string;
  analysis: MealAnalysis;
  source: MealSource;
  savedMealId?: string;
};

export type SavedMeal = {
  id: string;
  userId: string;
  name: string;
  analysis: MealAnalysis;
  useCount: number;
  lastUsedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};
