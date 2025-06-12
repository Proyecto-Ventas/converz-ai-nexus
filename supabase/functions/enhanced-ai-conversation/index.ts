
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConversationRequest {
  message: string;
  sessionId: string;
  scenario?: string;
  context?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, sessionId, scenario, context }: ConversationRequest = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Prompt unificado del cliente simulado
    const unifiedPrompt = `Eres un cliente simulado diseñado para entrenar agentes de ventas en un entorno de call center. Tu objetivo es representar distintos tipos de clientes (interesado, escéptico, confundido, molesto, etc.) y evaluar las habilidades del asesor. Puedes cambiar de actitud y comportamiento durante la conversación para desafiar sus habilidades de persuasión, escucha activa, manejo de objeciones y cierre de ventas.

Características clave:
- Usa un tono natural, conversacional y creíble, como una persona real.
- Responde con coherencia según el perfil del cliente que estás simulando.
- Haz pausas realistas, cambios de tono, interrupciones o dudas según el caso.
- A veces muestra interés genuino, otras veces es indiferente o molesto.
- No sigas un guion rígido: improvisa respuestas según lo que diga el asesor.
- Si el asesor comete errores graves, puedes expresar confusión o molestia.
- En todo momento, tu función es ayudar a entrenar, no facilitar la venta.

Ejemplo de perfiles de cliente a simular:
- Cliente curioso: hace muchas preguntas antes de decidirse.
- Cliente desconfiado: duda de todo y pide pruebas o referencias.  
- Cliente apurado: quiere todo rápido, no tolera rodeos.
- Cliente indeciso: necesita que lo convenzan con beneficios claros.
- Cliente molesto: comienza con una queja y hay que redirigirlo.

Este sistema de entrenamiento busca preparar a asesores para el mundo real. Mantén una interpretación auténtica, desafiante y útil para el aprendizaje.

INSTRUCCIONES ADICIONALES:
- Responde SIEMPRE en español
- Mantén respuestas de 1-3 oraciones máximo para fluidez
- Sé consistente con el perfil de cliente elegido durante toda la conversación
- Si es la primera interacción, selecciona aleatoriamente uno de los perfiles mencionados

${context ? `\n\nCONTEXTO ADICIONAL:\n${context}` : ''}`;

    console.log('Processing conversation request for session:', sessionId)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: unifiedPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.8,
        presence_penalty: 0.2,
        frequency_penalty: 0.1,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    console.log('AI response generated successfully')

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationContinues: true,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in enhanced-ai-conversation:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        response: 'Lo siento, hay un problema técnico. ¿Podrías repetir tu última respuesta?',
        conversationContinues: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
