import React from 'react';
import { Shield, Mail, Phone, ExternalLink } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">ModularApp</h3>
                <p className="text-sm text-gray-400">Sistema de Certificación</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Plataforma integral para la gestión y verificación de productos certificados. 
              Garantizamos la autenticidad y trazabilidad de todos los documentos.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <a 
                  href="mailto:soporte@modularapp.com" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  soporte@modularapp.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <a 
                  href="tel:+5411123456789" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  +54 11 1234-5678
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <a 
                  href="https://www.modularapp.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  www.modularapp.com
                </a>
              </div>
            </div>
          </div>

          {/* Legal Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Información Legal</h4>
            <div className="space-y-3">
              <a 
                href="/privacy-policy" 
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Política de Privacidad
              </a>
              <a 
                href="/terms-of-service" 
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Términos de Servicio
              </a>
              <a 
                href="/certificate-verification" 
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Verificación de Certificados
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-yellow-400 mb-2">Aviso Legal</h5>
            <p className="text-gray-400 text-xs leading-relaxed">
              Los documentos mostrados en este sitio son verificados y auténticos al momento de su publicación. 
              La validez de los certificados está sujeta a las condiciones establecidas por el organismo certificador correspondiente. 
              Para verificar la vigencia actual de un certificado, contacte directamente con el emisor. 
              ModularApp no se hace responsable por el uso indebido de la información aquí contenida.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} ModularApp. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">
                Verificación pública v1.0
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Sistema operativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};