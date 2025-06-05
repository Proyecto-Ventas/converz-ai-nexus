
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Target, Award } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { useUserStats } from '@/hooks/useUserStats';
import AchievementCard from '@/components/achievements/AchievementCard';

const Achievements = () => {
  const { achievements, availableAchievements, loading } = useAchievements();
  const { stats } = useUserStats();
  const [filter, setFilter] = useState<string>('all');

  const earnedAchievements = achievements.filter(ua => ua.earned_at);
  const inProgressAchievements = achievements.filter(ua => !ua.earned_at && (ua.progress || 0) > 0);
  const availableForProgress = availableAchievements.filter(
    a => !achievements.some(ua => ua.achievement_id === a.id)
  );

  const getFilteredAchievements = (category: string, list: any[]) => {
    if (category === 'all') return list;
    return list.filter(item => {
      const achievement = item.achievement || item;
      return achievement.category === category;
    });
  };

  // Crear array de categorías con tipos correctos
  const allCategories = availableAchievements.map(a => a.category).filter(Boolean) as string[];
  const uniqueCategories = Array.from(new Set(allCategories));
  const categories: string[] = ['all', ...uniqueCategories];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Logros
            </h1>
            <p className="text-gray-600">
              Desbloquea logros completando entrenamientos y alcanzando objetivos
            </p>
          </div>
        </div>

        {/* Estadísticas de logros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex items-center p-6">
              <Trophy className="h-8 w-8 text-yellow-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{earnedAchievements.length}</div>
                <div className="text-sm text-gray-600">Desbloqueados</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Target className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{inProgressAchievements.length}</div>
                <div className="text-sm text-gray-600">En Progreso</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Star className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{availableAchievements.length}</div>
                <div className="text-sm text-gray-600">Total Disponibles</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Award className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">
                  {earnedAchievements.reduce((sum, ua) => sum + (ua.achievement.xp_reward || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">XP de Logros</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progreso general */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Logros Completados</span>
                <span className="font-medium">
                  {earnedAchievements.length}/{availableAchievements.length}
                </span>
              </div>
              <Progress 
                value={availableAchievements.length > 0 ? (earnedAchievements.length / availableAchievements.length) * 100 : 0} 
                className="h-3"
              />
              <p className="text-xs text-gray-500">
                {availableAchievements.length > 0 
                  ? `${((earnedAchievements.length / availableAchievements.length) * 100).toFixed(1)}% completado`
                  : 'No hay logros disponibles'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filtros por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={filter === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilter(category)}
                >
                  {category === 'all' ? 'Todas' : category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs de logros */}
        <Tabs defaultValue="earned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="earned">
              Desbloqueados ({getFilteredAchievements(filter, earnedAchievements).length})
            </TabsTrigger>
            <TabsTrigger value="progress">
              En Progreso ({getFilteredAchievements(filter, inProgressAchievements).length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Disponibles ({getFilteredAchievements(filter, availableForProgress).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earned" className="space-y-6">
            {getFilteredAchievements(filter, earnedAchievements).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aún no has desbloqueado logros
                  </h3>
                  <p className="text-gray-600">
                    Completa sesiones de entrenamiento para desbloquear tu primer logro
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredAchievements(filter, earnedAchievements).map((userAchievement) => (
                  <AchievementCard
                    key={userAchievement.id}
                    userAchievement={userAchievement}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {getFilteredAchievements(filter, inProgressAchievements).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay logros en progreso
                  </h3>
                  <p className="text-gray-600">
                    Los logros aparecerán aquí cuando comiences a trabajar en ellos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredAchievements(filter, inProgressAchievements).map((userAchievement) => (
                  <AchievementCard
                    key={userAchievement.id}
                    userAchievement={userAchievement}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            {getFilteredAchievements(filter, availableForProgress).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay más logros disponibles
                  </h3>
                  <p className="text-gray-600">
                    ¡Has descubierto todos los logros en esta categoría!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredAchievements(filter, availableForProgress).map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    showProgress={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Achievements;
