import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  RefreshCw,
  FileSpreadsheet,
  Database,
  Users,
  UserCheck,
  Calendar,
  Package,
  Link,
  Eye,
  FileText,
  Loader,
  User
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SpreadsheetService, SpreadsheetProduct, ValidationResult } from '../../../services/spreadsheetService';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'validating' | 'preview' | 'importing' | 'complete'>('validating');
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetProduct[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationProgress, setValidationProgress] = useState({ progress: 0, message: '' });

  useEffect(() => {
    if (isOpen) {
      startValidationProcess();
    }
  }, [isOpen]);

  const startValidationProcess = async () => {
    try {
      setStep('validating');
      setError(null);
      setValidationProgress({ progress: 0, message: 'Iniciando validación...' });

      // Paso 1: Obtener datos del spreadsheet
      setValidationProgress({ progress: 10, message: 'Conectando con Google Spreadsheet...' });
      const data = await SpreadsheetService.fetchSpreadsheetData();
      console.log('Loaded spreadsheet data:', data.length, 'rows');
      setSpreadsheetData(data);

      // Paso 2: Obtener datos existentes para validación
      setValidationProgress({ progress: 30, message: 'Verificando datos existentes en Supabase...' });
      
      const [clientesResult, consultoresResult, productosResult] = await Promise.all([
        supabase.from('clientes').select('user_id').eq('activo', true),
        supabase.from('consultores').select('id').eq('activo', true),
        supabase.from('productos').select('id, nombre') // Obtener productos existentes
      ]);

      const existingClientes = clientesResult.data?.map(c => c.user_id) || [];
      const existingConsultores = consultoresResult.data?.map(c => c.id) || [];
      const existingProductIds = productosResult.data?.map(p => p.id) || []; // Usar IDs existentes
      
      console.log('Existing clientes:', existingClientes.length);
      console.log('Existing consultores:', existingConsultores.length);
      console.log('Existing productos:', existingProductIds.length);

      // Paso 3: Validar datos con progreso en tiempo real
      setValidationProgress({ progress: 40, message: 'Iniciando validación de productos...' });
      
      const validation = await SpreadsheetService.validateProducts(
        data, 
        existingClientes, 
        existingConsultores,
        existingProductIds,
        (progress, message) => {
          setValidationProgress({ 
            progress: 40 + (progress * 0.5), // 40% base + 50% de validación
            message 
          });
        }
      );
      
      setValidationResult(validation);
      setValidationProgress({ progress: 100, message: 'Validación completada exitosamente' });
      
      // Pequeña pausa para mostrar el 100%
      setTimeout(() => {
        setStep('preview');
      }, 1000);

    } catch (err: any) {
      console.error('Validation error:', err);
      setError(err.message || 'Error durante la validación');
      setValidationProgress({ progress: 0, message: 'Error en validación' });
    }
  };

  const handleImport = async () => {
    if (!validationResult) return;

    setImporting(true);
    setStep('importing');
    
    try {
      // Solo importar productos nuevos y válidos
      const productsToImport = validationResult.products.filter(p => p.isValid && p.isNew);
      
      if (productsToImport.length === 0) {
        throw new Error('No hay productos nuevos válidos para importar');
      }

      // Preparar datos para inserción
      const productsToInsert = productsToImport.map(product => ({
        nombre: product.nombre,
        fabricante: product.fabricante,
        fecha: product.fecha,
        qr_code_url: product.qr_code_url || null,
        djc_url: product.djc_url || null,
        certificado_url: product.certificado_url || null,
        cliente_id: product.cliente_id,
        consultor_id: product.consultor_id || null,
        public_id: crypto.randomUUID()
      }));

      console.log('Inserting products:', productsToInsert.length);
      
      const { data, error } = await supabase
        .from('productos')
        .insert(productsToInsert)
        .select();

      if (error) throw error;

      console.log('Successfully inserted:', data?.length || 0, 'products');
      setImportResult({
        success: data?.length || 0,
        failed: validationResult.invalid
      });
      setStep('complete');

    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Error al importar productos');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadReport = () => {
    if (!validationResult) return;
    
    const report = SpreadsheetService.generateValidationReport(validationResult);
    const timestamp = new Date().toISOString().split('T')[0];
    SpreadsheetService.downloadReport(report, `validation-report-${timestamp}.txt`);
  };

  const handleClose = () => {
    if (step === 'complete') {
      onSuccess(); // Refrescar la lista de productos
    }
    onClose();
    // Reset state
    setTimeout(() => {
      setStep('validating');
      setSpreadsheetData([]);
      setValidationResult(null);
      setImportResult(null);
      setError(null);
      setValidationProgress({ progress: 0, message: '' });
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 'validating' ? 'Validando productos...' : 'Importar productos desde Spreadsheet'}
              </h2>
              <p className="text-gray-500">
                {step === 'validating' ? 'Verificando datos y productos existentes' : 'Sincronizar con base de datos externa'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={step === 'validating' || importing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'validating' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Loader className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Validando productos</h3>
              <p className="text-gray-600 mb-6">{validationProgress.message}</p>
              
              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progreso</span>
                  <span className="text-sm font-medium text-blue-600">{Math.round(validationProgress.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${validationProgress.progress}%` }}
                  />
                </div>
              </div>
              
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-600 font-medium">Error durante validación</p>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <div className="mt-3 p-3 bg-red-100 rounded text-xs text-red-700">
                    <strong>Posibles causas:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Estructura del archivo incorrecta</li>
                      <li>Columnas requeridas faltantes (A, B, C, Y)</li>
                      <li>Error de conectividad con Google Sheets</li>
                      <li>Permisos insuficientes del spreadsheet</li>
                    </ul>
                  </div>
                  <button
                    onClick={startValidationProcess}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Reintentar Validación
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && validationResult && (
            <div className="space-y-6">
              {/* Demo Client Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Cliente Demo Asignado</p>
                    <p className="text-sm text-blue-700">
                      Todos los productos se importarán con el cliente ID: <code className="bg-blue-100 px-2 py-1 rounded">DEMO123</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{validationResult.products.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Nuevos válidos</p>
                      <p className="text-2xl font-bold text-green-900">{validationResult.valid}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-yellow-600">Ya existen</p>
                      <p className="text-2xl font-bold text-yellow-900">{validationResult.existing}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-red-600">Con errores</p>
                      <p className="text-2xl font-bold text-red-900">{validationResult.invalid}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Preview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Vista previa de productos validados</h3>
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Descargar Reporte</span>
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {validationResult.products.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <p>No se encontraron productos en el spreadsheet</p>
                        <p className="text-sm">Verifica que el spreadsheet tenga datos en las columnas correctas</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Fila</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Producto ID</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Fabricante</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Documentos</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Observaciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.products.map((product, index) => (
                            <tr 
                              key={index} 
                              className={`border-b border-gray-100 ${
                                product.exists 
                                  ? 'bg-yellow-50 opacity-60' // Productos existentes
                                  : product.isValid 
                                    ? 'bg-green-50' // Productos nuevos válidos
                                    : 'bg-red-50' // Productos con errores
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  {product.exists ? (
                                    <>
                                      <Database className="w-5 h-5 text-yellow-600" />
                                      <span className="text-xs text-yellow-700 font-medium">Existe</span>
                                    </>
                                  ) : product.isValid ? (
                                    <>
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <span className="text-xs text-green-700 font-medium">Nuevo</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-5 h-5 text-red-600" />
                                      <span className="text-xs text-red-700 font-medium">Error</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-mono text-sm text-gray-600">#{product.rowNumber}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-mono text-sm">{product.producto_id}</span>
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-medium text-gray-900">{product.nombre}</p>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{product.fabricante}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600 text-sm">{product.fecha}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                                    DEMO123
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-1">
                                  {product.qr_code_url && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full" title="QR disponible"></span>
                                  )}
                                  {product.djc_url && (
                                    <span className="w-2 h-2 bg-purple-500 rounded-full" title="DJC disponible"></span>
                                  )}
                                  {product.certificado_url && (
                                    <span className="w-2 h-2 bg-green-500 rounded-full" title="Certificado disponible"></span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {product.exists && (
                                  <span className="text-xs text-yellow-600">Ya existe en BD</span>
                                )}
                                {product.errors.length > 0 && (
                                  <div className="text-xs text-red-600">
                                    <ul className="space-y-1">
                                      {product.errors.map((error, errorIndex) => (
                                        <li key={errorIndex}>• {error}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {product.isValid && product.isNew && (
                                  <span className="text-xs text-green-600">Listo para importar</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <div className="space-y-1">
                    <p>Se importarán <strong className="text-green-600">{validationResult.valid}</strong> productos nuevos válidos.</p>
                    <p>Todos los productos serán asignados al cliente: <code className="bg-gray-100 px-1 rounded">DEMO123</code></p>
                    {validationResult.existing > 0 && (
                      <p><strong className="text-yellow-600">{validationResult.existing}</strong> productos ya existen en la base de datos.</p>
                    )}
                    {validationResult.invalid > 0 && (
                      <p><strong className="text-red-600">{validationResult.invalid}</strong> productos serán omitidos por errores.</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={validationResult.valid === 0 || importing}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {importing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Importar ({validationResult.valid} productos)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Database className="w-8 h-8 text-green-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Importando productos...</h3>
              <p className="text-gray-600">Guardando productos nuevos en la base de datos</p>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Importación completada!</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong className="text-green-600">{importResult.success}</strong> productos importados exitosamente</p>
                <p>Cliente asignado: <code className="bg-gray-100 px-2 py-1 rounded font-mono">DEMO123</code></p>
                {importResult.failed > 0 && (
                  <p><strong className="text-red-600">{importResult.failed}</strong> productos omitidos por errores</p>
                )}
                {validationResult?.existing && validationResult.existing > 0 && (
                  <p><strong className="text-yellow-600">{validationResult.existing}</strong> productos ya existían en la base de datos</p>
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Nota:</strong> Todos los productos importados están disponibles en el módulo de Productos con el cliente ID temporal "DEMO123".
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Finalizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};