import React from 'react';
import { Eye, QrCode, FileText, Award, Calendar, Building } from 'lucide-react';
import { Product } from '../../../types/products';

interface CardViewProps {
  products: Product[];
  onProductDetail: (product: Product) => void;
  onShowQR: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const CardView: React.FC<CardViewProps> = ({
  products,
  onProductDetail,
  onShowQR,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Card Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{product.nombre}</h3>
                  <p className="text-sm text-gray-500">ID: {product.id.slice(0, 8)}...</p>
                </div>
              </div>
              
              <div className="flex space-x-1">
                {product.certificado_url && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Certificado disponible"></div>
                )}
                {product.qr_code_url && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="QR disponible"></div>
                )}
                {product.djc_url && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full" title="DJC disponible"></div>
                )}
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>{product.fabricante}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{product.cliente?.user_profile?.name || 'Cliente no asignado'}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(product.fecha)}</span>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-1 min-h-[24px]">
              {product.certificado_url && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Award className="w-3 h-3 mr-1" />
                  Certificado
                </span>
              )}
              {product.qr_code_url && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <QrCode className="w-3 h-3 mr-1" />
                  QR
                </span>
              )}
              {product.djc_url && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <FileText className="w-3 h-3 mr-1" />
                  DJC
                </span>
              )}
              {product.djc_firmada_url && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FileText className="w-3 h-3 mr-1" />
                  Firmada
                </span>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onProductDetail(product)}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>Ver Detalle</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {onEdit && (
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Editar producto"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                {product.qr_code_url && (
                  <button
                    onClick={() => onShowQR(product)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Ver código QR"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                )}
                
                {product.djc_url && (
                  <button
                    onClick={() => openDocument(product.djc_url!)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Ver documento DJC"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                )}
                
                {product.certificado_url && (
                  <button
                    onClick={() => openDocument(product.certificado_url!)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Ver certificado"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                )}
                
                {product.djc_firmada_url && (
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = product.djc_firmada_url!;
                      link.download = `DJC_Firmada_${product.nombre}.pdf`;
                      link.click();
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Descargar DJC firmada"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};