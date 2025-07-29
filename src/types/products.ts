export interface Product {
  id: string;
  nombre: string;
  fabricante: string;
  fecha: string;
  qr_code_url?: string;
  djc_url?: string;
  certificado_url?: string;
  djc_firmada_url?: string;
  public_id: string;
  cliente_id: string;
  consultor_id?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  cliente?: {
    id: string;
    user_profile?: {
      name?: string;
      email: string;
    };
  };
  consultor?: {
    id: string;
    user_profile?: {
      name?: string;
      email: string;
    };
  };
}

export type ViewMode = 'table' | 'cards' | 'gallery';

export interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  refreshProducts: () => Promise<void>;
}