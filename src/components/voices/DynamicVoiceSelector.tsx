import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, Check, Filter, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { elevenLabsService } from '@/services/elevenLabsService';

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

  const loadVoices = async () => {
    try {
      setLoading(true);
      console.log('Loading voices from ElevenLabs...');
      
      const fetchedVoices = await elevenLabsService.fetchVoices();
      
      // Filtrar voces según configuración
      let processedVoices = fetchedVoices;
      
      if (priorityOnly) {
        const priorityIds = elevenLabsService.getPriorityVoices();
        processedVoices = fetchedVoices.filter(voice => 
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
      toast({
        title: "Error",
        description: "No se pudieron cargar las voces",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshVoices = async () => {
    elevenLabsService.clearCache();
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
      const audioUrl = await elevenLabsService.generateSpeech(testText, voice.voice_id);
      await playAudio(testText, voice.voice_id);
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
            Priorizando voces latinas y colombianas para máxima autenticidad
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicVoiceSelector;
