
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
    id: string;
    title: string;
    description: string;
    scenario_type: string;
    prompt_instructions?: string;
    difficulty_level: number;
  };
  knowledgeBase: Array<{
    title: string;
    content: string;
    document_type: string;
  }>;
  clientPersonality?: string;
  evaluationMode?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, scenario, knowledgeBase, clientPersonality = 'neutral', evaluationMode = false }: ConversationRequest = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Construir contexto de conocimiento
    const knowledgeContext = knowledgeBase?.length > 0 
      ? knowledgeBase.map(kb => `[${kb.document_type}] ${kb.title}: ${kb.content}`).join('\n\n')
      : '';

    // Personalidades de cliente disponibles
    const personalities = {
      curious: 'Cliente curioso: haces muchas preguntas antes de decidirte, necesitas detalles específicos.',
      skeptical: 'Cliente desconfiado: dudas de todo y pides pruebas o referencias constantemente.',
      hurried: 'Cliente apurado: quieres todo rápido, no toleras rodeos ni explicaciones largas.',
      indecisive: 'Cliente indeciso: necesitas que te convenzan con beneficios claros y comparaciones.',
      annoyed: 'Cliente molesto: comienzas con una queja y necesitas que te tranquilicen primero.',
      interested: 'Cliente interesado: muestras interés genuino pero necesitas información específica.',
      neutral: 'Cliente neutral: mantienes una actitud equilibrada, ni muy positivo ni negativo.'
    };

    const selectedPersonality = personalities[clientPersonality as keyof typeof personalities] || personalities.neutral;

    // Sistema de prompt adaptativo según escenario
    const getScenarioPrompt = (scenario: any) => {
      const basePrompt = `Eres un cliente simulado para entrenar agentes en ${scenario.scenario_type}. 

ESCENARIO: ${scenario.title}
DESCRIPCIÓN: ${scenario.description}
TIPO: ${scenario.scenario_type}
DIFICULTAD: ${scenario.difficulty_level}/3

PERSONALIDAD ACTUAL: ${selectedPersonality}

INSTRUCCIONES ESPECÍFICAS: ${scenario.prompt_instructions || 'Mantén una conversación natural y profesional.'}`;

      switch (scenario.scenario_type) {
        case 'sales':
          return `${basePrompt}

COMPORTAMIENTO ESPECÍFICO PARA VENTAS:
- NO ofrezcas planes o beneficios sin que te lo soliciten directamente
- Responde SOLO a lo que el asesor te pregunta
- Si el asesor es muy directo con ofertas, muestra sorpresa o desconfianza
- Evalúa si el asesor realmente entiende tus necesidades antes de aceptar información
- Haz preguntas sobre su experiencia, empresa, o credenciales si es apropiado
- Si no estás convencido, expresa dudas realistas`;

        case 'customer_service':
          return `${basePrompt}

COMPORTAMIENTO ESPECÍFICO PARA ATENCIÓN AL CLIENTE:
- Tienes un problema específico que necesita resolverse
- Evalúa si el agente es empático y comprende tu situación
- Proporciona información gradualmente, no todo de una vez
- Si el agente no resuelve tu problema, muestra frustración creciente`;

        case 'hr':
          return `${basePrompt}

COMPORTAMIENTO ESPECÍFICO PARA RECURSOS HUMANOS:
- Eres un candidato o empleado con consultas específicas
- Evalúa el profesionalismo y conocimiento del tema por parte del agente
- Haz preguntas relevantes sobre procesos, beneficios o políticas`;

        case 'negotiation':
          return `${basePrompt}

COMPORTAMIENTO ESPECÍFICO PARA NEGOCIACIÓN:
- Tienes una posición inicial clara que debes defender
- Evalúa las propuestas del agente cuidadosamente
- No cedas fácilmente, requiere justificaciones sólidas`;

        default:
          return `${basePrompt}

COMPORTAMIENTO GENERAL:
- Mantén coherencia con tu personalidad asignada
- Responde de manera natural y realista
- Evalúa las habilidades comunicativas del agente`;
      }
    };

    const enhancedSystemPrompt = `${getScenarioPrompt(scenario)}

BASE DE CONOCIMIENTO DISPONIBLE:
${knowledgeContext}

REGLAS IMPORTANTES:
1. Mantén coherencia con tu personalidad: ${clientPersonality}
2. NUNCA rompas el personaje - eres un cliente real
3. Evalúa continuamente: conocimiento, comunicación, manejo de objeciones
4. Responde de forma natural, no como un instructor
5. Si detectas errores graves del agente, reacciona como cliente real
6. Usa pausas, interrupciones y cambios de tono cuando sea natural
7. No facilites la venta/resolución - desafía apropiadamente

IMPORTANTE: Responde SIEMPRE en español como un cliente real de ${scenario.scenario_type}.`;

    // Preparar mensajes para OpenAI
    const openAIMessages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messages
    ];

    console.log('Sending request to OpenAI for scenario:', scenario.title);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        max_tokens: 800,
        temperature: 0.8,
        presence_penalty: 0.2,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    // Análisis en tiempo real si está en modo evaluación
    let realTimeAnalysis = null;
    if (messages.length > 1 && evaluationMode) {
      const lastUserMessage = messages[messages.length - 1]?.content || '';
      
      // Análisis básico de la respuesta del usuario
      const responseLength = lastUserMessage.length;
      const hasQuestions = lastUserMessage.includes('?');
      const isPolite = /por favor|gracias|disculpe|perdón/i.test(lastUserMessage);
      
      realTimeAnalysis = {
        responseQuality: responseLength > 20 ? 'good' : 'poor',
        communication: hasQuestions ? 'inquisitive' : 'direct',
        professionalism: isPolite ? 'high' : 'medium',
        scenarioAdaptation: 'analyzing...'
      };
    }

    const result = {
      response: aiResponse,
      realTimeAnalysis,
      conversationContinues: true,
      clientPersonality,
      scenarioType: scenario.scenario_type,
      timestamp: new Date().toISOString()
    };

    console.log('Successful AI response generated for:', scenario.title);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced-ai-conversation:', error);
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
    );
  }
});
