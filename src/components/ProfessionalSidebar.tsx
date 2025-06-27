
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DashboardIcon, 
  TrainingIcon, 
  ChallengesIcon, 
  KnowledgeIcon, 
  HistoryIcon, 
  AchievementsIcon, 
  ProfileIcon 
} from './icons/ModuleIcons';

const navigation = [
  {
    name: 'Operación',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        description: 'Vista general y métricas',
        icon: DashboardIcon
      },
      {
        name: 'Entrenamiento',
        href: '/training',
        description: 'Simulaciones y práctica',
        icon: TrainingIcon
      },
      {
        name: 'Desafíos',
        href: '/challenges',
        description: 'Retos y competencias',
        icon: ChallengesIcon
      }
    ]
  },
  {
    name: 'Gestión',
    items: [
      {
        name: 'Conocimiento',
        href: '/knowledge',
        description: 'Base de conocimientos',
        icon: KnowledgeIcon
      },
      {
        name: 'Historial',
        href: '/history',
        description: 'Registro de actividades',
        icon: HistoryIcon
      },
      {
        name: 'Logros',
        href: '/achievements',
        description: 'Objetivos alcanzados',
        icon: AchievementsIcon
      }
    ]
  },
  {
    name: 'Usuario',
    items: [
      {
        name: 'Mi Perfil',
        href: '/profile',
        description: 'Configuración personal',
        icon: ProfileIcon
      }
    ]
  }
];

const ProfessionalSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col bg-white/95 backdrop-blur-xl border-r border-emerald-200/60 shadow-xl transition-all duration-300 h-full",
        isCollapsed ? "w-16" : "w-80"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-emerald-200/60">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                <img 
                  src="https://www.convertia.com/favicon/favicon-convertia.png" 
                  alt="Convert-IA" 
                  className="h-6 w-6" 
                />
              </div>
              <div>
                <span className="text-xl font-bold text-emerald-900">Convert-IA</span>
                <p className="text-xs text-emerald-600">Platform</p>
              </div>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 p-0 hover:bg-emerald-100 text-emerald-700"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={cn("transition-transform", isCollapsed ? "rotate-180" : "")}
                >
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
          {navigation.map((section) => (
            <div key={section.name}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-4 px-3">
                  {section.name}
                </h3>
              )}
              <div className="space-y-2">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const IconComponent = item.icon;
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative',
                            isActive
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 active-indicator'
                              : 'text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 corporate-hover-emerald'
                          )}
                        >
                          <div className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center", !isCollapsed && "mr-3")}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-semibold">{item.name}</div>
                              {!isActive && (
                                <div className="text-xs text-emerald-500 truncate group-hover:text-emerald-700 transition-colors">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          )}
                          {isActive && !isCollapsed && (
                            <div className="ml-2 h-2 w-2 rounded-full bg-white/90 animate-pulse-emerald"></div>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="font-medium bg-emerald-900 text-white border-emerald-700">
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-xs text-emerald-200">{item.description}</div>
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
        <div className="border-t border-emerald-200/60 p-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-sm font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-900 truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-emerald-600 truncate">Usuario activo</p>
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
                  "text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors border border-red-200 hover:border-red-300",
                  isCollapsed ? "w-full justify-center p-2" : "w-full justify-start"
                )}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={cn("h-4 w-4", !isCollapsed && "mr-2")}
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {!isCollapsed && "Cerrar Sesión"}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-red-900 text-white border-red-700">
                Cerrar Sesión
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ProfessionalSidebar;
