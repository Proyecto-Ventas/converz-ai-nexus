
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  accent: string;
  description: string;
  country: string;
}

interface VoiceSelectorSimpleProps {
  selectedVoice?: string;
  onVoiceSelect: (voiceId: string, voiceName: string) => void;
}

const VoiceSelectorSimple = ({ selectedVoice, onVoiceSelect }: VoiceSelectorSimpleProps) => {
  const [voices] = useState<Voice[]>([
    // Voces en Español
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female', accent: 'Profesional', description: 'Voz femenina profesional', country: '🇺🇸' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male', accent: 'Autoridad', description: 'Voz masculina con autoridad', country: '🇺🇸' },
    { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female', accent: 'Amigable', description: 'Voz femenina cálida', country: '🇸🇪' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'male', accent: 'Maduro', description: 'Voz masculina madura', country: '🇬🇧' },
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'female', accent: 'Latino', description: 'Voz femenina latina', country: '🇲🇽' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'male', accent: 'Argentino', description: 'Voz masculina argentina', country: '🇦🇷' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'male', accent: 'Colombiano', description: 'Voz masculina colombiana', country: '🇨🇴' },
    { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', gender: 'female', accent: 'Chilena', description: 'Voz femenina chilena', country: '🇨🇱' },
  ]);

  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const { toast } = useToast();
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer({
    onAudioEnd: () => setTestingVoice(null)
  });

  const testVoice = async (voice: Voice) => {
    if (testingVoice === voice.id) {
      stopAudio();
      setTestingVoice(null);
      return;
    }

    setTestingVoice(voice.id);
    const testText = `Hola, soy ${voice.name}. Esta es una prueba de mi voz para el entrenamiento de ventas.`;
    
    try {
      await playAudio(testText, voice.name);
    } catch (error) {
      setTestingVoice(null);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId);
    if (voice) {
      onVoiceSelect(voiceId, voice.name);
      toast({
        title: "Voz seleccionada",
        description: `Has seleccionado la voz de ${voice.name}`,
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
      const voice = voices.find(v => v.id === savedVoice);
      if (voice) {
        onVoiceSelect(savedVoice, voice.name);
      }
    }
  }, [onVoiceSelect, selectedVoice, voices]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Volume2 className="h-5 w-5 mr-2" />
          Seleccionar Voz del Agente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedVoice} onValueChange={handleVoiceSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una voz..." />
          </SelectTrigger>
          <SelectContent>
            {voices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex items-center space-x-2">
                  <span>{voice.country}</span>
                  <span className="font-medium">{voice.name}</span>
                  <Badge variant="outline" className={voice.gender === 'female' ? 'text-pink-600' : 'text-blue-600'}>
                    {voice.gender === 'female' ? 'F' : 'M'}
                  </Badge>
                  <span className="text-sm text-gray-500">{voice.accent}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedVoice && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              {(() => {
                const voice = voices.find(v => v.id === selectedVoice);
                return voice ? (
                  <div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{voice.name}</span>
                      <span>{voice.country}</span>
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
                const voice = voices.find(v => v.id === selectedVoice);
                if (voice) testVoice(voice);
              }}
              disabled={isPlaying}
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
