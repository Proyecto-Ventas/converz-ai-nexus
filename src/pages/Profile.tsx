
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Calendar, Trophy, Target, Star, Settings, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useAchievements } from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user } = useAuth();
  const { stats, refreshStats } = useUserStats();
  const { achievements } = useAchievements();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: ''
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || ''
        });
      } else {
        // Crear perfil si no existe
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        };

        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (insertError) throw insertError;

        setProfile(insertedProfile);
        setFormData({
          full_name: insertedProfile.full_name || '',
          avatar_url: insertedProfile.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados correctamente",
      });

      loadProfile(); // Recargar para mostrar cambios
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const earnedAchievements = achievements.filter(ua => ua.earned_at);
  const levelProgress = stats ? ((stats.total_xp % 1000) / 1000) * 100 : 0;
  const nextLevelXP = stats ? Math.ceil(stats.total_xp / 1000) * 1000 : 1000;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pl-page">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pl-page">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header del perfil */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || formData.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {getInitials(profile?.full_name || profile?.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  disabled
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Información básica */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.full_name || 'Usuario'}
                  </h1>
                  <p className="text-gray-600">{profile?.email}</p>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats?.level || 1}</div>
                    <div className="text-sm text-gray-600">Nivel</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats?.total_sessions || 0}</div>
                    <div className="text-sm text-gray-600">Sesiones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{earnedAchievements.length}</div>
                    <div className="text-sm text-gray-600">Logros</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats?.total_xp || 0}</div>
                    <div className="text-sm text-gray-600">XP Total</div>
                  </div>
                </div>

                {/* Progreso de nivel */}
                {stats && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso al Nivel {(stats.level || 1) + 1}</span>
                      <span>{nextLevelXP - stats.total_xp} XP restantes</span>
                    </div>
                    <Progress value={levelProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs del perfil */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="achievements">Logros</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Tab: Resumen */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del usuario */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Miembro desde</p>
                      <p className="font-medium">
                        {profile?.created_at ? formatJoinDate(profile.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Rol</p>
                      <Badge variant="outline">{profile?.role || 'user'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas detalladas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Estadísticas de Entrenamiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tiempo total de entrenamiento</span>
                      <span className="font-medium">
                        {Math.floor((stats?.total_time_minutes || 0) / 60)}h {(stats?.total_time_minutes || 0) % 60}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Puntuación promedio</span>
                      <span className="font-medium">{Number(stats?.average_score || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mejor puntuación</span>
                      <span className="font-medium">{stats?.best_score || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Racha actual</span>
                      <span className="font-medium">{stats?.current_streak || 0} días</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">XP por logros</span>
                      <span className="font-medium">
                        {earnedAchievements.reduce((sum, ua) => sum + (ua.achievement.xp_reward || 0), 0)} XP
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Logros */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Logros Desbloqueados
                  </div>
                  <Badge variant="outline">{earnedAchievements.length} de {achievements.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {earnedAchievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Aún no tienes logros
                    </h3>
                    <p className="text-gray-600">
                      Completa sesiones de entrenamiento para desbloquear logros
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {earnedAchievements.map((userAchievement) => (
                      <div
                        key={userAchievement.id}
                        className="flex items-center space-x-3 p-4 border rounded-lg"
                      >
                        <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{userAchievement.achievement.title}</h4>
                          <p className="text-sm text-gray-600">
                            {userAchievement.achievement.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              +{userAchievement.achievement.xp_reward || 0} XP
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {userAchievement.earned_at ? 
                                new Date(userAchievement.earned_at).toLocaleDateString() : 
                                'Fecha desconocida'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Configuración */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuración del Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">URL del avatar</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    placeholder="https://ejemplo.com/avatar.jpg"
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={updateProfile} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de la cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email (no editable)</Label>
                  <Input value={profile?.email || ''} disabled />
                </div>
                <div>
                  <Label>ID de usuario</Label>
                  <Input value={user?.id || ''} disabled className="font-mono text-xs" />
                </div>
                <div>
                  <Label>Fecha de registro</Label>
                  <Input 
                    value={profile?.created_at ? formatJoinDate(profile.created_at) : 'N/A'} 
                    disabled 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
