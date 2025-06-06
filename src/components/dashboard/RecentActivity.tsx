
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Target, Star } from 'lucide-react';
import { useActivityLog } from '@/hooks/useActivityLog';

const RecentActivity = () => {
  const { activities, loading } = useActivityLog();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'session_completed':
        return <Trophy className="h-5 w-5 text-green-600" />;
      case 'achievement_earned':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'challenge_joined':
        return <Target className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.activity_type) {
      case 'session_completed':
        const score = activity.activity_data?.score || 0;
        return `Sesión completada con ${score}% de puntuación`;
      case 'achievement_earned':
        return `Logro desbloqueado: ${activity.activity_data?.achievement_title || 'Nuevo logro'}`;
      case 'challenge_joined':
        return `Se unió al desafío: ${activity.activity_data?.challenge_title || 'Nuevo desafío'}`;
      default:
        return activity.activity_type;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else {
      return `Hace ${diffDays}d`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No hay actividad reciente. ¡Comienza una sesión de entrenamiento!
          </p>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(activity.created_at!)}
                  </p>
                </div>
                {activity.points_earned > 0 && (
                  <Badge variant="secondary" className="flex-shrink-0">
                    +{activity.points_earned} XP
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
