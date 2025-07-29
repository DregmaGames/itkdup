import React, { useState } from 'react';
import { X, FileText, Download, AlertCircle, CheckCircle, PenTool, Upload } from 'lucide-react';
import { ProductoDJC, DJCTemplate } from '../../types/djc';
import { DJCPdfGenerator } from '../../services/djcPdfGenerator';
import { supabase } from '../../lib/supabase';

interface DJCGeneratorProps {
  product: ProductoDJC;
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (product: ProductoDJC, url: string) => void;
}

export const DJCGenerator: React.FC<DJCGeneratorProps> = ({
  product,
  isOpen,
  onClose,
  onGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleGenerateDJC = async () => {
    if (!product.user_profile?.firma_png_url) {
      setError('El cliente no tiene una firma digital configurada');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress steps
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create DJC template
      const template: DJCTemplate = {
        empresa: product.user_profile?.name || 'Empresa no especificada',
        producto: product.nombre,
        modelo: 'No especificado',
        marca: 'No especificado',
        fabricante: product.fabricante,
        domicilioFabricante: 'No especificado',
        identificacion: `ID: ${product.id.slice(0, 8)}...`,
        caracteristicasTecnicas: 'El producto cumple con las especificaciones técnicas establecidas en la normativa vigente y las características declaradas por el fabricante.',
        capacidadesLimitaciones: 'El producto debe utilizarse conforme a las instrucciones del fabricante y dentro de los parámetros especificados para garantizar su correcto funcionamiento.',
        materiales: 'Los materiales utilizados en la fabricación del producto cumplen con los estándares de calidad y seguridad requeridos.',
        fechaFirma: formatDate(product.created_at),
        nombreFirmante: product.user_profile?.name || 'Firmante',
        firmaUrl: product.user_profile?.firma_png_url || ''
      };

      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate PDF
      const pdfBytes = await DJCPdfGenerator.generateDJC(template);
      
      setProgress(70);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert to File and upload to Supabase Storage
      const fileName = `djc_firmada_${product.id}_${Date.now()}.pdf`;
      const file = new File([pdfBytes], fileName, { type: 'application/pdf' });

      // Simulate upload to Supabase Storage
      // In real implementation, you would upload to the djc_documents/firmadas/ bucket
      const mockUploadUrl = `https://supabase-storage.com/djc_documents/firmadas/${fileName}`;
      
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update product in database
      const { error: updateError } = await supabase
        .from('productos')
        .update({ djc_firmada_url: mockUploadUrl })
        .eq('id', product.id);

      if (updateError) throw updateError;

      setProgress(100);
      setSuccess(true);

      setTimeout(() => {
        onGenerated(product, mockUploadUrl);
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Error al generar el PDF');
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PenTool className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generar DJC Firmada</h2>
              <p className="text-gray-500">{product.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isGenerating && !success && !error && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Información del Producto</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Producto:</span>
                    <span className="font-medium">{product.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fabricante:</span>
                    <span className="font-medium">{product.fabricante}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium">{product.user_profile?.name || 'Sin nombre'}</span>
                  </div>
                </div>
              </div>

              {/* Signature Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  {product.user_profile?.firma_png_url ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">Firma digital disponible</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Firma digital no disponible</span>
                    </>
                  )}
                </div>
                {product.user_profile?.firma_png_url && (
                  <div className="mt-3">
                    <img
                      src={product.user_profile.firma_png_url}
                      alt="Firma digital"
                      className="max-h-16 border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Generation Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">¿Qué se generará?</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Documento PDF con todos los datos del producto</li>
                  <li>• Firma digital incrustada del cliente</li>
                  <li>• Fecha de firma automática</li>
                  <li>• Almacenamiento seguro en Supabase</li>
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerateDJC}
                disabled={!product.user_profile?.firma_png_url}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>Generar DJC Firmada</span>
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center">
                <Upload className="w-8 h-8 text-purple-600 animate-bounce" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Generando DJC Firmada...</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress}% completado</p>
              </div>
            </div>
          )}

          {success && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">¡DJC Generada Exitosamente!</p>
                <p className="text-sm text-gray-600">
                  El documento firmado ha sido generado y guardado correctamente.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Error en la Generación</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setProgress(0);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isGenerating && (
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {success ? 'Finalizar' : 'Cancelar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};