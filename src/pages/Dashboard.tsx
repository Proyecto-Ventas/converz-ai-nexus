
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { useUserStats } from '@/hooks/useUserStats';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Zap, Target, BarChart3, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { stats, loading: statsLoading } = useUserStats();
  const { achievements, loading: achievementsLoading } = useAchievements();

  const recentAchievements = achievements
    .filter(ua => ua.earned_at)
    .sort((a, b) => new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive py-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-corporate rounded-xl shadow-sm">
                <Target className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Panel de Control
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Bienvenido de vuelta. Aquí está tu progreso de entrenamiento.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex items-center space-x-2 h-11">
              <BarChart3 className="h-4 w-4" />
              <span>Ver Análisis</span>
            </Button>
            <Link to="/training">
              <Button className="btn-corporate flex items-center space-x-2 h-11">
                <Plus className="h-4 w-4" />
                <span>Nueva Sesión</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="card-corporate p-1">
          <DashboardStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Activity - Takes more space */}
          <div className="xl:col-span-2">
            <div className="card-corporate overflow-hidden">
              <RecentActivity />
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="xl:col-span-1">
            <Card className="card-corporate">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span>Logros Recientes</span>
                </CardTitle>
                <Link to="/achievements">
                  <Button variant="outline" size="sm" className="h-8">
                    <TrendingUp className="h-3 w-3 mr-2" />
                    Ver Todos
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-6">
                {achievementsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando logros...</p>
                  </div>
                ) : recentAchievements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-muted rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Award className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      No hay logros recientes
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      ¡Completa algunas sesiones para desbloquear logros!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAchievements.map((userAchievement) => (
                      <div
                        key={userAchievement.id}
                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 animate-fade-in"
                      >
                        <div className="h-12 w-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-xl">🏆</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate">
                            {userAchievement.achievement.title}
                          </h4>
                          <p className="text-sm text-amber-700">
                            +{userAchievement.achievement.xp_reward || 0} XP obtenidos
                          </p>
                        </div>
                        <div className="text-xs text-amber-600 font-medium">
                          {new Date(userAchievement.earned_at!).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Summary */}
        {!statsLoading && stats && (
          <Card className="bg-gradient-corporate text-white shadow-xl border-0 overflow-hidden">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center space-x-2 text-white">
                <TrendingUp className="h-6 w-6" />
                <span>Resumen de Progreso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{stats.total_sessions}</div>
                  <div className="text-blue-100 text-sm font-medium">Sesiones Completadas</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {Math.floor((stats.total_time_minutes || 0) / 60)}h
                  </div>
                  <div className="text-blue-100 text-sm font-medium">Tiempo Total</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{stats.best_score}%</div>
                  <div className="text-blue-100 text-sm font-medium">Mejor Puntuación</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{stats.total_xp}</div>
                  <div className="text-blue-100 text-sm font-medium">XP Total</div>
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
