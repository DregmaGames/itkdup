import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Grid, 
  Image, 
  RefreshCw, 
  Search, 
  Filter, 
  Plus,
  Download,
  Edit,
  Trash2,
  AlertCircle,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, ViewMode } from '../../types/products';
import { useAuth } from '../../contexts/AuthContext';
import { TableView } from './views/TableView';
import { CardView } from './views/CardView';
import { GalleryView } from './views/GalleryView';
import { ProductDetailsModal } from './ProductDetailsModal';
import { ProductFormModal } from './ProductFormModal';
import { QRCodeModal } from './QRCodeModal';
import { SyncModal } from './components/SyncModal';

interface ProductFilters {
  search: string;
  cliente_id: string;
  consultor_id: string;
  fecha_desde: string;
  fecha_hasta: string;
  has_qr: boolean | null;
  has_djc: boolean | null;
  has_certificado: boolean | null;
}

export const ProductList: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    cliente_id: '',
    consultor_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    has_qr: null,
    has_djc: null,
    has_certificado: null
  });
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [showSyncModal, setShowSyncModal] = useState(false);
  
  // Filter options
  const [clientes, setClientes] = useState<Array<{id: string, name: string}>>([]);
  const [consultores, setConsultores] = useState<Array<{id: string, name: string}>>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('productos')
        .select(`
          *,
          cliente:clientes!inner(
            id,
            user_profile:user_profiles!clientes_user_id_fkey(name, email)
          )
        `)
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (user?.role === 'Cliente') {
        query = query.eq('cliente_id', user.id);
      } else if (user?.role === 'Consultor') {
        const { data: consultorData } = await supabase
          .from('consultores')
          .select('id')
          .eq('user_id', user.id);
        
      }

      // Apply filters
      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,fabricante.ilike.%${filters.search}%`);
      }
      
      if (filters.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id);
      }
      
      if (filters.fecha_desde) {
        query = query.gte('fecha', filters.fecha_desde);
      }
      
      if (filters.fecha_hasta) {
        query = query.lte('fecha', filters.fecha_hasta);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Apply document filters
      if (filters.has_qr !== null) {
        filteredData = filteredData.filter(p => 
          filters.has_qr ? !!p.qr_code_url : !p.qr_code_url
        );
      }
      
      if (filters.has_djc !== null) {
        filteredData = filteredData.filter(p => 
          filters.has_djc ? !!p.djc_url : !p.djc_url
        );
      }
      
      if (filters.has_certificado !== null) {
        filteredData = filteredData.filter(p => 
          filters.has_certificado ? !!p.certificado_url : !p.certificado_url
        );
      }

      setProducts(filteredData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Fetch clientes
      const { data: clientesData } = await supabase
        .from('clientes')
        .select(`
          user_id,
          user_profile:user_profiles!clientes_user_id_fkey(name, email)
        `)
        .eq('activo', true);

      if (clientesData) {
        setClientes(clientesData.map(c => ({
          id: c.user_id,
          name: c.user_profile?.name || c.user_profile?.email || 'Sin nombre'
        })));
      }

      // Fetch consultores
      let consultoresQuery = supabase
        .from('consultores')
        .select(`
          id,
          user_profile:user_profiles!consultores_user_id_fkey(name, email)
        `);

      // Filter consultores based on user role
      if (user?.role === 'Cert') {
        const { data: certData } = await supabase
          .from('certificadores')
          .select('id')
          .eq('user_id', user.id);
        
        if (certData && certData.length > 0) {
          consultoresQuery = consultoresQuery.eq('certificador_id', certData[0].id);
        }
      }

      const { data: consultoresData } = await consultoresQuery;

      if (consultoresData) {
        setConsultores(consultoresData.map(c => ({
          id: c.id,
          name: c.user_profile?.name || c.user_profile?.email || 'Sin nombre'
        })));
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, [user, filters]);

  const handleProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleShowQR = (product: Product) => {
    setSelectedProduct(product);
    setShowQRModal(true);
  };

  const handleCreateProduct = () => {
    setFormMode('create');
    setSelectedProduct(null);
    setShowFormModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormMode('edit');
    setSelectedProduct(product);
    setShowFormModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      await fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar producto');
    }
  };

  const handleProductSaved = () => {
    fetchProducts();
    setShowFormModal(false);
    setSelectedProduct(null);
  };

  const handleSyncSuccess = () => {
    fetchProducts();
    setShowSyncModal(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      cliente_id: '',
      consultor_id: '',
      fecha_desde: '',
      fecha_hasta: '',
      has_qr: null,
      has_djc: null,
      has_certificado: null
    });
  };

  const viewModeOptions = [
    { key: 'table', label: 'Tabla', icon: Table },
    { key: 'cards', label: 'Tarjetas', icon: Grid },
    { key: 'gallery', label: 'Galería', icon: Image }
  ];

  const canCreateEdit = user?.role === 'Admin' || user?.role === 'Cert';
  const canDelete = user?.role === 'Admin';
  const canSync = user?.role === 'Admin' || user?.role === 'Cert';

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
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-red-800 font-medium">Error al cargar productos</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchProducts}
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
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Grid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
            <p className="text-gray-600">
              Gestión completa de productos eléctricos ({products.length} productos)
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {canCreateEdit && (
            <button
              onClick={handleCreateProduct}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          )}
          
          {canSync && (
            <button
              onClick={() => setShowSyncModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Sincronizar con Base</span>
            </button>
          )}
          
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h2>
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Producto o fabricante..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select
              value={filters.cliente_id}
              onChange={(e) => setFilters({...filters, cliente_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los clientes</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
              ))}
            </select>
          </div>

          {/* Consultor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consultor</label>
            <select
              value={filters.consultor_id}
              onChange={(e) => setFilters({...filters, consultor_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los consultores</option>
              {consultores.map(consultor => (
                <option key={consultor.id} value={consultor.id}>{consultor.name}</option>
              ))}
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={filters.fecha_desde}
              onChange={(e) => setFilters({...filters, fecha_desde: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={filters.fecha_hasta}
              onChange={(e) => setFilters({...filters, fecha_hasta: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Document Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
            <select
              value={filters.has_qr === null ? '' : filters.has_qr.toString()}
              onChange={(e) => setFilters({
                ...filters, 
                has_qr: e.target.value === '' ? null : e.target.value === 'true'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Con QR</option>
              <option value="false">Sin QR</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DJC</label>
            <select
              value={filters.has_djc === null ? '' : filters.has_djc.toString()}
              onChange={(e) => setFilters({
                ...filters, 
                has_djc: e.target.value === '' ? null : e.target.value === 'true'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Con DJC</option>
              <option value="false">Sin DJC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificado</label>
            <select
              value={filters.has_certificado === null ? '' : filters.has_certificado.toString()}
              onChange={(e) => setFilters({
                ...filters, 
                has_certificado: e.target.value === '' ? null : e.target.value === 'true'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Con Certificado</option>
              <option value="false">Sin Certificado</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Vista:</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {viewModeOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setViewMode(option.key as ViewMode)}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 transition-colors ${
                  viewMode === option.key
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Mostrando {products.length} productos
        </div>
      </div>

      {/* Products View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Grid className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No hay productos disponibles</p>
            <p className="text-sm text-gray-400">
              Los productos aparecerán aquí cuando sean agregados
            </p>
            {canCreateEdit && (
              <button
                onClick={handleCreateProduct}
                className="mt-4 flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primer Producto</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'table' && (
              <TableView
                products={products}
                onProductDetail={handleProductDetail}
                onShowQR={handleShowQR}
                onEdit={canCreateEdit ? handleEditProduct : undefined}
                onDelete={canDelete ? handleDeleteProduct : undefined}
              />
            )}
            {viewMode === 'cards' && (
              <CardView
                products={products}
                onProductDetail={handleProductDetail}
                onShowQR={handleShowQR}
                onEdit={canCreateEdit ? handleEditProduct : undefined}
                onDelete={canDelete ? handleDeleteProduct : undefined}
              />
            )}
            {viewMode === 'gallery' && (
              <GalleryView
                products={products}
                onProductDetail={handleProductDetail}
                onShowQR={handleShowQR}
                onEdit={canCreateEdit ? handleEditProduct : undefined}
                onDelete={canDelete ? handleDeleteProduct : undefined}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedProduct && (
        <>
          <ProductDetailsModal
            product={selectedProduct}
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            onEdit={canCreateEdit ? (product) => {
              setShowDetailsModal(false);
              handleEditProduct(product);
            } : undefined}
          />
          <QRCodeModal
            product={selectedProduct}
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
          />
        </>
      )}

      <ProductFormModal
        isOpen={showFormModal}
        mode={formMode}
        product={selectedProduct}
        onClose={() => setShowFormModal(false)}
        onSave={handleProductSaved}
        clientes={clientes}
        consultores={consultores}
      />

      {/* Sync Modal */}
      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSuccess={handleSyncSuccess}
      />
    </div>
  );
};