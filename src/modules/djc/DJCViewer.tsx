import React from 'react';
import { X, FileText, User, Building, Calendar, PenTool } from 'lucide-react';
import { ProductoDJC } from '../../types/djc';

interface DJCViewerProps {
  product: ProductoDJC;
  isOpen: boolean;
  onClose: () => void;
}

export const DJCViewer: React.FC<DJCViewerProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Vista Previa - DJC</h2>
              <p className="text-gray-500">{product.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Preview */}
        <div className="p-8 max-w-3xl mx-auto">
          {/* Document Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              DECLARACIÓN JURADA DE CONFORMIDAD
            </h1>
            <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
          </div>

          {/* Company Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-purple-600" />
              EMPRESA SOLICITANTE
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">
                {product.user_profile?.name || 'Empresa no especificada'}
              </p>
              <p className="text-gray-600">{product.user_profile?.email}</p>
            </div>
          </div>

          {/* Product Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              INFORMACIÓN DEL PRODUCTO
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Producto:</label>
                  <p className="font-medium text-gray-900">{product.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fabricante:</label>
                  <p className="font-medium text-gray-900">{product.fabricante}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Modelo:</label>
                  <p className="font-medium text-gray-900">{'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Marca:</label>
                  <p className="font-medium text-gray-900">{'No especificado'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Domicilio del Fabricante:</label>
                <p className="font-medium text-gray-900">{'No especificado'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Identificación:</label>
                <p className="font-medium text-gray-900">ID: {product.id.slice(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Technical Characteristics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">CARACTERÍSTICAS TÉCNICAS</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                {'El producto cumple con las especificaciones técnicas establecidas en la normativa vigente y las características declaradas por el fabricante.'}
              </p>
            </div>
          </div>

          {/* Capabilities and Limitations */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">CAPACIDADES Y LIMITACIONES</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                {'El producto debe utilizarse conforme a las instrucciones del fabricante y dentro de los parámetros especificados para garantizar su correcto funcionamiento.'}
              </p>
            </div>
          </div>

          {/* Materials */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">MATERIALES</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                {'Los materiales utilizados en la fabricación del producto cumplen con los estándares de calidad y seguridad requeridos.'}
              </p>
            </div>
          </div>

          {/* Declaration */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">DECLARACIÓN</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-gray-700 leading-relaxed">
                Por la presente, declaro bajo juramento que el producto descrito cumple 
                con todas las normativas y reglamentaciones técnicas vigentes aplicables. 
                Esta declaración se efectúa de conformidad con las disposiciones legales 
                correspondientes y bajo plena responsabilidad del declarante.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PenTool className="w-5 h-5 mr-2 text-purple-600" />
              FIRMA DEL RESPONSABLE
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
              {product.user_profile?.firma_png_url ? (
                <div className="text-center">
                  <div className="mb-4">
                    <img
                      src={product.user_profile.firma_png_url}
                      alt="Firma digital"
                      className="max-h-20 mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="font-medium text-gray-900">
                    {product.user_profile.name || 'Firmante'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Fecha: {formatDate(product.created_at)}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <PenTool className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Firma no disponible</p>
                  <p className="text-sm">
                    Se requiere cargar la firma digital del cliente
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Document Footer */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Documento generado el {formatDate(product.created_at)}</span>
              </div>
              <div>
                <span>Sistema ModularApp - DJC Digital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
};