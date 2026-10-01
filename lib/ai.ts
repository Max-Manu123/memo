import type { MealAnalysis } from "./types";

export type AnalyzeMealInput = {
  description?: string;
  imageUrl?: string;
  knownMealContext?: string;
};

export async function analyzeMeal(_input: AnalyzeMealInput): Promise<MealAnalysis> {
  return {
    calories: { min: 540, max: 610 },
    proteinGrams: 31,
    carbsGrams: 56,
    fatGrams: 18,
    confidence: "medium",
    assumptions: ["portion size is approximate"],
  };
}
