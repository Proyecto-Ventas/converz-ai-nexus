
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { useUserStats } from '@/hooks/useUserStats';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { stats, loading: statsLoading } = useUserStats();
  const { achievements, loading: achievementsLoading } = useAchievements();

  const recentAchievements = achievements
    .filter(ua => ua.earned_at)
    .sort((a, b) => new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Bienvenido de vuelta. Aquí está tu progreso de entrenamiento.
            </p>
          </div>
          <Link to="/training">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Sesión
            </Button>
          </Link>
        </div>

        {/* Estadísticas principales */}
        <DashboardStats />

        {/* Fila inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad reciente */}
          <RecentActivity />

          {/* Logros recientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Logros Recientes</CardTitle>
              <Link to="/achievements">
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Cargando logros...</p>
                </div>
              ) : recentAchievements.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay logros recientes. ¡Completa algunas sesiones para desbloquear logros!
                </p>
              ) : (
                <div className="space-y-4">
                  {recentAchievements.map((userAchievement) => (
                    <div
                      key={userAchievement.id}
                      className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg"
                    >
                      <div className="h-10 w-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">🏆</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {userAchievement.achievement.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          +{userAchievement.achievement.xp_reward || 0} XP obtenidos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumen rápido */}
        {!statsLoading && stats && (
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.total_sessions}</div>
                  <div className="text-sm text-gray-600">Sesiones</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{Math.floor((stats.total_time_minutes || 0) / 60)}h</div>
                  <div className="text-sm text-gray-600">Tiempo Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.best_score}%</div>
                  <div className="text-sm text-gray-600">Mejor Puntuación</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.total_xp}</div>
                  <div className="text-sm text-gray-600">XP Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
