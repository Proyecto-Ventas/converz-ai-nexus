
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Mic, MessageSquare } from 'lucide-react';
import EnhancedScenarioSelector from '@/components/training/EnhancedScenarioSelector';
import LiveTrainingInterface from '@/components/training/LiveTrainingInterface';
import EvaluationResults from '@/components/EvaluationResults';
import type { Database } from '@/integrations/supabase/types';

type Scenario = Database['public']['Tables']['scenarios']['Row'];

const Training = () => {
  const [currentView, setCurrentView] = useState('setup');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [interactionMode, setInteractionMode] = useState('call');
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

  if (currentView === 'training' && selectedScenario) {
    return (
      <div className="min-h-screen bg-white p-4">
        <LiveTrainingInterface
          scenario={selectedScenario.id}
          scenarioTitle={selectedScenario.title}
          scenarioDescription={selectedScenario.description}
          onComplete={handleTrainingComplete}
          onBack={resetTraining}
        />
      </div>
    );
  }

  if (currentView === 'results' && evaluationResults) {
    return (
      <div className="min-h-screen bg-white p-4">
        <EvaluationResults
          evaluation={evaluationResults}
          onRetry={resetTraining}
          onNextLevel={resetTraining}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Centro de Entrenamiento
          </h1>
          <p className="text-gray-600">
            Selecciona un escenario y configura tu sesión de entrenamiento con IA
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Selector de Escenario */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Seleccionar Escenario de Entrenamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedScenarioSelector onSelectScenario={handleScenarioSelect} />
              </CardContent>
            </Card>
          </div>

          {/* Panel de Configuración */}
          <div className="space-y-6">
            {/* Modo de Interacción */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Modo de Interacción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={interactionMode === 'call' ? 'default' : 'outline'}
                    onClick={() => setInteractionMode('call')}
                    className="flex items-center justify-center p-4 h-auto"
                  >
                    <Mic className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Llamada</div>
                      <div className="text-xs text-gray-500">Conversación por voz</div>
                    </div>
                  </Button>
                  <Button
                    variant={interactionMode === 'chat' ? 'default' : 'outline'}
                    onClick={() => setInteractionMode('chat')}
                    className="flex items-center justify-center p-4 h-auto"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Chat</div>
                      <div className="text-xs text-gray-500">Conversación por texto</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Escenario Seleccionado */}
            {selectedScenario && (
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle>Escenario Seleccionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">{selectedScenario.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedScenario.description}
                      </p>
                    </div>
                    
                    {(() => {
                      const expectedOutcomes = selectedScenario.expected_outcomes as { objectives?: string[] } | null;
                      const objectives = expectedOutcomes?.objectives || [];
                      
                      return objectives.length > 0 ? (
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1">Objetivos:</h5>
                          <ul className="space-y-1">
                            {objectives.map((objective: string, index: number) => (
                              <li key={index} className="text-xs text-gray-600 flex items-center">
                                <div className="w-1 h-1 bg-purple-600 rounded-full mr-2" />
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configuración de Voz */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Configuración de Voz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-4">
                    🎲 Se seleccionará una voz aleatoria para cada sesión
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-700">
                      Cada entrenamiento tendrá una personalidad y voz única para mayor variedad
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botón de Iniciar */}
            <Button
              onClick={startTraining}
              disabled={!selectedScenario}
              className="w-full"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar Entrenamiento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
