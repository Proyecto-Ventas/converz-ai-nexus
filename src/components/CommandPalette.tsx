
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

const commands = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Vista general y métricas principales',
    href: '/',
    category: 'Operación'
  },
  {
    id: 'training',
    label: 'Entrenamiento',
    description: 'Simulaciones y práctica con IA',
    href: '/training',
    category: 'Operación'
  },
  {
    id: 'challenges',
    label: 'Desafíos',
    description: 'Retos y competencias',
    href: '/challenges',
    category: 'Operación'
  },
  {
    id: 'knowledge',
    label: 'Conocimiento',
    description: 'Base de conocimientos y documentos',
    href: '/knowledge',
    category: 'Gestión'
  },
  {
    id: 'history',
    label: 'Historial',
    description: 'Registro de actividades y sesiones',
    href: '/history',
    category: 'Gestión'
  },
  {
    id: 'achievements',
    label: 'Logros',
    description: 'Objetivos alcanzados y estadísticas',
    href: '/achievements',
    category: 'Gestión'
  },
  {
    id: 'profile',
    label: 'Mi Perfil',
    description: 'Configuración personal y preferencias',
    href: '/profile',
    category: 'Usuario'
  }
];

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const iconUrl = "https://www.convertia.com/favicon/favicon-convertia.png";

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
        className="border-none focus:ring-0"
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          <div className="flex flex-col items-center py-6 text-center">
            <img src={iconUrl} alt="No results" className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm text-slate-500">No se encontraron resultados</p>
          </div>
        </CommandEmpty>
        
        {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
          <CommandGroup key={category} heading={category}>
            {categoryCommands.map((command) => (
              <CommandItem
                key={command.id}
                value={`${command.label} ${command.description}`}
                onSelect={() => handleSelect(command.href)}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer"
              >
                <img src={iconUrl} alt={command.label} className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{command.label}</div>
                  <div className="text-xs text-slate-500 truncate">{command.description}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      
      <div className="border-t border-slate-200 p-2">
        <div className="flex items-center justify-center text-xs text-slate-500">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-xs font-medium text-slate-600">
            <span className="text-xs">⌘</span>K
          </kbd>
          <span className="ml-1">para abrir</span>
        </div>
      </div>
    </CommandDialog>
  );
};

export default CommandPalette;
