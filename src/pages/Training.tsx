
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Mic, MessageSquare, Settings, Zap, Users, Clock, Target } from 'lucide-react';
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
      <div className="min-h-screen bg-background p-4">
        <EvaluationResults
          evaluation={evaluationResults}
          onRetry={resetTraining}
          onNextLevel={resetTraining}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive py-6">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-corporate rounded-2xl mb-6 shadow-lg">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Centro de Entrenamiento IA
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Mejora tus habilidades de comunicación con simulaciones realistas impulsadas por inteligencia artificial
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Scenario Selector - Takes more space */}
          <div className="xl:col-span-3">
            <Card className="card-elevated">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-2xl text-foreground flex items-center space-x-3">
                  <Target className="h-6 w-6 text-primary" />
                  <span>Selecciona tu Escenario de Entrenamiento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <EnhancedScenarioSelector onSelectScenario={handleScenarioSelect} />
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="xl:col-span-1 space-y-6">
            {/* Interaction Mode */}
            <Card className="card-corporate">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>Configuración</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Modo de Interacción</h3>
                  <div className="space-y-3">
                    <Button
                      variant={interactionMode === 'call' ? 'default' : 'outline'}
                      onClick={() => setInteractionMode('call')}
                      className="w-full justify-start p-4 h-auto text-left"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mic className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Entrenamiento por Voz</div>
                          <div className="text-sm text-muted-foreground">Conversación natural por audio</div>
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={interactionMode === 'chat' ? 'default' : 'outline'}
                      onClick={() => setInteractionMode('chat')}
                      className="w-full justify-start p-4 h-auto text-left"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Entrenamiento por Chat</div>
                          <div className="text-sm text-muted-foreground">Conversación por texto</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Scenario */}
            {selectedScenario && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 card-corporate">
                <CardHeader className="border-b border-blue-100">
                  <CardTitle className="text-blue-900 text-lg">Escenario Seleccionado</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 text-lg">{selectedScenario.title}</h4>
                      <p className="text-blue-700 mt-2 leading-relaxed text-sm">
                        {selectedScenario.description}
                      </p>
                    </div>
                    
                    {(() => {
                      const expectedOutcomes = selectedScenario.expected_outcomes as { objectives?: string[] } | null;
                      const objectives = expectedOutcomes?.objectives || [];
                      
                      return objectives.length > 0 ? (
                        <div className="bg-white/70 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            Objetivos de Aprendizaje:
                          </h5>
                          <ul className="space-y-2">
                            {objectives.slice(0, 3).map((objective: string, index: number) => (
                              <li key={index} className="text-sm text-blue-700 flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                                <span>{objective}</span>
                              </li>
                            ))}
                            {objectives.length > 3 && (
                              <li className="text-sm text-blue-600 italic">
                                +{objectives.length - 3} objetivos más...
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Configuration */}
            <Card className="card-corporate">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground text-lg">Configuración de IA</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Personalidad Adaptativa</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Cada sesión utiliza una personalidad y voz única, adaptándose a tu estilo de comunicación.
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                    <div className="grid grid-cols-1 gap-2 text-sm text-purple-700">
                      <div className="flex items-center">
                        <span className="mr-2">🎭</span>
                        <span>Personalidad aleatoria</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🗣️</span>
                        <span>Voz sintetizada natural</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🧠</span>
                        <span>Respuestas contextuales</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Training Button */}
            <div className="space-y-4">
              <Button
                onClick={startTraining}
                disabled={!selectedScenario}
                className="w-full h-14 btn-corporate text-lg font-semibold"
                size="lg"
              >
                <Play className="h-6 w-6 mr-3" />
                <span>Iniciar Entrenamiento</span>
              </Button>

              {!selectedScenario && (
                <p className="text-center text-sm text-muted-foreground">
                  Selecciona un escenario para comenzar
                </p>
              )}

              {/* Quick Stats */}
              <div className="bg-muted rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">24/7</div>
                    <div className="text-xs text-muted-foreground">Disponible</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">∞</div>
                    <div className="text-xs text-muted-foreground">Práctica ilimitada</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
