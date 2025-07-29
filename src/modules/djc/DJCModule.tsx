import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  RefreshCw, 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  PenTool,
  User,
  Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProductoDJC, DJCPermissions } from '../../types/djc';
import { getDJCPermissions } from '../../utils/djcPermissions';
import { DJCViewer } from './DJCViewer';
import { DJCGenerator } from './DJCGenerator';

export const DJCModule: React.FC = () => {
  const { user } = useAuth();
  const [productos, setProductos] = useState<ProductoDJC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductoDJC | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('productos')
        .select(`
          id,
          nombre,
          fabricante,
          fecha,
          cliente_id,
          djc_firmada_url,
          created_at,
          user_profile:clientes!productos_cliente_id_fkey(
            user_profile:user_profiles!clientes_user_id_fkey(
              id,
              name,
              email,
              firma_png_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (user?.role === 'Cliente') {
        query = query.eq('cliente_id', user.id);
      } else if (user?.role === 'Consultor') {
        // Get consultor's clients
        const { data: consultorData } = await supabase
          .from('consultores')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (consultorData) {
          const { data: clientesData } = await supabase
            .from('clientes')
            .select('user_id')
            .eq('consultor_id', consultorData.id);
          
          if (clientesData && clientesData.length > 0) {
            const clientIds = clientesData.map(c => c.user_id);
            query = query.in('cliente_id', clientIds);
          } else {
            setProductos([]);
            return;
          }
        }
      } else if (user?.role === 'Cert') {
        // Get certifier's consultants' clients
        const { data: certData } = await supabase
          .from('certificadores')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (certData) {
          const { data: consultoresData } = await supabase
            .from('consultores')
            .select('id')
            .eq('certificador_id', certData.id);
          
          if (consultoresData && consultoresData.length > 0) {
            const consultorIds = consultoresData.map(c => c.id);
            const { data: clientesData } = await supabase
              .from('clientes')
              .select('user_id')
              .in('consultor_id', consultorIds);
            
            if (clientesData && clientesData.length > 0) {
              const clientIds = clientesData.map(c => c.user_id);
              query = query.in('cliente_id', clientIds);
            } else {
              setProductos([]);
              return;
            }
          }
        }
      }
      // Admin sees all products (no additional filtering)

      const { data, error } = await query;

      if (error) throw error;
      setProductos(data || []);

    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [user]);

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.user_profile?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProductPermissions = (product: ProductoDJC): DJCPermissions => {
    const isOwnProduct = user?.role === 'Cliente' && product.cliente_id === user.id;
    return getDJCPermissions(user?.role || '', isOwnProduct);
  };

  const getDocumentStatus = (product: ProductoDJC) => {
    if (product.djc_firmada_url) {
      return {
        status: 'signed' as const,
        icon: CheckCircle,
        text: 'DJC Firmada',
        color: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        status: 'pending' as const,
        icon: Clock,
        text: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800'
      };
    }
  };

  const handleViewDJC = (product: ProductoDJC) => {
    setSelectedProduct(product);
    setShowViewer(true);
  };

  const handleGenerateDJC = (product: ProductoDJC) => {
    setSelectedProduct(product);
    setShowGenerator(true);
  };

  const handleDownloadDJC = (product: ProductoDJC) => {
    if (product.djc_firmada_url) {
      const link = document.createElement('a');
      link.href = product.djc_firmada_url;
      link.download = `DJC_Firmada_${product.nombre}.pdf`;
      link.click();
    }
  };

  const handleDJCGenerated = (product: ProductoDJC, url: string) => {
    setProductos(prev => prev.map(p => 
      p.id === product.id ? { ...p, djc_firmada_url: url } : p
    ));
    setShowGenerator(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos para DJC...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-red-800 font-medium">Error al cargar productos</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchProductos}
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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DJC Firmadas</h1>
            <p className="text-gray-600">
              Gestión de Declaraciones Juradas de Conformidad digitales
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={fetchProductos}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{productos.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">DJCs Firmadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {productos.filter(p => p.djc_firmada_url).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {productos.filter(p => !p.djc_firmada_url).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rol Actual</p>
              <p className="text-lg font-bold text-gray-900">{user?.role}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Productos ({filteredProductos.length})
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {searchTerm && `Filtrado por: "${searchTerm}"`}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredProductos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No hay productos disponibles</p>
              <p className="text-sm text-gray-400">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los productos aparecerán aquí'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Producto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado DJC</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductos.map((product) => {
                  const status = getDocumentStatus(product);
                  const permissions = getProductPermissions(product);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.nombre}</p>
                            <p className="text-sm text-gray-500">{product.fabricante}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.user_profile?.name || 'Sin nombre'}
                          </p>
                          <p className="text-sm text-gray-500">{product.user_profile?.email}</p>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.text}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(product.created_at)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          {permissions.canView && (
                            <button
                              onClick={() => handleViewDJC(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver vista previa"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          
                          {permissions.canGenerate && !product.djc_firmada_url && (
                            <button
                              onClick={() => handleGenerateDJC(product)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Generar DJC firmada"
                            >
                              <PenTool className="w-4 h-4" />
                            </button>
                          )}
                          
                          {permissions.canDownload && product.djc_firmada_url && (
                            <button
                              onClick={() => handleDownloadDJC(product)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Descargar DJC firmada"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && showViewer && (
        <DJCViewer
          product={selectedProduct}
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
        />
      )}

      {selectedProduct && showGenerator && (
        <DJCGenerator
          product={selectedProduct}
          isOpen={showGenerator}
          onClose={() => setShowGenerator(false)}
          onGenerated={handleDJCGenerated}
        />
      )}
    </div>
  );
};