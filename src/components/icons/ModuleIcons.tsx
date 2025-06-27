
import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Ícono específico para Dashboard - Tablero de control con métricas
export const DashboardIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="5"/>
    <rect x="14" y="12" width="7" height="9"/>
    <rect x="3" y="14" width="7" height="7"/>
    <circle cx="6.5" cy="6.5" r="1"/>
    <circle cx="17.5" cy="5.5" r="1"/>
    <circle cx="17.5" cy="16.5" r="1"/>
    <circle cx="6.5" cy="17.5" r="1"/>
  </svg>
);

// Ícono específico para Entrenamiento - Cerebro con circuitos
export const TrainingIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2a10 10 0 0 1 7.35 16.65l-1.68-1.69a7.5 7.5 0 1 0-11.34 0l-1.68 1.69A10 10 0 0 1 12 2z"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6"/>
    <path d="m1 12 6 0m6 0 6 0"/>
    <path d="M8.5 8.5l7 7m0-7l-7 7"/>
  </svg>
);

// Ícono específico para Desafíos - Trofeo con rayo
export const ChallengesIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    <path d="M12 4l2 4-2 1-2-1z"/>
  </svg>
);

// Ícono específico para Conocimiento - Libro con chip
export const KnowledgeIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    <rect x="10" y="6" width="6" height="6" rx="1"/>
    <path d="M12 8v2"/>
    <path d="M11 10h2"/>
  </svg>
);

// Ícono específico para Historial - Reloj con historial
export const HistoryIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M12 7v5l4 2"/>
    <path d="M16 16l2 2"/>
    <path d="M19 19l2 2"/>
  </svg>
);

// Ícono específico para Logros - Medalla con estrella
export const AchievementsIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.61 2.14a2 2 0 0 1 .13 2.2L16.79 15"/>
    <path d="M11 12 5.12 2.2"/>
    <path d="m13 12 5.88-9.8"/>
    <path d="M8 7h8"/>
    <circle cx="12" cy="17" r="5"/>
    <path d="m9 22 3-8 3 8"/>
    <path d="m12 14 1.5 3-1.5 1-1.5-1z"/>
  </svg>
);

// Ícono específico para Perfil - Usuario con engranaje
export const ProfileIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
    <path d="M12 14l2 2 4-4"/>
    <path d="M18 10v4"/>
    <path d="M21 12h-4"/>
  </svg>
);

export const ModuleIconsMap = {
  dashboard: DashboardIcon,
  training: TrainingIcon,
  challenges: ChallengesIcon,
  knowledge: KnowledgeIcon,
  history: HistoryIcon,
  achievements: AchievementsIcon,
  profile: ProfileIcon,
};
