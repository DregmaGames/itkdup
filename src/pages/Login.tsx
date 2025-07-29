import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Shield, ArrowRight, AlertCircle, UserPlus, Zap, UserCog, Award, Users, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginStep } from '../types/auth';

export const Login: React.FC = () => {
  const [loginStep, setLoginStep] = useState<LoginStep>({ step: 'email' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useOTP, setUseOTP] = useState(false);

  const { login, loginWithOTP, sendOTP, loginDirect } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleDirectLogin = (role: 'Admin' | 'Cert' | 'Consultor' | 'Cliente' = 'Admin') => {
    if (loginDirect) {
      loginDirect(role);
      navigate(from, { replace: true });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (useOTP) {
        await sendOTP(email);
        setLoginStep({ step: 'otp', email });
      } else {
        setLoginStep({ step: 'password', email });
      }
    } catch (error: any) {
      setError(error.message || 'Error al procesar el email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await loginWithOTP(email, otp);
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || 'Error al verificar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setLoginStep({ step: 'email' });
    setEmail('');
    setPassword('');
    setOtp('');
    setError('');
    setUseOTP(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600">
              Accede a tu cuenta ModularApp
            </p>
          </div>

          {/* Botón de acceso directo temporal */}
          <div className="mb-6">
            <div className="space-y-3">
              <h3 className="text-center text-sm font-medium text-gray-700 mb-3">
                Acceso Directo por Rol (Desarrollo)
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDirectLogin('Admin')}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg text-sm"
                >
                  <UserCog className="w-4 h-4" />
                  <span>Admin</span>
                </button>
                
                <button
                  onClick={() => handleDirectLogin('Cert')}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg text-sm"
                >
                  <Award className="w-4 h-4" />
                  <span>Certificador</span>
                </button>
                
                <button
                  onClick={() => handleDirectLogin('Consultor')}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span>Consultor</span>
                </button>
                
                <button
                  onClick={() => handleDirectLogin('Cliente')}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg text-sm"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Cliente</span>
                </button>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-2">
              Acceso temporal sin autenticación
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O usar login tradicional</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loginStep.step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="useOTP"
                  type="checkbox"
                  checked={useOTP}
                  onChange={(e) => setUseOTP(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="useOTP" className="text-sm text-gray-600">
                  Usar código OTP en lugar de contraseña
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {loginStep.step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu contraseña"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {loginStep.step === 'otp' && (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Código OTP
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Revisa tu email para obtener el código de 6 dígitos
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>Verificar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Información de desarrollo */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium text-sm">Modo Desarrollo</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Autenticación desactivada temporalmente. Usa el botón "Acceso Directo" para entrar como administrador.
                </p>
                <div className="mt-3 text-yellow-600 text-xs">
                  <p className="font-medium mb-1">Roles disponibles:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <p>• Admin: Acceso completo</p>
                    <p>• Cert: Panel certificador</p>
                    <p>• Consultor: Panel consultor</p>
                    <p>• Cliente: Panel cliente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};