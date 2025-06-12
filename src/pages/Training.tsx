
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Mic, Settings, Zap, Phone, MessageSquare } from 'lucide-react';
import LiveTrainingInterface from '@/components/training/LiveTrainingInterface';
import EvaluationResults from '@/components/EvaluationResults';

const Training = () => {
  const [currentView, setCurrentView] = useState('setup');
  const [interactionMode, setInteractionMode] = useState('call');
  const [evaluationResults, setEvaluationResults] = useState(null);

  // Escenario único simplificado
  const unifiedScenario = {
    id: 'sales-training-unified',
    title: 'Entrenamiento de Ventas',
    description: 'Simulación completa con cliente virtual que puede adoptar diferentes personalidades (curioso, escéptico, apurado, indeciso, molesto) para entrenar todas tus habilidades de venta.',
    expected_outcomes: {
      objectives: [
        'Desarrollar habilidades de escucha activa',
        'Mejorar técnicas de persuasión',
        'Aprender manejo efectivo de objeciones',
        'Practicar técnicas de cierre de ventas',
        'Adaptarse a diferentes tipos de clientes'
      ]
    }
  };

  const startTraining = () => {
    setCurrentView('training');
  };

  const handleTrainingComplete = (evaluation: any) => {
    setEvaluationResults(evaluation);
    setCurrentView('results');
  };

  const resetTraining = () => {
    setCurrentView('setup');
    setEvaluationResults(null);
  };

  if (currentView === 'training') {
    return (
      <LiveTrainingInterface
        scenario={unifiedScenario.id}
        scenarioTitle={unifiedScenario.title}
        scenarioDescription={unifiedScenario.description}
        onComplete={handleTrainingComplete}
        onBack={resetTraining}
      />
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Centro de Entrenamiento IA
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mejora tus habilidades de comunicación con nuestro cliente virtual inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Escenario Principal */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl text-gray-900">
                  Escenario de Entrenamiento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-600 rounded-lg">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {unifiedScenario.title}
                        </h3>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {unifiedScenario.description}
                        </p>
                        
                        <div className="bg-white/70 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3">
                            Objetivos de Aprendizaje:
                          </h4>
                          <ul className="space-y-2">
                            {unifiedScenario.expected_outcomes.objectives.map((objective: string, index: number) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                                <span>{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de Configuración */}
          <div className="space-y-6">
            {/* Modo de Interacción */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span>Configuración</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Modo de Interacción</h3>
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
                          <div className="text-sm text-gray-500">Conversación natural por audio</div>
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
                          <div className="text-sm text-gray-500">Conversación por texto</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Cliente Virtual */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-gray-900">Cliente Virtual IA</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Personalidad Adaptativa</h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Nuestro cliente virtual puede adoptar diferentes personalidades durante la conversación para desafiar y mejorar tus habilidades.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700">
                      🎭 Cliente curioso, escéptico, apurado o molesto<br/>
                      🗣️ Respuestas naturales y desafiantes<br/>
                      🧠 Evaluación en tiempo real de tus habilidades
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botón de Iniciar */}
            <Button
              onClick={startTraining}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              size="lg"
            >
              <Play className="h-6 w-6 mr-3" />
              <span className="text-lg font-semibold">Iniciar Entrenamiento</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
