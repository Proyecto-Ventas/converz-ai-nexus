
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Target, BookOpen } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  xp_reward: number | null;
  icon: string | null;
}

interface UserAchievement {
  id: string;
  progress: number | null;
  target: number | null;
  earned_at: string | null;
  achievement: Achievement;
}

interface AchievementCardProps {
  userAchievement?: UserAchievement;
  achievement?: Achievement;
  showProgress?: boolean;
}

const AchievementCard = ({ userAchievement, achievement, showProgress = true }: AchievementCardProps) => {
  const achievementData = userAchievement?.achievement || achievement;
  const isEarned = userAchievement?.earned_at !== null;
  const progress = userAchievement?.progress || 0;
  const target = userAchievement?.target || 1;
  const progressPercentage = target > 0 ? Math.min((progress / target) * 100, 100) : 0;

  if (!achievementData) return null;

  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'star':
        return <Star className={`h-8 w-8 ${isEarned ? 'text-yellow-500' : 'text-gray-400'}`} />;
      case 'trophy':
        return <Trophy className={`h-8 w-8 ${isEarned ? 'text-yellow-500' : 'text-gray-400'}`} />;
      case 'target':
        return <Target className={`h-8 w-8 ${isEarned ? 'text-blue-500' : 'text-gray-400'}`} />;
      case 'book-open':
        return <BookOpen className={`h-8 w-8 ${isEarned ? 'text-green-500' : 'text-gray-400'}`} />;
      default:
        return <Star className={`h-8 w-8 ${isEarned ? 'text-yellow-500' : 'text-gray-400'}`} />;
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Principiante':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Habilidades':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Experto':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card 
      variant="elevated"
      className={`h-full transition-all duration-200 ${isEarned ? 'ring-2 ring-yellow-400' : 'opacity-90 hover:opacity-100'}`}
    >
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-start space-x-4">
          {/* Icono */}
          <div className="flex-shrink-0">
            {getIcon(achievementData.icon)}
          </div>

          {/* Contenido */}
          <div className="flex-1 space-y-3 flex flex-col h-full">
            {/* Título y estado */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`font-semibold ${isEarned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                  {achievementData.title}
                </h3>
                <p className={`text-sm ${isEarned ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                  {achievementData.description}
                </p>
              </div>
              {isEarned && (
                <Badge variant="default" className="bg-yellow-500 text-white">
                  ¡Completado!
                </Badge>
              )}
            </div>

            {/* Categoría y XP */}
            <div className="flex items-center justify-between mt-auto">
              <Badge variant="outline" className={getCategoryColor(achievementData.category)}>
                {achievementData.category || 'General'}
              </Badge>
              <span className={`text-sm font-medium ${isEarned ? 'text-yellow-600' : 'text-gray-500'}`}>
                +{achievementData.xp_reward || 0} XP
              </span>
            </div>

            {/* Progreso */}
            {showProgress && userAchievement && !isEarned && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                  <span className="font-medium">
                    {progress}/{target}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            {/* Fecha de obtención */}
            {isEarned && userAchievement?.earned_at && (
              <p className="text-xs text-gray-500">
                Desbloqueado el {new Date(userAchievement.earned_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
