import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Zap, Mail, Lock, User, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const {
    signIn,
    signUp
  } = useAuth();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const {
          error
        } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Error al iniciar sesión",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "¡Bienvenido!",
            description: "Has iniciado sesión exitosamente"
          });
        }
      } else {
        if (!formData.fullName) {
          toast({
            title: "Error",
            description: "Por favor ingresa tu nombre completo",
            variant: "destructive"
          });
          return;
        }
        const {
          error
        } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          toast({
            title: "Error al registrarse",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "¡Registro exitoso!",
            description: "Verifica tu email para activar tu cuenta"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Algo salió mal. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen relative">
      {/* Fondo con gradiente personalizado */}
      <div className="absolute inset-0 z-0" style={{
      background: 'linear-gradient(135deg, hsl(160, 92%, 14%) 0%, rgba(255,255,255,0) 100%)'
    }} />
      
      {/* Contenido */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Theme Toggle - Fixed to top right corner */}
        <button onClick={toggleTheme} className="fixed top-4 right-4 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-emerald-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

      <div className="w-full max-w-md">
        {/* Auth Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/60">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="flex h-14 w-14 items-center justify-center">
                <img src="https://www.convertia.com/favicon/favicon-convertia.png" alt="Convert-IA" className="h-10 w-10" />
              </div>
              <span className="text-3xl font-bold text-emerald-900">Convert-IA</span>
            </div>
            <p className="text-emerald-700 font-medium text-sm">
              Plataforma de entrenamiento inteligente
            </p>
          </div>

          <div className="text-center mb-6">
            
            
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <Input type="text" placeholder="Nombre completo" value={formData.fullName} onChange={e => setFormData({
                ...formData,
                fullName: e.target.value
              })} className="pl-10 h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white/80" required={!isLogin} />
              </div>}

            <div className="relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <Input type="email" placeholder="Correo electrónico" value={formData.email} onChange={e => setFormData({
                ...formData,
                email: e.target.value
              })} className="pl-10 h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white/80" required />
            </div>

            <div className="relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <circle cx="12" cy="16" r="1" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <Input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={formData.password} onChange={e => setFormData({
                ...formData,
                password: e.target.value
              })} className="pl-10 pr-10 h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white/80" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 hover:text-emerald-600">
                {showPassword ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>}
              </button>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-white font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200">
              {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>;
};
export default AuthPage;