
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, MessageSquare } from 'lucide-react';
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

interface TrainingConfig {
  scenario: string;
  scenarioTitle: string;
  scenarioDescription: string;
  promptInstructions?: string;
  expectedOutcomes?: any;
  clientEmotion: string;
  interactionMode: string;
  behaviors: any;
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

      const { data: sessionData, error } = await supabase
        .from('training_sessions')
        .insert({
          scenario_id: scenario,
          session_status: 'active',
          interaction_mode: 'call',
          user_id: user.user.id
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
  }, [scenario, toast]);

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
        }

        // Create and play new audio
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        
        audio.oncanplaythrough = () => {
          console.log('Audio can play through, starting playback');
          audio.play().catch(error => {
            console.error('Audio play error:', error);
            setIsAiSpeaking(false);
          });
        };

        audio.onended = () => {
          console.log('Audio playback finished');
          setIsAiSpeaking(false);
          // Auto-restart listening after AI speaks
          setTimeout(() => {
            if (isSessionActive && !isListening) {
              startListening();
            }
          }, 500);
        };

        audio.onerror = (error) => {
          console.error('Audio playback error:', error);
          setIsAiSpeaking(false);
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
      }

      if (sessionId) {
        const { error } = await supabase
          .from('training_sessions')
          .update({
            completed_at: new Date().toISOString(),
            session_status: 'completed',
            total_messages: messages.length,
            duration_minutes: Math.floor((Date.now() - (messages[0]?.timestamp || Date.now())) / 60000)
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
        duration: Math.floor((Date.now() - (messages[0]?.timestamp || Date.now())) / 60000)
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
      }
    };
  }, [setupSpeechRecognition, initializeSession]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6" />
              <span>Entrenamiento en Vivo - {scenarioTitle}</span>
            </span>
            <div className="flex items-center space-x-2">
              <Badge variant={isSessionActive ? 'default' : 'secondary'}>
                {isSessionActive ? 'Activo' : 'Inactivo'}
              </Badge>
              <Button variant="outline" size="sm" onClick={onBack}>
                Volver
              </Button>
              {isSessionActive && (
                <Button variant="destructive" size="sm" onClick={endSession}>
                  Finalizar Sesión
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Controls */}
          <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {isListening ? (
                <Mic className="h-5 w-5 text-green-600 animate-pulse" />
              ) : (
                <MicOff className="h-5 w-5 text-gray-600" />
              )}
              <span className="text-sm font-medium">
                {isListening ? 'Escuchando...' : 'En espera'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {isAiSpeaking ? (
                <Volume2 className="h-5 w-5 text-blue-600 animate-pulse" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-600" />
              )}
              <span className="text-sm font-medium">
                {isAiSpeaking ? 'IA Hablando...' : 'IA Silenciosa'}
              </span>
            </div>

            {isProcessing && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium">Procesando...</span>
              </div>
            )}

            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isAiSpeaking || !isSessionActive}
              variant={isListening ? "destructive" : "default"}
              size="sm"
            >
              {isListening ? 'Detener' : 'Hablar'}
            </Button>
          </div>

          {/* Conversation Display */}
          <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-3 bg-white">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Iniciando conversación con el agente IA...</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Session Info */}
          <div className="text-center text-sm text-gray-600">
            {isSessionActive ? (
              <p>✅ Conversación automática activa - Habla naturalmente para continuar</p>
            ) : (
              <p>❌ Sesión inactiva</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveTrainingInterface;
