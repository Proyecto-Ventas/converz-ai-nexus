
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, CheckCircle, Award as AwardIcon, Clock as ClockIcon, Star, TrendingUp } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

// Definir el tipo para las tarjetas de estadísticas
interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  progress?: number;
  showProgress?: boolean;
  showPercentage?: boolean;
}

const DashboardStats = () => {
  const { stats, loading } = useUserStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 h-32">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No hay estadísticas disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const levelProgress = ((stats.total_xp % 1000) / 1000) * 100;
  const nextLevelXP = Math.ceil(stats.total_xp / 1000) * 1000;

  // Estilos consistentes para todas las tarjetas
  const cardBaseStyles = "h-full flex flex-col border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md";
  const cardHeaderStyles = "p-5 pb-2 bg-gray-50 border-b border-gray-100";
  const cardContentStyles = "p-5 pt-3 flex-1";
  const iconBaseStyles = "h-5 w-5 p-1 rounded-md";
  const titleStyles = "text-sm font-medium text-gray-700";
  const valueStyles = "text-2xl font-bold text-gray-900 mt-1";
  const descriptionStyles = "text-xs text-gray-500 mt-1";

  // Definir las tarjetas de estadísticas
  const statsCards: StatCard[] = [
    {
      title: 'Nivel Actual',
      value: stats.level,
      icon: <Star className={`${iconBaseStyles} text-yellow-500 bg-yellow-50`} />,
      description: `Siguiente nivel en ${nextLevelXP - stats.total_xp} XP`,
      progress: levelProgress
    },
    {
      title: 'XP Total',
      value: stats.total_xp,
      icon: <Zap className={`${iconBaseStyles} text-blue-500 bg-blue-50`} />,
      description: 'Puntos de experiencia acumulados',
      showProgress: false
    },
    {
      title: 'Sesiones',
      value: stats.total_sessions,
      icon: <CheckCircle className={`${iconBaseStyles} text-emerald-500 bg-emerald-50`} />,
      description: `Promedio: ${stats.total_sessions > 0 ? Math.round((stats.total_time_minutes || 0) / stats.total_sessions) : 0} min/sesión`,
      showProgress: false
    },
    {
      title: 'Racha Actual',
      value: stats.current_streak,
      icon: <AwardIcon className={`${iconBaseStyles} text-purple-500 bg-purple-50`} />,
      description: 'Días consecutivos entrenando',
      progress: Math.min(stats.current_streak * 10, 100)
    },
    {
      title: 'Tiempo Total',
      value: `${Math.floor(stats.total_time_minutes / 60)}h ${stats.total_time_minutes % 60}m`,
      icon: <ClockIcon className={`${iconBaseStyles} text-amber-500 bg-amber-50`} />,
      description: 'Tiempo total de práctica',
      showProgress: false
    },
    {
      title: 'Rendimiento',
      value: Number(stats.average_score || 0).toFixed(1),
      icon: <TrendingUp className={`${iconBaseStyles} text-rose-500 bg-rose-50`} />,
      description: 'Puntuación promedio en simulaciones',
      progress: Number(stats.average_score || 0),
      showPercentage: true
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {statsCards.map((stat, index) => (
          <Card key={index} className={cardBaseStyles}>
            <CardHeader className={cardHeaderStyles}>
              <div className="flex items-center justify-between">
                <CardTitle className={titleStyles}>{stat.title}</CardTitle>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent className={cardContentStyles}>
              <div className={valueStyles}>
                {stat.value}
                {stat.showPercentage && <span className="text-base font-normal text-gray-500">%</span>}
              </div>
              <p className={descriptionStyles}>
                {stat.description}
              </p>
              {stat.progress !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span>{Math.round(stat.progress)}%</span>
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
