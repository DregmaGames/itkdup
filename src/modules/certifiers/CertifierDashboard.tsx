import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Building2, 
  Package, 
  TrendingUp, 
  Activity,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CertifierProfile, ConsultorWithClients, CertifierStats } from '../../types/certifier';
import { ConsultantTree } from './ConsultantTree';
import { DetailModal } from './DetailModal';
import { CertifierStatsCard } from './CertifierStatsCard';

export const CertifierDashboard: React.FC = () => {
  const { user } = useAuth();
  const [certifierProfile, setCertifierProfile] = useState<CertifierProfile | null>(null);
  const [consultants, setConsultants] = useState<ConsultorWithClients[]>([]);
  const [stats, setStats] = useState<CertifierStats>({
    totalConsultants: 0,
    totalClients: 0,
    totalProducts: 0,
    activeConsultants: 0,
    activeClients: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [detailModalType, setDetailModalType] = useState<'certifier' | 'consultant' | 'client' | 'product'>('certifier');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchCertifierData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('Usuario no autenticado');

      // Fetch certifier profile - handle case where profile doesn't exist
      const { data: certifierData, error: certifierError } = await supabase
        .from('certificadores')
        .select(`
          *,
          user_profile:user_profiles!certificadores_user_id_fkey(*)
        `)
        .eq('user_id', user.id);

      if (certifierError) {
        console.error('Error fetching certifier:', certifierError);
        throw new Error('Error al obtener datos del certificador');
      }

      // Check if certifier profile exists
      if (!certifierData || certifierData.length === 0) {
        // No certifier profile exists for this user
        setCertifierProfile(null);
        setConsultants([]);
        setStats({
          totalConsultants: 0,
          totalClients: 0,
          totalProducts: 0,
          activeConsultants: 0,
          activeClients: 0,
          recentActivity: []
        });
        return;
      }

      const certifierProfile = certifierData[0];
      setCertifierProfile(certifierProfile);

      // Fetch consultants with their clients and products
      const { data: consultantsData, error: consultantsError } = await supabase
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
        .eq('certificador_id', certifierProfile.id)
        .order('created_at', { ascending: false });

      if (consultantsError) {
        console.error('Error fetching consultants:', consultantsError);
        // Don't throw here, just set empty array
        setConsultants([]);
      } else {
        setConsultants(consultantsData || []);
      }

      // Calculate statistics
      const consultantsList = consultantsData || [];
      const totalConsultants = consultantsList.length;
      const activeConsultants = consultantsList.filter(c => c.activo).length;
      const totalClients = consultantsList.reduce((sum, c) => sum + (c.clientes?.length || 0), 0);
      const activeClients = consultantsList.reduce((sum, c) => 
        sum + (c.clientes?.filter(cl => cl.activo).length || 0), 0) || 0;
      const totalProducts = consultantsList.reduce((sum, c) => 
        sum + (c.clientes?.reduce((clientSum, cl) => clientSum + (cl.productos?.length || 0), 0) || 0), 0) || 0;

      setStats({
        totalConsultants,
        totalClients,
        totalProducts,
        activeConsultants,
        activeClients,
        recentActivity: [
          { type: 'consultant', description: 'Nuevo consultor asignado', timestamp: '2024-01-09T10:00:00Z' },
          { type: 'client', description: 'Cliente actualizado', timestamp: '2024-01-09T08:30:00Z' },
          { type: 'product', description: 'Producto certificado', timestamp: '2024-01-09T07:15:00Z' }
        ]
      });

    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del certificador');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Cert') {
      fetchCertifierData();
    }
  }, [user]);

  const filteredConsultants = consultants.filter(consultant => {
    const consultantMatch = consultant.user_profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           consultant.empresa?.toLowerCase().includes(searchTerm.toLowerCase());
    const clientMatch = consultant.clientes?.some(client => 
      client.user_profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return consultantMatch || clientMatch;
  });

  const handleDetailView = (item: any, type: 'certifier' | 'consultant' | 'client' | 'product') => {
    setSelectedDetail(item);
    setDetailModalType(type);
    setShowDetailModal(true);
  };

  if (user?.role !== 'Cert') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Este módulo está reservado para usuarios con rol de Certificador.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de certificador...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-red-800 font-medium">Error al cargar datos</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCertifierData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Check if no certifier profile exists
  if (!certifierProfile) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Certificador</h1>
              <p className="text-gray-600">Configuración de perfil requerida</p>
            </div>
          </div>
        </div>

        {/* No Profile Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Perfil de Certificador No Configurado</h2>
            <p className="text-gray-600 mb-6">
              Tu cuenta tiene rol de Certificador, pero aún no tienes un perfil de certificador configurado en el sistema.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h3 className="font-medium text-gray-900 mb-2">¿Qué puedes hacer?</h3>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• Contacta al administrador del sistema para que configure tu perfil de certificador</li>
                  <li>• Verifica que tu cuenta tenga los permisos correctos</li>
                  <li>• Una vez configurado, podrás gestionar consultores y clientes</li>
                </ul>
              </div>
              
              <button
                onClick={fetchCertifierData}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Verificar Nuevamente</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Certificador</h1>
            <p className="text-gray-600">
              {certifierProfile?.empresa || 'Gestión jerárquica de consultores y clientes'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en jerarquía..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={fetchCertifierData}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Certifier Profile Card */}
      {certifierProfile && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mi Perfil de Certificador</h2>
            <button
              onClick={() => handleDetailView(certifierProfile, 'certifier')}
              className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
            >
              Ver Detalles
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-medium text-gray-900">
                {certifierProfile.user_profile?.name || 'Sin nombre'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Empresa</p>
              <p className="font-medium text-gray-900">
                {certifierProfile.empresa || 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Especialidad</p>
              <p className="font-medium text-gray-900">
                {certifierProfile.especialidad || 'No especificada'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <CertifierStatsCard
          title="Consultores"
          value={stats.totalConsultants}
          subtitle={`${stats.activeConsultants} activos`}
          icon={Users}
          color="bg-blue-500"
        />
        <CertifierStatsCard
          title="Clientes"
          value={stats.totalClients}
          subtitle={`${stats.activeClients} activos`}
          icon={Building2}
          color="bg-green-500"
        />
        <CertifierStatsCard
          title="Productos"
          value={stats.totalProducts}
          subtitle="Total certificados"
          icon={Package}
          color="bg-orange-500"
        />
        <CertifierStatsCard
          title="Eficiencia"
          value={`${stats.totalConsultants > 0 ? Math.round(stats.totalClients / stats.totalConsultants) : 0}`}
          subtitle="Clientes/Consultor"
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <CertifierStatsCard
          title="Productividad"
          value={`${stats.totalClients > 0 ? Math.round(stats.totalProducts / stats.totalClients) : 0}`}
          subtitle="Productos/Cliente"
          icon={BarChart3}
          color="bg-indigo-500"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hierarchical Tree */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Estructura Jerárquica</h2>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {filteredConsultants.length} consultores
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <ConsultantTree
                consultants={filteredConsultants}
                onDetailView={handleDetailView}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Gestionar Consultores</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Ver Reportes</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Historial de Certificaciones</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <DetailModal
          item={selectedDetail}
          type={detailModalType}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};