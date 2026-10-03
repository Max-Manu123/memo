import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { AuthAdapter, AuthUser, SignInInput, SignUpInput } from "./auth";

export const supabaseAuth: AuthAdapter = {
  async signUp(input: SignUpInput): Promise<AuthUser> {
    const { data, error } = await getSupabase().auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("No user was returned after sign up.");
    return { id: data.user.id, email: data.user.email ?? input.email, emailConfirmed: Boolean(data.user.email_confirmed_at) };
  },

  async signIn(input: SignInInput): Promise<AuthUser> {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("No user was returned after sign in.");
    return { id: data.user.id, email: data.user.email ?? input.email, emailConfirmed: Boolean(data.user.email_confirmed_at) };
  },

  async signOut(): Promise<void> {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await getSupabase().auth.getUser();
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? "", emailConfirmed: Boolean(data.user.email_confirmed_at) };
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` });
    if (error) throw error;
  },
};
