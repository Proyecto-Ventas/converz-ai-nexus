
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseAudioPlayerProps {
  onAudioEnd?: () => void;
  onAudioStart?: () => void;
  onAudioError?: (error: Error) => void;
}

export const useAudioPlayer = ({ 
  onAudioEnd, 
  onAudioStart,
  onAudioError 
}: UseAudioPlayerProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const playAudio = useCallback(async (text: string, voiceId: string) => {
    // Prevenir múltiples reproducciones simultáneas
    if (isPlaying || isLoading) {
      console.log('Audio already playing or loading, skipping...');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Generating audio for text:', text.substring(0, 50) + '...');
      console.log('Using voice ID:', voiceId);

      // Detener audio anterior si existe
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text.trim(),
          voice_id: voiceId,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true
          }
        }
      });

      if (error) {
        console.error('TTS error:', error);
        throw error;
      }

      if (data?.audioUrl) {
        console.log('Audio URL received, creating audio element...');
        
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = volume;
        audioRef.current = audio;
        
        // Configurar eventos del audio
        audio.onloadstart = () => {
          console.log('Audio loading started');
        };
        
        audio.oncanplaythrough = () => {
          console.log('Audio ready to play');
          setIsLoading(false);
        };
        
        audio.onplay = () => {
          console.log('Audio started playing');
          setIsPlaying(true);
          onAudioStart?.();
          
          // Iniciar seguimiento de tiempo
          timeUpdateInterval.current = setInterval(() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }, 100);
        };
        
        audio.onended = () => {
          console.log('Audio playback ended');
          setIsPlaying(false);
          setCurrentTime(0);
          audioRef.current = null;
          
          if (timeUpdateInterval.current) {
            clearInterval(timeUpdateInterval.current);
          }
          
          onAudioEnd?.();
        };

        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
        };
        
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          const error = new Error('Audio playback failed');
          setIsPlaying(false);
          setIsLoading(false);
          setCurrentTime(0);
          audioRef.current = null;
          
          if (timeUpdateInterval.current) {
            clearInterval(timeUpdateInterval.current);
          }
          
          onAudioError?.(error);
          toast({
            title: "Error de audio",
            description: "No se pudo reproducir el audio",
            variant: "destructive"
          });
        };

        // Configurar fuente y reproducir
        audio.src = data.audioUrl;
        
        // Intentar reproducir
        try {
          await audio.play();
        } catch (playError) {
          console.error('Error playing audio:', playError);
          setIsLoading(false);
          throw playError;
        }
        
      } else {
        throw new Error('No audio URL received from TTS service');
      }
    } catch (error) {
      console.error('Error in audio generation/playback:', error);
      setIsLoading(false);
      setIsPlaying(false);
      
      const audioError = error instanceof Error ? error : new Error('Unknown audio error');
      onAudioError?.(audioError);
      
      toast({
        title: "Error",
        description: "No se pudo generar o reproducir el audio",
        variant: "destructive"
      });
    }
  }, [isPlaying, isLoading, onAudioEnd, onAudioStart, onAudioError, toast, volume]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }
    
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    
    console.log('Audio stopped manually');
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    }
  }, [isPlaying]);

  const resumeAudio = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
      
      timeUpdateInterval.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    }
  }, [isPlaying]);

  const setAudioVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  return {
    isPlaying,
    isLoading,
    duration,
    currentTime,
    volume,
    playAudio,
    stopAudio,
    pauseAudio,
    resumeAudio,
    setVolume: setAudioVolume
  };
};
