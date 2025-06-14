
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
import { LATIN_VOICES } from '@/utils/latinVoices';

interface LiveTrainingInterfaceProps {
  scenario: string;
  scenarioTitle: string;
  scenarioDescription: string;
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
  onComplete,
  onBack
}: LiveTrainingInterfaceProps) => {
  const [mode, setMode] = useState<'chat' | 'call'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState('EXAVITQu4vr4xnSDxMaL');
  const [selectedVoiceName, setSelectedVoiceName] = useState('Bella');
  const [clientEmotion, setClientEmotion] = useState('neutral');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  const sessionManager = useSessionManager();
  const { toast } = useToast();
  
  const {
    isListening,
    isSupported: speechSupported,
    transcript,
    startListening,
    stopListening,
    cleanup
  } = useSpeechRecognition({
    onResult: (result) => {
      console.log('Speech recognition result:', result);
      setInputMessage(result);
    }
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
      console.log('Audio playback ended');
    }
  });
  
  // Estado de evaluación en tiempo real
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

  // Referencias para el seguimiento
  const lastMessageTime = useRef<number>(Date.now());
  const evaluationInterval = useRef<NodeJS.Timeout>();

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
          console.log('Mode is call, generating initial audio...');
          await generateAndPlayAudio(welcomeMessage);
        }
      }
    };

    initSession();

    // Evaluación cada 30 segundos
    evaluationInterval.current = setInterval(() => {
      updateRealTimeEvaluation();
    }, 30000);

    return () => {
      if (evaluationInterval.current) {
        clearInterval(evaluationInterval.current);
      }
      cleanup();
    };
  }, []);

  // Manejar cambio de modo
  useEffect(() => {
    if (mode === 'call') {
      console.log('Switched to call mode');
    } else {
      console.log('Switched to chat mode');
      stopAudio();
      if (isListening) {
        stopListening();
      }
    }
  }, [mode]);

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

    setMessages(prev => [...prev, newMessage]);
    
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
    const userMessages = messages.filter(m => m.sender === 'user');
    const responseTime = (Date.now() - lastMessageTime.current) / 1000;

    // Algoritmo de evaluación más exigente (0-100)
    let rapport = Math.max(0, 45 + (userMessages.length * 2) - (responseTime > 10 ? 15 : 0));
    let clarity = Math.min(100, 40 + (userMessages.filter(m => m.content.length > 20).length * 8));
    let empathy = Math.max(0, 35 + (userMessages.filter(m => 
      /gracias|perdón|disculpe|entiendo/i.test(m.content)
    ).length * 12));
    let accuracy = Math.min(100, 50 + (userMessages.filter(m => 
      m.content.includes('?') || /específico|detalle|información/i.test(m.content)
    ).length * 6));

    // Penalizaciones por comportamientos no deseados
    if (userMessages.some(m => /precio|costo|cuánto/i.test(m.content) && messages.length < 6)) {
      rapport -= 20;
      accuracy -= 15;
    }

    if (responseTime > 15) {
      clarity -= 25;
      rapport -= 10;
    }

    // Asegurar rango 0-100
    rapport = Math.max(0, Math.min(100, rapport));
    clarity = Math.max(0, Math.min(100, clarity));
    empathy = Math.max(0, Math.min(100, empathy));
    accuracy = Math.max(0, Math.min(100, accuracy));

    const overallScore = Math.round((rapport + clarity + empathy + accuracy) / 4);

    // Feedback en tiempo real
    const liveCoaching = [];
    const criticalIssues = [];
    const positivePoints = [];

    if (overallScore < 40) {
      liveCoaching.push("Necesitas conectar mejor con el cliente");
      criticalIssues.push("Puntuación baja");
    }
    if (responseTime > 10) {
      liveCoaching.push("Responde más rápido para mantener el interés");
      criticalIssues.push("Respuesta lenta");
    }
    if (rapport < 50) {
      liveCoaching.push("Muestra más empatía y interés genuino");
    }
    if (clarity < 50) {
      liveCoaching.push("Sé más claro en tu comunicación");
    }

    if (rapport >= 70) positivePoints.push("Buena conexión");
    if (clarity >= 70) positivePoints.push("Comunicación clara");
    if (empathy >= 70) positivePoints.push("Excelente empatía");

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
        "Haz más preguntas abiertas",
        "Escucha activamente antes de ofrecer",
        "Construye rapport antes de vender"
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
    console.log('Using voice ID:', selectedVoiceId);
    
    try {
      await playAudio(text, selectedVoiceId);
    } catch (error) {
      console.error('Error generating/playing audio:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Agregar mensaje del usuario
    await addMessage(userMessage, 'user');

    setIsProcessing(true);

    try {
      console.log('Sending message to AI:', userMessage);
      
      // Obtener respuesta de IA
      const response = await supabase.functions.invoke('enhanced-ai-conversation', {
        body: {
          messages: [
            ...messages.map(m => ({
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
      }

    } catch (error) {
      console.error('Error sending message:', error);
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
          Mensajes intercambiados: ${messages.length}.`,
        ai_analysis: {
          session_duration: Math.floor((Date.now() - sessionStartTime) / 1000),
          total_messages: messages.length,
          user_messages: messages.filter(m => m.sender === 'user').length,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{scenarioTitle}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={mode === 'call' ? 'default' : 'secondary'}>
                  {mode === 'call' ? 'Llamada' : 'Chat'}
                </Badge>
                <Badge variant="outline">{clientEmotion}</Badge>
                {mode === 'call' && (isPlaying || audioLoading) && (
                  <Badge variant="secondary" className="animate-pulse">
                    {audioLoading ? 'Generando...' : 'Reproduciendo'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant={mode === 'call' ? 'default' : 'outline'}
              onClick={handleVoiceMode}
              size="sm"
            >
              {mode === 'call' ? <Phone className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {mode === 'call' ? 'Llamada Activa' : 'Activar Llamada'}
            </Button>
            <Button onClick={handleEndSession} variant="destructive" size="sm">
              <PhoneOff className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>

        {/* Configuración de voz */}
        {showVoiceSettings && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="space-y-4">
                <VoiceSelectorSimple
                  selectedVoice={selectedVoiceId}
                  onVoiceSelect={handleVoiceSelect}
                />
                
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="text-sm font-medium">Emoción del Cliente:</label>
                    <select
                      value={clientEmotion}
                      onChange={(e) => setClientEmotion(e.target.value)}
                      className="ml-2 border rounded px-3 py-1 text-sm"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="curious">Curioso</option>
                      <option value="skeptical">Escéptico</option>
                      <option value="hurried">Apurado</option>
                      <option value="annoyed">Molesto</option>
                      <option value="interested">Interesado</option>
                    </select>
                  </div>

                  {mode === 'call' && (
                    <div className="flex items-center space-x-2">
                      <VolumeX className="h-4 w-4" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <Volume2 className="h-4 w-4" />
                      <span className="text-xs text-gray-500">{Math.round(volume * 100)}%</span>
                    </div>
                  )}
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
              isListening={isListening}
              currentUserText={transcript}
              className="h-[500px]"
            />

            {/* Input de mensaje */}
            <Card className="mt-4">
              <CardContent className="p-3">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={mode === 'call' ? "Habla o escribe tu mensaje..." : "Escribe tu mensaje..."}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  
                  {mode === 'call' && speechSupported && (
                    <Button
                      onClick={handleMicToggle}
                      variant={isListening ? 'default' : 'outline'}
                      size="sm"
                      disabled={isProcessing || isPlaying}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                  
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isProcessing}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      mode === 'call' ? 'bg-green-400' : 'bg-blue-400'
                    }`} />
                    <span>Modo: {mode === 'call' ? 'Llamada' : 'Chat'}</span>
                  </div>
                  
                  {mode === 'call' && (
                    <div className="flex items-center space-x-2">
                      {isListening && <span className="animate-pulse">🎤 Escuchando...</span>}
                      {isPlaying && <span className="animate-pulse">🔊 Reproduciendo...</span>}
                      {audioLoading && <span className="animate-pulse">⏳ Generando audio...</span>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
