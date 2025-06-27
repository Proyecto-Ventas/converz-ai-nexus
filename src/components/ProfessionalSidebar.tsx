import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DashboardIconCRM as DashboardIcon, 
  TrainingIconCRM as TrainingIcon, 
  ChallengesIconCRM as ChallengesIcon, 
  KnowledgeIconCRM as KnowledgeIcon, 
  HistoryIconCRM as HistoryIcon, 
  AchievementsIconCRM as AchievementsIcon, 
  ProfileIconCRM as ProfileIcon 
} from './icons/ModuleIconsCRM';
import { ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';

const navigation = [
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
  },
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
  },
  {
    name: 'Mi Perfil',
    href: '/profile',
    description: 'Configuración personal',
    icon: ProfileIcon
  }
];

interface ProfessionalSidebarProps {
  onWidthChange?: (width: number) => void;
}

const ProfessionalSidebar: React.FC<ProfessionalSidebarProps> = ({ onWidthChange }) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Notify parent about width changes
  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(isCollapsed ? 64 : 256);
    }
  }, [isCollapsed, onWidthChange]);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn(
        "flex flex-col bg-white/95 backdrop-blur-xl border-r border-emerald-200/60 shadow-xl transition-all duration-300 h-full overflow-hidden relative",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center h-16 border-b border-emerald-100/50 relative">
          {!isCollapsed ? (
            <div className="flex items-center w-full pl-3 pr-2">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="https://www.convertia.com/favicon/favicon-convertia.png" 
                  alt="Convert-IA" 
                  className="h-6 w-auto" 
                />
              </div>
              <h1 className="ml-3 text-base font-semibold text-emerald-800 whitespace-nowrap">Convert-IA</h1>
            </div>
          ) : (
            <div className="w-full flex pl-3.5">
              <img 
                src="https://www.convertia.com/favicon/favicon-convertia.png" 
                alt="Convert-IA" 
                className="h-6 w-auto" 
              />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-colors bg-white border border-emerald-200/60 shadow-md z-10",
              isCollapsed ? "-right-2.5" : "-right-3"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors group",
                          isActive 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center h-6 w-6 rounded-md flex-shrink-0",
                          isActive 
                            ? "bg-emerald-200 text-emerald-600" 
                            : "bg-gray-100 text-gray-500"
                        )}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        {!isCollapsed && (
                          <span className="ml-3">{item.name}</span>
                        )}
                        {isActive && !isCollapsed && (
                          <span className="ml-auto w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                        )}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" sideOffset={10} className="bg-gray-900 text-white">
                        <p>{item.name}</p>
                        <p className="text-xs text-gray-300">{item.description}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className={cn(
          "p-4 mt-auto border-t border-gray-200 bg-white",
          isCollapsed ? "px-2" : ""
        )}>
          <div className={cn(
            "flex items-center space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50",
            isCollapsed ? "justify-center px-0" : "bg-gray-50 border border-gray-200"
          )}>
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-emerald-600">
                <User className="h-4 w-4" />
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.email || 'usuario@ejemplo.com'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Section */}
        <div className="border-t border-emerald-200/60 p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className={cn(
                  "text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors border border-red-200 hover:border-red-300 w-full",
                  isCollapsed ? "justify-center p-2" : "justify-start"
                )}
              >
                <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
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
