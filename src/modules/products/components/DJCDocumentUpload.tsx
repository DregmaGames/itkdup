import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download, Eye, Trash2 } from 'lucide-react';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { DocumentViewer } from './DocumentViewer';
import { UserPermissions } from '../../../types/documents';

interface DJCDocumentUploadProps {
  productId: string;
  productName: string;
  currentDocumentUrl?: string;
  permissions: UserPermissions;
  onUploadSuccess: (url: string) => void;
  onDeleteSuccess: () => void;
}

export const DJCDocumentUpload: React.FC<DJCDocumentUploadProps> = ({
  productId,
  productName,
  currentDocumentUrl,
  permissions,
  onUploadSuccess,
  onDeleteSuccess
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasDocument = Boolean(currentDocumentUrl);
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf'];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validaciones
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > maxSizeBytes) {
      setError('El archivo no puede ser mayor a 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular upload con progreso
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simular llamada a Supabase Storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular URL del documento subido
      const mockDocumentUrl = `https://supabase-storage.com/djc/${productId}_${Date.now()}.pdf`;
      
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onUploadSuccess(mockDocumentUrl);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo');
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      // Simular llamada de eliminación
      await new Promise(resolve => setTimeout(resolve, 1000));
      onDeleteSuccess();
      setShowDeleteConfirm(false);
    } catch (err) {
      setError('Error al eliminar el documento');
    }
  };

  const handleDownload = () => {
    if (currentDocumentUrl) {
      const link = document.createElement('a');
      link.href = currentDocumentUrl;
      link.download = `DJC_${productName}.pdf`;
      link.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Declaración Jurada de Conformidad</h3>
            <p className="text-sm text-gray-500">Archivo PDF requerido</p>
          </div>
        </div>
        
        <DocumentStatusBadge
          status={hasDocument ? 'uploaded' : 'missing'}
          type="djc"
          hasDocument={hasDocument}
        />
      </div>

      {/* Content Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        {isUploading ? (
          /* Upload Progress */
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-600 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Subiendo DJC...</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : hasDocument ? (
          /* Document Uploaded */
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">DJC Subido Correctamente</p>
              <p className="text-xs text-gray-500">Documento disponible para visualización</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-2">
              {permissions.canView && (
                <button
                  onClick={() => setShowViewer(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver</span>
                </button>
              )}
              
              {permissions.canView && (
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
              )}
              
              {permissions.canUpload && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Reemplazar</span>
                </button>
              )}
              
              {permissions.canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Upload Area */
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">No hay DJC subido</p>
              <p className="text-xs text-gray-500">
                Formatos: PDF | Tamaño máximo: 10MB
              </p>
            </div>
            
            {permissions.canUpload && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
              >
                <Upload className="w-5 h-5" />
                <span>Subir DJC</span>
              </button>
            )}
          </div>
        )}
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-red-100 rounded"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showViewer && currentDocumentUrl && (
        <DocumentViewer
          documentUrl={currentDocumentUrl}
          documentType="djc"
          productName={productName}
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar la Declaración Jurada de Conformidad?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};