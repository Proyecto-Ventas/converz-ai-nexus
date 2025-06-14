
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { LATIN_VOICES, type LatinVoice } from '@/utils/latinVoices';

interface VoiceSelectorSimpleProps {
  selectedVoice?: string;
  onVoiceSelect: (voiceId: string, voiceName: string) => void;
}

const VoiceSelectorSimple = ({ selectedVoice, onVoiceSelect }: VoiceSelectorSimpleProps) => {
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const { toast } = useToast();
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer({
    onAudioEnd: () => setTestingVoice(null)
  });

  const testVoice = async (voice: LatinVoice) => {
    if (testingVoice === voice.id) {
      stopAudio();
      setTestingVoice(null);
      return;
    }

    setTestingVoice(voice.id);
    const testText = `Hola, soy ${voice.name} de ${voice.country}. Esta es una prueba de mi voz para el entrenamiento de ventas.`;
    
    try {
      await playAudio(testText, voice.name);
    } catch (error) {
      setTestingVoice(null);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    const voice = LATIN_VOICES.find(v => v.id === voiceId);
    if (voice) {
      onVoiceSelect(voiceId, voice.name);
      toast({
        title: "Voz seleccionada",
        description: `Has seleccionado la voz de ${voice.name} (${voice.country})`,
      });
    }
  };

  // Guardar preferencia en localStorage
  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('selectedVoice', selectedVoice);
    }
  }, [selectedVoice]);

  // Cargar preferencia guardada
  useEffect(() => {
    const savedVoice = localStorage.getItem('selectedVoice');
    if (savedVoice && !selectedVoice) {
      const voice = LATIN_VOICES.find(v => v.id === savedVoice);
      if (voice) {
        onVoiceSelect(savedVoice, voice.name);
      }
    }
  }, [onVoiceSelect, selectedVoice]);

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Volume2 className="h-5 w-5 mr-2 text-blue-600" />
          Seleccionar Voz del Agente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedVoice} onValueChange={handleVoiceSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una voz..." />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {LATIN_VOICES.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex items-center space-x-3 py-1">
                  <span className="text-base">{voice.flag}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{voice.name}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${voice.gender === 'female' ? 'text-pink-600 border-pink-300' : 'text-blue-600 border-blue-300'}`}
                      >
                        {voice.gender === 'female' ? 'F' : 'M'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{voice.accent}</span>
                      <span>•</span>
                      <span>{voice.country}</span>
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedVoice && (
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex-1">
              {(() => {
                const voice = LATIN_VOICES.find(v => v.id === selectedVoice);
                return voice ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-lg">{voice.flag}</span>
                      <span className="font-semibold text-gray-900">{voice.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {voice.country}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{voice.description}</p>
                  </div>
                ) : null;
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const voice = LATIN_VOICES.find(v => v.id === selectedVoice);
                if (voice) testVoice(voice);
              }}
              disabled={isPlaying}
              className="flex-shrink-0"
            >
              {testingVoice === selectedVoice ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceSelectorSimple;
