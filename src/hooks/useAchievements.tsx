
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirements: any;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  category?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  target: number;
  earned_at: string | null;
  achievement: Achievement;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadAchievements = async () => {
    try {
      console.log('Loading achievements...');
      
      // Load all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (achievementsError) {
        console.error('Error loading achievements:', achievementsError);
        throw achievementsError;
      }

      setAvailableAchievements(achievementsData || []);

      // Load user achievements if user is authenticated
      if (user?.id) {
        console.log('Loading user achievements for user:', user.id);
        
        const { data: userAchievementsData, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select(`
            id,
            user_id,
            achievement_id,
            progress,
            target,
            earned_at
          `)
          .eq('user_id', user.id);

        if (userAchievementsError) {
          console.error('Error loading user achievements:', userAchievementsError);
          setUserAchievements([]);
          setAchievements([]);
        } else {
          // Map user achievements with their corresponding achievement data
          const enhancedUserAchievements: UserAchievement[] = [];
          
          for (const ua of userAchievementsData || []) {
            const achievement = achievementsData?.find(a => a.id === ua.achievement_id);
            if (achievement) {
              enhancedUserAchievements.push({
                id: ua.id,
                user_id: ua.user_id,
                achievement_id: ua.achievement_id,
                progress: ua.progress || 0,
                target: ua.target || 1,
                earned_at: ua.earned_at,
                achievement
              });
            }
          }
          
          setUserAchievements(enhancedUserAchievements);
          setAchievements(enhancedUserAchievements);
        }
      }

    } catch (error: any) {
      console.error('Error in loadAchievements:', error);
      setError(error.message || 'Error loading achievements');
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('check_and_grant_achievements', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking achievements:', error);
      } else {
        // Reload achievements after checking
        await loadAchievements();
      }
    } catch (error) {
      console.error('Error in checkAchievements:', error);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, [user]);

  return {
    achievements,
    availableAchievements,
    userAchievements,
    loading,
    error,
    loadAchievements,
    checkAchievements
  };
};
