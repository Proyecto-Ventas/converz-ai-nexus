
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Phone, PhoneOff, ArrowLeft, Volume2, VolumeX, Settings, MessageSquare, Headphones, Activity, Zap } from 'lucide-react';
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
  const [isSessionEnding, setIsSessionEnding] = useState(false);
  const [conversationHistoryId, setConversationHistoryId] = useState<string | null>(null);

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
      if (mode === 'call' && result.trim() && !isProcessing && !waitingForAI) {
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
      if (mode === 'call' && !isListening && !isSessionEnding) {
        setTimeout(() => {
          startListening();
        }, 150); // Reducido de 200ms a 150ms para mayor fluidez
      }
    }
  });
  
  // Improved real-time metrics system
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

  const lastMessageTime = useRef<number>(Date.now());
  const evaluationInterval = useRef<NodeJS.Timeout>();
  const messageHistory = useRef<Message[]>([]);
  const sessionEndingRef = useRef(false);

  // Crear historial de conversación
  const createConversationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .insert({
          user_id: sessionManager.getCurrentSession()?.user_id,
          session_id: sessionId,
          scenario_title: scenarioTitle,
          mode: mode,
          client_emotion: clientEmotion,
          voice_used: selectedVoiceName,
          conversation_data: []
        })
        .select()
        .single();

      if (error) throw error;
      setConversationHistoryId(data.id);
      console.log('Conversation history created:', data.id);
    } catch (error) {
      console.error('Error creating conversation history:', error);
    }
  };

  // Actualizar historial de conversación
  const updateConversationHistory = async () => {
    if (!conversationHistoryId) return;

    try {
      const conversationData = messageHistory.current.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp.toISOString()
      }));

      const { error } = await supabase
        .from('conversation_history')
        .update({
          conversation_data: conversationData,
          total_messages: messageHistory.current.length,
          duration_seconds: Math.floor((Date.now() - sessionStartTime) / 1000),
          final_score: realTimeMetrics.overallScore
        })
        .eq('id', conversationHistoryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating conversation history:', error);
    }
  };

  // Initialize session
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
        
        // Crear historial de conversación
        await createConversationHistory();
        
        const welcomeMessage = getWelcomeMessage();
        await addMessage(welcomeMessage, 'ai', newSessionId);
        
        if (mode === 'call') {
          console.log('Starting call mode with immediate audio and listening...');
          await generateAndPlayAudio(welcomeMessage);
        }
      }
    };

    initSession();

    evaluationInterval.current = setInterval(() => {
      if (!sessionEndingRef.current) {
        updateRealTimeEvaluation();
        updateConversationHistory(); // Guardar progreso cada 10 segundos
      }
    }, 10000);

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
    
    const sessionIdToUse = currentSessionId || sessionId;
    if (sessionIdToUse) {
      await sessionManager.saveMessage(sessionIdToUse, content, sender, timestampInSession);
    }

    if (sender === 'user') {
      lastMessageTime.current = Date.now();
      setTimeout(() => updateRealTimeEvaluation(), 100);
    }

    return newMessage;
  };

  const updateRealTimeEvaluation = () => {
    if (sessionEndingRef.current) return;
    
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const userMessages = messageHistory.current.filter(m => m.sender === 'user');
    const aiMessages = messageHistory.current.filter(m => m.sender === 'ai');
    const responseTime = (Date.now() - lastMessageTime.current) / 1000;

    // Enhanced evaluation algorithm with proper scoring
    let rapport = 35;
    let clarity = 40;
    let empathy = 35;
    let accuracy = 45;

    if (userMessages.length > 0) {
      // Rapport improvements - More generous scoring
      rapport += Math.min(35, userMessages.length * 10);
      if (userMessages.some(m => /hola|buenos días|buenas tardes|mucho gusto|mi nombre es|gracias|perfecto|excelente/i.test(m.content))) {
        rapport += 25;
      }
      if (userMessages.some(m => /cómo está|espero que|me da mucho gusto|entiendo su situación/i.test(m.content))) {
        rapport += 15;
      }

      // Clarity improvements - Better scoring
      const avgMessageLength = userMessages.reduce((acc, m) => acc + m.content.length, 0) / userMessages.length;
      if (avgMessageLength > 30) clarity += 30;
      if (avgMessageLength > 80) clarity += 25;
      
      const hasStructuredResponses = userMessages.some(m => 
        /primero|segundo|tercero|por un lado|por otro lado|en primer lugar/i.test(m.content)
      );
      if (hasStructuredResponses) clarity += 20;

      // Empathy improvements - More comprehensive
      const empathyKeywords = /entiendo|comprendo|disculpe|perdón|me imagino|siento|lamento|entiendo su situación|me pongo en su lugar|debe ser difícil|lo comprendo perfectamente/i;
      const empathyCount = userMessages.filter(m => empathyKeywords.test(m.content)).length;
      empathy += Math.min(40, empathyCount * 15);
      
      const hasActiveListening = userMessages.some(m => 
        /según lo que me dice|si entiendo bien|para confirmar|déjeme ver si entendí/i.test(m.content)
      );
      if (hasActiveListening) empathy += 20;

      // Accuracy improvements - Sales-focused
      const questionCount = userMessages.filter(m => m.content.includes('?')).length;
      accuracy += Math.min(30, questionCount * 10);
      
      const hasSalesQuestions = userMessages.some(m => 
        /necesidad|presupuesto|objetivo|meta|problema|desafío|solución|beneficio|resultado/i.test(m.content)
      );
      if (hasSalesQuestions) accuracy += 25;
      
      const hasClosingAttempts = userMessages.some(m => 
        /podríamos|le parece si|qué le parece|podemos agendar|siguiente paso/i.test(m.content)
      );
      if (hasClosingAttempts) accuracy += 20;
    }

    // Response time penalties - less harsh
    if (responseTime > 10) {
      rapport -= 8;
      clarity -= 6;
    } else if (responseTime > 6) {
      rapport -= 4;
      clarity -= 3;
    }

    // Early price discussion penalty - less harsh
    if (userMessages.length > 0 && userMessages.some(m => /cuánto|precio|costo|vale/i.test(m.content)) && userMessages.length < 5) {
      rapport -= 10;
      accuracy -= 8;
    }

    // Bonus for conversation length
    if (userMessages.length >= 5) {
      rapport += 10;
      clarity += 10;
      empathy += 10;
      accuracy += 10;
    }

    // Ensure 0-100 range
    rapport = Math.max(0, Math.min(100, rapport));
    clarity = Math.max(0, Math.min(100, clarity));
    empathy = Math.max(0, Math.min(100, empathy));
    accuracy = Math.max(0, Math.min(100, accuracy));

    const overallScore = Math.round((rapport + clarity + empathy + accuracy) / 4);

    const liveCoaching = [];
    const criticalIssues = [];
    const positivePoints = [];

    if (overallScore < 50) {
      liveCoaching.push("Mejora tu approach inicial");
      criticalIssues.push("Score bajo - necesitas más práctica");
    } else if (overallScore >= 80) {
      positivePoints.push("¡Excelente desempeño!");
    } else if (overallScore >= 65) {
      positivePoints.push("Buen trabajo, sigue así");
    }

    if (responseTime > 8) {
      liveCoaching.push("Responde más rápido");
    }

    if (rapport < 60) {
      liveCoaching.push("Construye más rapport");
    } else if (rapport >= 80) {
      positivePoints.push("Excelente conexión con el cliente");
    }

    if (empathy < 60) {
      liveCoaching.push("Muestra más empatía");
    }

    if (accuracy < 60) {
      liveCoaching.push("Haz más preguntas de descubrimiento");
    }

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

    // Save metrics to database
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
    
    try {
      setWaitingForAI(true);
      if (isListening) {
        stopListening();
      }
      
      await playAudio(text, selectedVoiceId);
    } catch (error) {
      console.error('Error generating/playing audio:', error);
      setWaitingForAI(false);
      if (mode === 'call' && !isSessionEnding) {
        setTimeout(() => startListening(), 200);
      }
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || inputMessage.trim();
    if (!userMessage || isProcessing || sessionEndingRef.current) return;

    setInputMessage('');
    setCurrentUserInput('');
    
    await addMessage(userMessage, 'user');

    setIsProcessing(true);
    setWaitingForAI(true);

    try {
      console.log('Sending message to AI:', userMessage);
      
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
      
      await addMessage(aiResponse, 'ai');

      if (mode === 'call') {
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
      
      if (mode === 'call' && !isSessionEnding) {
        setTimeout(() => startListening(), 300);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndSession = async () => {
    if (isSessionEnding || sessionEndingRef.current) return;
    
    console.log('Ending session...');
    setIsSessionEnding(true);
    sessionEndingRef.current = true;
    
    cleanup();
    if (isPlaying) {
      stopAudio();
    }
    
    if (evaluationInterval.current) {
      clearInterval(evaluationInterval.current);
    }
    
    if (sessionId) {
      try {
        updateRealTimeEvaluation();
        
        // Final update to conversation history
        if (conversationHistoryId) {
          await supabase
            .from('conversation_history')
            .update({
              completed_at: new Date().toISOString(),
              final_score: realTimeMetrics.overallScore,
              duration_seconds: Math.floor((Date.now() - sessionStartTime) / 1000)
            })
            .eq('id', conversationHistoryId);
        }
        
        await sessionManager.endSession(sessionId, realTimeMetrics.overallScore);
        
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
          specific_feedback: `Sesión completada con puntuación de ${realTimeMetrics.overallScore}/100. 
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
        
        console.log('Session ended successfully, calling onComplete with evaluation:', evaluation);
        onComplete(evaluation);
      } catch (error) {
        console.error('Error ending session:', error);
        onComplete({
          overall_score: realTimeMetrics.overallScore,
          rapport_score: realTimeMetrics.rapport,
          clarity_score: realTimeMetrics.clarity,
          empathy_score: realTimeMetrics.empathy,
          accuracy_score: realTimeMetrics.accuracy,
          strengths: ['Sesión completada'],
          improvements: ['Error al procesar evaluación completa'],
          specific_feedback: 'La sesión se completó pero hubo un error al procesar la evaluación.'
        });
      }
    }
  };

  const currentDuration = Math.floor((Date.now() - sessionStartTime) / 1000);

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-emerald-200/60 p-4 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={onBack} 
              size="sm" 
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-2">
                {mode === 'chat' ? (
                  <MessageSquare className="h-5 w-5 text-white" />
                ) : (
                  <Headphones className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-emerald-900">{scenarioTitle}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={mode === 'call' ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'}>
                    {mode === 'call' ? '🎤 Llamada' : '💬 Chat'}
                  </Badge>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                    Emoción: {clientEmotion}
                  </Badge>
                  {mode === 'call' && selectedVoiceName && (
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                      🗣️ {selectedVoiceName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {mode === 'call' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button 
              onClick={handleEndSession} 
              variant="destructive" 
              size="sm"
              disabled={isSessionEnding}
              className="bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              {isSessionEnding ? 'Finalizando...' : 'Finalizar'}
            </Button>
          </div>
        </div>

        {/* Status Indicators for Voice Mode */}
        {mode === 'call' && (
          <div className="mt-4 flex items-center justify-center">
            {waitingForAI ? (
              <div className="flex items-center space-x-3 bg-blue-50 text-blue-700 px-6 py-3 rounded-full border border-blue-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm font-medium">Cliente hablando...</span>
              </div>
            ) : isListening ? (
              <div className="flex items-center space-x-3 bg-green-50 text-green-700 px-6 py-3 rounded-full border border-green-200">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Tu turno - Habla naturalmente</span>
                <Zap className="h-4 w-4 animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-full border border-gray-200">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm">Llamada en progreso</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice Settings Panel */}
      {showVoiceSettings && mode === 'call' && (
        <div className="bg-emerald-50/80 border-b border-emerald-200 p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <VoiceSelectorSimple
                  selectedVoice={selectedVoiceId}
                  onVoiceSelect={(voiceId, voiceName) => {
                    setSelectedVoiceId(voiceId);
                    setSelectedVoiceName(voiceName);
                  }}
                />
                
                <select
                  value={clientEmotion}
                  onChange={(e) => setClientEmotion(e.target.value)}
                  className="border border-emerald-200 rounded px-3 py-2 text-sm bg-white hover:border-emerald-400 focus:border-emerald-500 focus:outline-none"
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
                <VolumeX className="h-4 w-4 text-emerald-700" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-emerald-600"
                />
                <Volume2 className="h-4 w-4 text-emerald-700" />
                <span className="text-xs text-emerald-700 font-medium w-8">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          {mode === 'chat' ? (
            // Chat Interface - Full Height Messaging
            <div className="flex-1 bg-white border-r border-emerald-200/60 flex flex-col">
              <div className="border-b border-emerald-100 bg-emerald-50/50 p-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full p-2">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">Conversación por Chat</h3>
                    <p className="text-sm text-emerald-700">{scenarioDescription}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="border-t border-emerald-100 p-4 bg-emerald-50/30 flex-shrink-0">
                <div className="flex space-x-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={isProcessing}
                    className="flex-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isProcessing}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Voice Interface - Full Height Transcription
            <div className="flex-1 bg-white border-r border-emerald-200/60 flex flex-col">
              <div className="border-b border-emerald-100 bg-emerald-50/50 p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full p-2">
                      <Headphones className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900">Conversación por Voz</h3>
                      <p className="text-sm text-emerald-700">Voz: {selectedVoiceName}</p>
                    </div>
                  </div>
                  
                  {(isPlaying || waitingForAI) && (
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-8 bg-emerald-500 rounded animate-pulse"></div>
                        <div className="w-2 h-6 bg-emerald-400 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-10 bg-emerald-600 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-4 bg-emerald-300 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                      <span className="text-xs text-emerald-700 font-medium">IA hablando</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-lg px-4 py-3 ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                        : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium opacity-70">
                          {message.sender === 'user' ? 'Tú' : 'Cliente IA'}
                        </span>
                        <span className="text-xs opacity-60">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {currentUserInput && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-lg px-4 py-3 opacity-70">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Tú (hablando...)</span>
                        <Mic className="h-3 w-3 animate-pulse" />
                      </div>
                      <p className="text-sm italic">{currentUserInput}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Evaluation Panel */}
        <div className="w-80 flex-shrink-0">
          <RealTimeEvaluation
            metrics={realTimeMetrics}
            isActive={!isSessionEnding}
            sessionDuration={currentDuration}
            messageCount={messages.length}
            onRequestFeedback={() => updateRealTimeEvaluation()}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveTrainingInterface;
