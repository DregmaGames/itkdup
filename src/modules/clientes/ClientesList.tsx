import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Package, 
  Eye,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Table,
  Grid,
  FileText,
  Building,
  Hash
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Cliente, ClienteViewMode, ClienteFilters, CreateClienteData, UpdateClienteData } from '../../types/clientes';
import { ClienteTableView } from './views/ClienteTableView';
import { ClienteCardView } from './views/ClienteCardView';
import { ClienteModal } from './ClienteModal';
import { ClienteDetailModal } from './ClienteDetailModal';

export const ClientesList: React.FC = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ClienteViewMode>('table');
  const [filters, setFilters] = useState<ClienteFilters>({
    search: '',
    sector: '',
    activo: null,
    consultor_id: ''
  });
  
  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Estados para filtros
  const [sectores, setSectores] = useState<string[]>([]);
  const [consultores, setConsultores] = useState<Array<{ id: string; name: string }>>([]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('clientes')
        .select(`
          *,
          user_profile:user_profiles!clientes_user_id_fkey(*),
          consultor:consultores!clientes_consultor_id_fkey(
            id,
            company_name,
            user_profile:user_profiles!consultores_user_id_fkey(name, email)
          ),
          productos(*)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros según el rol
      if (user?.role === 'Consultor') {
        // Consultor solo ve sus clientes
        const { data: consultorData } = await supabase
          .from('consultores')
          .select('id')
          .eq('user_id', user.id);
        
        if (consultorData && consultorData.length > 0) {
          query = query.eq('consultor_id', consultorData[0].id);
        } else {
          setClientes([]);
          return;
        }
      } else if (user?.role === 'Cert') {
        // Certificador ve clientes de sus consultores
        const { data: certData } = await supabase
          .from('certificadores')
          .select('id')
          .eq('user_id', user.id);
        
        if (certData && certData.length > 0) {
          const { data: consultoresData } = await supabase
            .from('consultores')
            .select('id')
            .eq('certificador_id', certData[0].id);
          
          if (consultoresData && consultoresData.length > 0) {
            const consultorIds = consultoresData.map(c => c.id);
            query = query.in('consultor_id', consultorIds);
          } else {
            setClientes([]);
            return;
          }
        } else {
          setClientes([]);
          return;
        }
      }
      // Admin ve todos los clientes (sin filtros adicionales)

      const { data, error } = await query;

      if (error) throw error;
      setClientes(data || []);

      // Extraer sectores únicos para filtros
      const uniqueSectores = [...new Set(data?.map(c => c.sector).filter(Boolean) as string[])];
      setSectores(uniqueSectores);

    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultores = async () => {
    try {
      let query = supabase
        .from('consultores')
        .select(`
          id,
          user_profile:user_profiles!consultores_user_id_fkey(name, email)
        `);

      // Filtrar consultores según el rol
      if (user?.role === 'Cert') {
        const { data: certData } = await supabase
          .from('certificadores')
          .select('id')
          .eq('user_id', user.id);
        
        if (certData && certData.length > 0) {
          query = query.eq('certificador_id', certData[0].id);
        }
      }

      const { data } = await query;
      
      if (data) {
        const consultorOptions = data.map(c => ({
          id: c.id,
          name: c.user_profile?.name || c.user_profile?.email || 'Sin nombre'
        }));
        setConsultores(consultorOptions);
      }
    } catch (err) {
      console.error('Error fetching consultores:', err);
    }
  };

  useEffect(() => {
    if (user?.role && user.role !== 'Cliente') {
      fetchClientes();
      fetchConsultores();
    }
  }, [user]);

  const handleCreateCliente = async (data: CreateClienteData) => {
    try {
      // Primero crear el user_profile
      const { data: newUser, error: userError } = await supabase
        .from('user_profiles')
        .insert({
          email: data.email,
          role: 'Cliente',
          name: data.name
        })
        .select()
        .single();

      if (userError) throw userError;

      // Obtener el ID del consultor actual si es consultor
      let consultorId = null;
      if (user?.role === 'Consultor') {
        const { data: consultorData } = await supabase
          .from('consultores')
          .select('id')
          .eq('user_id', user.id)
          .single();
        consultorId = consultorData?.id || null;
      }

      // Crear el cliente
      const { error: clienteError } = await supabase
        .from('clientes')
        .insert({
          user_id: newUser.id,
          consultor_id: consultorId,
          cuit: data.cuit,
          razon_social: data.razon_social,
          nombre_comercial: data.nombre_comercial,
          empresa: data.empresa || data.razon_social,
          sector: data.sector,
          telefono: data.telefono,
          direccion: data.direccion,
          avatar: data.avatar
        });

      if (clienteError) throw clienteError;

      await fetchClientes();
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || 'Error al crear cliente');
    }
  };

  const handleUpdateCliente = async (id: string, data: UpdateClienteData) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await fetchClientes();
      setShowEditModal(false);
      setSelectedCliente(null);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar cliente');
    }
  };

  const handleDeleteCliente = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchClientes();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cliente');
    }
  };

  const filteredClientes = clientes.filter(cliente => {
    const searchTerm = filters.search.toLowerCase();
    const matchesSearch = !filters.search || 
      cliente.user_profile?.name?.toLowerCase().includes(searchTerm) ||
      cliente.user_profile?.email?.toLowerCase().includes(searchTerm) ||
      cliente.cuit?.toLowerCase().includes(searchTerm) ||
      cliente.razon_social?.toLowerCase().includes(searchTerm) ||
      cliente.nombre_comercial?.toLowerCase().includes(searchTerm);

    const matchesSector = !filters.sector || cliente.sector === filters.sector;
    const matchesActivo = filters.activo === null || cliente.activo === filters.activo;
    const matchesConsultor = !filters.consultor_id || cliente.consultor_id === filters.consultor_id;

    return matchesSearch && matchesSector && matchesActivo && matchesConsultor;
  });

  const getTotalStats = () => {
    const totalClientes = clientes.length;
    const clientesActivos = clientes.filter(c => c.activo).length;
    const totalProductos = clientes.reduce((sum, c) => sum + (c.productos?.length || 0), 0);
    const sectoresUnicos = new Set(clientes.map(c => c.sector).filter(Boolean)).size;
    
    return { totalClientes, clientesActivos, totalProductos, sectoresUnicos };
  };

  const stats = getTotalStats();

  // Verificar permisos de acceso
  if (user?.role === 'Cliente') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a la gestión de clientes.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-red-800 font-medium">Error al cargar clientes</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchClientes}
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
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">
              {user?.role === 'Admin' ? 'Gestión completa de clientes' : 
               user?.role === 'Cert' ? 'Clientes bajo tu supervisión' : 
               'Tus clientes asignados'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {(user?.role === 'Admin' || user?.role === 'Consultor') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Cliente</span>
            </button>
          )}
          
          <button
            onClick={fetchClientes}
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
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClientes}</p>
              <p className="text-sm text-green-600">{stats.clientesActivos} activos</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProductos}</p>
              <p className="text-sm text-gray-500">Total productos</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sectores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sectoresUnicos}</p>
              <p className="text-sm text-gray-500">Diferentes sectores</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalClientes > 0 ? Math.round(stats.totalProductos / stats.totalClientes) : 0}
              </p>
              <p className="text-sm text-gray-500">Productos/Cliente</p>
            </div>
            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, CUIT..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[300px]"
              />
            </div>

            <select
              value={filters.sector}
              onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos los sectores</option>
              {sectores.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <select
              value={filters.activo === null ? '' : filters.activo.toString()}
              onChange={(e) => setFilters({ 
                ...filters, 
                activo: e.target.value === '' ? null : e.target.value === 'true' 
              })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>

            {consultores.length > 0 && (
              <select
                value={filters.consultor_id}
                onChange={(e) => setFilters({ ...filters, consultor_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos los consultores</option>
                {consultores.map(consultor => (
                  <option key={consultor.id} value={consultor.id}>{consultor.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Vista:</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Tabla</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Tarjetas</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Mostrando {filteredClientes.length} de {clientes.length} clientes
        </div>
      </div>

      {/* Clientes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No hay clientes disponibles</p>
            <p className="text-sm text-gray-400">
              {filters.search || filters.sector || filters.activo !== null || filters.consultor_id ? 
                'Intenta ajustar los filtros de búsqueda' : 
                'Los clientes aparecerán aquí cuando sean agregados'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'table' && (
              <ClienteTableView
                clientes={filteredClientes}
                onEdit={(cliente) => {
                  setSelectedCliente(cliente);
                  setShowEditModal(true);
                }}
                onDelete={handleDeleteCliente}
                onDetail={(cliente) => {
                  setSelectedCliente(cliente);
                  setShowDetailModal(true);
                }}
                canEdit={user?.role === 'Admin' || user?.role === 'Consultor'}
                canDelete={user?.role === 'Admin'}
              />
            )}
            {viewMode === 'cards' && (
              <ClienteCardView
                clientes={filteredClientes}
                onEdit={(cliente) => {
                  setSelectedCliente(cliente);
                  setShowEditModal(true);
                }}
                onDelete={handleDeleteCliente}
                onDetail={(cliente) => {
                  setSelectedCliente(cliente);
                  setShowDetailModal(true);
                }}
                canEdit={user?.role === 'Admin' || user?.role === 'Consultor'}
                canDelete={user?.role === 'Admin'}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ClienteModal
          mode="create"
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCliente}
        />
      )}

      {showEditModal && selectedCliente && (
        <ClienteModal
          mode="edit"
          cliente={selectedCliente}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCliente(null);
          }}
          onUpdate={(data) => handleUpdateCliente(selectedCliente.id, data)}
        />
      )}

      {showDetailModal && selectedCliente && (
        <ClienteDetailModal
          cliente={selectedCliente}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCliente(null);
          }}
          onEdit={(cliente) => {
            setShowDetailModal(false);
            setSelectedCliente(cliente);
            setShowEditModal(true);
          }}
          canEdit={user?.role === 'Admin' || user?.role === 'Consultor'}
        />
      )}
    </div>
  );
};