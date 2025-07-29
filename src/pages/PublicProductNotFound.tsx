import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Search, Shield } from 'lucide-react';

export const PublicProductNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ModularApp</h1>
              <p className="text-sm text-gray-500">Sistema de Certificación</p>
            </div>
          </div>
        </div>
      </header>

      {/* Error Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-8 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-xl text-gray-600 mb-8">
            El producto que buscas no existe o no está disponible públicamente.
          </p>

          {/* Possible Reasons */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Posibles causas:</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                <span>El enlace del producto es incorrecto o ha expirado</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                <span>El producto ha sido removido del sistema público</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                <span>El identificador público no es válido</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                <span>Problema temporal con la base de datos</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver atrás</span>
            </button>

            <div className="text-center">
              <p className="text-gray-500 text-sm mb-4">¿Necesitas ayuda?</p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
                <a
                  href="mailto:soporte@modularapp.com"
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                >
                  Contactar Soporte
                </a>
                <a
                  href="/certificate-verification"
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                >
                  Verificar Certificado
                </a>
              </div>
            </div>
          </div>

          {/* URL Format Help */}
          <div className="mt-12 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Search className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Formato de URL correcto:</span>
            </div>
            <code className="text-sm text-gray-600 bg-white px-3 py-1 rounded border">
              /products/[identificador-uuid]
            </code>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">ModularApp</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 ModularApp. Sistema de Certificación y Verificación de Productos.
          </p>
        </div>
      </footer>
    </div>
  );
};