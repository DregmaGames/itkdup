import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Hash, 
  Building, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit,
  Package,
  Eye,
  ExternalLink,
  Award,
  FileText,
  QrCode,
  Briefcase
} from 'lucide-react';
import { Cliente } from '../../types/clientes';
import { supabase } from '../../lib/supabase';

interface ClienteDetailModalProps {
  cliente: Cliente;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (cliente: Cliente) => void;
  canEdit: boolean;
}

export const ClienteDetailModal: React.FC<ClienteDetailModalProps> = ({
  cliente,
  isOpen,
  onClose,
  onEdit,
  canEdit
}) => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [showProductos, setShowProductos] = useState(false);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchProductos = async () => {
    try {
      setLoadingProductos(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('cliente_id', cliente.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error('Error fetching productos:', error);
    } finally {
      setLoadingProductos(false);
    }
  };

  useEffect(() => {
    if (showProductos && cliente.user_id) {
      fetchProductos();
    }
  }, [showProductos, cliente.user_id]);

  const openUserProfile = () => {
    // Aquí podrías abrir el modal del perfil de usuario o navegar a él
    window.open(`/usuarios/${cliente.user_id}`, '_blank');
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const getProductStatusColor = (product: any) => {
    const hasAll = product.qr_code_url && product.djc_url && product.certificado_url;
    const hasPartial = product.qr_code_url || product.djc_url || product.certificado_url;
    
    if (hasAll) return 'bg-green-100 text-green-800';
    if (hasPartial) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {cliente.avatar ? (
              <img
                src={cliente.avatar}
                alt={cliente.user_profile?.name}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAzMkMzNi40MTgzIDMyIDQwIDI4LjQxODMgNDAgMjRDNDAgMTkuNTgxNyAzNi40MTgzIDE2IDMyIDE2QzI3LjU4MTcgMTYgMjQgMTkuNTgxNyAyNCAyNEMyNCAyOC40MTgzIDI3LjU4MTcgMzIgMzIgMzJaTTMyIDM2QzI1LjMzMzMgMzYgMTIgMzkuMzMzMyAxMiA0NlY0OEg1MlY0NkM1MiAzOS4zMzMzIDM4LjY2NjcgMzYgMzIgMzZaIiBmaWxsPSIjOUI5Qjk5Ii8+Cjwvc3ZnPgo=';
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {cliente.user_profile?.name || 'Cliente'}
              </h2>
              <p className="text-gray-500">{cliente.razon_social}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  cliente.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {cliente.activo ? 'Activo' : 'Inactivo'}
                </span>
                {cliente.sector && (
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {cliente.sector}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canEdit && (
              <button
                onClick={() => onEdit(cliente)}
                className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información Personal */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="font-medium text-gray-900">
                        {cliente.user_profile?.name || 'Sin nombre'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{cliente.user_profile?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">CUIT</p>
                      <p className="font-medium text-gray-900">{cliente.cuit || 'No especificado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Perfil de Usuario</p>
                      <button
                        onClick={openUserProfile}
                        className="font-medium text-green-600 hover:text-green-700 transition-colors"
                      >
                        Ver perfil completo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Empresarial */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Empresarial</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Razón Social</p>
                      <p className="font-medium text-blue-900">
                        {cliente.razon_social || 'No especificada'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Nombre Comercial</p>
                      <p className="font-medium text-blue-900">
                        {cliente.nombre_comercial || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Sector</p>
                      <p className="font-medium text-blue-900">
                        {cliente.sector || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Empresa</p>
                      <p className="font-medium text-blue-900">
                        {cliente.empresa || 'No especificada'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cliente.telefono && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-green-600">Teléfono</p>
                        <p className="font-medium text-green-900">{cliente.telefono}</p>
                      </div>
                    </div>
                  )}
                  
                  {cliente.direccion && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-green-600">Dirección</p>
                        <p className="font-medium text-green-900">{cliente.direccion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Consultor Asignado */}
              {cliente.consultor && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultor Asignado</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">
                        {cliente.consultor.user_profile?.name || 'Sin nombre'}
                      </p>
                      <p className="text-sm text-purple-600">
                        {cliente.consultor.user_profile?.email}
                      </p>
                      {cliente.consultor.empresa && (
                        <p className="text-sm text-purple-600">
                          {cliente.consultor.empresa}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Lateral */}
            <div className="space-y-6">
              {/* Productos */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
                  <button
                    onClick={() => setShowProductos(!showProductos)}
                    className="flex items-center space-x-2 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-sm"
                  >
                    <Package className="w-4 h-4" />
                    <span>{showProductos ? 'Ocultar' : 'Ver'}</span>
                  </button>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {cliente.productos?.length || 0}
                  </p>
                  <p className="text-sm text-gray-500">Productos registrados</p>
                </div>

                {showProductos && (
                  <div className="mt-4 space-y-3">
                    {loadingProductos ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                      </div>
                    ) : productos.length > 0 ? (
                      productos.map((producto) => (
                        <div key={producto.id} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{producto.nombre}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProductStatusColor(producto)}`}>
                              {producto.qr_code_url && producto.djc_url && producto.certificado_url ? 'Completo' : 
                               producto.qr_code_url || producto.djc_url || producto.certificado_url ? 'Parcial' : 'Pendiente'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{producto.fabricante}</p>
                          <div className="flex items-center space-x-1">
                            {producto.qr_code_url && (
                              <button
                                onClick={() => openDocument(producto.qr_code_url)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Ver QR"
                              >
                                <QrCode className="w-3 h-3" />
                              </button>
                            )}
                            {producto.djc_url && (
                              <button
                                onClick={() => openDocument(producto.djc_url)}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                title="Ver DJC"
                              >
                                <FileText className="w-3 h-3" />
                              </button>
                            )}
                            {producto.certificado_url && (
                              <button
                                onClick={() => openDocument(producto.certificado_url)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Ver Certificado"
                              >
                                <Award className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 text-sm py-4">
                        No hay productos registrados
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Información del Sistema */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Creado</p>
                    <p className="font-medium text-gray-900">{formatDateTime(cliente.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Última actualización</p>
                    <p className="font-medium text-gray-900">{formatDateTime(cliente.updated_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID del Cliente</p>
                    <p className="font-medium text-gray-900 font-mono text-xs">{cliente.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};