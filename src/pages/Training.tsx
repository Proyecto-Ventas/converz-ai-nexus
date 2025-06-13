
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Centro de Entrenamiento IA
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Mejora tus habilidades de comunicación con simulaciones realistas impulsadas por IA
          </p>
        </div>

        {!selectedScenario ? (
          // Vista de selección de escenarios
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

            <div className="space-y-6">
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-slate-900">¿Cómo funciona?</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-semibold text-xs">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Elige tu escenario</h4>
                        <p className="text-slate-600">Selecciona el tipo de entrenamiento que deseas practicar</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-semibold text-xs">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Configura tu cliente</h4>
                        <p className="text-slate-600">Elige la personalidad y modo de interacción</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-semibold text-xs">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Practica en vivo</h4>
                        <p className="text-slate-600">Conversa con el cliente IA por chat o voz</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-semibold text-xs">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Recibe feedback</h4>
                        <p className="text-slate-600">Obtén evaluación detallada de tu desempeño</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm border border-purple-200">
                <CardHeader className="border-b border-purple-100">
                  <CardTitle className="text-purple-900">Tecnología IA Avanzada</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-purple-700">Personalidades de cliente realistas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-purple-700">Evaluación en tiempo real</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-purple-700">Adaptación dinámica del diálogo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-purple-700">Soporte para voz y texto</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Vista de confirmación de escenario seleccionado
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" onClick={goBackToScenarios}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cambiar Escenario
              </Button>
              <h2 className="text-2xl font-bold text-slate-900">Escenario Seleccionado</h2>
            </div>

            <Card className="bg-white shadow-sm border border-slate-200 mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">{selectedScenario.title}</CardTitle>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {selectedScenario.scenario_type}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Nivel {selectedScenario.difficulty_level || 1}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">{selectedScenario.description}</p>
                
                {selectedScenario.expected_outcomes && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">Objetivos de Aprendizaje:</h4>
                    <ul className="space-y-1">
                      {((selectedScenario.expected_outcomes as any)?.objectives || []).map((objective: string, index: number) => (
                        <li key={index} className="text-sm text-slate-600 flex items-start">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0" />
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
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
              >
                <Play className="h-5 w-5 mr-2" />
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
