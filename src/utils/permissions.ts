import { UserPermissions } from '../types/documents';

export const getDocumentPermissions = (userRole: string): UserPermissions => {
  switch (userRole) {
    case 'Admin':
      return {
        canView: true,
        canUpload: true,
        canDelete: true
      };
    case 'Cert':
      return {
        canView: true,
        canUpload: true,
        canDelete: true
      };
    case 'Consultor':
      return {
        canView: true,
        canUpload: true,
        canDelete: false
      };
    case 'Cliente':
      return {
        canView: true,
        canUpload: false,
        canDelete: false
      };
    default:
      return {
        canView: false,
        canUpload: false,
        canDelete: false
      };
  }
};

export const canUserAccessProduct = (userRole: string, userId: string, product: any): boolean => {
  switch (userRole) {
    case 'Admin':
    case 'Cert':
      return true;
    case 'Consultor':
      return product.consultor_id === userId;
    case 'Cliente':
      return product.cliente_id === userId;
    default:
      return false;
  }
};