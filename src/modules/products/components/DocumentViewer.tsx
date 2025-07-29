import React from 'react';
import { X, Download, ExternalLink, FileText, Eye } from 'lucide-react';

interface DocumentViewerProps {
  documentUrl: string;
  documentType: 'djc' | 'certificate';
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  documentType,
  productName,
  isOpen,
  onClose
}) => {
  const typeLabel = documentType === 'djc' ? 'Declaración Jurada de Conformidad' : 'Certificado de Producto';
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = `${typeLabel}_${productName}.pdf`;
    link.click();
  };

  const handleOpenExternal = () => {
    window.open(documentUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              documentType === 'djc' ? 'bg-purple-100' : 'bg-green-100'
            }`}>
              <FileText className={`w-5 h-5 ${
                documentType === 'djc' ? 'text-purple-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{typeLabel}</h2>
              <p className="text-sm text-gray-500">{productName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>
            
            <button
              onClick={handleOpenExternal}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Abrir en nueva pestaña"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="h-[70vh] bg-gray-100">
          <iframe
            src={documentUrl}
            className="w-full h-full"
            title={`${typeLabel} - ${productName}`}
            onError={() => {
              // Si el iframe falla, mostrar mensaje alternativo
              console.log('Error loading PDF in iframe');
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Documento: {typeLabel}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};