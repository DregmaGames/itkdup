import { DJCPermissions } from '../types/djc';

export const getDJCPermissions = (userRole: string, isOwnProduct: boolean = false): DJCPermissions => {
  switch (userRole) {
    case 'Admin':
      return {
        canView: true,
        canGenerate: true,
        canDownload: true
      };
    case 'Cert':
      return {
        canView: true,
        canGenerate: true,
        canDownload: true
      };
    case 'Consultor':
      return {
        canView: true,
        canGenerate: false, // Solo lectura
        canDownload: true
      };
    case 'Cliente':
      return {
        canView: isOwnProduct,
        canGenerate: isOwnProduct,
        canDownload: isOwnProduct
      };
    default:
      return {
        canView: false,
        canGenerate: false,
        canDownload: false
      };
  }
};