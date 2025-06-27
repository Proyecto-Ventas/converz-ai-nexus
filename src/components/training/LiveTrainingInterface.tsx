import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Phone, PhoneOff, ArrowLeft, Volume2, VolumeX, Settings } from 'lucide-react';
import { useSessionManager } from './SessionManager';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import VoiceSelectorSimple from '@/components/voices/VoiceSelectorSimple';
import RealTimeEvaluation from './RealTimeEvaluation';
import ConversationTranscript from './ConversationTranscript';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LiveTrainingInterfaceProps {
  scenario: string;
  scenarioTitle: string;
  scenarioDescription: string;
  mode: 'chat' | 'call';
  clientEmotion: string;
  selectedVoiceId: string;
  selectedVoiceName: string;
  onComplete: (evaluation: any) => void;
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const LiveTrainingInterface = ({
  scenario,
  scenarioTitle,
  scenarioDescription,
  mode: initialMode,
  clientEmotion: initialClientEmotion,
  selectedVoiceId: initialVoiceId,
  selectedVoiceName: initialVoiceName,
  onComplete,
  onBack
}: LiveTrainingInterfaceProps) => {
  const [mode, setMode] = useState<'chat' | 'call'>(initialMode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState(initialVoiceId);
  const [selectedVoiceName, setSelectedVoiceName] = useState(initialVoiceName);
  const [clientEmotion, setClientEmotion] = useState(initialClientEmotion);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [currentUserInput, setCurrentUserInput] = useState('');
  const [waitingForAI, setWaitingForAI] = useState(false);

  const sessionManager = useSessionManager();
  const { toast } = useToast();
  
  const {
    isListening,
    isSupported: speechSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    cleanup
  } = useSpeechRecognition({
    onResult: (result) => {
      console.log('Speech recognition result:', result);
      setCurrentUserInput(result);
      // Auto-send message after speech recognition
      if (mode === 'call' && result.trim()) {
        handleSendMessage(result.trim());
      }
    },
    continuous: true,
    autoRestart: mode === 'call'
  });

  const {
    isPlaying,
    isLoading: audioLoading,
    playAudio,
    stopAudio,
    volume,
    setVolume
  } = useAudioPlayer({
    onAudioEnd: () => {
      console.log('Audio playback ended, resuming speech recognition');
      setWaitingForAI(false);
      if (mode === 'call' && !isListening) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    }
  });
  
  // Estado de evaluación en tiempo real mejorado
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    rapport: 45,
    clarity: 50,
    empathy: 40,
    accuracy: 55,
    responseTime: 3.2,
    overallScore: 47,
    trend: 'stable' as 'up' | 'down' | 'stable',
    criticalIssues: [] as string[],
    positivePoints: [] as string[],
    suggestions: [] as string[],
    liveCoaching: [] as string[]
  });

  // Referencias para el seguimiento mejorado
  const lastMessageTime = useRef<number>(Date.now());
  const evaluationInterval = useRef<NodeJS.Timeout>();
  const messageHistory = useRef<Message[]>([]);

  // Inicializar sesión
  useEffect(() => {
    const initSession = async () => {
      const config = {
        scenario,
        scenarioTitle,
        scenarioDescription,
        clientEmotion,
        interactionMode: mode,
        selectedVoiceName
      };

      const newSessionId = await sessionManager.startSession(config);
      if (newSessionId) {
        setSessionId(newSessionId);
        
        // Mensaje inicial del cliente
        const welcomeMessage = getWelcomeMessage();
        await addMessage(welcomeMessage, 'ai', newSessionId);
        
        if (mode === 'call') {
          console.log('Mode is call, generating initial audio and starting listening...');
          await generateAndPlayAudio(welcomeMessage);
          // Iniciar reconocimiento de voz automáticamente
          setTimeout(() => {
            startListening();
          }, 1000);
        }
      }
    };

    initSession();

    // Evaluación cada 15 segundos para ser más responsiva
    evaluationInterval.current = setInterval(() => {
      updateRealTimeEvaluation();
    }, 15000);

    return () => {
      if (evaluationInterval.current) {
        clearInterval(evaluationInterval.current);
      }
      cleanup();
    };
  }, []);

  const getWelcomeMessage = () => {
    const emotions = {
      curious: "Hola, me dijeron que me pueden ayudar. Tengo algunas preguntas sobre sus servicios...",
      skeptical: "Buenos días. Honestamente, no suelo responder a estas llamadas, pero decidí escuchar. ¿Qué tienen para ofrecer?",
      hurried: "Hola, tengo poco tiempo. ¿De qué se trata esto exactamente?",
      annoyed: "¿Sí? Mire, estoy ocupado. Esto más vale que sea importante.",
      interested: "¡Hola! Vi que me llamaron. Me interesa saber más sobre lo que ofrecen.",
      neutral: "Buenos días, ¿en qué puedo ayudarle?"
    };
    return emotions[clientEmotion as keyof typeof emotions] || emotions.neutral;
  };

  const addMessage = async (content: string, sender: 'user' | 'ai', currentSessionId?: string) => {
    const messageId = Date.now().toString();
    const timestamp = new Date();
    const timestampInSession = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    const newMessage: Message = {
      id: messageId,
      content,
      sender,
      timestamp
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      messageHistory.current = updated;
      return updated;
    });
    
    // Guardar mensaje en la base de datos
    const sessionIdToUse = currentSessionId || sessionId;
    if (sessionIdToUse) {
      await sessionManager.saveMessage(sessionIdToUse, content, sender, timestampInSession);
    }

    // Actualizar métricas si es mensaje del usuario
    if (sender === 'user') {
      lastMessageTime.current = Date.now();
      updateRealTimeEvaluation();
    }

    return newMessage;
  };

  const updateRealTimeEvaluation = () => {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const userMessages = messageHistory.current.filter(m => m.sender === 'user');
    const aiMessages = messageHistory.current.filter(m => m.sender === 'ai');
    const responseTime = (Date.now() - lastMessageTime.current) / 1000;

    // Algoritmo de evaluación mejorado y más preciso
    let rapport = 30; // Base más baja
    let clarity = 35;
    let empathy = 30;
    let accuracy = 40;

    // Bonificaciones por buenas prácticas
    if (userMessages.length > 0) {
      // Rapport: Conexión y construcción de relación
      rapport += Math.min(30, userMessages.length * 5); // Hasta 30 puntos por participación
      
      // Bonificación por saludos y cortesía
      if (userMessages.some(m => /hola|buenos días|buenas tardes|mucho gusto|mi nombre es/i.test(m.content))) {
        rapport += 15;
      }

      // Clarity: Claridad en la comunicación
      const avgMessageLength = userMessages.reduce((acc, m) => acc + m.content.length, 0) / userMessages.length;
      if (avgMessageLength > 20) clarity += 20; // Mensajes sustanciales
      if (avgMessageLength > 50) clarity += 15; // Mensajes detallados

      // Empathy: Empatía y comprensión
      const empathyKeywords = /entiendo|comprendo|disculpe|perdón|gracias|me imagino|siento|lamento/i;
      const empathyCount = userMessages.filter(m => empathyKeywords.test(m.content)).length;
      empathy += Math.min(25, empathyCount * 8);

      // Accuracy: Precisión y relevancia
      const questionCount = userMessages.filter(m => m.content.includes('?')).length;
      accuracy += Math.min(20, questionCount * 5);
      
      // Bonificación por mencionar servicios/productos específicos
      if (userMessages.some(m => /servicio|producto|precio|oferta|beneficio|solución/i.test(m.content))) {
        accuracy += 15;
      }
    }

    // Penalizaciones por comportamientos negativos
    if (responseTime > 10) {
      rapport -= 15;
      clarity -= 10;
    }

    if (userMessages.length > 0 && userMessages[0].content.length < 10) {
      clarity -= 10; // Primer mensaje muy corto
    }

    // Penalización por preguntar precio muy pronto
    if (userMessages.length < 3 && userMessages.some(m => /cuánto|precio|costo|vale/i.test(m.content))) {
      rapport -= 20;
      accuracy -= 15;
    }

    // Asegurar rango 0-100
    rapport = Math.max(0, Math.min(100, rapport));
    clarity = Math.max(0, Math.min(100, clarity));
    empathy = Math.max(0, Math.min(100, empathy));
    accuracy = Math.max(0, Math.min(100, accuracy));

    const overallScore = Math.round((rapport + clarity + empathy + accuracy) / 4);

    // Feedback en tiempo real mejorado
    const liveCoaching = [];
    const criticalIssues = [];
    const positivePoints = [];

    if (overallScore < 40) {
      liveCoaching.push("Necesitas mejorar tu approach inicial");
      criticalIssues.push("Score bajo");
    } else if (overallScore >= 70) {
      positivePoints.push("Excelente desempeño");
    }

    if (responseTime > 8) {
      liveCoaching.push("Responde más rápido para mantener engagement");
      criticalIssues.push("Respuesta lenta");
    }

    if (rapport < 50) {
      liveCoaching.push("Construye más rapport con el cliente");
    } else if (rapport >= 75) {
      positivePoints.push("Excelente conexión");
    }

    if (clarity < 50) {
      liveCoaching.push("Sé más claro y específico");
    } else if (clarity >= 75) {
      positivePoints.push("Comunicación muy clara");
    }

    if (empathy >= 70) positivePoints.push("Muy empático");
    if (accuracy >= 70) positivePoints.push("Respuestas precisas");

    setRealTimeMetrics({
      rapport,
      clarity,
      empathy,
      accuracy,
      responseTime,
      overallScore,
      trend: overallScore > realTimeMetrics.overallScore ? 'up' : 
             overallScore < realTimeMetrics.overallScore ? 'down' : 'stable',
      criticalIssues,
      positivePoints,
      suggestions: [
        "Presenta tu empresa y nombre",
        "Haz preguntas de descubrimiento",
        "Escucha activamente antes de ofrecer"
      ],
      liveCoaching
    });

    // Guardar métricas en tiempo real
    if (sessionId) {
      sessionManager.saveRealTimeMetric(sessionId, 'overall_score', overallScore);
      sessionManager.saveRealTimeMetric(sessionId, 'rapport', rapport);
      sessionManager.saveRealTimeMetric(sessionId, 'clarity', clarity);
      sessionManager.saveRealTimeMetric(sessionId, 'empathy', empathy);
      sessionManager.saveRealTimeMetric(sessionId, 'accuracy', accuracy);
    }
  };

  const generateAndPlayAudio = async (text: string) => {
    if (!text.trim()) return;
    console.log('Generating audio for:', text.substring(0, 50) + '...');
    
    try {
      setWaitingForAI(true);
      if (isListening) {
        stopListening();
      }
      
      await playAudio(text, selectedVoiceId);
    } catch (error) {
      console.error('Error generating/playing audio:', error);
      setWaitingForAI(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || inputMessage.trim();
    if (!userMessage || isProcessing) return;

    setInputMessage('');
    setCurrentUserInput('');
    
    // Agregar mensaje del usuario
    await addMessage(userMessage, 'user');

    setIsProcessing(true);
    setWaitingForAI(true);

    try {
      console.log('Sending message to AI:', userMessage);
      
      // Obtener respuesta de IA
      const response = await supabase.functions.invoke('enhanced-ai-conversation', {
        body: {
          messages: [
            ...messageHistory.current.map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            { role: 'user', content: userMessage }
          ],
          scenario: {
            id: scenario,
            title: scenarioTitle,
            description: scenarioDescription,
            scenario_type: 'sales',
            difficulty_level: 1
          },
          knowledgeBase: [],
          clientPersonality: clientEmotion,
          evaluationMode: true
        }
      });

      if (response.error) throw response.error;

      const aiResponse = response.data.response;
      console.log('AI response received:', aiResponse?.substring(0, 50) + '...');
      
      // Agregar respuesta de IA
      await addMessage(aiResponse, 'ai');

      // Si es modo llamada, generar y reproducir audio
      if (mode === 'call') {
        console.log('Call mode active, generating audio...');
        await generateAndPlayAudio(aiResponse);
      } else {
        setWaitingForAI(false);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setWaitingForAI(false);
      toast({
        title: "Error",
        description: "No se pudo procesar el mensaje",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceMode = () => {
    console.log('Toggling voice mode from:', mode);
    if (mode === 'call') {
      if (isListening) {
        stopListening();
      }
      if (isPlaying) {
        stopAudio();
      }
    }
    setMode(mode === 'chat' ? 'call' : 'chat');
  };

  const handleMicToggle = () => {
    console.log('Toggling microphone, currently listening:', isListening);
    if (isListening) {
      stopListening();
      // Auto-send if there's text
      if (inputMessage.trim()) {
        console.log('Auto-sending message after stopping mic');
        sendMessage();
      }
    } else {
      console.log('Starting to listen...');
      startListening();
    }
  };

  const handleVoiceSelect = (voiceId: string, voiceName: string) => {
    console.log('Voice selected:', voiceName, 'ID:', voiceId);
    setSelectedVoiceId(voiceId);
    setSelectedVoiceName(voiceName);
  };

  const handleEndSession = async () => {
    console.log('Ending session...');
    cleanup();
    
    if (sessionId) {
      await sessionManager.endSession(sessionId, realTimeMetrics.overallScore);
      
      // Crear evaluación completa
      const evaluation = {
        overall_score: realTimeMetrics.overallScore,
        rapport_score: realTimeMetrics.rapport,
        clarity_score: realTimeMetrics.clarity,
        empathy_score: realTimeMetrics.empathy,
        accuracy_score: realTimeMetrics.accuracy,
        strengths: realTimeMetrics.positivePoints,
        improvements: [
          ...realTimeMetrics.criticalIssues,
          ...realTimeMetrics.liveCoaching
        ],
        specific_feedback: `Sesión completada con una puntuación de ${realTimeMetrics.overallScore}/100. 
          ${realTimeMetrics.overallScore >= 70 ? 'Buen desempeño general.' : 'Hay áreas importantes que mejorar.'}
          Tiempo total: ${Math.floor((Date.now() - sessionStartTime) / 1000 / 60)} minutos.
          Mensajes intercambiados: ${messageHistory.current.length}.`,
        ai_analysis: {
          session_duration: Math.floor((Date.now() - sessionStartTime) / 1000),
          total_messages: messageHistory.current.length,
          user_messages: messageHistory.current.filter(m => m.sender === 'user').length,
          avg_response_time: realTimeMetrics.responseTime
        }
      };

      await sessionManager.saveEvaluation(sessionId, evaluation);
      onComplete(evaluation);
    }
  };

  const requestFeedback = () => {
    updateRealTimeEvaluation();
    toast({
      title: "Evaluación Actualizada",
      description: `Puntuación actual: ${realTimeMetrics.overallScore}/100`,
    });
  };

  const currentDuration = Math.floor((Date.now() - sessionStartTime) / 1000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack} size="sm" className="corporate-hover-emerald">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{scenarioTitle}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={mode === 'call' ? 'corporate-emerald text-white' : 'bg-slate-500 text-white'}>
                  {mode === 'call' ? 'Llamada' : 'Chat'}
                </Badge>
                <Badge variant="outline" className="corporate-emerald-border corporate-text-emerald">{clientEmotion}</Badge>
                {mode === 'call' && (
                  <>
                    {isListening && !waitingForAI && (
                      <Badge variant="secondary" className="animate-pulse bg-green-100 text-green-700">
                        🎤 Escuchando...
                      </Badge>
                    )}
                    {waitingForAI && (
                      <Badge variant="secondary" className="animate-pulse bg-blue-100 text-blue-700">
                        {audioLoading ? '⏳ Generando...' : '🔊 Reproduciendo...'}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {mode === 'call' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className="corporate-hover-emerald"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={handleEndSession} variant="destructive" size="sm">
              <PhoneOff className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>

        {/* Configuración de voz - Solo en modo llamada */}
        {showVoiceSettings && mode === 'call' && (
          <Card className="mb-4 corporate-emerald-border border-2">
            <CardContent className="p-4">
              <div className="space-y-4">
                <VoiceSelectorSimple
                  selectedVoice={selectedVoiceId}
                  onVoiceSelect={(voiceId, voiceName) => {
                    setSelectedVoiceId(voiceId);
                    setSelectedVoiceName(voiceName);
                  }}
                />
                
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="text-sm font-medium">Emoción del Cliente:</label>
                    <select
                      value={clientEmotion}
                      onChange={(e) => setClientEmotion(e.target.value)}
                      className="ml-2 border rounded px-3 py-1 text-sm corporate-hover-emerald"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="curious">Curioso</option>
                      <option value="skeptical">Escéptico</option>
                      <option value="hurried">Apurado</option>
                      <option value="annoyed">Molesto</option>
                      <option value="interested">Interesado</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <VolumeX className="h-4 w-4 corporate-text-emerald" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <Volume2 className="h-4 w-4 corporate-text-emerald" />
                    <span className="text-xs text-gray-500">{Math.round(volume * 100)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Conversación */}
          <div className="lg:col-span-2">
            <ConversationTranscript
              messages={messages}
              isListening={isListening && mode === 'call'}
              currentUserText={mode === 'call' ? (interimTranscript || currentUserInput) : ''}
              className="h-[500px]"
            />

            {/* Input de mensaje - Solo visible en modo chat */}
            {mode === 'chat' && (
              <Card className="mt-4 corporate-emerald-border border">
                <CardContent className="p-3">
                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      disabled={isProcessing}
                      className="flex-1"
                    />
                    
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isProcessing}
                      size="sm"
                      className="corporate-emerald text-white hover:from-emerald-600 hover:to-teal-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status en modo llamada */}
            {mode === 'call' && (
              <Card className="mt-4 corporate-emerald-border border">
                <CardContent className="p-3">
                  <div className="text-center">
                    {waitingForAI ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                        <span className="text-sm text-emerald-600">
                          {audioLoading ? 'Generando respuesta...' : 'Reproduciendo audio...'}
                        </span>
                      </div>
                    ) : isListening ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-pulse rounded-full h-4 w-4 bg-green-500"></div>
                        <span className="text-sm text-green-600">Escuchando... Habla naturalmente</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Modo llamada - Conversación automática</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Evaluación en tiempo real */}
          <div className="lg:col-span-2">
            <RealTimeEvaluation
              metrics={realTimeMetrics}
              isActive={true}
              sessionDuration={currentDuration}
              messageCount={messages.length}
              onRequestFeedback={requestFeedback}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrainingInterface;
