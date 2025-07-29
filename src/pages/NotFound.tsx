import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
        
        <p className="text-gray-500 mb-8">
          La página que buscas no existe o no tienes permisos para acceder a ella.
        </p>
        
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Volver al Dashboard</span>
        </Link>
      </div>
    </div>
  );
};