
-- Políticas RLS para training_sessions
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can create their own training sessions" ON public.training_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can view their own training sessions" ON public.training_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can update their own training sessions" ON public.training_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para conversation_messages
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create messages for their sessions" ON public.conversation_messages;
CREATE POLICY "Users can create messages for their sessions" ON public.conversation_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.training_sessions ts 
            WHERE ts.id = session_id AND ts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.conversation_messages;
CREATE POLICY "Users can view messages from their sessions" ON public.conversation_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.training_sessions ts 
            WHERE ts.id = session_id AND ts.user_id = auth.uid()
        )
    );

-- Políticas RLS para session_evaluations
ALTER TABLE public.session_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create evaluations for their sessions" ON public.session_evaluations;
CREATE POLICY "Users can create evaluations for their sessions" ON public.session_evaluations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.training_sessions ts 
            WHERE ts.id = session_id AND ts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view evaluations from their sessions" ON public.session_evaluations;
CREATE POLICY "Users can view evaluations from their sessions" ON public.session_evaluations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.training_sessions ts 
            WHERE ts.id = session_id AND ts.user_id = auth.uid()
        )
    );

-- Políticas RLS para real_time_metrics
ALTER TABLE public.real_time_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create metrics for their sessions" ON public.real_time_metrics;
CREATE POLICY "Users can create metrics for their sessions" ON public.real_time_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.training_sessions ts 
            WHERE ts.id = session_id AND ts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view metrics from their sessions" ON public.real_time_metrics;
CREATE POLICY "Users can view metrics from their sessions" ON public.real_time_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.training_sessions ts 
            WHERE ts.id = session_id AND ts.user_id = auth.uid()
        )
    );
