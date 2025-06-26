
interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  samples?: any[];
  category: string;
  fine_tuning?: {
    language?: string;
    is_allowed_to_fine_tune?: boolean;
  };
  labels?: {
    accent?: string;
    description?: string;
    age?: string;
    gender?: string;
    use_case?: string;
  };
  description?: string;
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface ElevenLabsVoicesResponse {
  voices: ElevenLabsVoice[];
}

export class ElevenLabsService {
  private static instance: ElevenLabsService;
  private voicesCache: ElevenLabsVoice[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 300000; // 5 minutos

  // Voces principales colombianas y latinas
  private readonly PRIORITY_VOICES = [
    'VmejBeYhbrcTPwDniox7', 'qHkrJuifPpn95wK3rm2A', 'YPh7OporwNAJ28F5IQrm',
    'J4vZAFDEcpenkMp3f3R9', '3Fx71T889APcHRu4VtQf', 'tTQzD8U9VSnJgfwC6HbY',
    '86V9x9hrQds83qf7zaGn', 'yvNNEO8EIbfE6QBiyLQx', 'KoIf2KgeJA8uoGcgKIao',
    'GPzYRfJNEJniCw2WrKzi'
  ];

  public static getInstance(): ElevenLabsService {
    if (!ElevenLabsService.instance) {
      ElevenLabsService.instance = new ElevenLabsService();
    }
    return ElevenLabsService.instance;
  }

  async fetchVoices(): Promise<ElevenLabsVoice[]> {
    const now = Date.now();
    
    // Retornar cache si es válido
    if (this.voicesCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.voicesCache;
    }

    try {
      console.log('Fetching voices from ElevenLabs API...');
      
      const response = await fetch('/api/elevenlabs/voices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ElevenLabsVoicesResponse = await response.json();
      
      // Actualizar cache
      this.voicesCache = data.voices;
      this.cacheTimestamp = now;
      
      console.log(`Fetched ${data.voices.length} voices from ElevenLabs`);
      return data.voices;
      
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      
      // Retornar cache anterior si existe
      if (this.voicesCache) {
        console.log('Returning cached voices due to API error');
        return this.voicesCache;
      }
      
      // Fallback a voces por defecto
      return this.getFallbackVoices();
    }
  }

  private getFallbackVoices(): ElevenLabsVoice[] {
    return [
      {
        voice_id: 'VmejBeYhbrcTPwDniox7',
        name: 'Sofia (Colombia)',
        category: 'professional',
        labels: {
          accent: 'Colombian',
          gender: 'female',
          description: 'Voz femenina colombiana profesional'
        }
      },
      {
        voice_id: 'qHkrJuifPpn95wK3rm2A',
        name: 'Carlos (Colombia)',
        category: 'professional',
        labels: {
          accent: 'Colombian',
          gender: 'male',
          description: 'Voz masculina colombiana natural'
        }
      }
    ];
  }

  async getVoicesByFilter(filters: {
    language?: string;
    gender?: string;
    accent?: string;
    category?: string;
  }): Promise<ElevenLabsVoice[]> {
    const allVoices = await this.fetchVoices();
    
    return allVoices.filter(voice => {
      if (filters.gender && voice.labels?.gender !== filters.gender) return false;
      if (filters.accent && !voice.labels?.accent?.toLowerCase().includes(filters.accent.toLowerCase())) return false;
      if (filters.category && voice.category !== filters.category) return false;
      return true;
    });
  }

  getPriorityVoices(): string[] {
    return this.PRIORITY_VOICES;
  }

  async generateSpeech(text: string, voiceId: string, settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  }): Promise<string> {
    console.log(`Generating speech with voice ${voiceId}:`, text.substring(0, 50) + '...');
    
    try {
      const response = await fetch('/api/elevenlabs/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.length > 500 ? text.substring(0, 500) + '...' : text,
          voice_id: voiceId,
          model_id: 'eleven_multilingual_v2',
          voice_settings: settings || {
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.audioUrl;
      
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.voicesCache = null;
    this.cacheTimestamp = 0;
  }
}

export const elevenLabsService = ElevenLabsService.getInstance();
