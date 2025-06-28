
-- Crear tabla para el historial de conversaciones si no existe
CREATE TABLE IF NOT EXISTS public.conversation_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  session_id uuid REFERENCES public.training_sessions(id),
  scenario_title text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('chat', 'call')),
  client_emotion text,
  voice_used text,
  duration_seconds integer DEFAULT 0,
  total_messages integer DEFAULT 0,
  final_score integer DEFAULT 0,
  conversation_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Habilitar RLS
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversation_history
DROP POLICY IF EXISTS "Users can view their own conversation history" ON public.conversation_history;
CREATE POLICY "Users can view their own conversation history" ON public.conversation_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own conversation history" ON public.conversation_history;
CREATE POLICY "Users can create their own conversation history" ON public.conversation_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own conversation history" ON public.conversation_history;
CREATE POLICY "Users can update their own conversation history" ON public.conversation_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Actualizar políticas de training_sessions para asegurar acceso completo
DROP POLICY IF EXISTS "Users can update their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can update their own training sessions" ON public.training_sessions
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Crear función para obtener estadísticas del historial
CREATE OR REPLACE FUNCTION public.get_user_conversation_history(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  scenario_title text,
  mode text,
  client_emotion text,
  voice_used text,
  duration_seconds integer,
  total_messages integer,
  final_score integer,
  created_at timestamp with time zone,
  completed_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    ch.id,
    ch.scenario_title,
    ch.mode,
    ch.client_emotion,
    ch.voice_used,
    ch.duration_seconds,
    ch.total_messages,
    ch.final_score,
    ch.created_at,
    ch.completed_at
  FROM public.conversation_history ch
  WHERE ch.user_id = p_user_id
  ORDER BY ch.created_at DESC;
$$;
