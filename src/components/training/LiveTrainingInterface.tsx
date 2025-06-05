import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Pause, Play, Shuffle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ConversationTranscript from './ConversationTranscript';
import ChatInterface from './ChatInterface';
import RealTimeEvaluation from './RealTimeEvaluation';
import { useSessionManager } from './SessionManager';
import { getRandomVoice, type RandomVoiceSelection } from '@/utils/randomVoiceSelector';

interface LiveTrainingInterfaceProps {
  config: any;
  onComplete: (evaluation: any) => void;
  onBack: () => void;
}

interface RealTimeMetrics {
  rapport: number;
  clarity: number;
  empathy: number;
  accuracy: number;
  responseTime: number;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  criticalIssues: string[];
  positivePoints: string[];
  suggestions: string[];
}

const LiveTrainingInterface = ({ config, onComplete, onBack }: LiveTrainingInterfaceProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentUserText, setCurrentUserText] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [callStatus, setCallStatus] = useState('connecting');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<RandomVoiceSelection | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    rapport: 75,
    clarity: 80,
    empathy: 70,
    accuracy: 85,
    responseTime: 2.1,
    overallScore: 77,
    trend: 'stable',
    criticalIssues: [],
    positivePoints: ['Tono profesional', 'Información precisa'],
    suggestions: []
  });

  const { toast } = useToast();
  const sessionManager = useSessionManager();
  const sessionStartRef = useRef<Date | null>(null);
  const recognitionRef = useRef<any>(null);
  const pauseStartRef = useRef<Date | null>(null);
  const totalPauseTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Seleccionar voz aleatoria al iniciar
  useEffect(() => {
    if (!selectedVoice) {
      const randomVoice = getRandomVoice();
      setSelectedVoice(randomVoice);
      console.log('Voz seleccionada:', randomVoice);
    }
  }, [selectedVoice]);

  useEffect(() => {
    if (isActive && !isPaused) {
      if (!sessionStartRef.current) {
        sessionStartRef.current = new Date();
      }
      
      const timer = setInterval(() => {
        if (sessionStartRef.current && !isPaused) {
          const elapsed = Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000);
          setSessionTime(elapsed - totalPauseTimeRef.current);
        }
      }, 1000);
      
      if (!sessionId) {
        initializeSession();
      }
      
      return () => clearInterval(timer);
    }
  }, [isActive, isPaused]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setCurrentUserText(interimTranscript);
        
        if (finalTranscript) {
          handleUserMessage(finalTranscript.trim());
          setCurrentUserText('');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: "Permisos de micrófono",
            description: "Por favor, permite el acceso al micrófono para usar esta función",
            variant: "destructive",
          });
        }
      };
    }
  }, []);

  const initializeSession = async () => {
    const enhancedConfig = {
      ...config,
      selectedVoice: selectedVoice?.voiceId,
      selectedVoiceName: selectedVoice?.voiceName,
      voicePersonality: selectedVoice?.personality,
      emotionalContext: selectedVoice?.emotionalContext,
      conversationStyle: selectedVoice?.conversationStyle
    };

    const newSessionId = await sessionManager.startSession(enhancedConfig);
    if (newSessionId) {
      setSessionId(newSessionId);
      console.log('Session initialized:', newSessionId);
    }

    if (config.interactionMode === 'call') {
      setCallStatus('ringing');
      setTimeout(() => {
        setCallStatus('connected');
        toast({
          title: "Llamada conectada",
          description: `Conectado con ${selectedVoice?.voiceName}`,
        });
        setTimeout(() => {
          sendInitialGreeting();
        }, 1000);
      }, 3000);
    } else {
      setCallStatus('connected');
      sendInitialGreeting();
    }
  };

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const sendInitialGreeting = async () => {
    setIsSpeaking(true);
    
    try {
      console.log('Sending initial greeting with enhanced AI conversation...');
      
      const { data, error } = await supabase.functions.invoke('enhanced-ai-conversation', {
        body: {
          messages: [
            {
              role: 'user',
              content: 'INICIO_SESION'
            }
          ],
          scenario: {
            title: config.scenarioTitle,
            description: config.scenarioDescription,
            prompt_instructions: config.promptInstructions
          },
          knowledgeBase: []
        },
      });

      if (error) {
        console.error('Error invoking enhanced AI conversation:', error);
        throw error;
      }

      const aiMessage = {
        id: Date.now().toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages([aiMessage]);
      
      if (sessionId) {
        await sessionManager.saveMessage(sessionId, data.response, 'ai', sessionTime);
      }

      // CRÍTICO: Asegurar que el audio se reproduzca
      if (audioEnabled && selectedVoice) {
        console.log('Generating audio for initial greeting...');
        await generateAndPlayAudio(data.response, selectedVoice.voiceId);
      } else {
        setIsSpeaking(false);
      }

      if (config.interactionMode === 'call' && recognitionRef.current) {
        setTimeout(() => {
          if (recognitionRef.current && !isSpeaking) {
            recognitionRef.current.start();
            setIsListening(true);
          }
        }, 500);
      }

    } catch (error) {
      console.error('Error initializing session:', error);
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: "No se pudo inicializar la conversación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const generateAndPlayAudio = async (text: string, voiceId: string) => {
    try {
      console.log('Generating audio for text:', text.substring(0, 50) + '...');
      console.log('Using voice:', voiceId);
      
      initializeAudioContext();
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text, 
          voice: voiceId,
          model: 'eleven_multilingual_v2'
        },
      });

      if (error) {
        console.error('Error in TTS function:', error);
        throw error;
      }

      if (!data || !data.audioContent) {
        console.error('No audio content received from TTS');
        throw new Error('No audio content received');
      }

      console.log('Audio content received, creating audio element...');
      
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      
      // Configurar eventos de audio con más logging
      audio.onloadstart = () => console.log('Audio load started');
      audio.oncanplay = () => console.log('Audio can play');
      audio.onplay = () => {
        console.log('Audio started playing');
        setIsSpeaking(true);
      };
      audio.onended = () => {
        console.log('Audio finished playing');
        setIsSpeaking(false);
        
        // Reactivar reconocimiento de voz si está en modo llamada
        if (config.interactionMode === 'call' && recognitionRef.current && !isPaused) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true);
              console.log('Speech recognition restarted after audio ended');
            } catch (error) {
              console.log('Speech recognition already running or error:', error);
            }
          }, 500);
        }
      };
      audio.onerror = (e) => {
        console.error('Error playing audio:', e);
        setIsSpeaking(false);
        toast({
          title: "Error de audio",
          description: "No se pudo reproducir el audio. Revisa la configuración.",
          variant: "destructive",
        });
      };
      
      // Asegurar que el audio se reproduzca
      try {
        console.log('Attempting to play audio...');
        await audio.play();
        console.log('Audio play() called successfully');
      } catch (playError) {
        console.error('Error calling audio.play():', playError);
        setIsSpeaking(false);
        
        // Mostrar mensaje para que el usuario interactúe si es necesario
        toast({
          title: "Interacción requerida",
          description: "Haz clic en cualquier parte para habilitar el audio",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error generating audio:', error);
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: `Error generando audio: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  const handleUserMessage = async (content: string) => {
    if (!content.trim()) return;

    console.log('Processing user message:', content);

    // Detener reconocimiento de voz mientras se procesa
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    if (sessionId) {
      await sessionManager.saveMessage(sessionId, content, 'user', sessionTime);
    }

    setIsSpeaking(true);

    try {
      console.log('Sending message to enhanced AI conversation...');
      
      const conversationHistory = messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('enhanced-ai-conversation', {
        body: {
          messages: [
            ...conversationHistory,
            {
              role: 'user',
              content: content
            }
          ],
          scenario: {
            title: config.scenarioTitle,
            description: config.scenarioDescription,
            prompt_instructions: config.promptInstructions
          },
          knowledgeBase: []
        },
      });

      if (error) {
        console.error('Error in enhanced AI conversation:', error);
        throw error;
      }

      console.log('AI response received:', data.response);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (sessionId) {
        await sessionManager.saveMessage(sessionId, data.response, 'ai', sessionTime);
      }

      await updateRealTimeMetrics(content, data.response);

      // CRÍTICO: Siempre generar audio para las respuestas
      if (audioEnabled && selectedVoice) {
        console.log('Generating audio for AI response...');
        await generateAndPlayAudio(data.response, selectedVoice.voiceId);
      } else {
        setIsSpeaking(false);
        console.log('Audio disabled or no voice selected');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: "Error en la conversación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const updateRealTimeMetrics = async (userMessage: string, aiResponse: string) => {
    const messageLength = userMessage.length;
    const messageCount = messages.length / 2;
    
    const rapportScore = Math.min(100, Math.max(40, 60 + messageCount * 2 + (messageLength > 50 ? 10 : 0)));
    const clarityScore = Math.min(100, Math.max(50, 70 + (messageLength > 30 ? 15 : -5)));
    const empathyScore = Math.min(100, Math.max(45, 65 + messageCount * 1.5));
    const accuracyScore = Math.min(100, Math.max(60, 80 + (Math.random() * 10 - 5)));
    
    const overallScore = Math.round((rapportScore + clarityScore + empathyScore + accuracyScore) / 4);
    
    const newMetrics = {
      ...realTimeMetrics,
      rapport: Math.round(rapportScore),
      clarity: Math.round(clarityScore),
      empathy: Math.round(empathyScore),
      accuracy: Math.round(accuracyScore),
      overallScore: overallScore,
      trend: (overallScore > realTimeMetrics.overallScore ? 'up' : 
              overallScore < realTimeMetrics.overallScore ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      positivePoints: [
        ...(messageLength > 40 ? ['Respuesta detallada'] : []),
        ...(messageCount > 2 ? ['Conversación fluida'] : []),
        'Tono profesional'
      ],
      suggestions: [
        ...(messageLength < 20 ? ['Intenta dar respuestas más detalladas'] : []),
        ...(messageCount < 3 ? ['Mantén la conversación activa'] : [])
      ]
    };

    setRealTimeMetrics(newMetrics);
    
    if (sessionId) {
      await sessionManager.saveRealTimeMetric(sessionId, 'overall_score', newMetrics.overallScore);
      await sessionManager.saveRealTimeMetric(sessionId, 'rapport_score', newMetrics.rapport);
      await sessionManager.saveRealTimeMetric(sessionId, 'clarity_score', newMetrics.clarity);
      await sessionManager.saveRealTimeMetric(sessionId, 'empathy_score', newMetrics.empathy);
      await sessionManager.saveRealTimeMetric(sessionId, 'accuracy_score', newMetrics.accuracy);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      if (pauseStartRef.current) {
        totalPauseTimeRef.current += Math.floor((Date.now() - pauseStartRef.current.getTime()) / 1000);
        pauseStartRef.current = null;
      }
      
      if (recognitionRef.current && config.interactionMode === 'call') {
        recognitionRef.current.start();
        setIsListening(true);
      }
      
      setIsPaused(false);
      toast({
        title: "Sesión reanudada",
        description: "La conversación continúa",
      });
    } else {
      pauseStartRef.current = new Date();
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      
      setIsPaused(true);
      toast({
        title: "Sesión pausada",
        description: "La conversación está en pausa",
      });
    }
  };

  const toggleMicrophone = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const changeVoice = () => {
    const newVoice = getRandomVoice();
    setSelectedVoice(newVoice);
    toast({
      title: "Voz cambiada",
      description: `Ahora hablas con ${newVoice.voiceName}`,
    });
  };

  const endSession = async () => {
    setIsActive(false);
    setCallStatus('ended');
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (messages.length >= 4) {
      await evaluateSession();
    } else {
      toast({
        title: "Sesión muy corta",
        description: "Continúa la conversación para obtener una evaluación completa",
      });
      onBack();
    }
  };

  const evaluateSession = async () => {
    try {
      const conversationText = messages
        .map(m => `${m.sender === 'user' ? 'Usuario' : 'Cliente'}: ${m.content}`)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('evaluate-response', {
        body: {
          userResponse: conversationText,
          scenario: config.scenario,
          scenarioTitle: config.scenarioTitle,
          scenarioDescription: config.scenarioDescription,
          expectedOutcomes: config.expectedOutcomes,
          clientEmotion: config.clientEmotion,
          sessionDuration: sessionTime,
        },
      });

      if (error) {
        console.error('Error evaluating session:', error);
        throw error;
      }

      const evaluation = {
        rapport: Math.round(Math.max(0, Math.min(100, data.rapport || realTimeMetrics.rapport))),
        clarity: Math.round(Math.max(0, Math.min(100, data.clarity || realTimeMetrics.clarity))),
        empathy: Math.round(Math.max(0, Math.min(100, data.empathy || realTimeMetrics.empathy))),
        accuracy: Math.round(Math.max(0, Math.min(100, data.accuracy || realTimeMetrics.accuracy))),
        overallScore: Math.round(Math.max(0, Math.min(100, data.overallScore || realTimeMetrics.overallScore))),
        strengths: data.strengths || realTimeMetrics.positivePoints,
        improvements: data.improvements || realTimeMetrics.suggestions,
        specificFeedback: data.specificFeedback || 'Sesión completada exitosamente',
        aiAnalysis: data.aiAnalysis || null,
        realTimeMetrics,
        transcript: messages,
        sessionDuration: sessionTime,
        voiceUsed: selectedVoice,
        scenarioInfo: {
          title: config.scenarioTitle,
          description: config.scenarioDescription,
          objectives: config.expectedOutcomes?.objectives || []
        }
      };

      if (sessionId) {
        await sessionManager.endSession(sessionId, evaluation.overallScore);
      }
      onComplete(evaluation);
    } catch (error) {
      console.error('Error evaluating session:', error);
      toast({
        title: "Error en evaluación",
        description: "No se pudo evaluar la sesión, pero se guardó correctamente",
        variant: "destructive",
      });
      
      const fallbackEvaluation = {
        ...realTimeMetrics,
        strengths: realTimeMetrics.positivePoints,
        improvements: realTimeMetrics.suggestions,
        specificFeedback: 'Sesión completada',
        transcript: messages,
        sessionDuration: sessionTime,
        voiceUsed: selectedVoice,
        scenarioInfo: {
          title: config.scenarioTitle,
          description: config.scenarioDescription,
          objectives: config.expectedOutcomes?.objectives || []
        }
      };
      
      if (sessionId) {
        await sessionManager.endSession(sessionId, fallbackEvaluation.overallScore);
      }
      onComplete(fallbackEvaluation);
    }
  };

  const reactivateAgent = async () => {
    try {
      console.log('Reactivating agent...');
      setIsSpeaking(false);
      setIsListening(false);
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Reiniciar audio context
      initializeAudioContext();
      
      // Enviar mensaje de reactivación
      await handleUserMessage("Continúa la conversación");
      
      toast({
        title: "Agente reactivado",
        description: "La conversación ha sido reiniciada",
      });
    } catch (error) {
      console.error('Error reactivating agent:', error);
      toast({
        title: "Error",
        description: "No se pudo reactivar el agente",
        variant: "destructive",
      });
    }
  };

  if (!isActive) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <div className="lg:col-span-2 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <Phone className="h-12 w-12 mx-auto text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">¿Listo para comenzar?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Escenario: {config.scenarioTitle}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Vas a entrenar con {selectedVoice?.voiceName || 'un cliente virtual'}
              </p>
              {selectedVoice && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mb-4 text-sm">
                  <p><strong>Personalidad:</strong> {selectedVoice.personality}</p>
                  <p><strong>Contexto:</strong> {selectedVoice.emotionalContext}</p>
                  <p><strong>Estilo:</strong> {selectedVoice.conversationStyle}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => setIsActive(true)} className="flex-1" size="lg">
                  Iniciar {config.interactionMode === 'call' ? 'Llamada' : 'Chat'}
                </Button>
                <Button onClick={changeVoice} variant="outline" size="lg">
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Configuración</h4>
              <div className="space-y-2 text-sm">
                <div>Escenario: {config.scenarioTitle || config.scenario}</div>
                <div>Cliente: {config.clientEmotion}</div>
                <div>Modo: {config.interactionMode}</div>
                <div>Voz: {selectedVoice?.voiceName || 'Seleccionando...'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <Badge className={`${
              isPaused ? 'bg-orange-100 text-orange-700' :
              callStatus === 'connected' ? 'bg-green-100 text-green-700 animate-pulse' :
              callStatus === 'ringing' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
              'bg-gray-100 text-gray-700'
            }`}>
              {isPaused && '⏸️ PAUSADO'}
              {!isPaused && callStatus === 'connected' && '🔴 EN VIVO'}
              {callStatus === 'ringing' && '📞 CONECTANDO'}
              {callStatus === 'connecting' && '⏳ INICIANDO'}
            </Badge>
            <div className="text-sm">
              <div><strong>Duración:</strong> {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</div>
              <div><strong>Cliente:</strong> {selectedVoice?.voiceName}</div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              className={isPaused ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Reanudar
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </>
              )}
            </Button>

            {config.interactionMode === 'call' && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMicrophone}
                disabled={isPaused}
                className={isListening ? 'bg-red-50 text-red-600' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              disabled={isPaused}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={reactivateAgent}
              disabled={isPaused}
              className="bg-blue-50 text-blue-600"
            >
              🔄 Reactivar
            </Button>
            
            <Button variant="destructive" size="sm" onClick={endSession}>
              <PhoneOff className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>

        <div className="flex-1">
          {config.interactionMode === 'call' ? (
            <Card className="h-[500px] flex flex-col">
              <CardContent className="flex-1 p-6">
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="text-center">
                    <div className="text-xl font-medium mb-2">
                      {isPaused ? 'Sesión Pausada' : `Hablando con ${selectedVoice?.voiceName}`}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {isPaused ? "Presiona Reanudar para continuar" :
                       isSpeaking ? `${selectedVoice?.voiceName} está hablando...` : 
                       isListening ? "Puedes responder ahora..." : 
                       "Conversación en pausa"}
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 rounded-full transition-all duration-300 ${
                          isPaused ? 'bg-orange-400 h-4' :
                          isSpeaking ? 'bg-purple-600 h-12 animate-pulse' : 
                          isListening ? 'bg-green-600 h-8 animate-bounce' : 
                          'bg-gray-400 h-4'
                        }`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ChatInterface
              messages={messages}
              onSendMessage={handleUserMessage}
              isLoading={isSpeaking}
              disabled={isPaused}
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        <RealTimeEvaluation
          metrics={realTimeMetrics}
          isActive={isActive && !isPaused}
          sessionDuration={sessionTime}
          onRequestFeedback={() => {}}
        />

        {config.interactionMode === 'call' && (
          <div className="h-[300px]">
            <ConversationTranscript
              messages={messages}
              isListening={isListening}
              currentUserText={currentUserText}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTrainingInterface;
