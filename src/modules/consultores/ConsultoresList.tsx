import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Users, 
  Building2, 
  Package, 
  Eye,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  User,
  TrendingUp,
  Activity,
  ChevronRight,
  ChevronDown,
  Award,
  FileText,
  QrCode
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ConsultorDetail {
  id: string;
  user_id: string;
  certificador_id: string;
  empresa?: string;
  especialidad?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  user_profile: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  clientes?: Array<{
    id: string;
    user_id: string;
    empresa?: string;
    sector?: string;
    telefono?: string;
    direccion?: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
    user_profile: {
      id: string;
      email: string;
      name?: string;
      role: string;
    };
    productos?: Array<{
      id: string;
      nombre: string;
      fabricante: string;
      fecha: string;
      qr_code_url?: string;
      djc_url?: string;
      certificado_url?: string;
    }>;
  }>;
}

interface ConsultorModalProps {
  consultor: ConsultorDetail;
  isOpen: boolean;
  onClose: () => void;
}

const ConsultorModal: React.FC<ConsultorModalProps> = ({ consultor, isOpen, onClose }) => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {consultor.user_profile?.name || 'Consultor'}
              </h2>
              <p className="text-gray-500">Detalles del consultor y sus clientes</p>
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
          {/* Consultor Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Nombre</p>
                  <p className="font-medium text-blue-900">
                    {consultor.user_profile?.name || 'Sin nombre'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Email</p>
                  <p className="font-medium text-blue-900">{consultor.user_profile?.email}</p>
                </div>
              </div>
              
              {consultor.empresa && (
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Empresa</p>
                    <p className="font-medium text-blue-900">{consultor.empresa}</p>
                  </div>
                </div>
              )}
              
              {consultor.especialidad && (
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Especialidad</p>
                    <p className="font-medium text-blue-900">{consultor.especialidad}</p>
                  </div>
                </div>
              )}
              
              {consultor.telefono && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Teléfono</p>
                    <p className="font-medium text-blue-900">{consultor.telefono}</p>
                  </div>
                </div>
              )}
              
              {consultor.direccion && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Dirección</p>
                    <p className="font-medium text-blue-900">{consultor.direccion}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                consultor.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {consultor.activo ? 'Activo' : 'Inactivo'}
              </span>
              
              <div className="flex items-center space-x-4 text-sm text-blue-600">
                <div className="flex items-center space-x-1">
                  <Building2 className="w-4 h-4" />
                  <span>{consultor.clientes?.length || 0} clientes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>
                    {consultor.clientes?.reduce((sum, client) => sum + (client.productos?.length || 0), 0) || 0} productos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clientes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Clientes Asignados ({consultor.clientes?.length || 0})
            </h3>
            
            {consultor.clientes && consultor.clientes.length > 0 ? (
              <div className="space-y-3">
                {consultor.clientes.map((client) => (
                  <div key={client.id} className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-green-50">
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
                          
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          
                          <div>
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
                              {client.empresa || 'Empresa no especificada'} 
                              {client.sector && ` • ${client.sector}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-green-600">
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>{client.productos?.length || 0} productos</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Productos del cliente */}
                    {expandedClients.has(client.id) && (
                      <div className="border-t border-gray-200 p-4">
                        {client.productos && client.productos.length > 0 ? (
                          <div className="space-y-2">
                            <h5 className="font-medium text-gray-900 mb-3">
                              Productos ({client.productos.length})
                            </h5>
                            {client.productos.map((product) => (
                              <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <h6 className="font-medium text-gray-900">{product.nombre}</h6>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProductStatusColor(product)}`}>
                                        {product.qr_code_url && product.djc_url && product.certificado_url ? 'Completo' : 
                                         product.qr_code_url || product.djc_url || product.certificado_url ? 'Parcial' : 'Pendiente'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{product.fabricante}</p>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">{formatDate(product.fecha)}</span>
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
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p>No hay productos registrados para este cliente</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p>No hay clientes asignados a este consultor</p>
              </div>
            )}
          </div>

          {/* System Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Creado</p>
                <p className="font-medium text-gray-900">{formatDateTime(consultor.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última actualización</p>
                <p className="font-medium text-gray-900">{formatDateTime(consultor.updated_at)}</p>
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

export const ConsultoresList: React.FC = () => {
  const { user } = useAuth();
  const [consultores, setConsultores] = useState<ConsultorDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsultor, setSelectedConsultor] = useState<ConsultorDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchConsultores = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.role === 'Admin') {
        // Admin puede ver todos los consultores
        const { data, error } = await supabase
          .from('consultores')
          .select(`
            *,
            user_profile:user_profiles!consultores_user_id_fkey(*),
            clientes:clientes!clientes_consultor_id_fkey(
              *,
              user_profile:user_profiles!clientes_user_id_fkey(*),
             productos(*)
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setConsultores(data || []);

      } else if (user?.role === 'Cert') {
        // Certificador solo ve sus consultores
        // Primero verificar si existe el perfil del certificador
        const { data: certifierData, error: certifierError } = await supabase
          .from('certificadores')
          .select('id')
          .eq('user_id', user.id);

        if (certifierError) throw certifierError;

        if (!certifierData || certifierData.length === 0) {
          // No existe perfil de certificador, mostrar mensaje apropiado
          setConsultores([]);
        } else {
          // Obtener consultores del certificador existente
          const { data, error } = await supabase
            .from('consultores')
            .select(`
              *,
              user_profile:user_profiles!consultores_user_id_fkey(*),
              clientes:clientes!clientes_consultor_id_fkey(
                *,
                user_profile:user_profiles!clientes_user_id_fkey(*),
               productos(*)
              )
            `)
            .eq('certificador_id', certifierData[0].id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setConsultores(data || []);
        }
      }

    } catch (err: any) {
      setError(err.message || 'Error al cargar consultores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultores();
  }, [user]);

  const filteredConsultores = consultores.filter(consultor =>
    consultor.user_profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultor.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultor.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultor.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsultorStats = (consultor: ConsultorDetail) => {
    const totalClientes = consultor.clientes?.length || 0;
    const clientesActivos = consultor.clientes?.filter(c => c.activo).length || 0;
    const totalProductos = consultor.clientes?.reduce((sum, c) => sum + (c.productos?.length || 0), 0) || 0;
    
    return { totalClientes, clientesActivos, totalProductos };
  };

  const handleDetailView = (consultor: ConsultorDetail) => {
    setSelectedConsultor(consultor);
    setShowDetailModal(true);
  };

  const getTotalStats = () => {
    const totalClientes = consultores.reduce((sum, c) => sum + (c.clientes?.length || 0), 0);
    const totalProductos = consultores.reduce((sum, c) => 
      sum + (c.clientes?.reduce((clientSum, cl) => clientSum + (cl.productos?.length || 0), 0) || 0), 0);
    const consultoresActivos = consultores.filter(c => c.activo).length;
    
    return { totalClientes, totalProductos, consultoresActivos };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando consultores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-red-800 font-medium">Error al cargar consultores</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchConsultores}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Consultores</h1>
            <p className="text-gray-600">
              {user?.role === 'Admin' ? 'Gestión de todos los consultores' : 'Consultores bajo tu supervisión'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar consultores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={fetchConsultores}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Consultores</p>
              <p className="text-2xl font-bold text-gray-900">{consultores.length}</p>
              <p className="text-sm text-green-600">{stats.consultoresActivos} activos</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClientes}</p>
              <p className="text-sm text-gray-500">Bajo supervisión</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProductos}</p>
              <p className="text-sm text-gray-500">Certificados</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {consultores.length > 0 ? Math.round(stats.totalClientes / consultores.length) : 0}
              </p>
              <p className="text-sm text-gray-500">Clientes/Consultor</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Consultores List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Consultores ({filteredConsultores.length})
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {searchTerm && `Filtrado por: "${searchTerm}"`}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredConsultores.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">
                {user?.role === 'Cert' && consultores.length === 0 && !searchTerm ? 
                  'No tienes un perfil de certificador configurado' : 
                  'No hay consultores disponibles'
                }
              </p>
              <p className="text-sm text-gray-400">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 
                 user?.role === 'Cert' && consultores.length === 0 && !searchTerm ? 
                   'Contacta al administrador para configurar tu perfil de certificador' :
                   user?.role === 'Cert' ? 'Aún no tienes consultores asignados' : 'Los consultores aparecerán aquí'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredConsultores.map((consultor) => {
                const stats = getConsultorStats(consultor);
                return (
                  <div key={consultor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              {consultor.user_profile?.name || 'Sin nombre'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              consultor.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {consultor.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{consultor.user_profile?.email}</p>
                          <p className="text-sm text-gray-500">
                            {consultor.empresa || 'Empresa no especificada'}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDetailView(consultor)}
                        className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver Detalles</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
                          <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{stats.totalClientes}</p>
                        <p className="text-xs text-gray-500">Clientes</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mx-auto mb-2">
                          <Package className="w-5 h-5 text-orange-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{stats.totalProductos}</p>
                        <p className="text-xs text-gray-500">Productos</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{stats.clientesActivos}</p>
                        <p className="text-xs text-gray-500">Activos</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Creado: {formatDateTime(consultor.created_at)}</span>
                        </div>
                        {consultor.especialidad && (
                          <div className="flex items-center space-x-1">
                            <Shield className="w-4 h-4" />
                            <span>{consultor.especialidad}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedConsultor && (
        <ConsultorModal
          consultor={selectedConsultor}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};