import React from 'react';
import { 
  X, 
  Shield, 
  User, 
  Building2, 
  Package, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Award,
  FileText,
  QrCode,
  ExternalLink,
  Copy
} from 'lucide-react';

interface DetailModalProps {
  item: any;
  type: 'certifier' | 'consultant' | 'client' | 'product';
  isOpen: boolean;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  type,
  isOpen,
  onClose
}) => {
  if (!isOpen || !item) return null;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const getModalConfig = () => {
    switch (type) {
      case 'certifier':
        return {
          title: 'Detalles del Certificador',
          icon: Shield,
          color: 'bg-purple-500'
        };
      case 'consultant':
        return {
          title: 'Detalles del Consultor',
          icon: User,
          color: 'bg-blue-500'
        };
      case 'client':
        return {
          title: 'Detalles del Cliente',
          icon: Building2,
          color: 'bg-green-500'
        };
      case 'product':
        return {
          title: 'Detalles del Producto',
          icon: Package,
          color: 'bg-orange-500'
        };
      default:
        return {
          title: 'Detalles',
          icon: Package,
          color: 'bg-gray-500'
        };
    }
  };

  const config = getModalConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
              <p className="text-gray-500">Información detallada</p>
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
              {item.user_profile && (
                <>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="font-medium text-gray-900">
                        {item.user_profile.name || 'Sin nombre'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{item.user_profile.email}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Product specific info */}
              {type === 'product' && (
                <>
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Nombre del Producto</p>
                      <p className="font-medium text-gray-900">{item.nombre}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Fabricante</p>
                      <p className="font-medium text-gray-900">{item.fabricante}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha del Producto</p>
                      <p className="font-medium text-gray-900">{formatDate(item.fecha)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">ID del Producto</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 font-mono text-sm">{item.id.slice(0, 8)}...</p>
                        <button
                          onClick={() => copyToClipboard(item.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Entity specific info */}
              {type !== 'product' && (
                <>
                  {item.empresa && (
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Empresa</p>
                        <p className="font-medium text-gray-900">{item.empresa}</p>
                      </div>
                    </div>
                  )}
                  
                  {item.especialidad && (
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Especialidad</p>
                        <p className="font-medium text-gray-900">{item.especialidad}</p>
                      </div>
                    </div>
                  )}
                  
                  {item.sector && (
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Sector</p>
                        <p className="font-medium text-gray-900">{item.sector}</p>
                      </div>
                    </div>
                  )}
                  
                  {item.telefono && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium text-gray-900">{item.telefono}</p>
                      </div>
                    </div>
                  )}
                  
                  {item.direccion && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Dirección</p>
                        <p className="font-medium text-gray-900">{item.direccion}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Product Documents */}
          {type === 'product' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* QR Code */}
                <div className={`p-4 rounded-lg border-2 ${
                  item.qr_code_url 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-center mb-3">
                    <QrCode className={`w-8 h-8 ${
                      item.qr_code_url ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <h4 className="font-medium text-center mb-2">Código QR</h4>
                  {item.qr_code_url ? (
                    <button
                      onClick={() => openDocument(item.qr_code_url)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ver QR</span>
                    </button>
                  ) : (
                    <p className="text-center text-gray-500 text-sm">No disponible</p>
                  )}
                </div>

                {/* DJC Document */}
                <div className={`p-4 rounded-lg border-2 ${
                  item.djc_url 
                    ? 'border-purple-200 bg-purple-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-center mb-3">
                    <FileText className={`w-8 h-8 ${
                      item.djc_url ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <h4 className="font-medium text-center mb-2">Documento DJC</h4>
                  {item.djc_url ? (
                    <button
                      onClick={() => openDocument(item.djc_url)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ver DJC</span>
                    </button>
                  ) : (
                    <p className="text-center text-gray-500 text-sm">No disponible</p>
                  )}
                </div>

                {/* Certificate */}
                <div className={`p-4 rounded-lg border-2 ${
                  item.certificado_url 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-center mb-3">
                    <Award className={`w-8 h-8 ${
                      item.certificado_url ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <h4 className="font-medium text-center mb-2">Certificado</h4>
                  {item.certificado_url ? (
                    <button
                      onClick={() => openDocument(item.certificado_url)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ver Certificado</span>
                    </button>
                  ) : (
                    <p className="text-center text-gray-500 text-sm">No disponible</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          {item.hasOwnProperty('activo') && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado</h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  item.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.activo ? 'Activo' : 'Inactivo'}
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
                <p className="font-medium text-gray-900">{formatDateTime(item.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última actualización</p>
                <p className="font-medium text-gray-900">{formatDateTime(item.updated_at)}</p>
              </div>
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