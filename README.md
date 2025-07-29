# ModularApp - Estructura Base

Una aplicación web modular construida con React, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

- **Autenticación híbrida**: Email + OTP + Password con Supabase Auth
- **Sistema de roles**: Admin, Cert, Consultor, Cliente
- **Rutas protegidas**: Control de acceso basado en roles
- **Layout responsivo**: Navbar fija y Sidebar colapsable
- **Arquitectura modular**: Preparada para carga dinámica de módulos
- **Seguridad**: Row Level Security (RLS) configurado

## 📁 Estructura del Proyecto

```
src/
├── components/
│   └── layout/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── NotFound.tsx
├── routes/
│   └── ProtectedRoute.tsx
├── types/
│   └── auth.ts
├── lib/
│   └── supabase.ts
└── App.tsx
```

## 🛠️ Configuración

### 1. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Copia las variables de entorno:

```bash
cp .env.example .env
```

3. Configura las variables en `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Configurar Base de Datos

Ejecuta la migración para crear las tablas necesarias:

```sql
-- Ejecutar en Supabase SQL Editor
-- Contenido del archivo: supabase/migrations/create_user_profiles.sql
```

### 3. Configurar Autenticación

En el dashboard de Supabase:

1. Ve a **Authentication > Settings**
2. Configura el email template para OTP
3. Habilita/deshabilita la confirmación de email según necesites
4. Configura los providers de autenticación

### 4. Configurar Roles

Los roles disponibles son:
- **Admin**: Acceso completo a todos los módulos
- **Cert**: Acceso a certificación y gestión
- **Consultor**: Acceso a consultoría
- **Cliente**: Acceso básico

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Policies** configuradas para cada rol
- **Rutas protegidas** que verifican autenticación y autorización
- **Contexto de autenticación** centralizado

## 🎯 Próximos Pasos

Esta estructura está preparada para agregar módulos dinámicamente:

1. **Módulos pendientes**:
   - Productos
   - Consultores
   - Clientes
   - QR Codes
   - Sincronización
   - Reportes
   - Configuración

2. **Características futuras**:
   - Carga dinámica de módulos
   - Sistema de permisos granular
   - Notificaciones en tiempo real
   - Auditoría de acciones

## 📱 Uso

### Login
- Soporte para email/password tradicional
- Opción de OTP via email
- Redireccionamiento automático según rol

### Dashboard
- Vista personalizada por rol
- Métricas relevantes
- Actividad reciente
- Tareas pendientes

### Navegación
- Sidebar adaptativo según permisos
- Rutas protegidas por rol
- Manejo de errores 404

## 🔧 Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Build para producción
npm run build
```

## 📋 Checklist de Configuración

- [ ] Proyecto Supabase creado
- [ ] Variables de entorno configuradas
- [ ] Migración de base de datos ejecutada
- [ ] Autenticación configurada
- [ ] Roles asignados a usuarios de prueba
- [ ] Aplicación funcionando localmente

## 🎨 Personalización

El diseño utiliza Tailwind CSS con:
- Paleta de colores profesional
- Componentes reutilizables
- Responsive design
- Modo oscuro preparado (futuro)

## 📚 Documentación

- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)