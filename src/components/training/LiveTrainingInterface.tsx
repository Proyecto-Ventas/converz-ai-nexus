
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, MessageSquare, Phone, ArrowLeft, Volume2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionManager } from './SessionManager';
import ChatInterface from './ChatInterface';

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
  // Estados principales
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [interactionMode, setInteractionMode] = useState<'chat' | 'voice'>('chat');
  const [clientPersonality, setClientPersonality] = useState('neutral');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Referencias
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionStartTime = useRef<Date | null>(null);

  // Hooks
  const { toast } = useToast();
  const sessionManager = useSessionManager();

  // Configuración de personalidades
  const personalities = [
    { value: 'neutral', label: 'Neutral', color: 'bg-gray-100 text-gray-700' },
    { value: 'curious', label: 'Curioso', color: 'bg-blue-100 text-blue-700' },
    { value: 'skeptical', label: 'Escéptico', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'hurried', label: 'Apurado', color: 'bg-orange-100 text-orange-700' },
    { value: 'indecisive', label: 'Indeciso', color: 'bg-purple-100 text-purple-700' },
    { value: 'annoyed', label: 'Molesto', color: 'bg-red-100 text-red-700' },
    { value: 'interested', label: 'Interesado', color: 'bg-green-100 text-green-700' }
  ];

  // Inicializar reconocimiento de voz
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Error",
        description: "Tu navegador no soporta reconocimiento de voz",
        variant: "destructive",
      });
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0].transcript;
      if (transcript.trim()) {
        handleUserMessage(transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast({
          title: "Error de reconocimiento",
          description: "No se pudo procesar el audio. Intenta de nuevo.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return true;
  }, [toast]);

  // Obtener datos del escenario
  const getScenarioData = useCallback(async () => {
    try {
      const { data: scenarioData, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', scenario)
        .single();

      if (error) throw error;
      return scenarioData;
    } catch (error) {
      console.error('Error getting scenario:', error);
      return {
        id: scenario,
        title: scenarioTitle,
        description: scenarioDescription,
        scenario_type: 'sales',
        difficulty_level: 1
      };
    }
  }, [scenario, scenarioTitle, scenarioDescription]);

  // Obtener base de conocimiento
  const getKnowledgeBase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('title, content, document_type')
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting knowledge base:', error);
      return [];
    }
  }, []);

  // Manejar mensaje del usuario
  const handleUserMessage = async (content: string) => {
    if (isProcessing || !isActive) return;

    setIsProcessing(true);
    
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Guardar mensaje en la base de datos
    if (sessionId) {
      await sessionManager.saveMessage(
        sessionId, 
        content, 
        'user', 
        Math.floor((Date.now() - (sessionStartTime.current?.getTime() || 0)) / 1000)
      );
    }

    try {
      // Obtener datos necesarios
      const [scenarioData, knowledgeBase] = await Promise.all([
        getScenarioData(),
        getKnowledgeBase()
      ]);

      // Preparar mensajes para la IA
      const conversationMessages = messages.concat(userMessage).map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Llamar a la función de IA
      const { data, error } = await supabase.functions.invoke('enhanced-ai-conversation', {
        body: {
          messages: conversationMessages,
          scenario: scenarioData,
          knowledgeBase,
          clientPersonality,
          evaluationMode: true
        }
      });

      if (error) throw error;

      const aiResponse = data.response;
      if (aiResponse) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);

        // Guardar respuesta de la IA
        if (sessionId) {
          await sessionManager.saveMessage(
            sessionId, 
            aiResponse, 
            'ai', 
            Math.floor((Date.now() - (sessionStartTime.current?.getTime() || 0)) / 1000)
          );
        }

        // Reproducir audio si está en modo voz
        if (interactionMode === 'voice') {
          await playAIResponse(aiResponse);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reproducir respuesta de la IA
  const playAIResponse = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice: 'Sarah', // Voz por defecto
          model_id: 'eleven_monolingual_v1'
        }
      });

      if (error) throw error;

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          // Reiniciar reconocimiento de voz después de que termine el audio
          if (interactionMode === 'voice' && isActive) {
            setTimeout(() => {
              startListening();
            }, 500);
          }
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing AI response:', error);
    }
  };

  // Iniciar/detener escucha
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Iniciar sesión de entrenamiento
  const startTraining = async () => {
    try {
      const sessionConfig = {
        scenario,
        scenarioTitle,
        clientPersonality,
        interactionMode
      };

      const newSessionId = await sessionManager.startSession(sessionConfig);
      if (newSessionId) {
        setSessionId(newSessionId);
        setIsActive(true);
        sessionStartTime.current = new Date();
        
        // Mensaje inicial del sistema
        const welcomeMessage: Message = {
          id: 'welcome',
          content: `¡Hola! Soy tu cliente para este entrenamiento de ${scenarioTitle}. ¿En qué puedo ayudarte?`,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);

        if (interactionMode === 'voice') {
          await playAIResponse(welcomeMessage.content);
        }

        toast({
          title: "¡Entrenamiento iniciado!",
          description: `Modo: ${interactionMode === 'voice' ? 'Voz' : 'Chat'} | Cliente: ${personalities.find(p => p.value === clientPersonality)?.label}`,
        });
      }
    } catch (error) {
      console.error('Error starting training:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento",
        variant: "destructive",
      });
    }
  };

  // Finalizar entrenamiento
  const endTraining = async () => {
    setIsActive(false);
    stopListening();

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (sessionId) {
      const finalScore = Math.floor(Math.random() * 40) + 60; // Score simulado
      await sessionManager.endSession(sessionId, finalScore);

      const evaluation = {
        sessionId,
        score: finalScore,
        messages: messages.length,
        duration: sessionStartTime.current ? 
          Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000) : 0,
        clientPersonality,
        interactionMode
      };

      onComplete(evaluation);
    }
  };

  // Efectos
  useEffect(() => {
    if (interactionMode === 'voice') {
      initializeSpeechRecognition();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [interactionMode, initializeSpeechRecognition]);

  const selectedPersonality = personalities.find(p => p.value === clientPersonality);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge className={selectedPersonality?.color}>
              Cliente: {selectedPersonality?.label}
            </Badge>
            <Badge variant="outline">
              {interactionMode === 'voice' ? <Phone className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
              {interactionMode === 'voice' ? 'Voz' : 'Chat'}
            </Badge>
            {isActive && (
              <Badge variant="default" className="bg-green-100 text-green-700">
                En vivo
              </Badge>
            )}
          </div>
        </div>

        {!isActive ? (
          // Configuración inicial
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Configurar Entrenamiento</CardTitle>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900">{scenarioTitle}</h2>
                <p className="text-slate-600 mt-2">{scenarioDescription}</p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Modo de Interacción</label>
                <Select value={interactionMode} onValueChange={(value: 'chat' | 'voice') => setInteractionMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat (Texto)
                      </div>
                    </SelectItem>
                    <SelectItem value="voice">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Voz (Audio)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Personalidad del Cliente</label>
                <Select value={clientPersonality} onValueChange={setClientPersonality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {personalities.map((personality) => (
                      <SelectItem key={personality.value} value={personality.value}>
                        {personality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={startTraining} className="w-full" size="lg">
                Iniciar Entrenamiento
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Interfaz de entrenamiento activa
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Panel de conversación */}
            <div className="lg:col-span-3">
              {interactionMode === 'chat' ? (
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleUserMessage}
                  isLoading={isProcessing}
                  disabled={!isActive}
                />
              ) : (
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Entrenamiento por Voz</span>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        {isListening && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg max-w-[80%] ${
                            message.sender === 'user'
                              ? 'bg-blue-500 text-white ml-auto'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <Button
                        onClick={toggleListening}
                        disabled={isProcessing}
                        size="lg"
                        className={`w-20 h-20 rounded-full ${
                          isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : isListening ? (
                          <MicOff className="h-8 w-8" />
                        ) : (
                          <Mic className="h-8 w-8" />
                        )}
                      </Button>
                      <p className="text-sm text-gray-600 mt-2">
                        {isProcessing ? 'Procesando...' : isListening ? 'Escuchando...' : 'Presiona para hablar'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Panel de control */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Estado de la Sesión</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Mensajes:</span>
                    <span>{messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo:</span>
                    <span>
                      {sessionStartTime.current ? 
                        `${Math.floor((Date.now() - sessionStartTime.current.getTime()) / 60000)}m` : 
                        '0m'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={endTraining} 
                variant="destructive" 
                className="w-full"
              >
                Finalizar Entrenamiento
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTrainingInterface;
