
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
  audioUrl?: string;
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
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Initialize session and AI greeting
  const initializeSession = useCallback(async () => {
    try {
      console.log('Initializing training session...');
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "Usuario no autenticado",
          variant: "destructive",
        });
        return;
      }

      const startTime = Date.now();
      setSessionStartTime(startTime);

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
            started_at: new Date(startTime).toISOString(),
            total_messages: 0
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        throw error;
      }

      console.log('Session created successfully:', sessionData);
      setSessionId(sessionData.id);
      setIsSessionActive(true);

      // Send initial AI greeting immediately
      await sendAiGreeting(sessionData.id);

    } catch (error) {
      console.error('Error initializing session:', error);
      toast({
        title: "Error",
        description: "No se pudo inicializar la sesión de entrenamiento",
        variant: "destructive",
      });
    }
  }, [scenario, scenarioTitle, toast]);

  // Send AI greeting
  const sendAiGreeting = async (currentSessionId: string) => {
    try {
      console.log('Sending AI greeting...');
      
      const greetingMessage = `¡Hola! Soy tu cliente virtual para esta simulación: ${scenarioTitle}. Estoy aquí para practicar contigo. ¿Cómo puedo ayudarte hoy?`;
      
      // Create AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        content: greetingMessage,
        timestamp: Date.now()
      };

      setMessages([aiMessage]);

      // Save to database
      await supabase
        .from('conversation_messages')
        .insert({
          session_id: currentSessionId,
          sender: 'ai',
          content: greetingMessage,
          timestamp_in_session: 0
        });

      // Generate and play audio
      await generateAndPlayAudio(greetingMessage);

    } catch (error) {
      console.error('Error sending AI greeting:', error);
    }
  };

  // Generate and play audio with better error handling
  const generateAndPlayAudio = async (text: string) => {
    try {
      setIsAiSpeaking(true);
      console.log('Generating audio for:', text.substring(0, 50) + '...');

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'Sarah' }
      });

      if (error) {
        console.error('TTS Error:', error);
        setIsAiSpeaking(false);
        return;
      }

      if (data?.audioUrl) {
        console.log('Playing audio...');
        
        // Stop any existing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.removeEventListener('ended', handleAudioEnd);
          audioRef.current.removeEventListener('error', handleAudioError);
        }

        // Create and play new audio
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        
        const handleAudioEnd = () => {
          console.log('Audio playback finished');
          setIsAiSpeaking(false);
          // Auto-restart listening after AI speaks
          setTimeout(() => {
            if (isSessionActive && !isListening) {
              startListening();
            }
          }, 500);
        };

        const handleAudioError = (error: any) => {
          console.error('Audio playback error:', error);
          setIsAiSpeaking(false);
        };

        audio.addEventListener('ended', handleAudioEnd);
        audio.addEventListener('error', handleAudioError);

        audio.oncanplaythrough = () => {
          console.log('Audio can play through, starting playback');
          audio.play().catch(error => {
            console.error('Audio play error:', error);
            setIsAiSpeaking(false);
          });
        };

        // Fallback timeout
        setTimeout(() => {
          if (isAiSpeaking) {
            console.log('Audio timeout, stopping AI speaking state');
            setIsAiSpeaking(false);
          }
        }, 30000);
      } else {
        setIsAiSpeaking(false);
      }
    } catch (error) {
      console.error('Error generating/playing audio:', error);
      setIsAiSpeaking(false);
    }
  };

  // Optimized AI response
  const sendToAI = async (userMessage: string) => {
    if (!sessionId) return;

    try {
      setIsProcessing(true);
      console.log('Sending to AI:', userMessage);

      // Get knowledge base for context
      const { data: knowledgeData } = await supabase
        .from('knowledge_base')
        .select('content, ai_summary')
        .limit(3);

      const context = knowledgeData?.map(kb => kb.ai_summary || kb.content?.substring(0, 300)).join('\n') || '';

      const { data, error } = await supabase.functions.invoke('enhanced-ai-conversation', {
        body: {
          message: userMessage,
          sessionId: sessionId,
          scenario: scenarioTitle,
          context: context
        }
      });

      if (error) {
        console.error('AI Conversation Error:', error);
        // Create a fallback response
        const fallbackResponse = "Entiendo tu punto. ¿Podrías contarme más detalles sobre lo que necesitas?";
        
        const aiMessage: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          content: fallbackResponse,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, aiMessage]);
        await generateAndPlayAudio(fallbackResponse);
        return;
      }

      if (data?.response) {
        console.log('AI Response received:', data.response.substring(0, 100) + '...');

        const aiMessage: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          content: data.response,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Save to database
        await supabase
          .from('conversation_messages')
          .insert({
            session_id: sessionId,
            sender: 'ai',
            content: data.response,
            timestamp_in_session: messages.length + 1
          });

        // Generate and play audio
        await generateAndPlayAudio(data.response);
      }

    } catch (error) {
      console.error('Error sending to AI:', error);
      toast({
        title: "Error",
        description: "Error al comunicarse con el agente IA",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Speech recognition setup
  const setupSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Error",
        description: "Reconocimiento de voz no soportado en este navegador",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice input received:', transcript);
      
      if (transcript.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          sender: 'user',
          content: transcript,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);

        // Save user message to database
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

        // Send to AI
        sendToAI(transcript);
      }
      
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      // Auto-retry on certain errors
      if (event.error === 'no-speech' && isSessionActive && !isAiSpeaking) {
        setTimeout(() => {
          startListening();
        }, 2000);
      }
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [sessionId, messages.length, isSessionActive, isAiSpeaking, toast]);

  // Start listening function
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && !isAiSpeaking && isSessionActive) {
      try {
        console.log('Starting voice recognition...');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  }, [isListening, isAiSpeaking, isSessionActive]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log('Stopping voice recognition...');
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // End session
  const endSession = async () => {
    try {
      console.log('Ending training session...');
      
      setIsSessionActive(false);
      stopListening();
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('error', () => {});
      }

      if (sessionId) {
        const durationMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
        
        const { error } = await supabase
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

        if (error) {
          console.error('Error ending session:', error);
        }
      }

      toast({
        title: "Sesión Finalizada",
        description: "La sesión de entrenamiento ha terminado exitosamente",
      });

      onComplete({
        sessionId,
        messages,
        duration: Math.floor((Date.now() - sessionStartTime) / 60000)
      });

    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    setupSpeechRecognition();
    initializeSession();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('error', () => {});
      }
    };
  }, [setupSpeechRecognition, initializeSession]);

  const formatDuration = (startTime: number) => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header mejorado */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
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
                <h1 className="text-2xl font-bold text-slate-900">{scenarioTitle}</h1>
                <p className="text-slate-600 mt-1">{scenarioDescription}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Duración</div>
                <div className="text-lg font-mono font-bold text-slate-900">
                  {formatDuration(sessionStartTime)}
                </div>
              </div>
              <Badge 
                variant={isSessionActive ? 'default' : 'secondary'}
                className={isSessionActive ? 'bg-green-500 hover:bg-green-600' : ''}
              >
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
        </div>

        {/* Control Panel mejorado */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {/* Estado del micrófono */}
              <div className="flex flex-col items-center space-y-2">
                <div className={`p-4 rounded-full ${isListening ? 'bg-green-100 border-2 border-green-300' : 'bg-slate-100'}`}>
                  {isListening ? (
                    <Mic className="h-8 w-8 text-green-600 animate-pulse" />
                  ) : (
                    <MicOff className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-slate-900">
                    {isListening ? 'Escuchando' : 'En Espera'}
                  </div>
                  <div className="text-xs text-slate-500">Micrófono</div>
                </div>
              </div>

              {/* Control principal */}
              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isAiSpeaking || !isSessionActive}
                  size="lg"
                  className={`h-16 w-16 rounded-full ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isListening ? (
                    <Phone className="h-8 w-8" />
                  ) : (
                    <Phone className="h-8 w-8" />
                  )}
                </Button>
                <span className="text-sm font-medium text-slate-700">
                  {isListening ? 'Presiona para detener' : 'Presiona para hablar'}
                </span>
              </div>

              {/* Estado del AI */}
              <div className="flex flex-col items-center space-y-2">
                <div className={`p-4 rounded-full ${isAiSpeaking ? 'bg-blue-100 border-2 border-blue-300' : 'bg-slate-100'}`}>
                  {isAiSpeaking ? (
                    <Volume2 className="h-8 w-8 text-blue-600 animate-pulse" />
                  ) : (
                    <VolumeX className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-slate-900">
                    {isAiSpeaking ? 'IA Hablando' : 'IA Silenciosa'}
                  </div>
                  <div className="text-xs text-slate-500">Audio</div>
                </div>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center mt-4 p-3 bg-blue-50 rounded-lg">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">Procesando respuesta...</span>
            </div>
          )}
        </div>

        {/* Conversation Display mejorado */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-slate-600" />
              <span>Conversación en Tiempo Real</span>
              <Badge variant="secondary" className="ml-auto">
                {messages.length} mensajes
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 text-lg">Iniciando conversación...</p>
                  <p className="text-slate-400 text-sm mt-2">La conversación aparecerá aquí</p>
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
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span className={`text-xs mt-2 block ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-500' : 'bg-slate-400'}`} />
              <span className="text-slate-600">
                {isSessionActive ? 'Sesión activa - Habla naturalmente' : 'Sesión inactiva'}
              </span>
            </div>
            <div className="text-slate-400">•</div>
            <span className="text-slate-500">
              Reconocimiento de voz en español
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrainingInterface;
