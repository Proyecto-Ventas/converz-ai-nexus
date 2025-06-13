
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EvaluationRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>;
  scenario: {
    title: string;
    description: string;
    type: string;
  };
  sessionData: {
    duration: number;
    messageCount: number;
    userWordCount: number;
    aiWordCount: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, scenario, sessionData }: EvaluationRequest = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Preparar contexto de la conversación
    const conversationText = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'user' ? 'Usuario' : 'Cliente IA'}: ${m.content}`)
      .join('\n');

    const evaluationPrompt = `Evalúa esta conversación de entrenamiento de ventas con un sistema estricto de 0-100 puntos:

ESCENARIO: ${scenario.title}
DESCRIPCIÓN: ${scenario.description}
TIPO: ${scenario.type}

DATOS DE SESIÓN:
- Duración: ${Math.floor(sessionData.duration / 60)} minutos
- Mensajes totales: ${sessionData.messageCount}
- Palabras del usuario: ${sessionData.userWordCount}
- Respuestas de IA: ${sessionData.aiWordCount}

CONVERSACIÓN:
${conversationText}

CRITERIOS DE EVALUACIÓN ESTRICTOS (0-100):

1. RAPPORT Y CONEXIÓN (0-100):
- 90-100: Conexión excepcional, empatía natural, cliente muy cómodo
- 70-89: Buena conexión, muestra interés genuino
- 50-69: Conexión básica, algo mecánico
- 30-49: Poca conexión, demasiado formal
- 0-29: Sin conexión, cliente incómodo

2. CLARIDAD COMUNICATIVA (0-100):
- 90-100: Comunicación perfecta, ideas claras, fácil seguimiento
- 70-89: Muy claro, bien estructurado
- 50-69: Generalmente claro, algunos momentos confusos
- 30-49: Confuso en varios puntos
- 0-29: Muy difícil de seguir

3. EMPATÍA Y COMPRENSIÓN (0-100):
- 90-100: Comprende perfectamente necesidades, responde emocionalmente
- 70-89: Buena comprensión, muestra preocupación genuina  
- 50-69: Comprensión básica, respuestas apropiadas
- 30-49: Comprensión limitada, respuestas genéricas
- 0-29: No comprende necesidades del cliente

4. PRECISIÓN Y CONOCIMIENTO (0-100):
- 90-100: Información perfecta, respuestas expertas
- 70-89: Muy conocedor, respuestas precisas
- 50-69: Conocimiento adecuado, pocas imprecisiones
- 30-49: Conocimiento limitado, algunas imprecisiones
- 0-29: Información incorrecta o muy limitada

PENALIZACIONES AUTOMÁTICAS:
- Ofrecer precios sin entender necesidades: -20 puntos
- Hablar más del producto que escuchar: -15 puntos
- No hacer preguntas de descubrimiento: -25 puntos
- Respuestas genéricas sin personalización: -10 puntos
- No manejar objeciones adecuadamente: -20 puntos

BONIFICACIONES:
- Preguntas abiertas efectivas: +10 puntos
- Manejo excepcional de objeciones: +15 puntos
- Personalización basada en necesidades: +10 puntos
- Cierre natural y no forzado: +20 puntos

Proporciona tu evaluación en este formato JSON:
{
  "overall_score": [0-100],
  "rapport_score": [0-100], 
  "clarity_score": [0-100],
  "empathy_score": [0-100],
  "accuracy_score": [0-100],
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "critical_errors": ["error crítico 1", "error crítico 2"],
  "improvements": ["mejora 1", "mejora 2", "mejora 3"],
  "specific_feedback": "Comentario detallado sobre el desempeño, incluyendo qué hizo bien y qué debe mejorar específicamente. Sé constructivo pero honesto sobre las deficiencias.",
  "coaching_tips": ["consejo práctico 1", "consejo práctico 2"],
  "next_steps": ["paso a seguir 1", "paso a seguir 2"]
}

SÉ ESTRICTO EN LA EVALUACIÓN. Un 70/100 debe ser un muy buen desempeño, no promedio.`;

    console.log('Sending evaluation request to OpenAI');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Eres un evaluador experto en ventas y comunicación. Proporciona evaluaciones detalladas y constructivas usando el sistema de puntuación 0-100 de manera estricta y justa.'
          },
          { role: 'user', content: evaluationPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const evaluationText = data.choices[0]?.message?.content;

    if (!evaluationText) {
      throw new Error('No evaluation received from OpenAI');
    }

    // Intentar parsear JSON de la respuesta
    let evaluation;
    try {
      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing evaluation JSON:', parseError);
      
      // Crear evaluación de respaldo
      evaluation = {
        overall_score: 50,
        rapport_score: 50,
        clarity_score: 50,
        empathy_score: 50,
        accuracy_score: 50,
        strengths: ["Participó en la conversación"],
        critical_errors: ["Error al procesar evaluación detallada"],
        improvements: ["Continuar practicando", "Mejorar técnicas de comunicación"],
        specific_feedback: "La evaluación automática no pudo procesarse correctamente. Se recomienda revisar la conversación manualmente y continuar practicando.",
        coaching_tips: ["Practica escucha activa", "Haz más preguntas abiertas"],
        next_steps: ["Repetir el ejercicio", "Estudiar técnicas de ventas"]
      };
    }

    // Validar y normalizar puntuaciones
    const normalizeScore = (score: any) => {
      const num = parseInt(score) || 0;
      return Math.max(0, Math.min(100, num));
    };

    evaluation.overall_score = normalizeScore(evaluation.overall_score);
    evaluation.rapport_score = normalizeScore(evaluation.rapport_score);
    evaluation.clarity_score = normalizeScore(evaluation.clarity_score);
    evaluation.empathy_score = normalizeScore(evaluation.empathy_score);
    evaluation.accuracy_score = normalizeScore(evaluation.accuracy_score);

    // Asegurar que existan arrays
    evaluation.strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
    evaluation.critical_errors = Array.isArray(evaluation.critical_errors) ? evaluation.critical_errors : [];
    evaluation.improvements = Array.isArray(evaluation.improvements) ? evaluation.improvements : [];
    evaluation.coaching_tips = Array.isArray(evaluation.coaching_tips) ? evaluation.coaching_tips : [];
    evaluation.next_steps = Array.isArray(evaluation.next_steps) ? evaluation.next_steps : [];

    console.log('Evaluation completed successfully');

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in comprehensive-evaluation:', error);
    
    // Evaluación de respaldo en caso de error
    const fallbackEvaluation = {
      overall_score: 40,
      rapport_score: 40,
      clarity_score: 40,
      empathy_score: 40,
      accuracy_score: 40,
      strengths: ["Completó la sesión de entrenamiento"],
      critical_errors: ["Error técnico en la evaluación"],
      improvements: [
        "Continuar practicando regularmente",
        "Enfocarse en construcción de rapport",
        "Mejorar técnicas de escucha activa"
      ],
      specific_feedback: "Hubo un error técnico al procesar la evaluación detallada. Se recomienda repetir el ejercicio y solicitar feedback adicional.",
      coaching_tips: [
        "Practica hacer preguntas abiertas",
        "Escucha antes de presentar soluciones",
        "Construye confianza gradualmente"
      ],
      next_steps: [
        "Repetir el escenario de entrenamiento",
        "Estudiar técnicas de comunicación efectiva"
      ]
    };

    return new Response(JSON.stringify(fallbackEvaluation), {
      status: 200, // Retornar 200 para que el frontend pueda manejar la respuesta
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
