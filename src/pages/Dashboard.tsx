import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { useUserStats } from '@/hooks/useUserStats';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
const Dashboard = () => {
  const {
    stats,
    loading: statsLoading
  } = useUserStats();
  const {
    achievements,
    loading: achievementsLoading
  } = useAchievements();
  const recentAchievements = achievements.filter(ua => ua.earned_at).sort((a, b) => new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime()).slice(0, 3);
  return <div className="w-full h-full pl-page">
      <div className="w-full h-full space-y-6 px-[10px] mx-[-2px] py-px my-[8px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Panel de Control
              </h1>
            </div>
            <p className="text-base text-gray-600">
              Bienvenido de vuelta. Aquí está tu progreso de entrenamiento.
            </p>
          </div>
          <Link to="/training" className="w-full sm:w-auto">
            
          </Link>
        </div>

        {/* Estadísticas principales */}
        <DashboardStats />

        {/* Fila inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad reciente */}
          <Card className="h-full">
            <RecentActivity />
          </Card>

          {/* Logros recientes */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Logros Recientes</span>
              </CardTitle>
              <Link to="/achievements">
                <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-6">
              {achievementsLoading ? <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-500">Cargando logros...</p>
                </div> : recentAchievements.length === 0 ? <div className="text-center py-12">
                  <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    No hay logros recientes
                  </h3>
                  <p className="text-slate-600">
                    ¡Completa algunas sesiones para desbloquear logros!
                  </p>
                </div> : <div className="space-y-4">
                  {recentAchievements.map(userAchievement => <div key={userAchievement.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                      <div className="h-12 w-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xl">🏆</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">
                          {userAchievement.achievement.title}
                        </h4>
                        <p className="text-sm text-slate-600">
                          +{userAchievement.achievement.xp_reward || 0} XP obtenidos
                        </p>
                      </div>
                      <div className="text-xs text-amber-600 font-medium">
                        {new Date(userAchievement.earned_at!).toLocaleDateString()}
                      </div>
                    </div>)}
                </div>}
            </CardContent>
          </Card>
        </div>

        {/* Resumen de progreso */}
        {!statsLoading && stats && <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border-0">
            <CardHeader className="border-b border-slate-700 bg-gray-100">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Resumen de Progreso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-zinc-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">{stats.total_sessions}</div>
                  <div className="text-sm text-slate-300">Sesiones Completadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {Math.floor((stats.total_time_minutes || 0) / 60)}h
                  </div>
                  <div className="text-sm text-slate-300">Tiempo Total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">{stats.best_score}%</div>
                  <div className="text-sm text-slate-300">Mejor Puntuación</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.total_xp}</div>
                  <div className="text-sm text-slate-300">XP Total</div>
                </div>
              </div>
            </CardContent>
          </Card>}
      </div>
    </div>;
};
export default Dashboard;