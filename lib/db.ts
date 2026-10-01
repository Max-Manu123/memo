import type { Goal, MealRecord } from "./types";

export type Profile = {
  userId: string;
  firstName: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  goal: Goal;
};

export type DbAdapter = {
  getProfile(userId: string): Promise<Profile | null>;
  saveProfile(profile: Profile): Promise<void>;
  listMeals(userId: string): Promise<MealRecord[]>;
  createMeal(meal: MealRecord): Promise<void>;
};

export const db: DbAdapter = {
  async getProfile() { return null; },
  async saveProfile() {},
  async listMeals() { return []; },
  async createMeal() {},
};
