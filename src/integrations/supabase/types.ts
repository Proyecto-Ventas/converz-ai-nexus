export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          requirements: Json | null
          title: string
          xp_reward: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          requirements?: Json | null
          title: string
          xp_reward?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          requirements?: Json | null
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      behaviors: {
        Row: {
          client_personality: string | null
          common_objections: string[] | null
          created_at: string | null
          emotional_tone: string | null
          id: string
          is_active: boolean | null
          knowledge_base: string | null
          name: string
          response_style: string | null
          scenario_id: string | null
          technical_level: string | null
          updated_at: string | null
          voice: string | null
        }
        Insert: {
          client_personality?: string | null
          common_objections?: string[] | null
          created_at?: string | null
          emotional_tone?: string | null
          id?: string
          is_active?: boolean | null
          knowledge_base?: string | null
          name: string
          response_style?: string | null
          scenario_id?: string | null
          technical_level?: string | null
          updated_at?: string | null
          voice?: string | null
        }
        Update: {
          client_personality?: string | null
          common_objections?: string[] | null
          created_at?: string | null
          emotional_tone?: string | null
          id?: string
          is_active?: boolean | null
          knowledge_base?: string | null
          name?: string
          response_style?: string | null
          scenario_id?: string | null
          technical_level?: string | null
          updated_at?: string | null
          voice?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "behaviors_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          admin_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      challenge_invitations: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          id: string
          invited_by: string | null
          responded_at: string | null
          status: string | null
          team_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          invited_by?: string | null
          responded_at?: string | null
          status?: string | null
          team_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          invited_by?: string | null
          responded_at?: string | null
          status?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_invitations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          id: string
          joined_at: string | null
          participant_id: string | null
          participant_type: string
          score: number | null
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          participant_id?: string | null
          participant_type: string
          score?: number | null
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          participant_id?: string | null
          participant_type?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_custom: boolean | null
          max_participants: number | null
          objective_type: string | null
          objective_value: number | null
          reward_xp: number | null
          start_date: string | null
          target_score: number | null
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          challenge_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          max_participants?: number | null
          objective_type?: string | null
          objective_value?: number | null
          reward_xp?: number | null
          start_date?: string | null
          target_score?: number | null
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          challenge_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          max_participants?: number | null
          objective_type?: string | null
          objective_value?: number | null
          reward_xp?: number | null
          start_date?: string | null
          target_score?: number | null
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_history: {
        Row: {
          client_emotion: string | null
          completed_at: string | null
          conversation_data: Json | null
          created_at: string | null
          duration_seconds: number | null
          final_score: number | null
          id: string
          mode: string
          scenario_title: string
          session_id: string | null
          total_messages: number | null
          user_id: string
          voice_used: string | null
        }
        Insert: {
          client_emotion?: string | null
          completed_at?: string | null
          conversation_data?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          final_score?: number | null
          id?: string
          mode: string
          scenario_title: string
          session_id?: string | null
          total_messages?: number | null
          user_id: string
          voice_used?: string | null
        }
        Update: {
          client_emotion?: string | null
          completed_at?: string | null
          conversation_data?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          final_score?: number | null
          id?: string
          mode?: string
          scenario_title?: string
          session_id?: string | null
          total_messages?: number | null
          user_id?: string
          voice_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string | null
          id: string
          sender: string
          session_id: string | null
          timestamp_in_session: number
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          sender: string
          session_id?: string | null
          timestamp_in_session: number
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          sender?: string
          session_id?: string | null
          timestamp_in_session?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversation_messages_session_id"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          ai_summary: string | null
          campaign_id: string | null
          content: string | null
          created_at: string | null
          document_type: string | null
          embeddings: string | null
          extraction_status: string | null
          file_id: string | null
          id: string
          key_points: string[] | null
          manual_notes: string | null
          processing_metadata: Json | null
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_summary?: string | null
          campaign_id?: string | null
          content?: string | null
          created_at?: string | null
          document_type?: string | null
          embeddings?: string | null
          extraction_status?: string | null
          file_id?: string | null
          id?: string
          key_points?: string[] | null
          manual_notes?: string | null
          processing_metadata?: Json | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_summary?: string | null
          campaign_id?: string | null
          content?: string | null
          created_at?: string | null
          document_type?: string | null
          embeddings?: string | null
          extraction_status?: string | null
          file_id?: string | null
          id?: string
          key_points?: string[] | null
          manual_notes?: string | null
          processing_metadata?: Json | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "uploaded_files"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      real_time_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          recorded_at: string | null
          session_id: string | null
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value: number
          recorded_at?: string | null
          session_id?: string | null
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_real_time_metrics_session_id"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "real_time_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          expected_outcomes: Json | null
          id: string
          is_active: boolean | null
          prompt_instructions: string | null
          scenario_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          expected_outcomes?: Json | null
          id?: string
          is_active?: boolean | null
          prompt_instructions?: string | null
          scenario_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          expected_outcomes?: Json | null
          id?: string
          is_active?: boolean | null
          prompt_instructions?: string | null
          scenario_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      session_evaluations: {
        Row: {
          accuracy_score: number | null
          ai_analysis: Json | null
          clarity_score: number | null
          created_at: string | null
          empathy_score: number | null
          id: string
          improvements: string[] | null
          overall_score: number | null
          rapport_score: number | null
          session_id: string | null
          specific_feedback: string | null
          strengths: string[] | null
        }
        Insert: {
          accuracy_score?: number | null
          ai_analysis?: Json | null
          clarity_score?: number | null
          created_at?: string | null
          empathy_score?: number | null
          id?: string
          improvements?: string[] | null
          overall_score?: number | null
          rapport_score?: number | null
          session_id?: string | null
          specific_feedback?: string | null
          strengths?: string[] | null
        }
        Update: {
          accuracy_score?: number | null
          ai_analysis?: Json | null
          clarity_score?: number | null
          created_at?: string | null
          empathy_score?: number | null
          id?: string
          improvements?: string[] | null
          overall_score?: number | null
          rapport_score?: number | null
          session_id?: string | null
          specific_feedback?: string | null
          strengths?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_session_evaluations_session_id"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_evaluations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_transcripts: {
        Row: {
          created_at: string | null
          full_transcript: Json
          id: string
          session_id: string | null
          word_count: number | null
        }
        Insert: {
          created_at?: string | null
          full_transcript?: Json
          id?: string
          session_id?: string | null
          word_count?: number | null
        }
        Update: {
          created_at?: string | null
          full_transcript?: Json
          id?: string
          session_id?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_transcripts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          captain_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          max_members: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          captain_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          captain_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          ai_words_count: number | null
          client_emotion: string | null
          completed_at: string | null
          conversation_log: Json | null
          created_at: string | null
          duration_minutes: number | null
          duration_seconds: number | null
          feedback: Json | null
          id: string
          interaction_mode: string | null
          scenario_id: string | null
          scenario_title: string | null
          score: number | null
          session_status: string | null
          total_messages: number | null
          user_id: string | null
          user_words_count: number | null
          voice_used: string | null
        }
        Insert: {
          ai_words_count?: number | null
          client_emotion?: string | null
          completed_at?: string | null
          conversation_log?: Json | null
          created_at?: string | null
          duration_minutes?: number | null
          duration_seconds?: number | null
          feedback?: Json | null
          id?: string
          interaction_mode?: string | null
          scenario_id?: string | null
          scenario_title?: string | null
          score?: number | null
          session_status?: string | null
          total_messages?: number | null
          user_id?: string | null
          user_words_count?: number | null
          voice_used?: string | null
        }
        Update: {
          ai_words_count?: number | null
          client_emotion?: string | null
          completed_at?: string | null
          conversation_log?: Json | null
          created_at?: string | null
          duration_minutes?: number | null
          duration_seconds?: number | null
          feedback?: Json | null
          id?: string
          interaction_mode?: string | null
          scenario_id?: string | null
          scenario_title?: string | null
          score?: number | null
          session_status?: string | null
          total_messages?: number | null
          user_id?: string | null
          user_words_count?: number | null
          voice_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_training_sessions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          content_extracted: string | null
          created_at: string | null
          file_size: number
          file_type: string
          filename: string
          id: string
          processing_status: string | null
          updated_at: string | null
          upload_url: string | null
          uploaded_by: string | null
        }
        Insert: {
          content_extracted?: string | null
          created_at?: string | null
          file_size: number
          file_type: string
          filename: string
          id?: string
          processing_status?: string | null
          updated_at?: string | null
          upload_url?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content_extracted?: string | null
          created_at?: string | null
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          processing_status?: string | null
          updated_at?: string | null
          upload_url?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string | null
          id: string
          progress: number | null
          target: number | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_achievements_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          points_earned: number | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_activity_log_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          average_score: number | null
          best_score: number | null
          current_streak: number | null
          level: number | null
          total_sessions: number | null
          total_time_minutes: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_score?: number | null
          best_score?: number | null
          current_streak?: number | null
          level?: number | null
          total_sessions?: number | null
          total_time_minutes?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_score?: number | null
          best_score?: number | null
          current_streak?: number | null
          level?: number | null
          total_sessions?: number | null
          total_time_minutes?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_stats_user_id"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_and_grant_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_behavior: {
        Args: {
          p_name: string
          p_client_personality: string
          p_scenario_id?: string
          p_emotional_tone?: string
          p_technical_level?: string
          p_common_objections?: string[]
          p_knowledge_base?: string
          p_response_style?: string
          p_voice?: string
        }
        Returns: string
      }
      create_custom_challenge: {
        Args: {
          p_title: string
          p_description: string
          p_challenge_type: string
          p_difficulty_level?: number
          p_target_score?: number
          p_objective_type?: string
          p_objective_value?: number
          p_end_date?: string
          p_team_id?: string
          p_is_public?: boolean
        }
        Returns: string
      }
      create_custom_scenario: {
        Args: {
          p_title: string
          p_description: string
          p_scenario_type: string
          p_difficulty_level?: number
          p_prompt_instructions?: string
          p_expected_outcomes?: Json
        }
        Returns: string
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_scenarios_by_category: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string
          scenario_type: string
          difficulty_level: number
          is_active: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_user_conversation_history: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          scenario_title: string
          mode: string
          client_emotion: string
          voice_used: string
          duration_seconds: number
          total_messages: number
          final_score: number
          created_at: string
          completed_at: string
        }[]
      }
      get_user_session_stats: {
        Args: { p_user_id: string }
        Returns: {
          total_sessions: number
          avg_score: number
          best_score: number
          total_duration_minutes: number
          sessions_this_month: number
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      invite_team_to_challenge: {
        Args: { p_challenge_id: string; p_team_id: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      process_uploaded_file: {
        Args: { p_file_id: string; p_extracted_content: string }
        Returns: boolean
      }
      respond_to_challenge_invitation: {
        Args: { p_invitation_id: string; p_response: string }
        Returns: boolean
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_behavior: {
        Args: {
          p_behavior_id: string
          p_name: string
          p_client_personality: string
          p_scenario_id?: string
          p_emotional_tone?: string
          p_technical_level?: string
          p_common_objections?: string[]
          p_knowledge_base?: string
          p_response_style?: string
          p_voice?: string
        }
        Returns: boolean
      }
      update_scenario: {
        Args: {
          p_scenario_id: string
          p_title: string
          p_description: string
          p_scenario_type: string
          p_difficulty_level: number
          p_prompt_instructions?: string
          p_expected_outcomes?: Json
        }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "user"],
    },
  },
} as const
