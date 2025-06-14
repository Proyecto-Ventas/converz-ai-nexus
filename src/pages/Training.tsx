
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Zap, ArrowLeft, BookOpen, Target, Trophy } from 'lucide-react';
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

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentView('config');
  };

  const handleConfigComplete = (config: any) => {
    setTrainingConfig(config);
    setCurrentView('training');
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

  // Vista de configuración previa
  if (currentView === 'config' && selectedScenario) {
    return (
      <CorporateLayout>
        <div className="p-6">
          <TrainingSetup
            scenario={selectedScenario}
            onStart={handleConfigComplete}
            onBack={goBackToScenarios}
          />
        </div>
      </CorporateLayout>
    );
  }

  // Vista de entrenamiento en vivo
  if (currentView === 'training' && selectedScenario && trainingConfig) {
    return (
      <LiveTrainingInterface
        scenario={selectedScenario.id}
        scenarioTitle={selectedScenario.title}
        scenarioDescription={selectedScenario.description || ''}
        mode={trainingConfig.mode}
        clientEmotion={trainingConfig.clientEmotion}
        selectedVoiceId={trainingConfig.selectedVoiceId}
        selectedVoiceName={trainingConfig.selectedVoiceName}
        onComplete={handleTrainingComplete}
        onBack={goBackToConfig}
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
    { label: 'Voces Latinas', value: '23', icon: <Zap className="h-5 w-5" /> },
    { label: 'Países Cubiertos', value: '9', icon: <Target className="h-5 w-5" /> },
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
                    <div className="w-8 h-8 corporate-emerald rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Selecciona Escenario</h4>
                      <p className="text-sm text-gray-600 mt-1">Elige el tipo de práctica que necesitas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 corporate-emerald rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Configura Parámetros</h4>
                      <p className="text-sm text-gray-600 mt-1">Elige modo llamada o chat, personalidad del cliente y voz</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 corporate-emerald rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Practica en Vivo</h4>
                      <p className="text-sm text-gray-600 mt-1">Interactúa por chat o voz con IA</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 corporate-emerald rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Recibe Feedback</h4>
                      <p className="text-sm text-gray-600 mt-1">Obtén evaluación detallada y consejos</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 corporate-emerald-light rounded-lg corporate-emerald-border border">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 corporate-text-emerald" />
                    <h4 className="font-semibold corporate-text-emerald">Voces Latinas Auténticas</h4>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    Incluimos 23 voces auténticas de toda Latinoamérica, incluyendo el acento paisa de Medellín, para una experiencia completamente realista.
                  </p>
                </div>
              </CorporateCard>
            </CorporateSection>
          </div>
        </div>
      </div>
    </CorporateLayout>
  );
};

export default Training;
