
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Zap, ArrowLeft } from 'lucide-react';
import EnhancedScenarioSelector from '@/components/training/EnhancedScenarioSelector';
import LiveTrainingInterface from '@/components/training/LiveTrainingInterface';
import EvaluationResults from '@/components/EvaluationResults';
import type { Database } from '@/integrations/supabase/types';

type Scenario = Database['public']['Tables']['scenarios']['Row'];

const Training = () => {
  const [currentView, setCurrentView] = useState<'setup' | 'training' | 'results'>('setup');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [evaluationResults, setEvaluationResults] = useState(null);

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const startTraining = () => {
    if (!selectedScenario) return;
    setCurrentView('training');
  };

  const handleTrainingComplete = (evaluation: any) => {
    setEvaluationResults(evaluation);
    setCurrentView('results');
  };

  const resetTraining = () => {
    setCurrentView('setup');
    setSelectedScenario(null);
    setEvaluationResults(null);
  };

  const goBackToScenarios = () => {
    setSelectedScenario(null);
  };

  // Vista de entrenamiento en vivo
  if (currentView === 'training' && selectedScenario) {
    return (
      <LiveTrainingInterface
        scenario={selectedScenario.id}
        scenarioTitle={selectedScenario.title}
        scenarioDescription={selectedScenario.description || ''}
        onComplete={handleTrainingComplete}
        onBack={resetTraining}
      />
    );
  }

  // Vista de resultados
  if (currentView === 'results' && evaluationResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <EvaluationResults
          evaluation={evaluationResults}
          onRetry={resetTraining}
          onNextLevel={resetTraining}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header compacto */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-3">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Centro de Entrenamiento IA
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Mejora tus habilidades de comunicación con simulaciones realistas
          </p>
        </div>

        {!selectedScenario ? (
          // Vista de selección de escenarios compacta
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-900">
                    Selecciona tu Escenario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedScenarioSelector onSelectScenario={handleScenarioSelect} />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-900 text-base">¿Cómo funciona?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-xs">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Elige escenario</h4>
                      <p className="text-slate-600 text-xs">Selecciona tu práctica</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-xs">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Configura</h4>
                      <p className="text-slate-600 text-xs">Personalidad y modo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-xs">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Practica</h4>
                      <p className="text-slate-600 text-xs">Chat o voz en vivo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-xs">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Feedback</h4>
                      <p className="text-slate-600 text-xs">Evaluación detallada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Vista de confirmación compacta
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" onClick={goBackToScenarios} size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Cambiar
              </Button>
              <h2 className="text-xl font-bold text-slate-900">Escenario Seleccionado</h2>
            </div>

            <Card className="bg-white shadow-sm mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900">{selectedScenario.title}</CardTitle>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {selectedScenario.scenario_type}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Nivel {selectedScenario.difficulty_level || 1}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-slate-600 text-sm mb-3">{selectedScenario.description}</p>
                
                {selectedScenario.expected_outcomes && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <h4 className="font-medium text-slate-900 mb-2 text-sm">Objetivos:</h4>
                    <ul className="space-y-1">
                      {((selectedScenario.expected_outcomes as any)?.objectives || []).map((objective: string, index: number) => (
                        <li key={index} className="text-xs text-slate-600 flex items-start">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={startTraining}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
              >
                <Play className="h-4 w-4 mr-2" />
                Comenzar Entrenamiento
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Training;
