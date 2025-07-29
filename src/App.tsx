import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { ProductList } from './modules/products/ProductList';
import { AdminDashboard } from './modules/admin/AdminDashboard';
import { CertifierDashboard } from './modules/certifiers/CertifierDashboard';
import { ConsultoresList } from './modules/consultores/ConsultoresList';
import { ClientesList } from './modules/clientes/ClientesList';
import { PublicProductView } from './pages/PublicProductView';
import { PublicProductNotFound } from './pages/PublicProductNotFound';
import { DJCModule } from './modules/djc/DJCModule';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  if (!user) {
    return null; // This will be handled by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <main className={`pt-16 transition-all duration-200 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'
      }`}>
        <div className="p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Placeholder routes for future modules */}
            <Route 
              path="/certificador" 
              element={
                <ProtectedRoute allowedRoles={['Cert']}>
                  <CertifierDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/productos" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Cert', 'Consultor', 'Cliente']}>
                  <ProductList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/consultores" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Cert']}>
                  <ConsultoresList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clientes" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Cert', 'Consultor']}>
                  <ClientesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/qr-codes" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Cert', 'Consultor']}>
                  <div className="text-center py-12">
                    <p className="text-gray-500">Módulo de QR Codes se cargará aquí</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sync" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Cert']}>
                  <div className="text-center py-12">
                    <p className="text-gray-500">Módulo de Sincronización se cargará aquí</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reportes" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Cert']}>
                  <div className="text-center py-12">
                    <p className="text-gray-500">Módulo de Reportes se cargará aquí</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracion" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <div className="text-center py-12">
                    <p className="text-gray-500">Módulo de Configuración se cargará aquí</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/djc-firmadas" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Cert', 'Consultor', 'Cliente']}>
                  <DJCModule />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - No authentication required */}
          <Route path="/products/:public_id" element={<PublicProductView />} />
          <Route path="/product-not-found" element={<PublicProductNotFound />} />
          
          {/* Private Routes - Authentication required */}
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;