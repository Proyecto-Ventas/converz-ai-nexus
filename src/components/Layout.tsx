
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProfessionalSidebar from './ProfessionalSidebar';
import AuthPage from './AuthPage';
import CommandPalette from './CommandPalette';
import NavigationBreadcrumb from './NavigationBreadcrumb';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Cargando Convert-IA...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-container flex bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100">
      <ProfessionalSidebar />
      <main className="flex-1 main-content">
        <div className="h-full">
          <NavigationBreadcrumb />
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
};

export default Layout;
