
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Mic, MessageSquare, Settings, Zap } from 'lucide-react';
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
      <LiveTrainingInterface
        scenario={selectedScenario.id}
        scenarioTitle={selectedScenario.title}
        scenarioDescription={selectedScenario.description}
        onComplete={handleTrainingComplete}
        onBack={resetTraining}
      />
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header renovado */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Centro de Entrenamiento IA
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Mejora tus habilidades de comunicación con simulaciones realistas impulsadas por inteligencia artificial
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selector de Escenario mejorado */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl text-slate-900">
                  Selecciona tu Escenario de Entrenamiento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <EnhancedScenarioSelector onSelectScenario={handleScenarioSelect} />
              </CardContent>
            </Card>
          </div>

          {/* Panel de Configuración renovado */}
          <div className="space-y-6">
            {/* Modo de Interacción */}
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  <span>Configuración</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Modo de Interacción</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant={interactionMode === 'call' ? 'default' : 'outline'}
                      onClick={() => setInteractionMode('call')}
                      className="flex items-center justify-start p-4 h-auto text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mic className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Entrenamiento por Voz</div>
                          <div className="text-sm text-slate-500">Conversación natural por audio</div>
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={interactionMode === 'chat' ? 'default' : 'outline'}
                      onClick={() => setInteractionMode('chat')}
                      className="flex items-center justify-start p-4 h-auto text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Entrenamiento por Chat</div>
                          <div className="text-sm text-slate-500">Conversación por texto</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Escenario Seleccionado */}
            {selectedScenario && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm border border-blue-200">
                <CardHeader className="border-b border-blue-100">
                  <CardTitle className="text-blue-900">Escenario Seleccionado</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 text-lg">{selectedScenario.title}</h4>
                      <p className="text-blue-700 mt-2 leading-relaxed">
                        {selectedScenario.description}
                      </p>
                    </div>
                    
                    {(() => {
                      const expectedOutcomes = selectedScenario.expected_outcomes as { objectives?: string[] } | null;
                      const objectives = expectedOutcomes?.objectives || [];
                      
                      return objectives.length > 0 ? (
                        <div className="bg-white/50 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-blue-800 mb-3">Objetivos de Aprendizaje:</h5>
                          <ul className="space-y-2">
                            {objectives.map((objective: string, index: number) => (
                              <li key={index} className="text-sm text-blue-700 flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                                <span>{objective}</span>
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

            {/* Configuración de IA */}
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-slate-900">Configuración de IA</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Personalidad Adaptativa</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      Cada sesión utiliza una personalidad y voz única, adaptándose a tu estilo de comunicación para maximizar el aprendizaje.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700">
                      🎭 Personalidad aleatoria para mayor variedad<br/>
                      🗣️ Voz sintetizada natural<br/>
                      🧠 Respuestas inteligentes contextuales
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botón de Iniciar mejorado */}
            <Button
              onClick={startTraining}
              disabled={!selectedScenario}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              size="lg"
            >
              <Play className="h-6 w-6 mr-3" />
              <span className="text-lg font-semibold">Iniciar Entrenamiento</span>
            </Button>

            {!selectedScenario && (
              <p className="text-center text-sm text-slate-500">
                Selecciona un escenario para comenzar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
