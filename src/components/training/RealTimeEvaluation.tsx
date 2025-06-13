
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Equal, Target, Heart, Brain, Mic, AlertCircle, Star, CheckCircle } from 'lucide-react';

interface RealTimeMetrics {
  rapport: number;
  clarity: number;
  empathy: number;
  accuracy: number;
  responseTime: number;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  criticalIssues: string[];
  positivePoints: string[];
  suggestions: string[];
  liveCoaching: string[];
}

interface RealTimeEvaluationProps {
  metrics: RealTimeMetrics;
  isActive: boolean;
  sessionDuration: number;
  messageCount: number;
  onRequestFeedback: () => void;
}

const RealTimeEvaluation = ({ 
  metrics, 
  isActive, 
  sessionDuration,
  messageCount,
  onRequestFeedback 
}: RealTimeEvaluationProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sistema de calificación más exigente 0-100
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    if (score >= 30) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excepcional';
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Muy Bueno';
    if (score >= 50) return 'Bueno';
    if (score >= 30) return 'Regular';
    return 'Necesita Mejora';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Equal className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 85) return <Star className="h-5 w-5 text-yellow-500" />;
    if (score >= 70) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 50) return <Target className="h-5 w-5 text-blue-500" />;
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const metricsData = [
    { 
      key: 'rapport', 
      label: 'Conexión', 
      icon: Heart, 
      value: metrics.rapport,
      description: 'Construcción de relación con el cliente'
    },
    { 
      key: 'clarity', 
      label: 'Claridad', 
      icon: Mic, 
      value: metrics.clarity,
      description: 'Comunicación clara y comprensible'
    },
    { 
      key: 'empathy', 
      label: 'Empatía', 
      icon: Heart, 
      value: metrics.empathy,
      description: 'Comprensión y respuesta emocional'
    },
    { 
      key: 'accuracy', 
      label: 'Precisión', 
      icon: Brain, 
      value: metrics.accuracy,
      description: 'Exactitud de información y respuestas'
    }
  ];

  // Feedback automático cada 2 minutos
  useEffect(() => {
    if (isActive && sessionDuration > 0 && sessionDuration % 120 === 0 && sessionDuration !== lastFeedbackTime) {
      onRequestFeedback();
      setLastFeedbackTime(sessionDuration);
    }
  }, [sessionDuration, isActive, onRequestFeedback, lastFeedbackTime]);

  return (
    <div className="space-y-3">
      {/* Puntuación general y estadísticas */}
      <Card className={`${getScoreBackground(metrics.overallScore)} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {getPerformanceIcon(metrics.overallScore)}
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                  {metrics.overallScore}/100
                </div>
                <div className="text-xs text-gray-600">{getScoreLabel(metrics.overallScore)}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getTrendIcon(metrics.trend)}
              <div className="text-sm text-center">
                <div className="font-medium">Tendencia</div>
                <div className="text-xs text-gray-600 capitalize">{
                  metrics.trend === 'up' ? 'Mejorando' : 
                  metrics.trend === 'down' ? 'Decayendo' : 'Estable'
                }</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-blue-600">{formatTime(sessionDuration)}</div>
              <div className="text-xs text-gray-600">Duración</div>
            </div>
            <div>
              <div className="font-semibold text-purple-600">{messageCount}</div>
              <div className="text-xs text-gray-600">Mensajes</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">{Math.round(metrics.responseTime)}s</div>
              <div className="text-xs text-gray-600">Resp. Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas detalladas */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Evaluación en Tiempo Real
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ocultar' : 'Detalles'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {metricsData.map((metric) => (
              <div key={metric.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${getScoreColor(metric.value)}`}>
                      {metric.value}/100
                    </span>
                    {metric.value >= 85 && <Star className="h-3 w-3 text-yellow-500" />}
                  </div>
                </div>
                <Progress value={metric.value} className="h-2" />
                {showDetails && (
                  <p className="text-xs text-gray-500 italic">{metric.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coaching en tiempo real */}
      {metrics.liveCoaching && metrics.liveCoaching.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center text-blue-700 mb-2">
              <Brain className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">¿Cómo lo estoy haciendo?</span>
            </div>
            {metrics.liveCoaching.map((tip, index) => (
              <div key={index} className="text-xs text-blue-700 mb-1 pl-6">
                • {tip}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alertas críticas */}
      {metrics.criticalIssues.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-center text-red-700 mb-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">¡Atención Inmediata!</span>
            </div>
            {metrics.criticalIssues.map((issue, index) => (
              <Badge key={index} variant="destructive" className="mr-1 mb-1 text-xs">
                {issue}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Puntos fuertes */}
      {metrics.positivePoints.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center text-green-700 mb-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">¡Excelente!</span>
            </div>
            {metrics.positivePoints.map((point, index) => (
              <Badge key={index} className="mr-1 mb-1 text-xs bg-green-100 text-green-700">
                {point}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Botón de feedback */}
      <Button
        onClick={onRequestFeedback}
        variant="outline"
        className="w-full"
        disabled={!isActive}
      >
        <Target className="h-4 w-4 mr-2" />
        Dame Resultados Ahora
      </Button>
    </div>
  );
};

export default RealTimeEvaluation;
