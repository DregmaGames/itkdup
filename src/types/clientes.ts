export interface Cliente {
  id: string;
  user_id: string;
  consultor_id?: string;
  cuit?: string;
  razon_social?: string;
  nombre_comercial?: string;
  empresa?: string;
  sector?: string;
  telefono?: string;
  direccion?: string;
  avatar?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  user_profile?: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  consultor?: {
    id: string;
    empresa?: string;
    user_profile?: {
      name?: string;
      email: string;
    };
  };
  productos?: Array<{
    id: string;
    nombre: string;
    fabricante: string;
    fecha: string;
    qr_code_url?: string;
    djc_url?: string;
    certificado_url?: string;
  }>;
}

export interface CreateClienteData {
  cuit: string;
  razon_social: string;
  nombre_comercial?: string;
  email: string;
  name: string;
  empresa?: string;
  sector?: string;
  telefono?: string;
  direccion?: string;
  avatar?: string;
}

export interface UpdateClienteData {
  cuit?: string;
  razon_social?: string;
  nombre_comercial?: string;
  empresa?: string;
  sector?: string;
  telefono?: string;
  direccion?: string;
  avatar?: string;
  activo?: boolean;
}

export type ClienteViewMode = 'table' | 'cards';

export interface ClienteFilters {
  search: string;
  sector: string;
  activo: boolean | null;
  consultor_id: string;
}