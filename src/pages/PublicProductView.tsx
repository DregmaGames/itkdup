import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Award, 
  Download, 
  Calendar, 
  Building, 
  AlertCircle, 
  Eye, 
  ExternalLink,
  ArrowLeft,
  Shield,
  CheckCircle,
  QrCode
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PublicProduct, DocumentViewerState } from '../types/public';
import { PublicDocumentViewer } from '../components/public/PublicDocumentViewer';
import { PublicFooter } from '../components/public/PublicFooter';

export const PublicProductView: React.FC = () => {
  const { public_id } = useParams<{ public_id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentViewer, setDocumentViewer] = useState<DocumentViewerState>({
    isOpen: false,
    documentUrl: '',
    documentType: 'djc',
    documentTitle: ''
  });

  useEffect(() => {
    if (public_id) {
      fetchProduct(public_id);
    } else {
      setError('ID de producto no proporcionado');
      setLoading(false);
    }
  }, [public_id]);

  const fetchProduct = async (publicId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Usar la vista pública para mayor seguridad
      const { data, error } = await supabase
        .from('public_productos')
        .select('*')
        .eq('public_id', publicId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Producto no encontrado');
        } else {
          setError('Error al cargar el producto');
        }
        return;
      }

      setProduct(data);
    } catch (err: any) {
      setError('Error de conexión');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDocumentView = (url: string, type: 'djc' | 'certificate') => {
    setDocumentViewer({
      isOpen: true,
      documentUrl: url,
      documentType: type,
      documentTitle: type === 'djc' ? 'Declaración Jurada de Conformidad' : 'Certificado de Producto'
    });
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-8">{error || 'El producto solicitado no existe o no está disponible públicamente.'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ModularApp</h1>
                <p className="text-sm text-gray-500">Sistema de Certificación</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">Verificado</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Product Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nombre}</h1>
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span className="font-medium">{product.fabricante}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Certificado el {formatDate(product.fecha)}</span>
                  </div>
                </div>
              </div>
              
              {product.qr_code_url && (
                <div className="ml-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border">
                    <img
                      src={product.qr_code_url}
                      alt="Código QR"
                      className="w-20 h-20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">Código QR</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Información del Producto</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Nombre</p>
                      <p className="text-gray-600">{product.nombre}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Fabricante</p>
                      <p className="text-gray-600">{product.fabricante}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Fecha de Certificación</p>
                      <p className="text-gray-600">{formatDate(product.fecha)}</p>
                    </div>
                  </div>

                  {product.qr_code_url && (
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <QrCode className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Código QR</p>
                        <p className="text-gray-600">Disponible para verificación</p>
                      </div>
                      <button
                        onClick={() => window.open(product.qr_code_url, '_blank')}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Documentos Oficiales</h2>
                <div className="space-y-4">
                  
                  {/* DJC Document */}
                  <div className={`p-6 rounded-lg border-2 ${
                    product.djc_url ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          product.djc_url ? 'bg-purple-500' : 'bg-gray-400'
                        }`}>
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Declaración Jurada de Conformidad</h3>
                          <p className="text-sm text-gray-600">Documento oficial de conformidad</p>
                        </div>
                      </div>
                      
                      {product.djc_url && (
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Disponible
                        </span>
                      )}
                    </div>
                    
                    {product.djc_url ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDocumentView(product.djc_url!, 'djc')}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Documento</span>
                        </button>
                        <button
                          onClick={() => handleDownload(product.djc_url!, `DJC_${product.nombre}.pdf`)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Descargar</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">Documento no disponible</p>
                    )}
                  </div>

                  {/* Certificate Document */}
                  <div className={`p-6 rounded-lg border-2 ${
                    product.certificado_url ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          product.certificado_url ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Certificado de Producto</h3>
                          <p className="text-sm text-gray-600">Certificación oficial del producto</p>
                        </div>
                      </div>
                      
                      {product.certificado_url && (
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Disponible
                        </span>
                      )}
                    </div>
                    
                    {product.certificado_url ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDocumentView(product.certificado_url!, 'certificate')}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Certificado</span>
                        </button>
                        <button
                          onClick={() => handleDownload(product.certificado_url!, `Certificado_${product.nombre}.pdf`)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Descargar</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">Certificado no disponible</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Verification */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div className="text-center">
                <p className="font-semibold text-gray-900">Producto Verificado</p>
                <p className="text-sm text-gray-600">
                  Este producto ha sido verificado en nuestro sistema el {formatDate(product.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PublicFooter />

      {/* Document Viewer Modal */}
      <PublicDocumentViewer
        isOpen={documentViewer.isOpen}
        documentUrl={documentViewer.documentUrl}
        documentType={documentViewer.documentType}
        documentTitle={documentViewer.documentTitle}
        productName={product.nombre}
        onClose={() => setDocumentViewer(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};