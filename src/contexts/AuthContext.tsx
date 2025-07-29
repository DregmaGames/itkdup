import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';

// Simple UUID generation function
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simular un usuario admin para pruebas
  const simulateAdminUser = (): User => ({
    id: generateUUID(),
    email: 'admin@test.com',
    role: 'Admin',
    name: 'Administrador Temporal',
    avatar: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Simular un pequeño delay para mostrar el loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar si ya hay un usuario en localStorage
      const storedUser = localStorage.getItem('temp-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simular login exitoso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let mockUser: User;
      
      // Simular diferentes roles según el email
      if (email.includes('admin')) {
        mockUser = simulateAdminUser();
      } else if (email.includes('cert')) {
        mockUser = {
          ...simulateAdminUser(),
          role: 'Cert',
          email: email,
          name: 'Certificador Temporal'
        };
      } else if (email.includes('consultor')) {
        mockUser = {
          ...simulateAdminUser(),
          role: 'Consultor',
          email: email,
          name: 'Consultor Temporal'
        };
      } else {
        mockUser = {
          ...simulateAdminUser(),
          role: 'Cliente',
          email: email,
          name: 'Cliente Temporal'
        };
      }
      
      localStorage.setItem('temp-user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithOTP = async (email: string, otp: string) => {
    // Redirigir al login normal para simplificar
    return login(email, 'temp-password');
  };

  const sendOTP = async (email: string) => {
    // Simular envío de OTP
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const logout = async () => {
    localStorage.removeItem('temp-user');
    setUser(null);
  };

  // Función para login directo (bypass)
  const loginDirect = (role: 'Admin' | 'Cert' | 'Consultor' | 'Cliente' = 'Admin') => {
    const mockUser: User = {
      id: generateUUID(),
      email: `${role.toLowerCase()}@test.com`,
      role: role,
      name: `${role} Temporal`,
      avatar: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('temp-user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    loginWithOTP,
    sendOTP,
    logout,
    checkAuth,
    loginDirect, // Añadimos la función de login directo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};