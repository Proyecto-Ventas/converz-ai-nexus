
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock, TrendingUp, Star, Award } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

const DashboardStats = () => {
  const { stats, loading } = useUserStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Nivel y XP */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nivel Actual</CardTitle>
          <Star className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold">{stats.level}</div>
            <Badge variant="secondary">{stats.total_xp} XP</Badge>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {nextLevelXP - stats.total_xp} XP para el siguiente nivel
          </p>
        </CardContent>
      </Card>

      {/* Sesiones Totales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_sessions}</div>
          <p className="text-xs text-muted-foreground">
            Racha actual: {stats.current_streak} días
          </p>
        </CardContent>
      </Card>

      {/* Tiempo Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo de Entrenamiento</CardTitle>
          <Clock className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor((stats.total_time_minutes || 0) / 60)}h {(stats.total_time_minutes || 0) % 60}m
          </div>
          <p className="text-xs text-muted-foreground">
            Promedio: {stats.total_sessions > 0 ? Math.round((stats.total_time_minutes || 0) / stats.total_sessions) : 0} min/sesión
          </p>
        </CardContent>
      </Card>

      {/* Mejor Puntuación */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mejor Puntuación</CardTitle>
          <Trophy className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.best_score}%</div>
          <p className="text-xs text-muted-foreground">
            Promedio: {Number(stats.average_score || 0).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Puntuación Promedio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Number(stats.average_score || 0).toFixed(1)}%</div>
          <Progress value={Number(stats.average_score || 0)} className="h-2 mt-2" />
        </CardContent>
      </Card>

      {/* Logros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado General</CardTitle>
          <Award className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nivel:</span>
              <Badge variant="outline">Nivel {stats.level}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Estado:</span>
              <Badge variant={stats.current_streak > 0 ? "default" : "secondary"}>
                {stats.current_streak > 0 ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
