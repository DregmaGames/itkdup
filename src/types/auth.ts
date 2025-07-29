export interface User {
  id: string;
  email: string;
  role: 'Admin' | 'Cert' | 'Consultor' | 'Cliente';
  name?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOTP: (email: string, otp: string) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  loginDirect?: (role?: 'Admin' | 'Cert' | 'Consultor' | 'Cliente') => void;
}

export interface LoginStep {
  step: 'email' | 'otp' | 'password';
  email?: string;
}