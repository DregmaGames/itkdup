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
  company_name?: string;
  description?: string;
  specialties?: string[];
  contact_info?: any;
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
    company_name?: string;
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
  company_name?: string;
  sector?: string;
  contact_info?: any;
  address?: string;
  firma_png_url?: string;
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
    company_name?: string;
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
  company_name?: string;
  description?: string;
  specialties?: string[];
  contact_info?: any;
  address?: string;
  sector?: string;
  firma_png_url?: string;
  // Relaciones
  certificador_id?: string;
  consultor_id?: string;
}