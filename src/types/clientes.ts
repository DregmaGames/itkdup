export interface Cliente {
  id: string;
  user_id: string;
  consultor_id?: string;
  company_name: string;
  sector?: string;
  contact_info?: any;
  address?: string;
  firma_png_url?: string;
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
    company_name?: string;
    user_profile?: {
      name?: string;
      email: string;
    };
  };
  productos?: Array<{
    id: string;
    name: string;
    brand: string;
    created_at: string;
    qr_code_url?: string;
    djc_document_url?: string;
    certificate_url?: string;
  }>;
}

export interface CreateClienteData {
  email: string;
  name: string;
  company_name: string;
  sector?: string;
  contact_info?: any;
  address?: string;
  firma_png_url?: string;
}

export interface UpdateClienteData {
  company_name?: string;
  sector?: string;
  contact_info?: any;
  address?: string;
  firma_png_url?: string;
}

export type ClienteViewMode = 'table' | 'cards';

export interface ClienteFilters {
  search: string;
  sector: string;
  consultor_id: string;
}