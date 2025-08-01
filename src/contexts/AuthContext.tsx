import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthContextType } from '../types/auth';

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
  const [isLoading, setIsLoading] = useState(false);

  const mapSupabaseUserToUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error || !profile) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.name,
        avatar: profile.avatar,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };
    } catch (error) {
      console.error('Error mapping user:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const mappedUser = await mapSupabaseUserToUser(data.user);
        setUser(mappedUser);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const loginWithOTP = async (email: string, otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      if (data.user) {
        const mappedUser = await mapSupabaseUserToUser(data.user);
        setUser(mappedUser);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al verificar el código');
    }
  };

  const sendOTP = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Error al enviar el código');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Función para login directo (bypass) - útil para demo
  const loginDirect = async (role: 'Admin' | 'Cert' | 'Consultor' | 'Cliente' = 'Admin') => {
    try {
      // Mapear rol a email específico
      const emailMap = {
        'Admin': 'admin@demo.modularapp.com',
        'Cert': 'cert@demo.modularapp.com',
        'Consultor': 'consultor@demo.modularapp.com',
        'Cliente': 'cliente@demo.modularapp.com'
      };
      
      const email = emailMap[role];
      const password = 'demo123';
      
      console.log('Login directo como:', email);

      // Usar login real de Supabase Auth
      await login(email, password);
      
    } catch (error: any) {
      console.error('Error en login directo:', error);
      throw new Error(error.message || 'Error al acceder como usuario demo');
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const mappedUser = await mapSupabaseUserToUser(session.user);
        setUser(mappedUser);
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

  // Escuchar cambios en la autenticación de Supabase
  useEffect(() => {
    checkAuth();
    
    // Escuchar cambios de autenticación de Supabase (para login real)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        
        if (session?.user) {
          try {
            const mappedUser = await mapSupabaseUserToUser(session.user);
            setUser(mappedUser);
          } catch (error) {
            console.error('Error mapping user:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    loginWithOTP,
    sendOTP,
    logout: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
      } catch (error) {
        console.error('Error logging out:', error);
      }
    },
    checkAuth,
    loginDirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};