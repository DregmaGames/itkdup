export interface CertifierProfile {
  id: string;
  user_id: string;
  empresa?: string;
  especialidad?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  user_profile: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export interface ConsultorWithClients {
  id: string;
  user_id: string;
  certificador_id: string;
  empresa?: string;
  especialidad?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  user_profile: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  clientes: ClienteWithProducts[];
}

export interface ClienteWithProducts {
  id: string;
  user_id: string;
  consultor_id: string;
  empresa?: string;
  sector?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  user_profile: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  productos: ProductoBasico[];
}

export interface ProductoBasico {
  id: string;
  nombre: string;
  fabricante: string;
  fecha: string;
  qr_code_url?: string;
  djc_url?: string;
  certificado_url?: string;
  cliente_id: string;
  consultor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface HierarchyNode {
  id: string;
  type: 'certifier' | 'consultant' | 'client' | 'product';
  name: string;
  data: any;
  children?: HierarchyNode[];
  expanded?: boolean;
}

export type DetailModalType = 'certifier' | 'consultant' | 'client' | 'product';

export interface CertifierStats {
  totalConsultants: number;
  totalClients: number;
  totalProducts: number;
  activeConsultants: number;
  activeClients: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}