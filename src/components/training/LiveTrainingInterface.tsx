
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, MessageSquare, Phone, ArrowLeft, Volume2, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionManager } from './SessionManager';
import ChatInterface from './ChatInterface';
import VoiceSelectorSimple from '@/components/voices/VoiceSelectorSimple';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('Sarah');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  // Referencias
  const sessionStartTime = useRef<Date | null>(null);
  const conversationInProgress = useRef(false);

  // Hooks
  const { toast } = useToast();
  const sessionManager = useSessionManager();

  // Speech recognition hook
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
    language: 'es-ES',
    continuous: false
  });

  // Audio player hook
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer({
    onAudioEnd: () => {
      if (interactionMode === 'voice' && isActive && !conversationInProgress.current) {
        setTimeout(() => {
          if (!isProcessing) {
            startListening();
          }
        }, 500);
      }
    }
  });

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

  // Cargar preferencias guardadas
  useEffect(() => {
    const savedVoice = localStorage.getItem('selectedVoice');
    const savedVoiceName = localStorage.getItem('selectedVoiceName');
    const savedPersonality = localStorage.getItem('clientPersonality');
    const savedMode = localStorage.getItem('interactionMode');

    if (savedVoice) setSelectedVoice(savedVoice);
    if (savedVoiceName) setSelectedVoiceName(savedVoiceName);
    if (savedPersonality) setClientPersonality(savedPersonality);
    if (savedMode) setInteractionMode(savedMode as 'chat' | 'voice');
  }, []);

  // Guardar preferencias
  const savePreferences = useCallback(() => {
    localStorage.setItem('selectedVoice', selectedVoice);
    localStorage.setItem('selectedVoiceName', selectedVoiceName);
    localStorage.setItem('clientPersonality', clientPersonality);
    localStorage.setItem('interactionMode', interactionMode);
  }, [selectedVoice, selectedVoiceName, clientPersonality, interactionMode]);

  useEffect(() => {
    savePreferences();
  }, [savePreferences]);

  // Manejar resultado del reconocimiento de voz
  function handleSpeechResult(transcript: string) {
    if (transcript.trim() && !isProcessing) {
      handleUserMessage(transcript.trim());
    }
  }

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

    conversationInProgress.current = true;
    setIsProcessing(true);
    
    // Detener audio y reconocimiento
    if (isPlaying) stopAudio();
    if (isListening) stopListening();
    
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
          await playAudio(aiResponse, selectedVoiceName);
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
      conversationInProgress.current = false;
    }
  };

  // Iniciar sesión de entrenamiento
  const startTraining = async () => {
    try {
      const sessionConfig = {
        scenario,
        scenarioTitle,
        clientPersonality,
        interactionMode,
        selectedVoice,
        selectedVoiceName
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
          await playAudio(welcomeMessage.content, selectedVoiceName);
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
    stopAudio();
    conversationInProgress.current = false;

    if (sessionId) {
      const finalScore = Math.floor(Math.random() * 40) + 60;
      await sessionManager.endSession(sessionId, finalScore);

      const evaluation = {
        sessionId,
        score: finalScore,
        messages: messages.length,
        duration: sessionStartTime.current ? 
          Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000) : 0,
        clientPersonality,
        interactionMode,
        selectedVoice,
        selectedVoiceName
      };

      onComplete(evaluation);
    }
  };

  // Manejar selección de voz
  const handleVoiceSelect = (voiceId: string, voiceName: string) => {
    setSelectedVoice(voiceId);
    setSelectedVoiceName(voiceName);
    setShowVoiceSelector(false);
  };

  const selectedPersonality = personalities.find(p => p.value === clientPersonality);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-3 shadow-sm">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge className={selectedPersonality?.color} variant="secondary">
              {selectedPersonality?.label}
            </Badge>
            <Badge variant="outline">
              {interactionMode === 'voice' ? <Phone className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
              {interactionMode === 'voice' ? 'Voz' : 'Chat'}
            </Badge>
            {isActive && (
              <Badge className="bg-green-100 text-green-700">
                En vivo
              </Badge>
            )}
          </div>
        </div>

        {!isActive ? (
          // Configuración inicial compacta
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{scenarioTitle}</CardTitle>
                  <p className="text-sm text-slate-600">{scenarioDescription}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Modo</label>
                      <Select value={interactionMode} onValueChange={(value: 'chat' | 'voice') => setInteractionMode(value)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chat">
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Chat
                            </div>
                          </SelectItem>
                          <SelectItem value="voice">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              Voz
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Cliente</label>
                      <Select value={clientPersonality} onValueChange={setClientPersonality}>
                        <SelectTrigger className="h-9">
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
                  </div>

                  {interactionMode === 'voice' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Voz del Agente</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {selectedVoiceName || 'Seleccionar'}
                        </Button>
                      </div>
                      
                      {showVoiceSelector && (
                        <div className="border rounded-lg p-3 bg-slate-50">
                          <VoiceSelectorSimple
                            selectedVoice={selectedVoice}
                            onVoiceSelect={handleVoiceSelect}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <Button onClick={startTraining} className="w-full" size="lg">
                    Iniciar Entrenamiento
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Cómo funciona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-xs">1</span>
                    </div>
                    <span>Configura el modo y personalidad</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-xs">2</span>
                    </div>
                    <span>Practica en tiempo real</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-xs">3</span>
                    </div>
                    <span>Recibe evaluación detallada</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Interfaz de entrenamiento activa compacta
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-160px)]">
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
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>Entrenamiento por Voz</span>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        {isListening && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-4">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg max-w-[85%] ${
                            message.sender === 'user'
                              ? 'bg-blue-500 text-white ml-auto'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <Button
                        onClick={() => isListening ? stopListening() : startListening()}
                        disabled={isProcessing || isPlaying}
                        size="lg"
                        className={`w-16 h-16 rounded-full ${
                          isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {isProcessing || isPlaying ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : isListening ? (
                          <MicOff className="h-6 w-6" />
                        ) : (
                          <Mic className="h-6 w-6" />
                        )}
                      </Button>
                      <p className="text-xs text-gray-600 mt-2">
                        {isProcessing ? 'Procesando...' : 
                         isPlaying ? 'Reproduciendo...' :
                         isListening ? 'Escuchando...' : 'Presiona para hablar'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Panel de control compacto */}
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Estado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
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
                  {interactionMode === 'voice' && (
                    <div className="flex justify-between">
                      <span>Voz:</span>
                      <span className="text-xs">{selectedVoiceName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button 
                onClick={endTraining} 
                variant="destructive" 
                className="w-full"
                size="sm"
              >
                Finalizar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTrainingInterface;
