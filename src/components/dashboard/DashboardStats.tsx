
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock, TrendingUp, Star, Award, Zap, Users } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

const DashboardStats = () => {
  const { stats, loading } = useUserStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse card-corporate">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="card-corporate">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No hay estadísticas disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const levelProgress = ((stats.total_xp % 1000) / 1000) * 100;
  const nextLevelXP = Math.ceil(stats.total_xp / 1000) * 1000;

  const statCards = [
    {
      title: "Nivel Actual",
      value: stats.level,
      subtitle: `${stats.total_xp} XP`,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      progress: levelProgress,
      progressLabel: `${nextLevelXP - stats.total_xp} XP para siguiente nivel`
    },
    {
      title: "Sesiones Completadas",
      value: stats.total_sessions,
      subtitle: `Racha: ${stats.current_streak} días`,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Tiempo Total",
      value: `${Math.floor((stats.total_time_minutes || 0) / 60)}h ${(stats.total_time_minutes || 0) % 60}m`,
      subtitle: `Promedio: ${stats.total_sessions > 0 ? Math.round((stats.total_time_minutes || 0) / stats.total_sessions) : 0} min/sesión`,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Mejor Puntuación",
      value: `${stats.best_score}%`,
      subtitle: `Promedio: ${Number(stats.average_score || 0).toFixed(1)}%`,
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Rendimiento General",
      value: `${Number(stats.average_score || 0).toFixed(1)}%`,
      subtitle: "Puntuación promedio",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      progress: Number(stats.average_score || 0)
    },
    {
      title: "XP Total",
      value: stats.total_xp,
      subtitle: "Experiencia acumulada",
      icon: Zap,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      title: "Estado de Cuenta",
      value: `Nivel ${stats.level}`,
      subtitle: stats.current_streak > 0 ? "Usuario Activo" : "Usuario Inactivo",
      icon: Award,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      badge: stats.current_streak > 0 ? "Activo" : "Inactivo",
      badgeVariant: stats.current_streak > 0 ? "default" : "secondary"
    },
    {
      title: "Progreso Semanal",
      value: "↗ +12%",
      subtitle: "Comparado con semana anterior",
      icon: Users,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100"
    }
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="card-corporate hover:shadow-md transition-all duration-200 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                {card.badge && (
                  <Badge variant={card.badgeVariant as any} className="text-xs">
                    {card.badge}
                  </Badge>
                )}
              </div>
              
              {card.progress !== undefined && (
                <div className="space-y-2">
                  <Progress value={card.progress} className="h-2" />
                  {card.progressLabel && (
                    <p className="text-xs text-muted-foreground">{card.progressLabel}</p>
                  )}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
