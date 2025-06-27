
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Trophy, TrendingUp, Search, Filter, BarChart3 } from 'lucide-react';
import { useSessionManager } from '@/components/training/SessionManager';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useUserStats } from '@/hooks/useUserStats';

const History = () => {
  const sessionManager = useSessionManager();
  const { activities, loading: activitiesLoading } = useActivityLog();
  const { stats } = useUserStats();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'duration'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'completed' | 'high_score'>('all');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const sessionsData = await sessionManager.getUserSessions(50);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions
    .filter(session => {
      // Filtro de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (session.scenario_title || '').toLowerCase().includes(searchLower) ||
          (session.client_emotion || '').toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(session => {
      // Filtro por tipo
      switch (filterBy) {
        case 'completed':
          return session.completed_at;
        case 'high_score':
          return (session.score || 0) >= 80;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Ordenamiento
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'duration':
          return (b.duration_minutes || 0) - (a.duration_minutes || 0);
        case 'date':
        default:
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
    });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muy Bueno';
    if (score >= 70) return 'Bueno';
    if (score >= 60) return 'Regular';
    return 'Necesita Mejora';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.activity_type) {
      case 'session_completed':
        return `Sesión completada con ${activity.activity_data?.score || 0}% de puntuación`;
      case 'achievement_earned':
        return `Logro desbloqueado: ${activity.activity_data?.achievement_title || 'Nuevo logro'}`;
      case 'challenge_joined':
        return `Se unió al desafío: ${activity.activity_data?.challenge_title || 'Nuevo desafío'}`;
      default:
        return activity.activity_type;
    }
  };

  const monthlyStats = React.useMemo(() => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.created_at || '');
        return sessionDate.getMonth() === month.getMonth() && 
               sessionDate.getFullYear() === month.getFullYear();
      });
      
      last6Months.push({
        month: month.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        sessions: monthSessions.length,
        avgScore: monthSessions.length > 0 
          ? Math.round(monthSessions.reduce((sum, s) => sum + (s.score || 0), 0) / monthSessions.length)
          : 0,
        totalTime: monthSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
      });
    }
    
    return last6Months;
  }, [sessions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pl-page">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pl-page">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Historial
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Revisa tu progreso y actividad de entrenamiento
            </p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex items-center p-6">
              <Trophy className="h-8 w-8 text-yellow-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{sessions.length}</div>
                <div className="text-sm text-gray-600">Sesiones Totales</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{Number(stats?.average_score || 0).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Puntuación Promedio</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.floor((stats?.total_time_minutes || 0) / 60)}h
                </div>
                <div className="text-sm text-gray-600">Tiempo Total</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{stats?.best_score || 0}%</div>
                <div className="text-sm text-gray-600">Mejor Puntuación</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              {monthlyStats.map((month, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">{month.month}</div>
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 space-y-1">
                    <div className="text-lg font-bold text-blue-600">{month.sessions}</div>
                    <div className="text-xs text-gray-600">sesiones</div>
                    <div className="text-sm font-medium">{month.avgScore}%</div>
                    <div className="text-xs text-gray-600">promedio</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs para sesiones y actividad */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sessions">Sesiones ({filteredSessions.length})</TabsTrigger>
            <TabsTrigger value="activity">Actividad ({activities.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-6">
            {/* Filtros y búsqueda */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar sesiones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Fecha</SelectItem>
                      <SelectItem value="score">Puntuación</SelectItem>
                      <SelectItem value="duration">Duración</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="completed">Completadas</SelectItem>
                      <SelectItem value="high_score">Puntuación Alta (80%+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de sesiones */}
            {filteredSessions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No hay sesiones para mostrar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Comienza una nueva sesión de entrenamiento para ver tu historial aquí
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {session.scenario_title || 'Sesión de Entrenamiento'}
                            </h3>
                            {session.completed_at && (
                              <Badge
                                className={`${getScoreColor(session.score || 0)} text-white`}
                              >
                                {session.score || 0}% - {getScoreLabel(session.score || 0)}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(session.created_at || '')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(session.duration_minutes || 0)}</span>
                            </div>
                            <div>
                              <span>Emoción: {session.client_emotion || 'N/A'}</span>
                            </div>
                            <div>
                              <span>Modo: {session.interaction_mode || 'N/A'}</span>
                            </div>
                          </div>
                          
                          {(session.total_messages || 0) > 0 && (
                            <div className="mt-2 text-sm text-gray-500">
                              {session.total_messages} mensajes • {session.user_words_count || 0} palabras del usuario
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={session.completed_at ? 'default' : 'secondary'}>
                            {session.completed_at ? 'Completada' : 'En progreso'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {activitiesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No hay actividad registrada
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tu actividad aparecerá aquí conforme uses la plataforma
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{getActivityDescription(activity)}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(activity.created_at!)}
                          </p>
                        </div>
                        {activity.points_earned > 0 && (
                          <Badge variant="secondary">
                            +{activity.points_earned} XP
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default History;
