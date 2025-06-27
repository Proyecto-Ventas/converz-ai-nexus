
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navigation = [
  {
    name: 'Operación',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        description: 'Vista general y métricas'
      },
      {
        name: 'Entrenamiento',
        href: '/training',
        description: 'Simulaciones y práctica'
      },
      {
        name: 'Desafíos',
        href: '/challenges',
        description: 'Retos y competencias'
      }
    ]
  },
  {
    name: 'Gestión',
    items: [
      {
        name: 'Conocimiento',
        href: '/knowledge',
        description: 'Base de conocimientos'
      },
      {
        name: 'Historial',
        href: '/history',
        description: 'Registro de actividades'
      },
      {
        name: 'Logros',
        href: '/achievements',
        description: 'Objetivos alcanzados'
      }
    ]
  },
  {
    name: 'Usuario',
    items: [
      {
        name: 'Mi Perfil',
        href: '/profile',
        description: 'Configuración personal'
      }
    ]
  }
];

const EnhancedSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const iconUrl = "https://www.convertia.com/favicon/favicon-convertia.png";

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col bg-white/90 backdrop-blur-md border-r border-slate-200/60 shadow-lg transition-all duration-300",
        isCollapsed ? "w-16" : "w-72"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/60">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                <img src={iconUrl} alt="Convert-IA" className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900">Convert-IA</span>
                <p className="text-xs text-slate-500">Platform</p>
              </div>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 p-0 hover:bg-slate-100"
              >
                <img src={iconUrl} alt="Toggle" className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {navigation.map((section) => (
            <div key={section.name}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                  {section.name}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          )}
                        >
                          <div className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center", !isCollapsed && "mr-3")}>
                            <img src={iconUrl} alt={item.name} className="h-4 w-4" />
                          </div>
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{item.name}</div>
                              {!isActive && (
                                <div className="text-xs text-slate-500 truncate group-hover:text-slate-600">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          )}
                          {isActive && !isCollapsed && (
                            <div className="ml-2 h-2 w-2 rounded-full bg-white/80"></div>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="font-medium">
                          <div>{item.name}</div>
                          <div className="text-xs text-slate-500">{item.description}</div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-200/60 p-3">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 mb-3 px-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-slate-500 truncate">Usuario activo</p>
              </div>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className={cn(
                  "text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors",
                  isCollapsed ? "w-full justify-center p-2" : "w-full justify-start"
                )}
              >
                <img src={iconUrl} alt="Cerrar Sesión" className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && "Cerrar Sesión"}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Cerrar Sesión</TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedSidebar;
