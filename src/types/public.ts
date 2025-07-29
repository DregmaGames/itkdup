export interface PublicProduct {
  public_id: string;
  nombre: string;
  fabricante: string;
  fecha: string;
  qr_code_url?: string;
  djc_url?: string;
  certificado_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicViewConfig {
  companyName: string;
  companyLogo?: string;
  supportEmail: string;
  disclaimer: string;
  privacyPolicy?: string;
}

export interface DocumentViewerState {
  isOpen: boolean;
  documentUrl: string;
  documentType: 'djc' | 'certificate';
  documentTitle: string;
}