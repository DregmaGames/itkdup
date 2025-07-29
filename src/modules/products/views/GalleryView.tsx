import React from 'react';
import { Eye, QrCode, FileText, Award, Calendar, Building } from 'lucide-react';
import { Product } from '../../../types/products';

interface GalleryViewProps {
  products: Product[];
  onProductDetail: (product: Product) => void;
  onShowQR: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
        >
          {/* Gallery Item Header */}
          <div className="p-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{product.nombre}</h3>
            <p className="text-xs text-gray-500">{product.fabricante}</p>
          </div>

          {/* Document Icons Grid */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {/* QR Code */}
              <button
                onClick={() => product.qr_code_url && onShowQR(product)}
                disabled={!product.qr_code_url}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                  product.qr_code_url
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                title={product.qr_code_url ? 'Ver código QR' : 'QR no disponible'}
              >
                <QrCode className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">QR</span>
              </button>

              {/* DJC Document */}
              <button
                onClick={() => product.djc_url && openDocument(product.djc_url)}
                disabled={!product.djc_url}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                  product.djc_url
                    ? 'bg-purple-50 text-purple-600 hover:bg-purple-100 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                title={product.djc_url ? 'Ver documento DJC' : 'DJC no disponible'}
              >
                <FileText className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">DJC</span>
              </button>

              {/* Certificate */}
              <button
                onClick={() => product.certificado_url && openDocument(product.certificado_url)}
                disabled={!product.certificado_url}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                  product.certificado_url
                    ? 'bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                title={product.certificado_url ? 'Ver certificado' : 'Certificado no disponible'}
              >
                <Award className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Cert</span>
              </button>
              
              {/* DJC Firmada */}
              <button
                onClick={() => product.djc_firmada_url && (() => {
                  const link = document.createElement('a');
                  link.href = product.djc_firmada_url!;
                  link.download = `DJC_Firmada_${product.nombre}.pdf`;
                  link.click();
                })()}
                disabled={!product.djc_firmada_url}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                  product.djc_firmada_url
                    ? 'bg-purple-50 text-purple-600 hover:bg-purple-100 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                title={product.djc_firmada_url ? 'Descargar DJC firmada' : 'DJC firmada no disponible'}
              >
                <FileText className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Firmada</span>
              </button>
            </div>

            {/* Product Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(product.fecha)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Building className="w-3 h-3" />
                <span className="truncate">{product.fabricante}</span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex justify-center space-x-1 mb-3">
              {product.certificado_url && (
                <div className="w-2 h-2 bg-green-500 rounded-full" title="Certificado disponible"></div>
              )}
              {product.qr_code_url && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" title="QR disponible"></div>
              )}
              {product.djc_url && (
                <div className="w-2 h-2 bg-purple-500 rounded-full" title="DJC disponible"></div>
              )}
              {!product.certificado_url && !product.qr_code_url && !product.djc_url && (
                <div className="w-2 h-2 bg-gray-300 rounded-full" title="Sin documentos"></div>
              )}
            </div>

            {/* Detail Button */}
            <button
              onClick={() => onProductDetail(product)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Detalle</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};