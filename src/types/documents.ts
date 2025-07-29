export interface ProductDocument {
  id: string;
  product_id: string;
  type: 'djc' | 'certificate';
  filename: string;
  file_url: string;
  file_size: number;
  status: 'uploaded' | 'missing' | 'pending' | 'expired';
  uploaded_by: string;
  uploaded_at: string;
  expires_at?: string;
}

export interface DocumentUploadConfig {
  type: 'djc' | 'certificate';
  maxSizeBytes: number;
  allowedTypes: string[];
  title: string;
  description: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export type DocumentStatus = 'uploaded' | 'missing' | 'pending' | 'expired';

export interface UserPermissions {
  canView: boolean;
  canUpload: boolean;
  canDelete: boolean;
}