
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!elevenLabsApiKey) {
      console.log('No ElevenLabs API key found');
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key not configured',
          voices: []
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    console.log('Fetching voices from ElevenLabs API...');

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch voices from ElevenLabs',
          voices: []
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.voices?.length || 0} voices`);

    // Filtrar y enriquecer voces para el contexto latino
    const processedVoices = data.voices?.map((voice: any) => ({
      ...voice,
      labels: {
        ...voice.labels,
        // Detectar voces latinas basado en nombre y descripción
        is_latin: detectLatinVoice(voice),
        country: detectCountry(voice),
      }
    })) || [];

    return new Response(
      JSON.stringify({ 
        voices: processedVoices,
        total: processedVoices.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in elevenlabs-voices function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        voices: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

function detectLatinVoice(voice: any): boolean {
  const name = voice.name?.toLowerCase() || '';
  const description = voice.description?.toLowerCase() || '';
  
  const latinKeywords = [
    'spanish', 'español', 'latino', 'latina', 'mexican', 'colombian', 'colombiano',
    'argentinian', 'argentino', 'chilean', 'chileno', 'peruvian', 'peruano',
    'venezuelan', 'venezolano', 'ecuadorian', 'ecuatoriano'
  ];
  
  return latinKeywords.some(keyword => 
    name.includes(keyword) || description.includes(keyword)
  );
}

function detectCountry(voice: any): string {
  const name = voice.name?.toLowerCase() || '';
  const description = voice.description?.toLowerCase() || '';
  
  const countryMap: Record<string, string> = {
    'colombian': 'Colombia',
    'colombiano': 'Colombia',
    'mexican': 'México',
    'mexicano': 'México',
    'argentinian': 'Argentina',
    'argentino': 'Argentina',
    'chilean': 'Chile',
    'chileno': 'Chile',
    'peruvian': 'Perú',
    'peruano': 'Perú',
    'venezuelan': 'Venezuela',
    'venezolano': 'Venezuela'
  };
  
  for (const [keyword, country] of Object.entries(countryMap)) {
    if (name.includes(keyword) || description.includes(keyword)) {
      return country;
    }
  }
  
  return 'Unknown';
}
