import React from 'react';
import { X, Shield, UserCheck, Building2, Package, User, Mail, Phone, MapPin, Calendar, Building, Users } from 'lucide-react';
import { AdminEntityType } from '../../types/admin';

interface AdminEntityModalProps {
  entity: any;
  entityType: AdminEntityType;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminEntityModal: React.FC<AdminEntityModalProps> = ({
  entity,
  entityType,
  isOpen,
  onClose
}) => {
  if (!isOpen || !entity) return null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case 'certificadores':
        return Shield;
      case 'consultores':
        return UserCheck;
      case 'clientes':
        return Building2;
      case 'productos':
        return Package;
      case 'admin_users':
        return Users;
      default:
        return User;
    }
  };

  const getEntityTitle = () => {
    switch (entityType) {
      case 'certificadores':
        return 'Certificador';
      case 'consultores':
        return 'Consultor';
      case 'clientes':
        return 'Cliente';
      case 'productos':
        return 'Producto';
      case 'admin_users':
        return 'Usuario Administrador';
      default:
        return 'Entidad';
    }
  };

  const getEntityColor = () => {
    switch (entityType) {
      case 'certificadores':
        return 'bg-purple-500';
      case 'consultores':
        return 'bg-blue-500';
      case 'clientes':
        return 'bg-green-500';
      case 'productos':
        return 'bg-orange-500';
      case 'admin_users':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const Icon = getEntityIcon();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${getEntityColor()} rounded-lg flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {getEntityTitle()}
              </h2>
              <p className="text-gray-500">Detalles de la entidad</p>
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
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* User Profile Info */}
              {(entity.user_profile || entityType === 'admin_users') && (
                <>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="font-medium text-gray-900">
                        {entityType === 'admin_users' ? (entity.name || 'Sin nombre') : (entity.user_profile?.name || 'Sin nombre')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {entityType === 'admin_users' ? entity.email : entity.user_profile?.email}
                      </p>
                    </div>
                  </div>
                  
                  {entityType === 'admin_users' && (
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Rol</p>
                        <p className="font-medium text-gray-900">{entity.role}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Product specific info */}
              {entityType === 'productos' && (
                <>
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Nombre del Producto</p>
                      <p className="font-medium text-gray-900">{entity.nombre}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Fabricante</p>
                      <p className="font-medium text-gray-900">{entity.fabricante}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha del Producto</p>
                      <p className="font-medium text-gray-900">{formatDate(entity.fecha)}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Entity specific info */}
              {entityType !== 'productos' && (
                <>
                  {entity.empresa && (
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Empresa</p>
                        <p className="font-medium text-gray-900">{entity.empresa}</p>
                      </div>
                    </div>
                  )}
                  
                  {entity.especialidad && (
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Especialidad</p>
                        <p className="font-medium text-gray-900">{entity.especialidad}</p>
                      </div>
                    </div>
                  )}
                  
                  {entity.sector && (
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Sector</p>
                        <p className="font-medium text-gray-900">{entity.sector}</p>
                      </div>
                    </div>
                  )}
                  
                  {entity.telefono && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium text-gray-900">{entity.telefono}</p>
                      </div>
                    </div>
                  )}
                  
                  {entity.direccion && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Dirección</p>
                        <p className="font-medium text-gray-900">{entity.direccion}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Relationships */}
          {(entity.certificador || entity.consultor) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Relaciones</h3>
              <div className="space-y-3">
                {entity.certificador && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Certificador Asignado</span>
                    </div>
                    <p className="text-purple-800 mt-1">
                      {entity.certificador.user_profile?.name || 'Sin nombre'} 
                      ({entity.certificador.user_profile?.email})
                    </p>
                    {entity.certificador.empresa && (
                      <p className="text-purple-700 text-sm mt-1">
                        {entity.certificador.empresa}
                      </p>
                    )}
                  </div>
                )}
                
                {entity.consultor && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Consultor Asignado</span>
                    </div>
                    <p className="text-blue-800 mt-1">
                      {entity.consultor.user_profile?.name || 'Sin nombre'} 
                      ({entity.consultor.user_profile?.email})
                    </p>
                    {entity.consultor.empresa && (
                      <p className="text-blue-700 text-sm mt-1">
                        {entity.consultor.empresa}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Documents */}
          {entityType === 'productos' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${
                  entity.qr_code_url ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className="font-medium text-center">Código QR</h4>
                  <p className={`text-center text-sm mt-2 ${
                    entity.qr_code_url ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {entity.qr_code_url ? 'Disponible' : 'No disponible'}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg border ${
                  entity.djc_url ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className="font-medium text-center">Documento DJC</h4>
                  <p className={`text-center text-sm mt-2 ${
                    entity.djc_url ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {entity.djc_url ? 'Disponible' : 'No disponible'}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg border ${
                  entity.certificado_url ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className="font-medium text-center">Certificado</h4>
                  <p className={`text-center text-sm mt-2 ${
                    entity.certificado_url ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {entity.certificado_url ? 'Disponible' : 'No disponible'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          {entity.hasOwnProperty('activo') && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado</h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  entity.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {entity.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          )}

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Creado</p>
                <p className="font-medium text-gray-900">{formatDateTime(entity.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última actualización</p>
                <p className="font-medium text-gray-900">{formatDateTime(entity.updated_at)}</p>
              </div>
              {entityType === 'admin_users' && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">ID de Usuario</p>
                  <p className="font-medium text-gray-900 font-mono text-sm">{entity.id}</p>
                </div>
              )}
            </div>
          </div>
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