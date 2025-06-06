
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Target, Star, TrendingUp, Activity } from 'lucide-react';
import { useActivityLog } from '@/hooks/useActivityLog';

const RecentActivity = () => {
  const { activities, loading } = useActivityLog();

  if (loading) {
    return (
      <Card className="card-corporate">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Actividad Reciente</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (activityType: string) => {
    const iconMap = {
      session_completed: { icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-100' },
      achievement_earned: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      challenge_joined: { icon: Target, color: 'text-blue-600', bg: 'bg-blue-100' },
      default: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' }
    };
    
    const config = iconMap[activityType] || iconMap.default;
    const IconComponent = config.icon;
    
    return (
      <div className={`p-3 rounded-xl ${config.bg}`}>
        <IconComponent className={`h-5 w-5 ${config.color}`} />
      </div>
    );
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
    <Card className="card-corporate">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Actividad Reciente</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {activities.length} actividades
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-muted rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              No hay actividad reciente
            </h3>
            <p className="text-muted-foreground">
              ¡Comienza una sesión de entrenamiento para ver tu actividad aquí!
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.slice(0, 10).map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {getActivityDescription(activity)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.created_at!)}
                    </p>
                    {activity.points_earned > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-emerald-600 font-medium">
                          +{activity.points_earned} XP
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {activity.points_earned > 0 && (
                  <Badge variant="secondary" className="flex-shrink-0 bg-emerald-100 text-emerald-700 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{activity.points_earned}
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
