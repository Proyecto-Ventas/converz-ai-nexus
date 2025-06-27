
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Trophy, Target, Star, Crown } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string | null;
  difficulty_level: number | null;
  end_date: string | null;
  reward_xp: number | null;
  is_participating: boolean;
  participant_count: number;
  user_score: number | null;
  is_custom?: boolean;
  created_by?: string;
  target_score?: number | null;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin: (challengeId: string) => void;
  onLeave: (challengeId: string) => void;
  loading?: boolean;
}

const ChallengeCard = ({ challenge, onJoin, onLeave, loading = false }: ChallengeCardProps) => {
  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-orange-500';
      case 4: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Fácil';
      case 2: return 'Medio';
      case 3: return 'Difícil';
      case 4: return 'Extremo';
      default: return 'Desconocido';
    }
  };

  const formatTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Finalizado';
    if (diffDays === 0) return 'Último día';
    if (diffDays === 1) return '1 día restante';
    return `${diffDays} días restantes`;
  };

  const getProgressPercentage = () => {
    if (!challenge.user_score || !challenge.target_score) return 0;
    return Math.min((challenge.user_score / challenge.target_score) * 100, 100);
  };

  return (
    <Card variant="elevated" className="h-full flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {challenge.is_custom && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>Personalizado</span>
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <CardTitle className="text-lg">{challenge.title}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {challenge.description}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge 
              className={`${getDifficultyColor(challenge.difficulty_level || 1)} text-white`}
            >
              {getDifficultyLabel(challenge.difficulty_level || 1)}
            </Badge>
            <Badge variant="outline">
              {challenge.challenge_type === 'team' ? 'Equipo' : 'Individual'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Información del desafío */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{challenge.participant_count} participantes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span>{challenge.reward_xp || 0} XP</span>
          </div>
          {challenge.end_date && (
            <div className="flex items-center space-x-2 col-span-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{formatTimeRemaining(challenge.end_date)}</span>
            </div>
          )}
          {challenge.target_score && (
            <div className="flex items-center space-x-2 col-span-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Meta: {challenge.target_score} puntos</span>
            </div>
          )}
        </div>

        {/* Progreso del usuario si está participando */}
        {challenge.is_participating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>Tu progreso</span>
              </span>
              <span className="font-medium">
                {challenge.user_score || 0} 
                {challenge.target_score && ` / ${challenge.target_score}`} puntos
              </span>
            </div>
            {challenge.target_score && (
              <Progress value={getProgressPercentage()} className="h-2" />
            )}
          </div>
        )}

        {/* Botón de acción */}
        <div className="pt-4 mt-auto">
          {challenge.is_participating ? (
            <div className="space-y-2">
              <Badge variant="default" className="w-full justify-center py-2">
                Participando
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLeave(challenge.id)}
                disabled={loading}
                className="w-full"
              >
                Abandonar
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => onJoin(challenge.id)}
              disabled={loading}
              className="w-full"
            >
              Unirse al Desafío
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
