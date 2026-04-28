export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "employee";
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSuccessPayload {
  token: string;
  user: AuthUser;
}
