
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import EnhancedSidebar from './EnhancedSidebar';
import AuthPage from './AuthPage';
import CommandPalette from './CommandPalette';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 w-full overflow-hidden">
      <EnhancedSidebar />
      <main className="flex-1 overflow-auto bg-white/60 backdrop-blur-sm">
        <div className="h-full">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
};

export default Layout;
