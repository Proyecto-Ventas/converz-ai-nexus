
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, Check, Filter, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { supabase } from '@/integrations/supabase/client';

interface DynamicVoiceSelectorProps {
  selectedVoice?: string;
  onVoiceSelect: (voiceId: string, voiceName: string) => void;
  priorityOnly?: boolean;
}

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels?: {
    accent?: string;
    gender?: string;
    description?: string;
    country?: string;
    is_latin?: boolean;
    age?: string;
    use_case?: string;
  };
  category?: string;
  description?: string;
}

const DynamicVoiceSelector = ({ 
  selectedVoice, 
  onVoiceSelect, 
  priorityOnly = false 
}: DynamicVoiceSelectorProps) => {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<ElevenLabsVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const { toast } = useToast();
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer({
    onAudioEnd: () => setTestingVoice(null)
  });

  // Voces por defecto como fallback
  const getFallbackVoices = (): ElevenLabsVoice[] => {
    return [
      {
        voice_id: 'VmejBeYhbrcTPwDniox7',
        name: 'Sofia (Colombia)',
        category: 'professional',
        labels: {
          accent: 'Colombian',
          gender: 'female',
          description: 'Voz femenina colombiana profesional',
          country: 'Colombia',
          is_latin: true
        }
      },
      {
        voice_id: 'qHkrJuifPpn95wK3rm2A',
        name: 'Carlos (Colombia)',
        category: 'professional',
        labels: {
          accent: 'Colombian',
          gender: 'male',
          description: 'Voz masculina colombiana natural',
          country: 'Colombia',
          is_latin: true
        }
      },
      {
        voice_id: '9BWtsMINqrJLrRacOk9x',
        name: 'Aria',
        category: 'professional',
        labels: {
          gender: 'female',
          description: 'Voz femenina clara y profesional',
          country: 'US',
          is_latin: false
        }
      },
      {
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Sarah',
        category: 'professional',
        labels: {
          gender: 'female',
          description: 'Voz femenina amigable',
          country: 'US',
          is_latin: false
        }
      }
    ];
  };

  const loadVoices = async () => {
    try {
      setLoading(true);
      console.log('Loading voices from ElevenLabs...');
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-voices');
      
      if (error) {
        console.error('Error calling elevenlabs-voices function:', error);
        throw error;
      }

      let processedVoices = data?.voices || [];
      
      // Si no hay voces o hay error, usar fallback
      if (!processedVoices || processedVoices.length === 0) {
        console.log('Using fallback voices');
        processedVoices = getFallbackVoices();
      }
      
      if (priorityOnly) {
        const priorityIds = [
          'VmejBeYhbrcTPwDniox7', 'qHkrJuifPpn95wK3rm2A', 'YPh7OporwNAJ28F5IQrm',
          'J4vZAFDEcpenkMp3f3R9', '3Fx71T889APcHRu4VtQf', 'tTQzD8U9VSnJgfwC6HbY',
          '86V9x9hrQds83qf7zaGn', 'yvNNEO8EIbfE6QBiyLQx', 'KoIf2KgeJA8uoGcgKIao',
          'GPzYRfJNEJniCw2WrKzi', '9BWtsMINqrJLrRacOk9x', 'EXAVITQu4vr4xnSDxMaL'
        ];
        processedVoices = processedVoices.filter(voice => 
          priorityIds.includes(voice.voice_id)
        );
      }
      
      // Priorizar voces latinas
      const sortedVoices = processedVoices.sort((a, b) => {
        if (a.labels?.is_latin && !b.labels?.is_latin) return -1;
        if (!a.labels?.is_latin && b.labels?.is_latin) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setVoices(sortedVoices);
      setFilteredVoices(sortedVoices);
      
      console.log(`Loaded ${sortedVoices.length} voices`);
      
    } catch (error) {
      console.error('Error loading voices:', error);
      
      // Usar voces de fallback en caso de error
      const fallbackVoices = getFallbackVoices();
      setVoices(fallbackVoices);
      setFilteredVoices(fallbackVoices);
      
      toast({
        title: "Usando voces por defecto",
        description: "No se pudieron cargar las voces dinámicas, usando voces predeterminadas",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshVoices = async () => {
    await loadVoices();
    toast({
      title: "Voces actualizadas",
      description: "Se ha actualizado el catálogo de voces",
    });
  };

  const filterVoices = () => {
    let filtered = voices;
    
    if (selectedGender !== 'all') {
      filtered = filtered.filter(voice => voice.labels?.gender === selectedGender);
    }
    
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(voice => voice.labels?.country === selectedCountry);
    }
    
    setFilteredVoices(filtered);
  };

  const testVoice = async (voice: ElevenLabsVoice) => {
    if (testingVoice === voice.voice_id) {
      stopAudio();
      setTestingVoice(null);
      return;
    }

    setTestingVoice(voice.voice_id);
    const testText = `Hola, soy ${voice.name}. Esta es una prueba de mi voz para el entrenamiento de ventas. ¿Cómo puedo ayudarte hoy?`;
    
    try {
      await playAudio(testText, voice.voice_id);
    } catch (error) {
      console.error('Error testing voice:', error);
      setTestingVoice(null);
      toast({
        title: "Error",
        description: "No se pudo reproducir la voz de prueba",
        variant: "destructive"
      });
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    if (voice) {
      onVoiceSelect(voiceId, voice.name);
      toast({
        title: "Voz seleccionada",
        description: `Has seleccionado la voz de ${voice.name}`,
      });
    }
  };

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    filterVoices();
  }, [selectedGender, selectedCountry, voices]);

  const countries = Array.from(new Set(voices.map(v => v.labels?.country).filter(Boolean)));

  return (
    <Card className="w-full corporate-emerald-border border-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 corporate-text-emerald" />
            <span>Selector de Voz Dinámica</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshVoices}
            disabled={loading}
            className="corporate-hover-emerald"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Filter className="h-4 w-4 inline mr-1" />
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
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              País/Región
            </label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country!}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de voces */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 corporate-text-emerald" />
            <p className="text-gray-600">Cargando voces...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredVoices.map((voice) => (
              <div
                key={voice.voice_id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedVoice === voice.voice_id 
                    ? 'corporate-emerald-border border-2 corporate-emerald-light shadow-md' 
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
                onClick={() => handleVoiceSelect(voice.voice_id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{voice.name}</h4>
                    {voice.labels?.country && (
                      <p className="text-xs text-gray-500">{voice.labels.country}</p>
                    )}
                  </div>
                  {selectedVoice === voice.voice_id && (
                    <Check className="h-4 w-4 corporate-text-emerald" />
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  {voice.labels?.gender && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        voice.labels.gender === 'female' 
                          ? 'text-pink-600 border-pink-300' 
                          : 'text-emerald-600 border-emerald-300'
                      }`}
                    >
                      {voice.labels.gender === 'female' ? 'F' : 'M'}
                    </Badge>
                  )}
                  {voice.labels?.is_latin && (
                    <Badge className="corporate-emerald text-white text-xs">
                      Latino
                    </Badge>
                  )}
                </div>
                
                {voice.labels?.description && (
                  <p className="text-xs text-gray-600 mb-3">{voice.labels.description}</p>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full corporate-hover-emerald"
                  onClick={(e) => {
                    e.stopPropagation();
                    testVoice(voice);
                  }}
                  disabled={isPlaying && testingVoice !== voice.voice_id}
                >
                  {testingVoice === voice.voice_id ? (
                    <Pause className="h-3 w-3 mr-1" />
                  ) : (
                    <Play className="h-3 w-3 mr-1" />
                  )}
                  {testingVoice === voice.voice_id ? 'Detener' : 'Probar'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Información adicional */}
        <div className="corporate-emerald-light p-3 rounded-lg corporate-emerald-border border">
          <p className="text-xs corporate-text-emerald font-medium">
            📊 {filteredVoices.length} voces disponibles
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {voices.length === getFallbackVoices().length 
              ? 'Usando voces predeterminadas - configura tu API key de ElevenLabs para más opciones'
              : 'Priorizando voces latinas y colombianas para máxima autenticidad'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicVoiceSelector;
