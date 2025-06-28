import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import EnhancedScenarioSelector from '@/components/training/EnhancedScenarioSelector';
import LiveTrainingInterface from '@/components/training/LiveTrainingInterface';
import TrainingSetup from '@/components/training/TrainingSetup';
import EvaluationResults from '@/components/EvaluationResults';
import { CorporateLayout, CorporateCard, CorporateHeader, CorporateSection, CorporateStats } from '@/components/ui/corporate-layout';
import type { Database } from '@/integrations/supabase/types';
type Scenario = Database['public']['Tables']['scenarios']['Row'];
const Training = () => {
  const [currentView, setCurrentView] = useState<'setup' | 'config' | 'training' | 'results'>('setup');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [trainingConfig, setTrainingConfig] = useState<any>(null);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentView('config');
  };
  const handleConfigComplete = (config: any) => {
    setIsLoading(true);
    setTrainingConfig(config);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentView('training');
    }, 1000);
  };
  const handleTrainingComplete = (evaluation: any) => {
    setEvaluationResults(evaluation);
    setCurrentView('results');
  };
  const resetTraining = () => {
    setCurrentView('setup');
    setSelectedScenario(null);
    setTrainingConfig(null);
    setEvaluationResults(null);
  };
  const goBackToScenarios = () => {
    setCurrentView('setup');
    setSelectedScenario(null);
    setTrainingConfig(null);
  };
  const goBackToConfig = () => {
    setCurrentView('config');
    setTrainingConfig(null);
  };

  // Loading state
  if (isLoading) {
    return <CorporateLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">Preparando Entrenamiento</h3>
              <p className="text-slate-600">Configurando el escenario y la IA...</p>
            </div>
          </div>
        </div>
      </CorporateLayout>;
  }

  // Vista de configuración previa
  if (currentView === 'config' && selectedScenario) {
    return <CorporateLayout>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <TrainingSetup scenario={selectedScenario} onStart={handleConfigComplete} onBack={goBackToScenarios} />
        </div>
      </CorporateLayout>;
  }

  // Vista de entrenamiento en vivo
  if (currentView === 'training' && selectedScenario && trainingConfig) {
    return <LiveTrainingInterface scenario={selectedScenario.id} scenarioTitle={selectedScenario.title} scenarioDescription={selectedScenario.description || ''} mode={trainingConfig.mode} clientEmotion={trainingConfig.clientEmotion} selectedVoiceId={trainingConfig.selectedVoiceId} selectedVoiceName={trainingConfig.selectedVoiceName} onComplete={handleTrainingComplete} onBack={goBackToConfig} />;
  }

  // Vista de resultados
  if (currentView === 'results' && evaluationResults) {
    return <CorporateLayout>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <EvaluationResults evaluation={evaluationResults} onRetry={resetTraining} onNextLevel={resetTraining} />
        </div>
      </CorporateLayout>;
  }
  const trainingStats = [{
    label: 'Escenarios Disponibles',
    value: '12',
    icon: <span className="text-lg">👥</span>
  }, {
    label: 'Voces Latinas',
    value: '23',
    icon: <span className="text-lg">🗣️</span>
  }, {
    label: 'Países Cubiertos',
    value: '9',
    icon: <span className="text-lg">🏙️</span>
  }, {
    label: 'Entrenamientos Hoy',
    value: '8',
    icon: <span className="text-lg">🎬</span>
  }];
  const iconUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5z'/%3E%3Cpath d='M2 17l10 5 10-5'/%3E%3Cpath d='M2 12l10 5 10-5'/%3E%3C/svg%3E";
  return <CorporateLayout>
      <div className="p-4 sm:p-6 max-w-7xl px-[10px] mx-[-4px]">
        <CorporateHeader title="Centro de Entrenamiento IA" subtitle="Mejora tus habilidades de comunicación con simulaciones realistas y voces latinas auténticas" icon={<img src={iconUrl} alt="Training" className="h-6 w-6" />} actions={<Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
              <span className="text-sm">👨‍🏫</span>
              Ayuda
            </Button>} />

        <CorporateStats stats={trainingStats} className="mb-6 sm:mb-8" />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
          <div className="xl:col-span-3">
            <CorporateSection title="Selecciona tu Escenario de Entrenamiento">
              <CorporateCard elevated className="p-0">
                <div className="py-6 min-h-screen">
                  <EnhancedScenarioSelector onSelectScenario={handleScenarioSelect} />
                </div>
              </CorporateCard>
            </CorporateSection>
          </div>

          <div className="xl:col-span-1">
            <CorporateSection title="Guía de Entrenamiento">
              <CorporateCard className="p-4 sm:p-6">
                <div className="space-y-4">
                  {[{
                  step: '1',
                  title: 'Selecciona Escenario',
                  desc: 'Elige el tipo de práctica que necesitas'
                }, {
                  step: '2',
                  title: 'Configura Parámetros',
                  desc: 'Elige modo llamada o chat, personalidad del cliente y voz'
                }, {
                  step: '3',
                  title: 'Practica en Vivo',
                  desc: 'Interactúa por chat o voz con IA'
                }, {
                  step: '4',
                  title: 'Recibe Feedback',
                  desc: 'Obtén evaluación detallada y consejos'
                }].map(item => <div key={item.step} className="flex items-start space-x-3">
                      <div className="w-8 h-8 corporate-emerald rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">{item.step}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{item.desc}</p>
                      </div>
                    </div>)}
                </div>

                <div className="mt-6 p-4 corporate-emerald-light rounded-lg corporate-emerald-border border">
                  <div className="flex items-center space-x-2">
                    <img src={iconUrl} alt="Voice" className="h-5 w-5" />
                    <h4 className="font-semibold corporate-text-emerald text-sm sm:text-base">Voces Latinas Auténticas</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 mt-1">
                    Incluimos 23 voces auténticas de toda Latinoamérica, incluyendo el acento paisa de Medellín, para una experiencia completamente realista.
                  </p>
                </div>
              </CorporateCard>
            </CorporateSection>
          </div>
        </div>
      </div>
    </CorporateLayout>;
};
export default Training;