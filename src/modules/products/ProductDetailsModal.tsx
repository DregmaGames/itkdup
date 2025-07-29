import React from 'react';
import { X, Calendar, Building, User, FileText, Award, QrCode, ExternalLink, Copy, Upload, Edit, Download } from 'lucide-react';
import { Product } from '../../types/products';
import { DJCDocumentUpload } from './components/DJCDocumentUpload';
import { CertificateUpload } from './components/CertificateUpload';
import { getDocumentPermissions } from '../../utils/permissions';
import { useAuth } from '../../contexts/AuthContext';

interface ProductDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit
}) => {
  const { user } = useAuth();
  const permissions = getDocumentPermissions(user?.role || '');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDJCUploadSuccess = async (url: string) => {
    // Aquí harías la llamada real a Supabase para actualizar el producto
    try {
      // Simular actualización en base de datos
      console.log('Updating DJC URL:', url);
      
      // Si tienes la función onUpdate, puedes usarla
      if (onUpdate) {
        onUpdate({ ...product, djc_url: url });
      }
    } catch (error) {
      console.error('Error updating DJC:', error);
    }
  };

  const handleDJCDeleteSuccess = async () => {
    try {
      console.log('Deleting DJC');
      
      if (onUpdate) {
        onUpdate({ ...product, djc_url: undefined });
      }
    } catch (error) {
      console.error('Error deleting DJC:', error);
    }
  };

  const handleCertificateUploadSuccess = async (url: string) => {
    try {
      console.log('Updating Certificate URL:', url);
      
      if (onUpdate) {
        onUpdate({ ...product, certificado_url: url });
      }
    } catch (error) {
      console.error('Error updating Certificate:', error);
    }
  };

  const handleCertificateDeleteSuccess = async () => {
    try {
      console.log('Deleting Certificate');
      
      if (onUpdate) {
        onUpdate({ ...product, certificado_url: undefined });
      }
    } catch (error) {
      console.error('Error deleting Certificate:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{product.nombre}</h2>
              <p className="text-gray-500">Detalles del producto</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium text-gray-900">{product.nombre}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fabricante</p>
                  <p className="font-medium text-gray-900">{product.fabricante}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fecha del Producto</p>
                  <p className="font-medium text-gray-900">{formatDate(product.fecha)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">ID del Producto</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 font-mono text-sm">{product.id.slice(0, 8)}...</p>
                    <button
                      onClick={() => copyToClipboard(product.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Código QR</h3>
                  <p className="text-sm text-gray-600">Identificador único del producto</p>
                </div>
              </div>
              {product.qr_code_url && (
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Disponible
                </span>
              )}
            </div>
            
            {product.qr_code_url ? (
              <div className="flex items-center space-x-3">
                <div className="flex-1 p-3 bg-white rounded-lg border">
                  <p className="text-sm text-gray-600">QR Code generado y disponible</p>
                </div>
                <button
                  onClick={() => openDocument(product.qr_code_url!)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver QR</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-center text-gray-500">Código QR no disponible</p>
              </div>
            )}
          </div>

          {/* DJC Firmada Section */}
          {product.djc_firmada_url && (
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">DJC Firmada</h3>
                    <p className="text-sm text-gray-600">Documento firmado digitalmente</p>
                  </div>
                </div>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Disponible
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-1 p-3 bg-white rounded-lg border">
                  <p className="text-sm text-gray-600">DJC firmada digitalmente disponible</p>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = product.djc_firmada_url!;
                    link.download = `DJC_Firmada_${product.nombre}.pdf`;
                    link.click();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>
          )}

          {/* Documents Management Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gestión de Documentos</h3>
                <p className="text-sm text-gray-600">Subir y gestionar documentos del producto</p>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* DJC Document Upload */}
              <DJCDocumentUpload
                productId={product.id}
                productName={product.nombre}
                currentDocumentUrl={product.djc_url}
                permissions={permissions}
                onUploadSuccess={handleDJCUploadSuccess}
                onDeleteSuccess={handleDJCDeleteSuccess}
              />
            </div>
          </div>

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Creado</p>
                <p className="font-medium text-gray-900">{formatDateTime(product.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última actualización</p>
                <p className="font-medium text-gray-900">{formatDateTime(product.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-right text-sm text-gray-500">
              <p>Permisos: {user?.role}</p>
              <p>
                {permissions.canView && 'Ver '}
                {permissions.canUpload && 'Subir '}
                {permissions.canDelete && 'Eliminar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors ml-4"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};