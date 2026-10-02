import type { Goal, MealRecord } from "./types";

export type Profile = {
  userId: string;
  firstName: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  goal: Goal;
};

export type SavedMeal = {
  id: string;
  userId: string;
  name: string;
  analysis: MealRecord["analysis"];
  useCount: number;
  lastUsedAt?: string;
};

export type DbAdapter = {
  getProfile(userId: string): Promise<Profile | null>;
  saveProfile(profile: Profile): Promise<void>;
  listMeals(userId: string): Promise<MealRecord[]>;
  createMeal(meal: MealRecord): Promise<void>;
  listSavedMeals(userId: string): Promise<SavedMeal[]>;
  saveMeal(savedMeal: SavedMeal): Promise<void>;
  updateSavedMeal(savedMeal: SavedMeal): Promise<void>;
};

export const db: DbAdapter = {
  async getProfile() { return null; },
  async saveProfile() {},
  async listMeals() { return []; },
  async createMeal() {},
  async listSavedMeals() { return []; },
  async saveMeal() {},
  async updateSavedMeal() {},
};
