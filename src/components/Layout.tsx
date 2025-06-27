import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ProfessionalSidebar from './ProfessionalSidebar';
import AuthPage from './AuthPage';
import CommandPalette from './CommandPalette';
import NavigationBreadcrumb from './NavigationBreadcrumb';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(64);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100">
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gray-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside style={{ width: sidebarWidth }} className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <ProfessionalSidebar onWidthChange={setSidebarWidth} />
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full" style={{ marginLeft: 5 }}>
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100" 
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-lg font-semibold text-gray-800">Convert-IA</div>
          <div className="w-10"></div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 w-full overflow-auto">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
      
      <CommandPalette />
    </div>
  );
};

export default Layout;
