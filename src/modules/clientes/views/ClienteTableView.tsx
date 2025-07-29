import React from 'react';
import { Eye, Edit, Trash2, User, Building2, Hash, Phone, Calendar } from 'lucide-react';
import { Cliente } from '../../../types/clientes';

interface ClienteTableViewProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onDetail: (cliente: Cliente) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const ClienteTableView: React.FC<ClienteTableViewProps> = ({
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">CUIT</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Razón Social</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Sector</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Consultor</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Productos</th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  {cliente.avatar ? (
                    <img
                      src={cliente.avatar}
                      alt={cliente.user_profile?.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyMi43NjE0IDIwIDI1IDE3Ljc2MTQgMjUgMTVDMjUgMTIuMjM4NiAyMi43NjE0IDEwIDIwIDEwQzE3LjIzODYgMTAgMTUgMTIuMjM4NiAxNSAxNUMxNSAxNy43NjE0IDE3LjIzODYgMjAgMjAgMjBaTTIwIDIyLjVDMTYuMjUgMjIuNSA4Ljc1IDI0LjM3NSA4Ljc1IDI4VjMwSDMxLjI1VjI4QzMxLjI1IDI0LjM3NSAyMy43NSAyMi41IDIwIDIyLjVaIiBmaWxsPSIjOUI5Qjk5Ii8+Cjwvc3ZnPgo=';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium text-gray-900">
                      {cliente.user_profile?.name || 'Sin nombre'}
                    </p>
                    <p className="text-sm text-gray-500">{cliente.user_profile?.email}</p>
                  </div>
                </div>
              </td>
              
              <td className="py-4 px-4">
                <div className="flex items-center space-x-1">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 font-mono text-sm">
                    {cliente.cuit || 'No especificado'}
                  </span>
                </div>
              </td>
              
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {cliente.razon_social || 'No especificada'}
                  </p>
                  {cliente.nombre_comercial && (
                    <p className="text-sm text-gray-500">{cliente.nombre_comercial}</p>
                  )}
                </div>
              </td>
              
              <td className="py-4 px-4">
                {cliente.sector ? (
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {cliente.sector}
                  </span>
                ) : (
                  <span className="text-gray-400">No especificado</span>
                )}
              </td>
              
              <td className="py-4 px-4">
                {cliente.consultor ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {cliente.consultor.user_profile?.name || 'Sin nombre'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cliente.consultor.empresa || cliente.consultor.user_profile?.email}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-400">Sin asignar</span>
                )}
              </td>
              
              <td className="py-4 px-4">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  cliente.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {cliente.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              
              <td className="py-4 px-4">
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-orange-800">
                      {cliente.productos?.length || 0}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">productos</span>
                </div>
              </td>
              
              <td className="py-4 px-4">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onDetail(cliente)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {canEdit && (
                    <button
                      onClick={() => onEdit(cliente)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  
                  {canDelete && (
                    <button
                      onClick={() => onDelete(cliente.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};