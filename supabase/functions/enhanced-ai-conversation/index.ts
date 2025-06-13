
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConversationRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  scenario: {
    title: string;
    description: string;
    prompt_instructions?: string;
  };
  knowledgeBase: Array<{
    title: string;
    content: string;
    document_type: string;
  }>;
  evaluationMode?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, scenario, knowledgeBase, evaluationMode = false }: ConversationRequest = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Construir contexto de conocimiento
    const knowledgeContext = knowledgeBase.map(kb => 
      `[${kb.document_type}] ${kb.title}: ${kb.content}`
    ).join('\n\n')

    // Sistema de prompt mejorado
    const enhancedSystemPrompt = `
Eres un cliente/entrevistador profesional en un escenario de entrenamiento: "${scenario.title}".

DESCRIPCIÓN DEL ESCENARIO: ${scenario.description}

INSTRUCCIONES ESPECÍFICAS: ${scenario.prompt_instructions || 'Mantén una conversación natural y profesional.'}

BASE DE CONOCIMIENTO DISPONIBLE:
${knowledgeContext}

REGLAS IMPORTANTES:
1. SIEMPRE verifica que las respuestas del usuario estén alineadas con la base de conocimiento
2. Si el usuario menciona información incorrecta o no verificada, señálalo de manera natural
3. Mantén el rol del escenario en todo momento
4. Sé conversacional pero desafiante cuando sea apropiado
5. Presenta objeciones realistas basadas en el escenario
6. Evalúa continuamente: conocimiento, comunicación, manejo de objeciones y profesionalismo
7. Si detectas mentiras, información falsa o actitudes negativas, reacciona de manera realista

PERSONALIDAD: ${scenario.prompt_instructions || 'Profesional, inquisitivo, pero justo'}

Responde SIEMPRE en español y mantén una conversación fluida y continua.
`

    // Preparar mensajes para OpenAI
    const openAIMessages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messages
    ]

    console.log('Sending request to OpenAI with', openAIMessages.length, 'messages')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
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

    // Análisis en tiempo real de la respuesta del usuario
    let realTimeAnalysis = null
    if (messages.length > 1 && evaluationMode) {
      const lastUserMessage = messages[messages.length - 1]?.content || ''
      
      // Verificar información contra base de conocimiento
      const knowledgeCheck = knowledgeBase.some(kb => 
        lastUserMessage.toLowerCase().includes(kb.content.toLowerCase().substring(0, 50).toLowerCase())
      )

      // Análisis de tono y profesionalismo
      const negativeIndicators = ['mentira', 'falso', 'no sé', 'no me importa', 'whatever']
      const unprofessionalTone = negativeIndicators.some(indicator => 
        lastUserMessage.toLowerCase().includes(indicator)
      )

      realTimeAnalysis = {
        knowledgeAccuracy: knowledgeCheck ? 'high' : 'medium',
        professionalismLevel: unprofessionalTone ? 'low' : 'high',
        responseQuality: lastUserMessage.length > 20 ? 'good' : 'poor',
        suggestedImprovements: unprofessionalTone ? 
          ['Mantén un tono más profesional', 'Evita respuestas vagas'] : 
          ['Continúa con este nivel de profesionalismo']
      }
    }

    const result = {
      response: aiResponse,
      realTimeAnalysis,
      conversationContinues: true,
      timestamp: new Date().toISOString()
    }

    console.log('Successful AI response generated')

    return new Response(JSON.stringify(result), {
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
