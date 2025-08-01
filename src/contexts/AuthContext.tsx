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
  const [isLoading, setIsLoading] = useState(true);

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

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
        return;
      }

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
      setIsLoading(true);
      
      // Buscar un usuario demo con el rol especificado
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', role)
        .like('email', '%demo@modularapp.com')
        .limit(1);

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        
        // Crear sesión ficticia para el usuario demo
        const demoUser: User = {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          name: profile.name,
          avatar: profile.avatar,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        };

        setUser(demoUser);
        
        // Guardar en localStorage para persistencia temporal
        localStorage.setItem('demo-user', JSON.stringify(demoUser));
      } else {
        throw new Error(`No se encontró usuario demo con rol ${role}`);
      }
    } catch (error: any) {
      console.error('Error en login directo:', error);
      throw new Error(error.message || 'Error al acceder como usuario demo');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para restaurar sesión demo desde localStorage
  const restoreDemoSession = async () => {
    try {
      const storedUser = localStorage.getItem('demo-user');
      if (storedUser) {
        const demoUser = JSON.parse(storedUser);
        
        // Verificar que el usuario demo aún existe en la base de datos
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', demoUser.id)
          .single();

        if (!error && profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            role: profile.role,
            name: profile.name,
            avatar: profile.avatar,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          });
          return;
        } else {
          // Usuario demo no existe, limpiar localStorage
          localStorage.removeItem('demo-user');
        }
      }
    } catch (error) {
      console.error('Error restoring demo session:', error);
      localStorage.removeItem('demo-user');
    }
  };

  // Escuchar cambios en la autenticación de Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const mappedUser = await mapSupabaseUserToUser(session.user);
          setUser(mappedUser);
        } else {
          // Si no hay sesión de Supabase, intentar restaurar sesión demo
          await restoreDemoSession();
          if (!localStorage.getItem('demo-user')) {
            setUser(null);
          }
        }
        setIsLoading(false);
      }
    );

    // Verificar sesión inicial
    checkAuth();

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    loginWithOTP,
    sendOTP,
    logout: async () => {
      localStorage.removeItem('demo-user');
      await logout();
    },
    checkAuth,
    loginDirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};