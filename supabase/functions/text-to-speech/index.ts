
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache para audio generado
const audioCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutos

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice_id, model_id = 'eleven_multilingual_v2', voice_settings } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`Processing TTS request for voice ${voice_id}:`, text.substring(0, 50) + '...');

    // Generar clave de cache
    const cacheKey = `${voice_id}_${text}_${JSON.stringify(voice_settings)}`;
    const cached = audioCache.get(cacheKey);
    
    // Verificar cache
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Returning cached audio');
      return new Response(
        JSON.stringify({ audioUrl: cached.data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    if (!elevenLabsApiKey) {
      console.log('No ElevenLabs API key, returning mock response');
      return new Response(
        JSON.stringify({ 
          audioUrl: 'data:audio/mp3;base64,//uQRAAAAWMSLwUIDAz/QkEARAQERAQERAQERAQERAQERAQERAQ',
          message: 'Demo mode - no audio generation'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Configuración de voz optimizada para fluidez
    const optimizedSettings = {
      stability: voice_settings?.stability || 0.7,
      similarity_boost: voice_settings?.similarity_boost || 0.8,
      style: voice_settings?.style || 0.3,
      use_speaker_boost: voice_settings?.use_speaker_boost || true,
      ...voice_settings
    };

    console.log(`Generating audio with voice ${voice_id} and settings:`, optimizedSettings);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text.length > 500 ? text.substring(0, 500) + '...' : text,
        model_id: model_id,
        voice_settings: optimizedSettings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      
      // Retornar respuesta de fallback
      return new Response(
        JSON.stringify({ 
          audioUrl: 'data:audio/mp3;base64,//uQRAAAAWMSLwUIDAz/QkEARAQERAQERAQERAQERAQERAQERAQ',
          message: 'TTS service temporarily unavailable',
          error: errorText
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Procesamiento optimizado de audio
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Audio = btoa(binary);
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    // Guardar en cache
    audioCache.set(cacheKey, {
      data: audioUrl,
      timestamp: Date.now()
    });

    // Limpiar cache antiguo
    cleanupCache();

    console.log('TTS generation successful, audio cached');

    return new Response(
      JSON.stringify({ 
        audioUrl,
        cached: false,
        duration: uint8Array.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    return new Response(
      JSON.stringify({ 
        audioUrl: 'data:audio/mp3;base64,//uQRAAAAWMSLwUIDAz/QkEARAQERAQERAQERAQERAQERAQERAQ',
        message: 'TTS fallback mode',
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of audioCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      audioCache.delete(key);
    }
  }
}
