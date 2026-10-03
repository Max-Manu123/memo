export type AuthUser = {
  id: string;
  email: string;
};

export type SignUpInput = {
  email: string;
  password: string;
};

export type SignInInput = SignUpInput;

export type AuthAdapter = {
  signUp(input: SignUpInput): Promise<AuthUser>;
  signIn(input: SignInInput): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  resetPassword(email: string): Promise<void>;
};

export const auth: AuthAdapter = {
  async signUp() {
    throw new Error("Auth provider not configured. Connect Supabase before using authentication.");
  },
  async signIn() {
    throw new Error("Auth provider not configured. Connect Supabase before using authentication.");
  },
  async signOut() {
    throw new Error("Auth provider not configured. Connect Supabase before using authentication.");
  },
  async getCurrentUser() {
    return null;
  },
};
