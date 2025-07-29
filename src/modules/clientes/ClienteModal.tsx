import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Hash, Building, Phone, MapPin, Image, Briefcase } from 'lucide-react';
import { Cliente, CreateClienteData, UpdateClienteData } from '../../types/clientes';

interface ClienteModalProps {
  mode: 'create' | 'edit';
  cliente?: Cliente;
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (data: CreateClienteData) => void;
  onUpdate?: (data: UpdateClienteData) => void;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  mode,
  cliente,
  isOpen,
  onClose,
  onCreate,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cuit: '',
    razon_social: '',
    nombre_comercial: '',
    empresa: '',
    sector: '',
    telefono: '',
    direccion: '',
    avatar: '',
    activo: true
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && cliente) {
      setFormData({
        name: cliente.user_profile?.name || '',
        email: cliente.user_profile?.email || '',
        cuit: cliente.cuit || '',
        razon_social: cliente.razon_social || '',
        nombre_comercial: cliente.nombre_comercial || '',
        empresa: cliente.empresa || '',
        sector: cliente.sector || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        avatar: cliente.avatar || '',
        activo: cliente.activo
      });
    } else {
      setFormData({
        name: '',
        email: '',
        cuit: '',
        razon_social: '',
        nombre_comercial: '',
        empresa: '',
        sector: '',
        telefono: '',
        direccion: '',
        avatar: '',
        activo: true
      });
    }
    setErrors({});
  }, [mode, cliente, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'create') {
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'El email no es válido';
      }
    }

    if (!formData.cuit.trim()) {
      newErrors.cuit = 'El CUIT es requerido';
    } else if (!/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
      newErrors.cuit = 'El CUIT debe tener el formato XX-XXXXXXXX-X';
    }

    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create' && onCreate) {
        await onCreate({
          name: formData.name,
          email: formData.email,
          cuit: formData.cuit,
          razon_social: formData.razon_social,
          nombre_comercial: formData.nombre_comercial || undefined,
          empresa: formData.empresa || undefined,
          sector: formData.sector || undefined,
          telefono: formData.telefono || undefined,
          direccion: formData.direccion || undefined,
          avatar: formData.avatar || undefined
        });
      } else if (mode === 'edit' && onUpdate) {
        await onUpdate({
          cuit: formData.cuit,
          razon_social: formData.razon_social,
          nombre_comercial: formData.nombre_comercial || undefined,
          empresa: formData.empresa || undefined,
          sector: formData.sector || undefined,
          telefono: formData.telefono || undefined,
          direccion: formData.direccion || undefined,
          avatar: formData.avatar || undefined,
          activo: formData.activo
        });
      }
    } catch (error) {
      console.error('Error saving cliente:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCuit = (value: string) => {
    // Remover caracteres no numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Formatear con guiones
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
              </h2>
              <p className="text-gray-500">
                {mode === 'create' ? 'Agregar un nuevo cliente' : 'Modificar información del cliente'}
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
          {/* Información Personal (solo en crear) */}
          {mode === 'create' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre y apellido"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="email@empresa.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Información Empresarial */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Empresarial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  CUIT *
                </label>
                <input
                  type="text"
                  value={formData.cuit}
                  onChange={(e) => handleInputChange('cuit', formatCuit(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.cuit ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="20-12345678-9"
                  maxLength={13}
                />
                {errors.cuit && <p className="text-red-500 text-sm mt-1">{errors.cuit}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Razón Social *
                </label>
                <input
                  type="text"
                  value={formData.razon_social}
                  onChange={(e) => handleInputChange('razon_social', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.razon_social ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Empresa S.A."
                />
                {errors.razon_social && <p className="text-red-500 text-sm mt-1">{errors.razon_social}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  value={formData.nombre_comercial}
                  onChange={(e) => handleInputChange('nombre_comercial', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nombre comercial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Sector
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleccionar sector</option>
                  <option value="Manufactura">Manufactura</option>
                  <option value="Comercio">Comercio</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Salud">Salud</option>
                  <option value="Educación">Educación</option>
                  <option value="Construcción">Construcción</option>
                  <option value="Agricultura">Agricultura</option>
                  <option value="Turismo">Turismo</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Image className="w-4 h-4 inline mr-1" />
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => handleInputChange('avatar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/avatar.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Dirección
                </label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Dirección completa"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Estado (solo en editar) */}
          {mode === 'edit' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => handleInputChange('activo', e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                  Cliente activo
                </label>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};