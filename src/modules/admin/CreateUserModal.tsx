import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, Building2, UserCheck, Award, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CreateUserData {
  email: string;
  name: string;
  role: 'Admin' | 'Cert' | 'Consultor' | 'Cliente';
  // Campos adicionales según el rol
  empresa?: string;
  especialidad?: string;
  telefono?: string;
  direccion?: string;
  // Para clientes
  cuit?: string;
  razon_social?: string;
  nombre_comercial?: string;
  sector?: string;
  // Relaciones
  certificador_id?: string;
  consultor_id?: string;
}

interface Certificador {
  id: string;
  user_profile: {
    name?: string;
    email: string;
  };
  empresa?: string;
}

interface Consultor {
  id: string;
  certificador_id: string;
  user_profile: {
    name?: string;
    email: string;
  };
  empresa?: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    name: '',
    role: 'Cliente'
  });
  
  const [certificadores, setCertificadores] = useState<Certificador[]>([]);
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [filteredConsultores, setFilteredConsultores] = useState<Consultor[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar certificadores y consultores
  useEffect(() => {
    if (isOpen) {
      fetchCertificadores();
      fetchConsultores();
    }
  }, [isOpen]);

  // Filtrar consultores por certificador seleccionado
  useEffect(() => {
    if (formData.certificador_id) {
      const filtered = consultores.filter(c => c.certificador_id === formData.certificador_id);
      setFilteredConsultores(filtered);
      // Limpiar consultor seleccionado si no pertenece al certificador
      if (formData.consultor_id && !filtered.find(c => c.id === formData.consultor_id)) {
        setFormData(prev => ({ ...prev, consultor_id: '' }));
      }
    } else {
      setFilteredConsultores([]);
      setFormData(prev => ({ ...prev, consultor_id: '' }));
    }
  }, [formData.certificador_id, consultores]);

  const fetchCertificadores = async () => {
    try {
      const { data, error } = await supabase
        .from('certificadores')
        .select(`
          id,
          empresa,
          user_profile:user_profiles!certificadores_user_id_fkey(name, email)
        `)
        .eq('activo', true);

      if (error) throw error;
      setCertificadores(data || []);
    } catch (err) {
      console.error('Error fetching certificadores:', err);
    }
  };

  const fetchConsultores = async () => {
    try {
      const { data, error } = await supabase
        .from('consultores')
        .select(`
          id,
          certificador_id,
          empresa,
          user_profile:user_profiles!consultores_user_id_fkey(name, email)
        `);

      if (error) throw error;
      setConsultores(data || []);
    } catch (err) {
      console.error('Error fetching consultores:', err);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validaciones básicas
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    // Validaciones específicas por rol
    if (formData.role === 'Cliente') {
      if (!formData.consultor_id) {
        newErrors.consultor_id = 'Debe seleccionar un consultor';
      }
      if (!formData.cuit?.trim()) {
        newErrors.cuit = 'El CUIT es requerido para clientes';
      } else if (!/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
        newErrors.cuit = 'El CUIT debe tener el formato XX-XXXXXXXX-X';
      }
      if (!formData.razon_social?.trim()) {
        newErrors.razon_social = 'La razón social es requerida';
      }
    }

    if (formData.role === 'Consultor') {
      if (!formData.certificador_id) {
        newErrors.certificador_id = 'Debe seleccionar un certificador';
      }
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
      // Generate a UUID for the user profile
      const userId = crypto.randomUUID();
      
      // 1. Crear user_profile
      const { data: newUser, error: userError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: formData.email,
          role: formData.role,
          name: formData.name
        })
        .select()
        .single();

      if (userError) throw userError;

      // 2. Crear registro específico según el rol
      if (formData.role === 'Cert') {
        const { error: certError } = await supabase
          .from('certificadores')
          .insert({
            user_id: newUser.id,
            empresa: formData.empresa,
            especialidad: formData.especialidad,
            telefono: formData.telefono,
            direccion: formData.direccion
          });
        
        if (certError) throw certError;

      } else if (formData.role === 'Consultor') {
        const { error: consError } = await supabase
          .from('consultores')
          .insert({
            user_id: newUser.id,
            certificador_id: formData.certificador_id,
            empresa: formData.empresa,
            especialidad: formData.especialidad,
            telefono: formData.telefono,
            direccion: formData.direccion
          });
        
        if (consError) throw consError;

      } else if (formData.role === 'Cliente') {
        const { error: clientError } = await supabase
          .from('clientes')
          .insert({
            user_id: newUser.id,
            consultor_id: formData.consultor_id,
            cuit: formData.cuit,
            razon_social: formData.razon_social,
            nombre_comercial: formData.nombre_comercial,
            empresa: formData.empresa || formData.razon_social,
            sector: formData.sector,
            telefono: formData.telefono,
            direccion: formData.direccion
          });
        
        if (clientError) throw clientError;
      }

      // Éxito
      onSuccess();
      handleClose();
      
    } catch (err: any) {
      setErrors({ general: err.message || 'Error al crear usuario' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      name: '',
      role: 'Cliente'
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCuit = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return Shield;
      case 'Cert': return Award;
      case 'Consultor': return UserCheck;
      case 'Cliente': return Building2;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'purple';
      case 'Cert': return 'blue';
      case 'Consultor': return 'green';
      case 'Cliente': return 'orange';
      default: return 'gray';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Usuario</h2>
              <p className="text-gray-500">Agregar usuario al sistema</p>
            </div>
          </div>
          <button
            onClick={handleClose}
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

          {/* Información básica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="usuario@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre y apellido"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>
          </div>

          {/* Selección de rol */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rol del Usuario</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['Admin', 'Cert', 'Consultor', 'Cliente'] as const).map((role) => {
                const Icon = getRoleIcon(role);
                const color = getRoleColor(role);
                const isSelected = formData.role === role;
                
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleInputChange('role', role)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `border-${color}-500 bg-${color}-50`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                      isSelected ? `bg-${color}-500` : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <p className={`text-sm font-medium ${
                      isSelected ? `text-${color}-700` : 'text-gray-700'
                    }`}>
                      {role}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Relaciones jerárquicas para Cliente */}
          {formData.role === 'Cliente' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignación Jerárquica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="w-4 h-4 inline mr-1" />
                    Certificador *
                  </label>
                  <select
                    value={formData.certificador_id || ''}
                    onChange={(e) => handleInputChange('certificador_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.certificador_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar certificador</option>
                    {certificadores.map((cert) => (
                      <option key={cert.id} value={cert.id}>
                        {cert.user_profile.name || cert.user_profile.email} 
                        {cert.empresa && ` - ${cert.empresa}`}
                      </option>
                    ))}
                  </select>
                  {errors.certificador_id && <p className="text-red-500 text-sm mt-1">{errors.certificador_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    Consultor *
                  </label>
                  <select
                    value={formData.consultor_id || ''}
                    onChange={(e) => handleInputChange('consultor_id', e.target.value)}
                    disabled={!formData.certificador_id}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.consultor_id ? 'border-red-300' : 'border-gray-300'
                    } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {formData.certificador_id ? 'Seleccionar consultor' : 'Primero seleccione un certificador'}
                    </option>
                    {filteredConsultores.map((cons) => (
                      <option key={cons.id} value={cons.id}>
                        {cons.user_profile.name || cons.user_profile.email}
                        {cons.empresa && ` - ${cons.empresa}`}
                      </option>
                    ))}
                  </select>
                  {errors.consultor_id && <p className="text-red-500 text-sm mt-1">{errors.consultor_id}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Relación para Consultor */}
          {formData.role === 'Consultor' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignación de Certificador</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="w-4 h-4 inline mr-1" />
                  Certificador *
                </label>
                <select
                  value={formData.certificador_id || ''}
                  onChange={(e) => handleInputChange('certificador_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.certificador_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar certificador</option>
                  {certificadores.map((cert) => (
                    <option key={cert.id} value={cert.id}>
                      {cert.user_profile.name || cert.user_profile.email}
                      {cert.empresa && ` - ${cert.empresa}`}
                    </option>
                  ))}
                </select>
                {errors.certificador_id && <p className="text-red-500 text-sm mt-1">{errors.certificador_id}</p>}
              </div>
            </div>
          )}

          {/* Información específica por rol */}
          {(formData.role === 'Cert' || formData.role === 'Consultor') && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Profesional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.empresa || ''}
                    onChange={(e) => handleInputChange('empresa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    value={formData.especialidad || ''}
                    onChange={(e) => handleInputChange('especialidad', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Área de especialización"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Información empresarial para Cliente */}
          {formData.role === 'Cliente' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Empresarial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CUIT *
                  </label>
                  <input
                    type="text"
                    value={formData.cuit || ''}
                    onChange={(e) => handleInputChange('cuit', formatCuit(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cuit ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="20-12345678-9"
                    maxLength={13}
                  />
                  {errors.cuit && <p className="text-red-500 text-sm mt-1">{errors.cuit}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    value={formData.razon_social || ''}
                    onChange={(e) => handleInputChange('razon_social', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.razon_social ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Empresa S.A."
                  />
                  {errors.razon_social && <p className="text-red-500 text-sm mt-1">{errors.razon_social}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Comercial
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_comercial || ''}
                    onChange={(e) => handleInputChange('nombre_comercial', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre comercial"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector
                  </label>
                  <select
                    value={formData.sector || ''}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          )}

          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono || ''}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Crear Usuario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};