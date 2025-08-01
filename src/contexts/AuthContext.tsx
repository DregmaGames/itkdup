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
      // Limpiar demo session
      console.log('Cerrando sesión...');
      localStorage.removeItem('demoUser');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('Error al cerrar sesión de Supabase (ignorado):', error);
      }
      setUser(null);
      console.log('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error logging out:', error);
      setUser(null); // Asegurar logout even if error
    }
  };

  // Función para login directo (bypass) - útil para demo
  const loginDirect = async (role: 'Admin' | 'Cert' | 'Consultor' | 'Cliente' = 'Admin') => {
    // Crear usuario demo directamente sin autenticación real
    const emailMap = {
      'Admin': 'admin@demo.modularapp.com',
      'Cert': 'cert@demo.modularapp.com',
      'Consultor': 'consultor@demo.modularapp.com',
      'Cliente': 'cliente@demo.modularapp.com'
    };
    
    const email = emailMap[role];
    const demoUser: User = {
      id: crypto.randomUUID(),
      email: email,
      role: role,
      name: `Usuario ${role} Demo`,
      avatar: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setUser(demoUser);
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    console.log('Usuario demo creado:', demoUser);
  };

  const checkAuth = async () => {
    setIsLoading(true);
    
    try {
      // Verificar demo session primero (sincrono)
      const demoUserData = localStorage.getItem('demoUser');
      if (demoUserData) {
        try {
          const demoUser = JSON.parse(demoUserData);
          setUser(demoUser);
          return;
        } catch (error) {
          console.error('Error parsing demo user:', error);
          localStorage.removeItem('demoUser');
        }
      }
      
      // Si no hay demo session, verificar Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Supabase session:', session ? 'encontrada' : 'no encontrada');
      
      if (session?.user) {
        const mappedUser = await mapSupabaseUserToUser(session.user);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Escuchar cambios en la autenticación de Supabase
  useEffect(() => {
    console.log('AuthProvider: iniciando...');
    checkAuth();
    
    // Escuchar cambios de autenticación de Supabase (para login real)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'con sesión' : 'sin sesión');
        
        // Solo actuar si no hay demo session activa
        const hasDemoSession = localStorage.getItem('demoUser');
        if (hasDemoSession) {
          console.log('Demo session activa, ignorando auth change');
          return;
        }
        
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