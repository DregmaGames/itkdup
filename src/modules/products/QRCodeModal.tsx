import React from 'react';
import { X, QrCode, Download, Copy, ExternalLink } from 'lucide-react';
import { Product } from '../../types/products';

interface QRCodeModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadQR = () => {
    if (product.qr_code_url) {
      const link = document.createElement('a');
      link.href = product.qr_code_url;
      link.download = `QR_${product.nombre}.png`;
      link.click();
    }
  };

  const openQRUrl = () => {
    if (product.qr_code_url) {
      window.open(product.qr_code_url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Código QR</h2>
              <p className="text-sm text-gray-500">{product.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {product.qr_code_url ? (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-lg shadow-sm flex items-center justify-center border-2 border-gray-200">
                  <img
                    src={product.qr_code_url}
                    alt={`QR Code for ${product.nombre}`}
                    className="max-w-full max-h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTAwIDUwTDEwMCAxNTBMMTAwIDE1MEwxMDAgNTBaIiBzdHJva2U9IiM2QjczODAiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{product.nombre}</h3>
                <p className="text-sm text-gray-600">{product.fabricante}</p>
                <p className="text-sm text-gray-500 mt-1">
                  ID: {product.id.slice(0, 8)}...
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={downloadQR}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
                
                <button
                  onClick={() => copyToClipboard(product.qr_code_url!)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar URL</span>
                </button>
                
                <button
                  onClick={openQRUrl}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">QR no disponible</h3>
              <p className="text-gray-500">
                Este producto no tiene un código QR asociado.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};