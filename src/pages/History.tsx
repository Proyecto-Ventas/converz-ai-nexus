
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, Calendar, Clock, MessageSquare, TrendingUp, Phone, History as HistoryIcon, Headphones } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CorporateLayout, CorporateCard, CorporateHeader, CorporateSection } from '@/components/ui/corporate-layout';

interface ConversationHistory {
  id: string;
  scenario_title: string;
  mode: 'chat' | 'call';
  client_emotion: string;
  voice_used?: string;
  duration_seconds: number;
  total_messages: number;
  final_score: number;
  conversation_data: Array<{
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: string;
  }>;
  created_at: string;
  completed_at?: string;
}

const History = () => {
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversationHistory();
    }
  }, [user]);

  const loadConversationHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (conversation: ConversationHistory) => {
    if (conversation.completed_at) {
      return <Badge className="bg-green-100 text-green-700">Completada</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-700">En Progreso</Badge>;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-700 font-semibold">{score}%</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-700 font-semibold">{score}%</Badge>;
    return <Badge className="bg-red-100 text-red-700 font-semibold">{score}%</Badge>;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const exportConversation = (conversation: ConversationHistory) => {
    const data = {
      conversation,
      export_date: new Date().toISOString(),
      summary: {
        scenario: conversation.scenario_title,
        mode: conversation.mode,
        duration: formatDuration(conversation.duration_seconds),
        messages: conversation.total_messages,
        score: conversation.final_score
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversacion-${conversation.scenario_title.replace(/\s+/g, '-')}-${format(new Date(conversation.created_at), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getConversationStats = () => {
    const totalConversations = conversations.length;
    const completedConversations = conversations.filter(c => c.completed_at).length;
    const avgScore = conversations.reduce((acc, c) => acc + c.final_score, 0) / Math.max(totalConversations, 1);
    const totalDuration = conversations.reduce((acc, c) => acc + c.duration_seconds, 0);
    
    return { totalConversations, completedConversations, avgScore: Math.round(avgScore), totalDuration };
  };

  const stats = getConversationStats();

  if (loading) {
    return (
      <CorporateLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </CorporateLayout>
    );
  }

  return (
    <CorporateLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <CorporateHeader 
          title="Historial de Conversaciones" 
          subtitle="Revisa y analiza todas tus sesiones de entrenamiento anteriores"
          icon={<HistoryIcon className="h-6 w-6" />}
          actions={
            <Button onClick={loadConversationHistory} variant="outline" size="sm">
              Actualizar
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <CorporateCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Conversaciones</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.totalConversations}</p>
              </div>
            </div>
          </CorporateCard>
          
          <CorporateCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Puntuación Promedio</p>
                <p className="text-2xl font-bold text-green-900">{stats.avgScore}%</p>
              </div>
            </div>
          </CorporateCard>
          
          <CorporateCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tiempo Total</p>
                <p className="text-2xl font-bold text-blue-900">{Math.floor(stats.totalDuration / 60)}m</p>
              </div>
            </div>
          </CorporateCard>
          
          <CorporateCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Phone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-purple-900">{stats.completedConversations}</p>
              </div>
            </div>
          </CorporateCard>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-emerald-50 border border-emerald-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Detalles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {conversations.length === 0 ? (
              <CorporateCard>
                <CardContent className="p-8 text-center">
                  <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay conversaciones aún</h3>
                  <p className="text-gray-600 mb-4">
                    Comienza tu primer entrenamiento para ver el historial aquí.
                  </p>
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                    Iniciar Entrenamiento
                  </Button>
                </CardContent>
              </CorporateCard>
            ) : (
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <CorporateCard key={conversation.id} className="hover:shadow-lg transition-shadow border-emerald-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="bg-emerald-100 p-2 rounded-lg">
                              {conversation.mode === 'call' ? (
                                <Headphones className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-emerald-600" />
                              )}
                            </div>
                            <h3 className="font-semibold text-emerald-900">{conversation.scenario_title}</h3>
                            {getStatusBadge(conversation)}
                            {getScoreBadge(conversation.final_score)}
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(conversation.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(conversation.duration_seconds)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{conversation.total_messages} mensajes</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-700">
                              <strong>Cliente:</strong> {conversation.client_emotion}
                            </span>
                            <span className="text-gray-700">
                              <strong>Modo:</strong> {conversation.mode === 'call' ? 'Llamada' : 'Chat'}
                            </span>
                            {conversation.voice_used && (
                              <span className="text-gray-700">
                                <strong>Voz:</strong> {conversation.voice_used}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedConversation(conversation)}
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportConversation(conversation)}
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </CorporateCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {selectedConversation ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información de la conversación */}
                <CorporateCard className="lg:col-span-1">
                  <CardHeader className="bg-emerald-50 border-b border-emerald-100">
                    <CardTitle className="text-emerald-900 flex items-center">
                      <HistoryIcon className="h-5 w-5 mr-2" />
                      Información de la Sesión
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <strong className="text-gray-900">Escenario:</strong>
                      <p className="text-gray-700 mt-1">{selectedConversation.scenario_title}</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">Fecha:</strong>
                      <p className="text-gray-700 mt-1">
                        {format(new Date(selectedConversation.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <strong className="text-gray-900">Duración:</strong>
                      <p className="text-gray-700 mt-1">{formatDuration(selectedConversation.duration_seconds)}</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">Total mensajes:</strong>
                      <p className="text-gray-700 mt-1">{selectedConversation.total_messages}</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">Puntuación Final:</strong>
                      <div className="mt-1">{getScoreBadge(selectedConversation.final_score)}</div>
                    </div>
                    <div>
                      <strong className="text-gray-900">Tipo:</strong>
                      <p className="text-gray-700 mt-1">
                        {selectedConversation.mode === 'call' ? 'Llamada de Voz' : 'Chat de Texto'}
                      </p>
                    </div>
                  </CardContent>
                </CorporateCard>

                {/* Transcripción */}
                <CorporateCard className="lg:col-span-2">
                  <CardHeader className="bg-emerald-50 border-b border-emerald-100">
                    <CardTitle className="text-emerald-900 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Transcripción Completa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {selectedConversation.conversation_data && selectedConversation.conversation_data.length > 0 ? (
                        <div className="space-y-3 p-6">
                          {selectedConversation.conversation_data.map((message, index) => (
                            <div key={index} className={`flex ${
                              message.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}>
                              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                message.sender === 'user' 
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium opacity-70">
                                    {message.sender === 'user' ? 'Usuario' : 'Cliente IA'}
                                  </span>
                                  <span className="text-xs opacity-60">
                                    {format(new Date(message.timestamp), 'HH:mm')}
                                  </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-gray-500">
                          No hay mensajes en esta conversación.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CorporateCard>
              </div>
            ) : (
              <CorporateCard>
                <CardContent className="p-8 text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona una conversación</h3>
                  <p className="text-gray-600">
                    Haz clic en "Ver" en cualquier conversación para ver los detalles completos.
                  </p>
                </CardContent>
              </CorporateCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CorporateLayout>
  );
};

export default History;
