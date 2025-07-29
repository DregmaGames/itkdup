import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Building2, Package, Eye, RefreshCw, Shield, TrendingUp, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Certificador, Consultor, Cliente, AdminEntityType } from '../../types/admin';
import { Product } from '../../types/products';
import { User } from '../../types/auth';
import { AdminEntityModal } from './AdminEntityModal';
import { CreateUserModal } from './CreateUserModal';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminEntityType>('certificadores');
  const [certificadores, setCertificadores] = useState<Certificador[]>([]);
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  // Estadísticas para el resumen
  const [stats, setStats] = useState({
    totalCertificadores: 0,
    totalConsultores: 0,
    totalClientes: 0,
    totalProductos: 0,
    totalAdminUsers: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch admin users
      const { data: adminData, error: adminError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'Admin')
        .order('created_at', { ascending: false });

      if (adminError) throw adminError;

      // Fetch certificadores
      const { data: certData, error: certError } = await supabase
        .from('certificadores')
        .select(`
          *,
          user_profile:user_profiles!certificadores_user_id_fkey(id, email, name, role)
        `)
        .order('created_at', { ascending: false });

      if (certError) throw certError;

      // Fetch consultores
      const { data: consData, error: consError } = await supabase
        .from('consultores')
        .select(`
          *,
          user_profile:user_profiles!consultores_user_id_fkey(id, email, name, role),
          certificador:certificadores!consultores_certificador_id_fkey(
            id,
            empresa,
            user_profile:user_profiles!certificadores_user_id_fkey(name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (consError) throw consError;

      // Fetch clientes
      const { data: clientData, error: clientError } = await supabase
        .from('clientes')
        .select(`
          *,
          user_profile:user_profiles!clientes_user_id_fkey(id, email, name, role),
          consultor:consultores!clientes_consultor_id_fkey(
            id,
            empresa,
            user_profile:user_profiles!consultores_user_id_fkey(name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (clientError) throw clientError;

      // Fetch productos
      const { data: prodData, error: prodError } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      setCertificadores(certData || []);
      setConsultores(consData || []);
      setClientes(clientData || []);
      setProductos(prodData || []);
      setAdminUsers(adminData || []);

      // Actualizar estadísticas
      setStats({
        totalCertificadores: certData?.length || 0,
        totalConsultores: consData?.length || 0,
        totalClientes: clientData?.length || 0,
        totalProductos: prodData?.length || 0,
        totalAdminUsers: adminData?.length || 0,
      });

    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEntityDetail = (entity: any) => {
    setSelectedEntity(entity);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { key: 'certificadores', label: 'Certificadores', icon: Shield, count: stats.totalCertificadores },
    { key: 'consultores', label: 'Consultores', icon: UserCheck, count: stats.totalConsultores },
    { key: 'clientes', label: 'Clientes', icon: Building2, count: stats.totalClientes },
    { key: 'productos', label: 'Productos', icon: Package, count: stats.totalProductos },
    { key: 'admin_users', label: 'Usuarios Admin', icon: Users, count: stats.totalAdminUsers },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestión completa de entidades del sistema</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Usuario</span>
          </button>
          
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer transition-all ${
              activeTab === tab.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab(tab.key as AdminEntityType)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tab.label}</p>
                <p className="text-2xl font-bold text-gray-900">{tab.count}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                activeTab === tab.key ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <tab.icon className={`w-6 h-6 ${
                  activeTab === tab.key ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as AdminEntityType)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'certificadores' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Certificadores</h3>
              {certificadores.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay certificadores registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Empresa</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Especialidad</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificadores.map((cert) => (
                        <tr key={cert.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">
                              {cert.user_profile?.name || 'Sin nombre'}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {cert.user_profile?.email}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {cert.empresa || 'No especificada'}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {cert.especialidad || 'No especificada'}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              cert.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {cert.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleEntityDetail(cert)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'consultores' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Consultores</h3>
              {consultores.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay consultores registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Empresa</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Certificador</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultores.map((cons) => (
                        <tr key={cons.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">
                              {cons.user_profile?.name || 'Sin nombre'}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {cons.user_profile?.email}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {cons.empresa || 'No especificada'}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {cons.certificador?.user_profile?.name || 'Sin asignar'}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              cons.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {cons.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleEntityDetail(cons)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'clientes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Clientes</h3>
              {clientes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay clientes registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Empresa</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Consultor</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map((client) => (
                        <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">
                              {client.user_profile?.name || 'Sin nombre'}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {client.user_profile?.email}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {client.empresa || 'No especificada'}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {client.consultor?.user_profile?.name || 'Sin asignar'}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              client.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {client.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleEntityDetail(client)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'admin_users' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Usuarios Administradores</h3>
              {adminUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay usuarios administradores registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha Creación</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Última Actualización</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((admin) => (
                        <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="font-medium text-gray-900">
                                {admin.name || 'Sin nombre'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {admin.email}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {formatDate(admin.created_at)}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {formatDate(admin.updated_at)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleEntityDetail(admin)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'productos' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
              {productos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay productos registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Fabricante</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Documentos</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((prod) => (
                        <tr key={prod.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{prod.nombre}</div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{prod.fabricante}</td>
                          <td className="py-4 px-4 text-gray-600">{formatDate(prod.fecha)}</td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-1">
                              {prod.qr_code_url && (
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  QR
                                </span>
                              )}
                              {prod.djc_url && (
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  DJC
                                </span>
                              )}
                              {prod.certificado_url && (
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Cert
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleEntityDetail(prod)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedEntity && (
        <AdminEntityModal
          entity={selectedEntity}
          entityType={activeTab}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSuccess={() => {
          fetchData(); // Refrescar datos después de crear usuario
        }}
      />
    </div>
  );
};