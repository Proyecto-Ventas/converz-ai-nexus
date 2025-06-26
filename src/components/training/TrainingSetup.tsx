
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, MessageSquare, Settings, Play, User, Zap, Volume2 } from 'lucide-react';
import DynamicVoiceSelector from '@/components/voices/DynamicVoiceSelector';
import { CorporateCard } from '@/components/ui/corporate-layout';

interface TrainingSetupProps {
  scenario: any;
  onStart: (config: any) => void;
  onBack: () => void;
}

const TrainingSetup = ({ scenario, onStart, onBack }: TrainingSetupProps) => {
  const [mode, setMode] = useState<'chat' | 'call'>('call');
  const [clientEmotion, setClientEmotion] = useState('neutral');
  const [selectedVoiceId, setSelectedVoiceId] = useState('VmejBeYhbrcTPwDniox7');
  const [selectedVoiceName, setSelectedVoiceName] = useState('Sofia (Colombia)');

  const emotions = [
    { value: 'neutral', label: 'Neutral', color: 'bg-gray-100 text-gray-700', description: 'Cliente con actitud neutra y abierta' },
    { value: 'curious', label: 'Curioso', color: 'bg-emerald-100 text-emerald-700', description: 'Interesado en conocer más detalles' },
    { value: 'skeptical', label: 'Escéptico', color: 'bg-yellow-100 text-yellow-700', description: 'Desconfiado, necesita convencimiento' },
    { value: 'hurried', label: 'Apurado', color: 'bg-orange-100 text-orange-700', description: 'Con poco tiempo disponible' },
    { value: 'annoyed', label: 'Molesto', color: 'bg-red-100 text-red-700', description: 'Inicialmente irritado o impaciente' },
    { value: 'interested', label: 'Interesado', color: 'bg-teal-100 text-teal-700', description: 'Genuinamente interesado desde el inicio' }
  ];

  const handleStart = () => {
    if (mode === 'call' && !selectedVoiceId) {
      // Usar voz por defecto si no se seleccionó ninguna
      setSelectedVoiceId('VmejBeYhbrcTPwDniox7');
      setSelectedVoiceName('Sofia (Colombia)');
    }

    const config = {
      scenario: scenario.id,
      scenarioTitle: scenario.title,
      scenarioDescription: scenario.description,
      mode,
      clientEmotion,
      selectedVoiceId,
      selectedVoiceName
    };
    
    console.log('Starting training with enhanced config:', config);
    onStart(config);
  };

  const handleVoiceSelect = (voiceId: string, voiceName: string) => {
    console.log('Voice selected in setup:', voiceName, 'ID:', voiceId);
    setSelectedVoiceId(voiceId);
    setSelectedVoiceName(voiceName);
  };

  const selectedEmotion = emotions.find(e => e.value === clientEmotion);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="corporate-hover-emerald">
          ← Volver a escenarios
        </Button>
        <div className="flex items-center space-x-3">
          <Badge className="corporate-emerald text-white">
            <Zap className="h-3 w-3 mr-1" />
            Configuración Avanzada
          </Badge>
        </div>
      </div>

      {/* Escenario seleccionado */}
      <CorporateCard className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 corporate-emerald-light rounded-lg">
              <Settings className="h-5 w-5 corporate-text-emerald" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{scenario.title}</h2>
              <p className="text-sm text-gray-600 mt-1">Configuración previa con voces dinámicas</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="corporate-emerald-light p-4 rounded-lg corporate-emerald-border border">
            <p className="text-gray-700 leading-relaxed">{scenario.description}</p>
            <div className="mt-3 flex items-center space-x-3">
              <Badge variant="outline" className="corporate-emerald-border corporate-text-emerald">
                {scenario.scenario_type?.toUpperCase()}
              </Badge>
              <Badge variant="secondary">
                Nivel {scenario.difficulty_level || 1}
              </Badge>
            </div>
          </div>
        </CardContent>
      </CorporateCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configuración de Modo */}
        <CorporateCard>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5 corporate-text-emerald" />
              <span>Modo de Interacción</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setMode('call')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  mode === 'call' 
                    ? 'corporate-emerald text-white shadow-lg' 
                    : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <Phone className={`h-6 w-6 mx-auto mb-2 ${mode === 'call' ? 'text-white' : 'text-emerald-600'}`} />
                <div className={`font-semibold ${mode === 'call' ? 'text-white' : 'text-gray-900'}`}>
                  Llamada por Voz
                </div>
                <div className={`text-xs mt-1 ${mode === 'call' ? 'text-emerald-100' : 'text-gray-500'}`}>
                  Conversación con ElevenLabs
                </div>
              </button>

              <button
                onClick={() => setMode('chat')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  mode === 'chat' 
                    ? 'corporate-emerald text-white shadow-lg' 
                    : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <MessageSquare className={`h-6 w-6 mx-auto mb-2 ${mode === 'chat' ? 'text-white' : 'text-emerald-600'}`} />
                <div className={`font-semibold ${mode === 'chat' ? 'text-white' : 'text-gray-900'}`}>
                  Chat de Texto
                </div>
                <div className={`text-xs mt-1 ${mode === 'chat' ? 'text-emerald-100' : 'text-gray-500'}`}>
                  Solo mensajes
                </div>
              </button>
            </div>

            <div className="corporate-emerald-light p-3 rounded-lg corporate-emerald-border border">
              <p className="text-sm corporate-text-emerald font-medium mb-1">
                {mode === 'call' ? '🎯 Modo Llamada Activo' : '💬 Modo Chat Activo'}
              </p>
              <p className="text-xs text-gray-600">
                {mode === 'call' 
                  ? 'Conversación natural por voz con tecnología ElevenLabs'
                  : 'Práctica mediante texto para enfocarte en el contenido'
                }
              </p>
            </div>
          </CardContent>
        </CorporateCard>

        {/* Configuración del Cliente */}
        <CorporateCard>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 corporate-text-emerald" />
              <span>Personalidad del Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={clientEmotion} onValueChange={setClientEmotion}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {emotions.map((emotion) => (
                  <SelectItem key={emotion.value} value={emotion.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${emotion.color.split(' ')[0]}`} />
                      <span className="font-medium">{emotion.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedEmotion && (
              <div className="corporate-emerald-light p-3 rounded-lg corporate-emerald-border border">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-4 h-4 rounded-full ${selectedEmotion.color.split(' ')[0]}`} />
                  <span className="font-semibold corporate-text-emerald">{selectedEmotion.label}</span>
                </div>
                <p className="text-sm text-gray-600">{selectedEmotion.description}</p>
              </div>
            )}
          </CardContent>
        </CorporateCard>
      </div>

      {/* Selector de Voz Dinámico - Solo visible en modo llamada */}
      {mode === 'call' && (
        <div>
          <DynamicVoiceSelector
            selectedVoice={selectedVoiceId}
            onVoiceSelect={handleVoiceSelect}
            priorityOnly={true}
          />
        </div>
      )}

      {/* Botón de inicio */}
      <div className="text-center pt-6">
        <Button
          onClick={handleStart}
          size="lg"
          className="corporate-emerald hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Play className="h-5 w-5 mr-3" />
          Comenzar Entrenamiento {mode === 'call' ? 'por Voz' : 'por Chat'}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          {mode === 'call' 
            ? 'Conversación fluida con voces latinas auténticas de ElevenLabs' 
            : 'Interacción por texto con retroalimentación inteligente'
          }
        </p>
      </div>
    </div>
  );
};

export default TrainingSetup;
