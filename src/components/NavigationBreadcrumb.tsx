
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const NavigationBreadcrumb = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const getPageInfo = (path: string) => {
    const routes = {
      '/': { title: 'Dashboard', parent: null },
      '/training': { title: 'Entrenamiento', parent: '/' },
      '/challenges': { title: 'Desafíos', parent: '/' },
      '/knowledge': { title: 'Conocimiento', parent: '/' },
      '/history': { title: 'Historial', parent: '/' },
      '/achievements': { title: 'Logros', parent: '/' },
      '/profile': { title: 'Mi Perfil', parent: '/' },
    };
    return routes[path as keyof typeof routes] || { title: 'Página', parent: '/' };
  };

  const currentPage = getPageInfo(pathname);
  
  if (pathname === '/') return null;

  return (
    <div className="nav-breadcrumb px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-emerald-100">
      <div className="flex items-center space-x-2">
        <Link 
          to="/" 
          className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
        >
          Dashboard
        </Link>
        <span className="separator text-emerald-400">/</span>
        <span className="text-emerald-900 font-semibold">{currentPage.title}</span>
      </div>
    </div>
  );
};

export default NavigationBreadcrumb;
