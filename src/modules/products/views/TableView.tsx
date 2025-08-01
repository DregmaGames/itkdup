import React from 'react';
import { Eye, QrCode, FileText, Award, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Product } from '../../../types/products';

interface TableViewProps {
  products: Product[];
  onProductDetail: (product: Product) => void;
  onShowQR: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Producto</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Consultor</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Fabricante</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.nombre}</p>
                    <p className="text-sm text-gray-500">ID: {product.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {product.cliente?.user_profile?.name || 'Sin asignar'}
                  </p>
                  <p className="text-sm text-gray-500">{product.cliente?.user_profile?.email}</p>
                </div>
              </td>
              
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {product.consultor?.user_profile?.name || 'Sin asignar'}
                  </p>
                  <p className="text-sm text-gray-500">{product.consultor?.user_profile?.email}</p>
                </div>
              </td>
              
              <td className="py-4 px-4">
                <span className="text-gray-900">{product.fabricante}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-600">{formatDate(product.fecha)}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center flex-wrap gap-1">
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
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onProductDetail(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {onEdit && (
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={() => onDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};