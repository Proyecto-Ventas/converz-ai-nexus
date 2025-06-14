
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Zap, ArrowLeft, BookOpen, Target, Trophy } from 'lucide-react';
import EnhancedScenarioSelector from '@/components/training/EnhancedScenarioSelector';
import LiveTrainingInterface from '@/components/training/LiveTrainingInterface';
import EvaluationResults from '@/components/EvaluationResults';
import { CorporateLayout, CorporateCard, CorporateHeader, CorporateSection, CorporateStats } from '@/components/ui/corporate-layout';
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
      <CorporateLayout>
        <div className="p-6">
          <EvaluationResults
            evaluation={evaluationResults}
            onRetry={resetTraining}
            onNextLevel={resetTraining}
          />
        </div>
      </CorporateLayout>
    );
  }

  const trainingStats = [
    { label: 'Escenarios Disponibles', value: '12', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Voces Latinas', value: '22', icon: <Zap className="h-5 w-5" /> },
    { label: 'Idiomas Soportados', value: '15', icon: <Target className="h-5 w-5" /> },
    { label: 'Entrenamientos Hoy', value: '8', icon: <Trophy className="h-5 w-5" /> }
  ];

  return (
    <CorporateLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <CorporateHeader
          title="Centro de Entrenamiento IA"
          subtitle="Mejora tus habilidades de comunicación con simulaciones realistas y voces latinas auténticas"
          icon={<Zap className="h-6 w-6" />}
        />

        <CorporateStats stats={trainingStats} className="mb-8" />

        {!selectedScenario ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <CorporateSection title="Selecciona tu Escenario de Entrenamiento">
                <CorporateCard elevated className="p-0">
                  <div className="p-6">
                    <EnhancedScenarioSelector onSelectScenario={handleScenarioSelect} />
                  </div>
                </CorporateCard>
              </CorporateSection>
            </div>

            <div className="xl:col-span-1">
              <CorporateSection title="Guía de Entrenamiento">
                <CorporateCard className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Selecciona Escenario</h4>
                        <p className="text-sm text-gray-600 mt-1">Elige el tipo de práctica que necesitas</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Configura Parámetros</h4>
                        <p className="text-sm text-gray-600 mt-1">Personaliza la voz y personalidad del cliente</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Practica en Vivo</h4>
                        <p className="text-sm text-gray-600 mt-1">Interactúa por chat o voz con IA</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Recibe Feedback</h4>
                        <p className="text-sm text-gray-600 mt-1">Obtén evaluación detallada y consejos</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Nuevo: Voces Latinas</h4>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Ahora incluimos 22 voces auténticas de toda Latinoamérica, incluyendo acentos específicos como el paisa de Medellín.
                    </p>
                  </div>
                </CorporateCard>
              </CorporateSection>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <Button variant="outline" onClick={goBackToScenarios}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cambiar Escenario
              </Button>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-900">Escenario Seleccionado</h2>
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <CorporateCard elevated className="mb-6">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedScenario.title}</h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                        {selectedScenario.scenario_type?.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        Nivel {selectedScenario.difficulty_level || 1}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">{selectedScenario.description}</p>
                
                {selectedScenario.expected_outcomes && (
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-blue-600" />
                      Objetivos del Entrenamiento
                    </h4>
                    <ul className="space-y-2">
                      {((selectedScenario.expected_outcomes as any)?.objectives || []).map((objective: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-1.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CorporateCard>

            <div className="text-center">
              <Button
                onClick={startTraining}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="h-5 w-5 mr-3" />
                Comenzar Entrenamiento
              </Button>
            </div>
          </div>
        )}
      </div>
    </CorporateLayout>
  );
};

export default Training;
