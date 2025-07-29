import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  User, 
  Building2, 
  Package, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Award,
  FileText,
  QrCode,
  Clock
} from 'lucide-react';
import { ConsultorWithClients } from '../../types/certifier';

interface ConsultantTreeProps {
  consultants: ConsultorWithClients[];
  onDetailView: (item: any, type: 'consultant' | 'client' | 'product') => void;
  searchTerm: string;
}

export const ConsultantTree: React.FC<ConsultantTreeProps> = ({
  consultants,
  onDetailView,
  searchTerm
}) => {
  const [expandedConsultants, setExpandedConsultants] = useState<Set<string>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const toggleConsultant = (consultantId: string) => {
    const newExpanded = new Set(expandedConsultants);
    if (newExpanded.has(consultantId)) {
      newExpanded.delete(consultantId);
    } else {
      newExpanded.add(consultantId);
    }
    setExpandedConsultants(newExpanded);
  };

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProductStatusColor = (product: any) => {
    const hasAll = product.qr_code_url && product.djc_url && product.certificado_url;
    const hasPartial = product.qr_code_url || product.djc_url || product.certificado_url;
    
    if (hasAll) return 'bg-green-100 text-green-800';
    if (hasPartial) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (consultants.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No hay consultores asignados</p>
        <p className="text-sm text-gray-400">
          {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los consultores aparecerán aquí cuando sean asignados'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {consultants.map((consultant) => (
        <div key={consultant.id} className="border border-gray-200 rounded-lg">
          {/* Consultant Level */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleConsultant(consultant.id)}
                  className="p-1 hover:bg-blue-200 rounded transition-colors"
                >
                  {expandedConsultants.has(consultant.id) ? (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                </button>
                
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {consultant.user_profile?.name || 'Sin nombre'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      consultant.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {consultant.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {consultant.empresa || 'Empresa no especificada'}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {consultant.clientes?.length || 0} clientes
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {consultant.clientes?.reduce((sum, client) => sum + (client.productos?.length || 0), 0) || 0} productos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onDetailView(consultant, 'consultant')}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>Ver Detalles</span>
              </button>
            </div>
          </div>

          {/* Clients Level */}
          {expandedConsultants.has(consultant.id) && (
            <div className="border-t border-gray-200">
              {consultant.clientes && consultant.clientes.length > 0 ? (
                <div className="p-4 space-y-3">
                  {consultant.clientes.map((client) => (
                    <div key={client.id} className="border border-gray-100 rounded-lg">
                      <div className="p-3 bg-gradient-to-r from-green-50 to-green-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleClient(client.id)}
                              className="p-1 hover:bg-green-200 rounded transition-colors"
                            >
                              {expandedClients.has(client.id) ? (
                                <ChevronDown className="w-4 h-4 text-green-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-green-600" />
                              )}
                            </button>
                            
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">
                                  {client.user_profile?.name || 'Sin nombre'}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  client.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {client.activo ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {client.empresa || 'Empresa no especificada'} • {client.sector || 'Sector no especificado'}
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Package className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {client.productos?.length || 0} productos
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => onDetailView(client, 'client')}
                            className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:bg-green-200 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver Detalles</span>
                          </button>
                        </div>
                      </div>

                      {/* Products Level */}
                      {expandedClients.has(client.id) && (
                        <div className="border-t border-gray-100">
                          {client.productos && client.productos.length > 0 ? (
                            <div className="p-3 space-y-2">
                              {client.productos.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                      <Package className="w-4 h-4 text-white" />
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <h5 className="font-medium text-gray-900">{product.nombre}</h5>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProductStatusColor(product)}`}>
                                          {product.qr_code_url && product.djc_url && product.certificado_url ? 'Completo' : 
                                           product.qr_code_url || product.djc_url || product.certificado_url ? 'Parcial' : 'Pendiente'}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600">{product.fabricante}</p>
                                      <div className="flex items-center space-x-4 mt-1">
                                        <div className="flex items-center space-x-1">
                                          <Clock className="w-3 h-3 text-gray-400" />
                                          <span className="text-xs text-gray-500">
                                            {formatDate(product.fecha)}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          {product.qr_code_url && (
                                            <QrCode className="w-3 h-3 text-blue-500" title="QR disponible" />
                                          )}
                                          {product.djc_url && (
                                            <FileText className="w-3 h-3 text-purple-500" title="DJC disponible" />
                                          )}
                                          {product.certificado_url && (
                                            <Award className="w-3 h-3 text-green-500" title="Certificado disponible" />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => onDetailView(product, 'product')}
                                    className="flex items-center space-x-2 px-3 py-2 text-orange-600 hover:bg-orange-200 rounded-lg transition-colors text-sm font-medium"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Ver Detalles</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm">No hay productos registrados</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm">No hay clientes asignados a este consultor</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};