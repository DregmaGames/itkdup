import React from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  User, 
  Building2, 
  Hash, 
  Phone, 
  Calendar,
  Mail,
  MapPin,
  Package,
  Briefcase,
  Building
} from 'lucide-react';
import { Cliente } from '../../../types/clientes';

interface ClienteCardViewProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onDetail: (cliente: Cliente) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const ClienteCardView: React.FC<ClienteCardViewProps> = ({
  clientes,
  onEdit,
  onDelete,
  onDetail,
  canEdit,
  canDelete
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {clientes.map((cliente) => (
        <div
          key={cliente.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        >
          {/* Card Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {cliente.avatar ? (
                  <img
                    src={cliente.avatar}
                    alt={cliente.user_profile?.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyNEMyNy4zMTM3IDI0IDMwIDIxLjMxMzcgMzAgMThDMzAgMTQuNjg2MyAyNy4zMTM3IDEyIDI0IDEyQzIwLjY4NjMgMTIgMTggMTQuNjg2MyAxOCAxOEMxOCAyMS4zMTM3IDIwLjY4NjMgMjQgMjQgMjRaTTI0IDI3QzE5LjUgMjcgMTAuNSAyOS4yNSAxMC41IDMzVjM2SDM3LjVWMzNDMzcuNSAyOS4yNSAyOC41IDI3IDI0IDI3WiIgZmlsbD0iIzlCOUI5OSIvPgo8L3N2Zz4K';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {cliente.user_profile?.name || 'Sin nombre'}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {cliente.razon_social || 'Razón social no especificada'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  cliente.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {cliente.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            {/* Información básica */}
            <div className="space-y-3">
              {cliente.user_profile?.email && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{cliente.user_profile.email}</span>
                </div>
              )}
              
              {cliente.cuit && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="font-mono">{cliente.cuit}</span>
                </div>
              )}
              
              {cliente.telefono && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{cliente.telefono}</span>
                </div>
              )}
              
              {cliente.direccion && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{cliente.direccion}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {cliente.sector && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {cliente.sector}
                </span>
              )}
              
              {cliente.nombre_comercial && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <Building className="w-3 h-3 mr-1" />
                  {cliente.nombre_comercial}
                </span>
              )}
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-1">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {cliente.productos?.length || 0}
                </p>
                <p className="text-xs text-gray-500">Productos</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mx-auto mb-1">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900">
                  {formatDate(cliente.created_at)}
                </p>
                <p className="text-xs text-gray-500">Registro</p>
              </div>
            </div>

            {/* Consultor asignado */}
            {cliente.consultor && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                    <User className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Consultor</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {cliente.consultor.user_profile?.name || 'Sin nombre'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onDetail(cliente)}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>Ver Detalle</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {canEdit && (
                  <button
                    onClick={() => onEdit(cliente)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Editar cliente"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                
                {canDelete && (
                  <button
                    onClick={() => onDelete(cliente.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};