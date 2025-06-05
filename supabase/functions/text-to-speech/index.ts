
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
    const { text, voice = 'Sarah', model = 'eleven_multilingual_v2', settings } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Processing TTS request for text:', text.substring(0, 50) + '...');

    // If no API key, return audio URL instead of base64
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

    // Voice mapping for different character types
    const voiceMapping = {
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',  // Professional female
      'George': 'JBFqnCBsd6RMkjVDRZzb', // Business male
      'Charlotte': 'XB0fDUnXU5powFXDhCwa', // Friendly female
      'Daniel': 'onwK4e9ZLuTAKqWW03F9',  // Authoritative male
      'Aria': '9BWtsMINqrJLrRacOk9x',     // Natural female
      'Roger': 'CwhRBWXzGAHq8TQ4Fs17',   // Mature male
    };

    const voiceId = voiceMapping[voice] || voiceMapping['Sarah'];

    // Default voice settings
    const voiceSettings = settings || {
      stability: 0.6,
      similarity_boost: 0.8,
      style: 0.3,
      use_speaker_boost: true
    };

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text.length > 500 ? text.substring(0, 500) + '...' : text,
        model_id: model,
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      
      // Return a fallback response instead of throwing
      return new Response(
        JSON.stringify({ 
          audioUrl: 'data:audio/mp3;base64,//uQRAAAAWMSLwUIDAz/QkEARAQERAQERAQERAQERAQERAQERAQ',
          message: 'TTS service temporarily unavailable'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Create a data URL for immediate use
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    console.log('TTS generation successful');

    return new Response(
      JSON.stringify({ audioUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    // Always return a response, never fail completely
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
