import React, { useState, useEffect } from 'react';
import { X, Save, Package, Calendar, Building, User, Link, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/products';

interface ProductFormData {
  nombre: string;
  fabricante: string;
  fecha: string;
  cliente_id: string;
  consultor_id: string;
  qr_code_url: string;
  djc_url: string;
  certificado_url: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
  clientes: Array<{id: string, name: string}>;
  consultores: Array<{id: string, name: string}>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  product,
  onClose,
  onSave,
  clientes,
  consultores
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    fabricante: '',
    fecha: '',
    cliente_id: '',
    consultor_id: '',
    qr_code_url: '',
    djc_url: '',
    certificado_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        nombre: product.nombre,
        fabricante: product.fabricante,
        fecha: product.fecha,
        cliente_id: product.cliente_id,
        consultor_id: product.consultor_id || '',
        qr_code_url: product.qr_code_url || '',
        djc_url: product.djc_url || '',
        certificado_url: product.certificado_url || ''
      });
    } else {
      setFormData({
        nombre: '',
        fabricante: '',
        fecha: new Date().toISOString().split('T')[0], // Today's date
        cliente_id: '',
        consultor_id: '',
        qr_code_url: '',
        djc_url: '',
        certificado_url: ''
      });
    }
    setErrors({});
  }, [mode, product, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es requerido';
    }

    if (!formData.fabricante.trim()) {
      newErrors.fabricante = 'El fabricante es requerido';
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Debe seleccionar un cliente';
    }

    // Validate URLs
    const urlFields = ['qr_code_url', 'djc_url', 'certificado_url'];
    urlFields.forEach(field => {
      const value = formData[field as keyof ProductFormData];
      if (value && !isValidUrl(value)) {
        newErrors[field] = 'Debe ser una URL válida (https://...)';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const productData = {
        nombre: formData.nombre.trim(),
        fabricante: formData.fabricante.trim(),
        fecha: formData.fecha,
        cliente_id: formData.cliente_id,
        consultor_id: formData.consultor_id || null,
        qr_code_url: formData.qr_code_url || null,
        djc_url: formData.djc_url || null,
        certificado_url: formData.certificado_url || null,
        public_id: mode === 'create' ? crypto.randomUUID() : undefined
      };

      if (mode === 'create') {
        const { error } = await supabase
          .from('productos')
          .insert(productData);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('productos')
          .update(productData)
          .eq('id', product!.id);
        
        if (error) throw error;
      }

      onSave();
    } catch (err: any) {
      setErrors({ general: err.message || 'Error al guardar producto' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
              </h2>
              <p className="text-gray-500">
                {mode === 'create' ? 'Agregar un nuevo producto eléctrico' : 'Modificar información del producto'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {errors.general && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del producto eléctrico"
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Fabricante *
                </label>
                <input
                  type="text"
                  value={formData.fabricante}
                  onChange={(e) => handleInputChange('fabricante', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.fabricante ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del fabricante"
                />
                {errors.fabricante && <p className="text-red-500 text-sm mt-1">{errors.fabricante}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha de Registro *
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.fecha ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fecha && <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>}
              </div>
            </div>
          </div>

          {/* Relationships */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Cliente *
                </label>
                <select
                  value={formData.cliente_id}
                  onChange={(e) => handleInputChange('cliente_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.cliente_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                  ))}
                </select>
                {errors.cliente_id && <p className="text-red-500 text-sm mt-1">{errors.cliente_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Consultor
                </label>
                <select
                  value={formData.consultor_id}
                  onChange={(e) => handleInputChange('consultor_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Seleccionar consultor (opcional)</option>
                  {consultores.map(consultor => (
                    <option key={consultor.id} value={consultor.id}>{consultor.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Document URLs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos (URLs)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link className="w-4 h-4 inline mr-1" />
                  URL del Código QR
                </label>
                <input
                  type="url"
                  value={formData.qr_code_url}
                  onChange={(e) => handleInputChange('qr_code_url', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.qr_code_url ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://ejemplo.com/qr-code.png"
                />
                {errors.qr_code_url && <p className="text-red-500 text-sm mt-1">{errors.qr_code_url}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link className="w-4 h-4 inline mr-1" />
                  URL del DJC
                </label>
                <input
                  type="url"
                  value={formData.djc_url}
                  onChange={(e) => handleInputChange('djc_url', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.djc_url ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://ejemplo.com/djc.pdf"
                />
                {errors.djc_url && <p className="text-red-500 text-sm mt-1">{errors.djc_url}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link className="w-4 h-4 inline mr-1" />
                  URL del Certificado
                </label>
                <input
                  type="url"
                  value={formData.certificado_url}
                  onChange={(e) => handleInputChange('certificado_url', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.certificado_url ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://ejemplo.com/certificado.pdf"
                />
                {errors.certificado_url && <p className="text-red-500 text-sm mt-1">{errors.certificado_url}</p>}
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Las URLs deben usar protocolo HTTPS y apuntar a archivos válidos.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};