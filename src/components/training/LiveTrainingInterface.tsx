
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, MessageSquare, Phone, PhoneOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: number;
}

interface LiveTrainingInterfaceProps {
  scenario: string;
  scenarioTitle: string;
  scenarioDescription: string;
  onComplete: (evaluation: any) => void;
  onBack: () => void;
}

const LiveTrainingInterface: React.FC<LiveTrainingInterfaceProps> = ({
  scenario,
  scenarioTitle,
  scenarioDescription,
  onComplete,
  onBack
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStartTime] = useState<number>(Date.now());
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitializedRef = useRef(false);
  const { toast } = useToast();

  // Función de limpieza mejorada
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up resources...');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
      recognitionRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    setIsListening(false);
    setIsAiSpeaking(false);
    setIsProcessing(false);
  }, []);

  // Inicialización única de la sesión
  const initializeSession = useCallback(async () => {
    if (isInitializedRef.current) {
      console.log('🚫 Session already initialized');
      return;
    }
    
    isInitializedRef.current = true;
    console.log('🚀 Initializing training session...');
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "Usuario no autenticado",
          variant: "destructive",
        });
        return;
      }

      const { data: sessionData, error } = await supabase
        .from('training_sessions')
        .insert({
          scenario_id: scenario,
          user_id: user.user.id,
          duration_minutes: 0,
          score: 0,
          conversation_log: {
            scenario_title: scenarioTitle,
            interaction_mode: 'call',
            session_status: 'active',
            started_at: new Date(sessionStartTime).toISOString(),
            total_messages: 0
          }
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating session:', error);
        throw error;
      }

      console.log('✅ Session created:', sessionData.id);
      setSessionId(sessionData.id);
      setIsSessionActive(true);

      // Mensaje de bienvenida del AI
      await sendAiGreeting(sessionData.id);

    } catch (error) {
      console.error('❌ Error initializing session:', error);
      isInitializedRef.current = false;
      toast({
        title: "Error",
        description: "No se pudo inicializar la sesión",
        variant: "destructive",
      });
    }
  }, [scenario, scenarioTitle, sessionStartTime, toast]);

  // Saludo inicial del AI
  const sendAiGreeting = async (currentSessionId: string) => {
    try {
      console.log('👋 Sending AI greeting...');
      
      const greetingMessage = "¡Hola! Soy tu cliente para esta simulación de entrenamiento. Estoy interesado en conocer más sobre sus servicios. ¿Cómo me puede ayudar?";
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        content: greetingMessage,
        timestamp: Date.now()
      };

      setMessages([aiMessage]);

      // Guardar en base de datos
      await supabase
        .from('conversation_messages')
        .insert({
          session_id: currentSessionId,
          sender: 'ai',
          content: greetingMessage,
          timestamp_in_session: 0
        });

      // Generar audio
      await generateAndPlayAudio(greetingMessage);

    } catch (error) {
      console.error('❌ Error sending AI greeting:', error);
    }
  };

  // Generar y reproducir audio sin duplicaciones
  const generateAndPlayAudio = async (text: string) => {
    if (isAiSpeaking) {
      console.log('🚫 AI already speaking, skipping...');
      return;
    }

    try {
      setIsAiSpeaking(true);
      console.log('🔊 Generating audio for:', text.substring(0, 50) + '...');

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'Sarah' }
      });

      if (error || !data?.audioUrl) {
        console.error('❌ TTS Error:', error);
        setIsAiSpeaking(false);
        return;
      }

      console.log('🎵 Playing audio...');
      
      // Limpiar audio anterior
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        console.log('✅ Audio finished');
        setIsAiSpeaking(false);
        // Reiniciar escucha después de un breve delay
        setTimeout(() => {
          if (isSessionActive && !isListening) {
            startListening();
          }
        }, 500);
      };

      audio.onerror = (error) => {
        console.error('❌ Audio error:', error);
        setIsAiSpeaking(false);
      };

      await audio.play();

    } catch (error) {
      console.error('❌ Error in audio generation:', error);
      setIsAiSpeaking(false);
    }
  };

  // Enviar mensaje al AI
  const sendToAI = async (userMessage: string) => {
    if (!sessionId || isProcessing) return;

    try {
      setIsProcessing(true);
      console.log('🤖 Sending to AI:', userMessage);

      const { data, error } = await supabase.functions.invoke('enhanced-ai-conversation', {
        body: {
          message: userMessage,
          sessionId: sessionId,
          scenario: scenarioTitle,
          context: scenarioDescription
        }
      });

      if (error) {
        console.error('❌ AI Error:', error);
        throw error;
      }

      if (data?.response) {
        console.log('✅ AI Response received');

        const aiMessage: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          content: data.response,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Guardar en base de datos
        await supabase
          .from('conversation_messages')
          .insert({
            session_id: sessionId,
            sender: 'ai',
            content: data.response,
            timestamp_in_session: messages.length + 1
          });

        // Generar audio
        await generateAndPlayAudio(data.response);
      }

    } catch (error) {
      console.error('❌ Error sending to AI:', error);
      toast({
        title: "Error",
        description: "Error al comunicarse con el cliente virtual",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Configurar reconocimiento de voz una sola vez
  const setupSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Error",
        description: "Reconocimiento de voz no soportado",
        variant: "destructive",
      });
      return;
    }

    if (recognitionRef.current) {
      console.log('✅ Speech recognition already set up');
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('🗣️ Voice input:', transcript);
      
      if (transcript.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          sender: 'user',
          content: transcript,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);

        // Guardar mensaje del usuario
        if (sessionId) {
          supabase
            .from('conversation_messages')
            .insert({
              session_id: sessionId,
              sender: 'user',
              content: transcript,
              timestamp_in_session: messages.length
            });
        }

        sendToAI(transcript);
      }
      
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('🔇 Voice recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    console.log('✅ Speech recognition configured');
  }, [sessionId, messages.length, toast]);

  // Iniciar escucha
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening || isAiSpeaking || !isSessionActive) {
      return;
    }

    try {
      console.log('🎤 Starting voice recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('❌ Error starting recognition:', error);
    }
  }, [isListening, isAiSpeaking, isSessionActive]);

  // Detener escucha
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log('🔇 Stopping voice recognition...');
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Finalizar sesión
  const endSession = async () => {
    try {
      console.log('🏁 Ending session...');
      
      setIsSessionActive(false);
      cleanup();

      if (sessionId) {
        const durationMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
        
        await supabase
          .from('training_sessions')
          .update({
            completed_at: new Date().toISOString(),
            duration_minutes: durationMinutes,
            conversation_log: {
              scenario_title: scenarioTitle,
              interaction_mode: 'call',
              session_status: 'completed',
              started_at: new Date(sessionStartTime).toISOString(),
              ended_at: new Date().toISOString(),
              total_messages: messages.length
            }
          })
          .eq('id', sessionId);
      }

      toast({
        title: "Sesión Finalizada",
        description: "Entrenamiento completado exitosamente",
      });

      onComplete({
        sessionId,
        messages,
        duration: Math.floor((Date.now() - sessionStartTime) / 60000)
      });

    } catch (error) {
      console.error('❌ Error ending session:', error);
    }
  };

  // Efectos
  useEffect(() => {
    initializeSession();
    return cleanup;
  }, []);

  useEffect(() => {
    if (isSessionActive) {
      setupSpeechRecognition();
    }
  }, [isSessionActive, setupSpeechRecognition]);

  // Función para formatear duración
  const formatDuration = (startTime: number) => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Entrenamiento de Ventas</h1>
                  <p className="text-gray-600 mt-1">Simulación con cliente virtual</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Duración</div>
                  <div className="text-lg font-mono font-bold text-gray-900">
                    {formatDuration(sessionStartTime)}
                  </div>
                </div>
                <Badge variant={isSessionActive ? 'default' : 'secondary'}>
                  {isSessionActive ? 'En Vivo' : 'Inactivo'}
                </Badge>
                {isSessionActive && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={endSession}
                    className="flex items-center space-x-2"
                  >
                    <PhoneOff className="h-4 w-4" />
                    <span>Finalizar</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-12">
                {/* Microphone status */}
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full transition-all ${
                    isListening ? 'bg-green-100 border-2 border-green-400 shadow-lg' : 'bg-gray-100'
                  }`}>
                    {isListening ? (
                      <Mic className="h-8 w-8 text-green-600 animate-pulse" />
                    ) : (
                      <MicOff className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {isListening ? 'Escuchando' : 'En Espera'}
                    </div>
                    <div className="text-xs text-gray-500">Micrófono</div>
                  </div>
                </div>

                {/* Main control */}
                <div className="flex flex-col items-center space-y-4">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isAiSpeaking || !isSessionActive}
                    size="lg"
                    className={`h-20 w-20 rounded-full transition-all shadow-lg ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Phone className="h-10 w-10" />
                  </Button>
                  <span className="text-sm font-medium text-gray-700">
                    {isListening ? 'Presiona para detener' : 'Presiona para hablar'}
                  </span>
                </div>

                {/* AI status */}
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full transition-all ${
                    isAiSpeaking ? 'bg-blue-100 border-2 border-blue-400 shadow-lg' : 'bg-gray-100'
                  }`}>
                    {isAiSpeaking ? (
                      <Volume2 className="h-8 w-8 text-blue-600 animate-pulse" />
                    ) : (
                      <VolumeX className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {isAiSpeaking ? 'Cliente Hablando' : 'Cliente Silencioso'}
                    </div>
                    <div className="text-xs text-gray-500">Audio</div>
                  </div>
                </div>
              </div>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center mt-6 p-4 bg-blue-50 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-3" />
                <span className="text-sm font-medium text-blue-700">Procesando respuesta del cliente...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation Display */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <MessageSquare className="h-5 w-5" />
              <span>Conversación en Tiempo Real</span>
              <Badge variant="secondary" className="ml-auto">
                {messages.length} mensajes
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">Iniciando conversación...</p>
                  <p className="text-gray-400 text-sm mt-2">La conversación aparecerá aquí</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span className={`text-xs mt-2 block ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Bar */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-gray-600">
                  {isSessionActive ? 'Sesión activa - Habla naturalmente' : 'Sesión inactiva'}
                </span>
              </div>
              <div className="text-gray-300">•</div>
              <span className="text-gray-600">
                Reconocimiento de voz en español
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveTrainingInterface;
