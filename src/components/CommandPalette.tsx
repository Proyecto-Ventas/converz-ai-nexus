
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { 
  DashboardIcon, 
  TrainingIcon, 
  ChallengesIcon, 
  KnowledgeIcon, 
  HistoryIcon, 
  AchievementsIcon, 
  ProfileIcon 
} from './icons/ModuleIcons';

const commands = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Vista general y métricas principales',
    href: '/',
    category: 'Operación',
    icon: DashboardIcon
  },
  {
    id: 'training',
    label: 'Entrenamiento',
    description: 'Simulaciones y práctica con IA',
    href: '/training',
    category: 'Operación',
    icon: TrainingIcon
  },
  {
    id: 'challenges',
    label: 'Desafíos',
    description: 'Retos y competencias',
    href: '/challenges',
    category: 'Operación',
    icon: ChallengesIcon
  },
  {
    id: 'knowledge',
    label: 'Conocimiento',
    description: 'Base de conocimientos y documentos',
    href: '/knowledge',
    category: 'Gestión',
    icon: KnowledgeIcon
  },
  {
    id: 'history',
    label: 'Historial',
    description: 'Registro de actividades y sesiones',
    href: '/history',
    category: 'Gestión',
    icon: HistoryIcon
  },
  {
    id: 'achievements',
    label: 'Logros',
    description: 'Objetivos alcanzados y estadísticas',
    href: '/achievements',
    category: 'Gestión',
    icon: AchievementsIcon
  },
  {
    id: 'profile',
    label: 'Mi Perfil',
    description: 'Configuración personal y preferencias',
    href: '/profile',
    category: 'Usuario',
    icon: ProfileIcon
  }
];

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, typeof commands>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Buscar módulos... (Ctrl + K)" 
        className="border-none focus:ring-0 text-emerald-900 placeholder:text-emerald-500"
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-sm text-emerald-600">No se encontraron resultados</p>
          </div>
        </CommandEmpty>
        
        {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
          <CommandGroup key={category} heading={category}>
            {categoryCommands.map((command) => {
              const IconComponent = command.icon;
              return (
                <CommandItem
                  key={command.id}
                  value={`${command.label} ${command.description}`}
                  onSelect={() => handleSelect(command.href)}
                  className="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-emerald-50 rounded-lg"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-emerald-900">{command.label}</div>
                    <div className="text-xs text-emerald-600 truncate">{command.description}</div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
      
      <div className="border-t border-emerald-200 p-3 bg-emerald-50/50">
        <div className="flex items-center justify-center text-xs text-emerald-600">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-emerald-300 bg-emerald-100 px-1.5 font-mono text-xs font-medium text-emerald-700">
            <span className="text-xs">⌘</span>K
          </kbd>
          <span className="ml-1">para abrir navegación rápida</span>
        </div>
      </div>
    </CommandDialog>
  );
};

export default CommandPalette;
