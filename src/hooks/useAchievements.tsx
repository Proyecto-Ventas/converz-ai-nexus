
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirements: any;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  target: number;
  earned_at: string | null;
  created_at: string;
  achievement: Achievement;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
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

      setAchievements(achievementsData || []);

      // Load user achievements if user is authenticated
      if (user?.id) {
        console.log('Loading user achievements for user:', user.id);
        
        const { data: userAchievementsData, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievements!fk_user_achievements_achievement_id (*)
          `)
          .eq('user_id', user.id);

        if (userAchievementsError) {
          console.error('Error loading user achievements:', userAchievementsError);
          // Don't throw here, just log the error
          setUserAchievements([]);
        } else {
          setUserAchievements(userAchievementsData || []);
        }
      }

    } catch (error) {
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
    userAchievements,
    loading,
    error,
    loadAchievements,
    checkAchievements
  };
};
