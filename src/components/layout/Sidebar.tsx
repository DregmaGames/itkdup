import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Package, FileText, Settings, QrCode, FolderSync as Sync, Shield, UserCheck, Building2 } from 'lucide-react';
import { UserCog, Award, PenTool } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    icon: Home,
    label: 'Dashboard',
    path: '/dashboard',
    roles: ['Admin', 'Cert', 'Consultor', 'Cliente']
  },
  // Módulos que se cargarán dinámicamente después
  {
    icon: Award,
    label: 'Certificador',
    path: '/certificador',
    roles: ['Cert']
  },
  {
    icon: UserCog,
    label: 'Administración',
    path: '/admin',
    roles: ['Admin']
  },
  {
    icon: Package,
    label: 'Productos',
    path: '/productos',
    roles: ['Admin', 'Cert', 'Consultor', 'Cliente']
  },
  {
    icon: UserCheck,
    label: 'Consultores',
    path: '/consultores',
    roles: ['Admin', 'Cert']
  },
  {
    icon: Building2,
    label: 'Clientes',
    path: '/clientes',
    roles: ['Admin', 'Cert', 'Consultor']
  },
  {
    icon: QrCode,
    label: 'Códigos QR',
    path: '/qr-codes',
    roles: ['Admin', 'Cert', 'Consultor']
  },
  {
    icon: PenTool,
    label: 'DJC Firmadas',
    path: '/djc-firmadas',
    roles: ['Admin', 'Cert', 'Consultor', 'Cliente']
  },
  {
    icon: Settings,
    label: 'Configuración',
    path: '/configuracion',
    roles: ['Admin']
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-200 ease-in-out z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-4">
          <nav className="space-y-2">
            {filteredMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User role indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Rol: {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};