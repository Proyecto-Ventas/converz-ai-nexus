
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

export const useConversationHistory = () => {
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setConversations(data || []);
    } catch (err) {
      console.error('Error loading conversation history:', err);
      setError('Error al cargar el historial de conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const createConversationHistory = async (data: {
    session_id: string;
    scenario_title: string;
    mode: 'chat' | 'call';
    client_emotion: string;
    voice_used?: string;
  }) => {
    if (!user) return null;

    try {
      const { data: newConversation, error } = await supabase
        .from('conversation_history')
        .insert({
          user_id: user.id,
          ...data,
          conversation_data: []
        })
        .select()
        .single();

      if (error) throw error;
      
      return newConversation;
    } catch (err) {
      console.error('Error creating conversation history:', err);
      return null;
    }
  };

  const updateConversationHistory = async (
    id: string, 
    updates: Partial<ConversationHistory>
  ) => {
    try {
      const { error } = await supabase
        .from('conversation_history')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the local data
      await loadConversations();
    } catch (err) {
      console.error('Error updating conversation history:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  return {
    conversations,
    loading,
    error,
    loadConversations,
    createConversationHistory,
    updateConversationHistory
  };
};
