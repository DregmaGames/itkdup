export interface Certificador {
  id: string;
  user_id: string;
  empresa?: string;
  especialidad?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Datos del user_profile
  user_profile?: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export interface Consultor {
  id: string;
  user_id: string;
  certificador_id?: string;
  empresa?: string;
  especialidad?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Datos del user_profile
  user_profile?: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  // Datos del certificador
  certificador?: {
    id: string;
    empresa?: string;
    user_profile?: {
      name?: string;
      email: string;
    };
  };
}

export interface Cliente {
  id: string;
  user_id: string;
  consultor_id?: string;
  empresa?: string;
  sector?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Datos del user_profile
  user_profile?: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  // Datos del consultor
  consultor?: {
    id: string;
    empresa?: string;
    user_profile?: {
      name?: string;
      email: string;
    };
  };
}

export type AdminEntity = Certificador | Consultor | Cliente;
export type AdminEntityType = 'certificadores' | 'consultores' | 'clientes' | 'productos' | 'admin_users';

export interface CreateUserFormData {
  email: string;
  name: string;
  role: 'Admin' | 'Cert' | 'Consultor' | 'Cliente';
  empresa?: string;
  especialidad?: string;
  telefono?: string;
  direccion?: string;
  // Para clientes
  cuit?: string;
  razon_social?: string;
  nombre_comercial?: string;
  sector?: string;
  // Relaciones
  certificador_id?: string;
  consultor_id?: string;
}