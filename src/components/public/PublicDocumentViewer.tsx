import React from 'react';
import { X, Download, ExternalLink, FileText, Award, AlertCircle } from 'lucide-react';

interface PublicDocumentViewerProps {
  isOpen: boolean;
  documentUrl: string;
  documentType: 'djc' | 'certificate';
  documentTitle: string;
  productName: string;
  onClose: () => void;
}

export const PublicDocumentViewer: React.FC<PublicDocumentViewerProps> = ({
  isOpen,
  documentUrl,
  documentType,
  documentTitle,
  productName,
  onClose
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = `${documentTitle}_${productName}.pdf`;
    link.click();
  };

  const handleOpenExternal = () => {
    window.open(documentUrl, '_blank');
  };

  const getDocumentColor = () => {
    return documentType === 'djc' ? 'purple' : 'green';
  };

  const color = getDocumentColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
              {documentType === 'djc' ? (
                <FileText className={`w-6 h-6 text-${color}-600`} />
              ) : (
                <Award className={`w-6 h-6 text-${color}-600`} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{documentTitle}</h2>
              <p className="text-gray-500">{productName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className={`flex items-center space-x-2 px-4 py-2 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition-colors`}
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
        <div className="h-[75vh] bg-gray-100 relative">
          <iframe
            src={`${documentUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full border-0"
            title={`${documentTitle} - ${productName}`}
            onError={() => {
              console.log('Error loading PDF in iframe');
            }}
          />
          
          {/* Fallback for browsers that don't support PDF viewing */}
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center hidden" id="pdf-fallback">
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se puede mostrar el PDF
                </h3>
                <p className="text-gray-600 mb-4">
                  Tu navegador no puede mostrar archivos PDF. Puedes descargar el documento.
                </p>
                <button
                  onClick={handleDownload}
                  className={`flex items-center space-x-2 px-6 py-3 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition-colors mx-auto`}
                >
                  <Download className="w-5 h-5" />
                  <span>Descargar {documentTitle}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {documentType === 'djc' ? (
                <FileText className="w-4 h-4" />
              ) : (
                <Award className="w-4 h-4" />
              )}
              <span>Documento oficial verificado</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Descargar copia
              </button>
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
    </div>
  );
};