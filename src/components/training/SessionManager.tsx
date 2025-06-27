import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DbTrainingSession = Database['public']['Tables']['training_sessions']['Row'];
type DbTrainingSessionInsert = Database['public']['Tables']['training_sessions']['Insert'];
type DbConversationMessage = Database['public']['Tables']['conversation_messages']['Row'];
type DbSessionEvaluation = Database['public']['Tables']['session_evaluations']['Row'];

interface SessionData {
  id: string;
  user_id: string | null;
  scenario_id: string | null;
  created_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  score: number | null;
  conversation_log: any;
  feedback: any;
  scenario_title?: string;
  client_emotion?: string;
  interaction_mode?: string;
  voice_used?: string;
  session_status?: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  total_messages?: number;
  user_words_count?: number;
  ai_words_count?: number;
}

interface Message extends DbConversationMessage {
  sender: 'user' | 'ai';
}

interface SessionEvaluation extends DbSessionEvaluation {}

export class SessionManager {
  private static instance: SessionManager;
  private currentSession: SessionData | null = null;
  private messageCounter: number = 0;
  private sessionStartTime: number = 0;
  private toast: any;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  setToast(toast: any) {
    this.toast = toast;
  }

  setUserId(userId: string) {
    this.userId = userId;
    console.log('SessionManager: Setting user ID:', userId);
  }

