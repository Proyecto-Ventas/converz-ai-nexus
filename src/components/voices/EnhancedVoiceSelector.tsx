
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, Check, Filter, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { LATIN_VOICES, getVoicesByCountry, type LatinVoice } from '@/utils/latinVoices';

interface EnhancedVoiceSelectorProps {
  selectedVoice?: string;
  onVoiceSelect: (voiceId: string, voiceName: string) => void;
  showCountryFilter?: boolean;
  compact?: boolean;
}

const EnhancedVoiceSelector = ({ 
  selectedVoice, 
  onVoiceSelect, 
  showCountryFilter = true,
  compact = false 
}: EnhancedVoiceSelectorProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const { toast } = useToast();
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer({
    onAudioEnd: () => setTestingVoice(null)
  });

  const voicesByCountry = getVoicesByCountry();
  const countries = ['all', ...Object.keys(voicesByCountry).sort()];

  const filteredVoices = LATIN_VOICES.filter(voice => {
    const countryMatch = selectedCountry === 'all' || voice.country === selectedCountry;
    const genderMatch = selectedGender === 'all' || voice.gender === selectedGender;
    return countryMatch && genderMatch;
  });

  const testVoice = async (voice: LatinVoice) => {
    if (testingVoice === voice.id) {
      stopAudio();
      setTestingVoice(null);
      return;
    }

    setTestingVoice(voice.id);
    const testText = `Hola, soy ${voice.name} de ${voice.country}. Esta es una prueba de mi voz para el sistema de entrenamiento corporativo.`;
    
    try {
      await playAudio(testText, voice.name);
    } catch (error) {
      setTestingVoice(null);
      toast({
        title: "Error",
        description: "No se pudo reproducir la voz de prueba",
        variant: "destructive"
      });
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

  // Guardar preferencias
  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('selectedVoice', selectedVoice);
    }
  }, [selectedVoice]);

  useEffect(() => {
    const savedVoice = localStorage.getItem('selectedVoice');
    if (savedVoice && !selectedVoice) {
      const voice = LATIN_VOICES.find(v => v.id === savedVoice);
      if (voice) {
        onVoiceSelect(savedVoice, voice.name);
      }
    }
  }, [onVoiceSelect, selectedVoice]);

  if (compact) {
    return (
      <div className="space-y-3">
        <Select value={selectedVoice} onValueChange={handleVoiceSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar voz..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {filteredVoices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex items-center space-x-2">
                  <span>{voice.flag}</span>
                  <span className="font-medium">{voice.name}</span>
                  <Badge variant="outline" className={voice.gender === 'female' ? 'text-pink-600' : 'text-blue-600'}>
                    {voice.gender === 'female' ? 'F' : 'M'}
                  </Badge>
                  <span className="text-xs text-gray-500">{voice.accent}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Volume2 className="h-5 w-5 text-blue-600" />
          <span>Seleccionar Voz del Agente</span>
          <Globe className="h-4 w-4 text-gray-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {showCountryFilter && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Filter className="h-4 w-4 inline mr-1" />
                País/Región
              </label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los países</SelectItem>
                  {countries.slice(1).map(country => (
                    <SelectItem key={country} value={country}>
                      {voicesByCountry[country][0].flag} {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Género
              </label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {filteredVoices.map((voice) => (
            <div
              key={voice.id}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                ${selectedVoice === voice.id 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => handleVoiceSelect(voice.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{voice.flag}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{voice.name}</h4>
                    <p className="text-xs text-gray-500">{voice.country}</p>
                  </div>
                </div>
                {selectedVoice === voice.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${voice.gender === 'female' ? 'text-pink-600 border-pink-300' : 'text-blue-600 border-blue-300'}`}
                >
                  {voice.gender === 'female' ? 'Femenino' : 'Masculino'}
                </Badge>
                <span className="text-xs font-medium text-gray-600">{voice.accent}</span>
              </div>
              
              <p className="text-xs text-gray-600 mb-3">{voice.description}</p>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  testVoice(voice);
                }}
                disabled={isPlaying && testingVoice !== voice.id}
              >
                {testingVoice === voice.id ? (
                  <Pause className="h-3 w-3 mr-1" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                {testingVoice === voice.id ? 'Detener' : 'Probar'}
              </Button>
            </div>
          ))}
        </div>

        {selectedVoice && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                {(() => {
                  const voice = LATIN_VOICES.find(v => v.id === selectedVoice);
                  return voice ? (
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedVoiceSelector;
