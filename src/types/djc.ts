export interface ProductoDJC {
  id: string;
  nombre: string;
  modelo?: string;
  marca?: string;
  fabricante: string;
  domicilio_fabricante?: string;
  identificacion?: string;
  caracteristicas_tecnicas?: string;
  capacidades_limitaciones?: string;
  materiales?: string;
  created_at: string;
  cliente_id: string;
  djc_firmada_url?: string;
  user_profile?: {
    id: string;
    name?: string;
    email: string;
    firma_png_url?: string;
  };
}

export interface DJCTemplate {
  empresa: string;
  producto: string;
  modelo: string;
  marca: string;
  fabricante: string;
  domicilioFabricante: string;
  identificacion: string;
  caracteristicasTecnicas: string;
  capacidadesLimitaciones: string;
  materiales: string;
  fechaFirma: string;
  nombreFirmante: string;
  firmaUrl: string;
}

export interface DJCPermissions {
  canView: boolean;
  canGenerate: boolean;
  canDownload: boolean;
}

export type DJCStatus = 'pending' | 'signed' | 'downloaded';