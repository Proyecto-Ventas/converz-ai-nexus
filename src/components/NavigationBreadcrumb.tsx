import React from 'react';
import { useLocation, Link } from 'react-router-dom';
const NavigationBreadcrumb = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const getPageInfo = (path: string) => {
    const routes = {
      '/': {
        title: 'Dashboard',
        parent: null
      },
      '/training': {
        title: 'Entrenamiento',
        parent: '/'
      },
      '/challenges': {
        title: 'Desafíos',
        parent: '/'
      },
      '/knowledge': {
        title: 'Conocimiento',
        parent: '/'
      },
      '/history': {
        title: 'Historial',
        parent: '/'
      },
      '/achievements': {
        title: 'Logros',
        parent: '/'
      },
      '/profile': {
        title: 'Mi Perfil',
        parent: '/'
      }
    };
    return routes[path as keyof typeof routes] || {
      title: 'Página',
      parent: '/'
    };
  };
  const currentPage = getPageInfo(pathname);
  if (pathname === '/') return null;
  return;
};
export default NavigationBreadcrumb;