  async startSession(config: any): Promise<string | null> {
    if (!this.userId) {
      console.error('SessionManager: No user ID available');
      this.toast?.({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return null;
    }

    try {
      this.sessionStartTime = Date.now();
      this.messageCounter = 0;
      
      console.log('SessionManager: Creating session for user:', this.userId);
      
      const conversationLog = {
        scenario_title: config.scenarioTitle || 'Entrenamiento General',
        client_emotion: config.clientEmotion || 'neutral',
        interaction_mode: config.interactionMode || 'chat',
        voice_used: config.selectedVoiceName || null,
        session_status: 'in_progress',
        started_at: new Date().toISOString(),
        total_messages: 0,
        user_words_count: 0,
        ai_words_count: 0,
        messages: []
      };

      const sessionData: DbTrainingSessionInsert = {
        user_id: this.userId,
        scenario_id: config.scenario || 'sales-cold-call',
        duration_minutes: 0,
        score: 0,
        conversation_log: conversationLog as any,
        total_messages: 0,
        user_words_count: 0,
        ai_words_count: 0,
        duration_seconds: 0,
        session_status: 'active',
        scenario_title: config.scenarioTitle,
        client_emotion: config.clientEmotion,
        interaction_mode: config.interactionMode,
        voice_used: config.selectedVoiceName
      };

      console.log('SessionManager: Inserting session data:', sessionData);

      const { data, error } = await supabase
        .from('training_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('SessionManager: Error creating session:', error);
        this.toast?.({
          title: "Error",
          description: `Error al crear la sesión: ${error.message || 'Error desconocido'}`,
          variant: "destructive",
        });
        return null;
      }

      this.currentSession = {
        ...data,
        ...conversationLog
      };

      console.log('SessionManager: Session created successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('SessionManager: Error starting session:', error);
      return null;
    }
  }

  async saveMessage(sessionId: string, content: string, sender: 'user' | 'ai', timestampInSession: number): Promise<void> {
    if (!sessionId || !content || !sender) {
      console.error('SessionManager: Invalid parameters for saveMessage');
      return;
    }

    try {
      this.messageCounter++;
      
      console.log('SessionManager: Saving message:', { sessionId, sender, content: content.substring(0, 50) + '...' });
      
      // Save to conversation_messages with retry logic
      let retries = 3;
      let messageError = null;
      
      while (retries > 0) {
        const { error } = await supabase
          .from('conversation_messages')
          .insert({
            session_id: sessionId,
            content,
            sender,
            timestamp_in_session: timestampInSession
          });

        if (!error) {
          messageError = null;
          break;
        }
        
        messageError = error;
        retries--;
        console.warn(`Message save attempt failed, retries left: ${retries}`, error);
        
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (messageError) {
        console.error('SessionManager: Failed to save message after retries:', messageError);
        throw messageError;
      }

      // Update conversation_log in training_sessions
      if (this.currentSession) {
        const updatedLog = {
          ...this.currentSession.conversation_log as any,
          total_messages: this.messageCounter,
          messages: [
            ...((this.currentSession.conversation_log as any)?.messages || []),
            {
              content,
              sender,
              timestamp: new Date().toISOString(),
              timestampInSession
            }
          ]
        };

        // Count words
        const wordCount = content.split(' ').filter(word => word.trim().length > 0).length;
        if (sender === 'user') {
          updatedLog.user_words_count = (updatedLog.user_words_count || 0) + wordCount;
        } else {
          updatedLog.ai_words_count = (updatedLog.ai_words_count || 0) + wordCount;
        }

        // Update session with retry logic
        retries = 3;
        let updateError = null;
        
        while (retries > 0) {
          const { error } = await supabase
            .from('training_sessions')
            .update({
              conversation_log: updatedLog,
              total_messages: this.messageCounter,
              user_words_count: updatedLog.user_words_count,
              ai_words_count: updatedLog.ai_words_count
            })
            .eq('id', sessionId);

          if (!error) {
            updateError = null;
            break;
          }
          
          updateError = error;
          retries--;
          console.warn(`Session update attempt failed, retries left: ${retries}`, error);
          
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (updateError) {
          console.error('SessionManager: Failed to update session after retries:', updateError);
        } else {
          this.currentSession.conversation_log = updatedLog;
        }
      }

      console.log('SessionManager: Message saved successfully');
    } catch (error) {
      console.error('SessionManager: Error in saveMessage:', error);
    }
  }

  async saveRealTimeMetric(sessionId: string, metricName: string, metricValue: number): Promise<void> {
    if (!sessionId || !metricName || typeof metricValue !== 'number') {
      console.error('SessionManager: Invalid parameters for saveRealTimeMetric');
      return;
    }

    try {
      const { error } = await supabase
        .from('real_time_metrics')
        .insert({
          session_id: sessionId,
          metric_name: metricName,
          metric_value: metricValue
        });

      if (error) {
        console.error('SessionManager: Error saving metric:', error);
      }
    } catch (error) {
      console.error('SessionManager: Error in saveRealTimeMetric:', error);
    }
  }

  async endSession(sessionId: string, finalScore: number): Promise<void> {
    if (!sessionId || typeof finalScore !== 'number') {
      console.error('SessionManager: Invalid parameters for endSession');
      return;
    }

    try {
      const endTime = new Date().toISOString();
      const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      const durationMinutes = Math.floor(duration / 60);
      
      const currentSession = this.currentSession;
      
      if (currentSession?.conversation_log) {
        const updatedConversationLog = {
          ...currentSession.conversation_log as any,
          session_status: 'completed',
          ended_at: endTime,
          duration_seconds: duration
        };

        // Use upsert to ensure session is updated
        const { error } = await supabase
          .from('training_sessions')
          .update({
            completed_at: endTime,
            score: finalScore,
            duration_minutes: durationMinutes,
            duration_seconds: duration,
            conversation_log: updatedConversationLog,
            session_status: 'completed'
          })
          .eq('id', sessionId);

        if (error) {
          console.error('SessionManager: Error ending session:', error);
          throw error;
        }

        this.currentSession = null;
        this.messageCounter = 0;
        this.sessionStartTime = 0;
        console.log('SessionManager: Session ended successfully with score:', finalScore);
      }
    } catch (error) {
      console.error('SessionManager: Error in endSession:', error);
      throw error;
    }
  }

  async saveEvaluation(sessionId: string, evaluation: any): Promise<void> {
    try {
      console.log('SessionManager: Saving evaluation for session:', sessionId);
      
      // Ensure scores are in 0-100 range
      const normalizedEvaluation = {
        session_id: sessionId,
        overall_score: Math.min(100, Math.max(0, evaluation.overall_score || 0)),
        rapport_score: Math.min(100, Math.max(0, evaluation.rapport_score || 0)),
        clarity_score: Math.min(100, Math.max(0, evaluation.clarity_score || 0)),
        empathy_score: Math.min(100, Math.max(0, evaluation.empathy_score || 0)),
        accuracy_score: Math.min(100, Math.max(0, evaluation.accuracy_score || 0)),
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        specific_feedback: evaluation.specific_feedback || '',
        ai_analysis: evaluation.ai_analysis || {}
      };

      // Use upsert to handle duplicates
      const { error } = await supabase
        .from('session_evaluations')
        .upsert(normalizedEvaluation, {
          onConflict: 'session_id'
        });

      if (error) {
        console.error('SessionManager: Error saving evaluation:', error);
        throw error;
      }

      console.log('SessionManager: Evaluation saved successfully');
    } catch (error) {
      console.error('SessionManager: Error in saveEvaluation:', error);
      throw error;
    }
  }

  async getUserSessions(limit: number = 10): Promise<SessionData[]> {
    if (!this.userId) {
      console.log('SessionManager: No user ID for getUserSessions');
      return [];
    }

    try {
      console.log('SessionManager: Fetching sessions for user:', this.userId);
      
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('SessionManager: Error fetching sessions:', error);
        return [];
      }

      console.log('SessionManager: Sessions fetched:', data?.length || 0);

      return (data || []).map(session => ({
        id: session.id,
        user_id: session.user_id,
        scenario_id: session.scenario_id,
        created_at: session.created_at,
        completed_at: session.completed_at,
        duration_minutes: session.duration_minutes,
        score: session.score,
        conversation_log: session.conversation_log,
        feedback: session.feedback,
        scenario_title: (session.conversation_log as any)?.scenario_title,
        client_emotion: (session.conversation_log as any)?.client_emotion,
        interaction_mode: (session.conversation_log as any)?.interaction_mode,
        voice_used: (session.conversation_log as any)?.voice_used,
        session_status: (session.conversation_log as any)?.session_status || 'completed',
        started_at: (session.conversation_log as any)?.started_at,
        ended_at: (session.conversation_log as any)?.ended_at,
        duration_seconds: session.duration_seconds || (session.duration_minutes ? session.duration_minutes * 60 : 0),
        total_messages: session.total_messages || (session.conversation_log as any)?.total_messages || 0,
        user_words_count: session.user_words_count || (session.conversation_log as any)?.user_words_count || 0,
        ai_words_count: session.ai_words_count || (session.conversation_log as any)?.ai_words_count || 0
      })) as SessionData[];
    } catch (error) {
      console.error('SessionManager: Error in getUserSessions:', error);
      return [];
    }
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp_in_session', { ascending: true });

      if (error) {
        console.error('SessionManager: Error fetching messages:', error);
        return [];
      }

      return (data || []).map(msg => ({
        ...msg,
        sender: msg.sender as 'user' | 'ai'
      }));
    } catch (error) {
      console.error('SessionManager: Error in getSessionMessages:', error);
      return [];
    }
  }

  async getSessionEvaluation(sessionId: string): Promise<SessionEvaluation | null> {
    try {
      const { data, error } = await supabase
        .from('session_evaluations')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('SessionManager: Error fetching evaluation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('SessionManager: Error in getSessionEvaluation:', error);
      return null;
    }
  }

  getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  getSessionDuration(): number {
    if (this.sessionStartTime === 0) return 0;
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  getMessageCount(): number {
    return this.messageCounter;
  }
}

export const useSessionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const sessionManager = SessionManager.getInstance();

  useEffect(() => {
    sessionManager.setToast(toast);
    if (user?.id) {
      console.log('useSessionManager: Setting user ID:', user.id);
      sessionManager.setUserId(user.id);
    }
  }, [user, toast]);

  return sessionManager;
};
