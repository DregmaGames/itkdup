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
      // Buscar cualquier usuario con el rol especificado
      console.log('Buscando usuario demo con rol:', role);
      
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', role)
        .limit(1);

      if (error) {
        console.error('Error en consulta:', error);
        throw error;
      }

      console.log('Usuarios encontrados:', profiles);

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
        
        console.log('Usuario demo logueado exitosamente:', demoUser);
      } else {
        console.log('No se encontró usuario con rol:', role);
        throw new Error(`No se encontró usuario con rol ${role}`);
      }
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
        // Verificar si hay sesión demo guardada
        const storedUser = localStorage.getItem('demo-user');
        if (storedUser) {
          try {
            const demoUser = JSON.parse(storedUser);
            setUser(demoUser);
          } catch {
            localStorage.removeItem('demo-user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
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
    // Verificar estado inicial sin loading
    const storedUser = localStorage.getItem('demo-user');
    if (storedUser) {
      try {
        const demoUser = JSON.parse(storedUser);
        console.log('Demo user restored on mount:', demoUser.email, demoUser.role);
        setUser(demoUser);
      } catch {
        localStorage.removeItem('demo-user');
        setUser(null);
      }
    }
    
    // Escuchar cambios de autenticación de Supabase (para login real)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        
        if (session?.user) {
          try {
            const mappedUser = await mapSupabaseUserToUser(session.user);
            setUser(mappedUser);
            }
          } catch (error) {
            console.error('Error mapping user:', error);
        // Para logout, no hacer nada aquí, se maneja en logout()
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
      localStorage.removeItem('demo-user');
      setUser(null);
      await logout();
    },
    checkAuth,
    loginDirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};