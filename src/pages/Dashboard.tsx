import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Package, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';

interface DashboardCard {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<any>;
  color: string;
  roles: string[];
}

const dashboardCards: DashboardCard[] = [
  {
    title: 'Usuarios Activos',
    value: '2,847',
    change: '+12%',
    icon: Users,
    color: 'bg-blue-500',
    roles: ['Admin', 'Cert']
  },
  {
    title: 'Productos',
    value: '1,234',
    change: '+8%',
    icon: Package,
    color: 'bg-green-500',
    roles: ['Admin', 'Cert']
  },
  {
    title: 'Consultas',
    value: '156',
    change: '+23%',
    icon: TrendingUp,
    color: 'bg-purple-500',
    roles: ['Admin', 'Cert', 'Consultor']
  },
  {
    title: 'Pendientes',
    value: '12',
    change: '-5%',
    icon: AlertCircle,
    color: 'bg-orange-500',
    roles: ['Admin', 'Cert', 'Consultor', 'Cliente']
  }
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const filteredCards = dashboardCards.filter(card => 
    user?.role && card.roles.includes(user.role)
  );

  const getDashboardMessage = () => {
    switch (user?.role) {
      case 'Admin':
        return 'Panel de administración principal';
      case 'Cert':
        return 'Panel de certificación';
      case 'Consultor':
        return 'Panel de consultoría';
      case 'Cliente':
        return 'Panel de cliente';
      default:
        return 'Panel de control';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Bienvenido, {user?.name || user?.email}!
          </h1>
          <p className="text-gray-600">{getDashboardMessage()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Sistema operativo</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-green-600">{card.change} vs mes anterior</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Nuevo usuario registrado</p>
                <p className="text-xs text-gray-500">Hace 2 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Producto actualizado</p>
                <p className="text-xs text-gray-500">Hace 15 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Consulta pendiente</p>
                <p className="text-xs text-gray-500">Hace 1 hora</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tareas Pendientes</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {user?.role === 'Admin' && (
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Configurar nuevos módulos</p>
                  <p className="text-xs text-gray-500">Pendiente</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">Revisar reportes mensuales</p>
                <p className="text-xs text-gray-500">Vence mañana</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">Actualizar datos de contacto</p>
                <p className="text-xs text-gray-500">Vence en 3 días</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future modules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Módulos Dinámicos</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">
            Los módulos se cargarán dinámicamente aquí
          </p>
          <p className="text-sm text-gray-400">
            Productos, Consultores, Clientes, QR Codes, Sync, etc.
          </p>
        </div>
      </div>
    </div>
  );
};