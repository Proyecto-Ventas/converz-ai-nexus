
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseAudioPlayerProps {
  onAudioEnd?: () => void;
}

export const useAudioPlayer = ({ onAudioEnd }: UseAudioPlayerProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const playAudio = useCallback(async (text: string, voiceId: string = 'EXAVITQu4vr4xnSDxMaL') => {
    if (isPlaying) return;

    setIsLoading(true);
    
    try {
      console.log('Generating audio for text:', text.substring(0, 50) + '...');
      console.log('Using voice ID:', voiceId);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice: voiceId,
          model: 'eleven_multilingual_v2',
          settings: {
            stability: 0.6,
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
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const audio = new Audio(data.audioUrl);
        audio.volume = volume;
        audioRef.current = audio;
        
        audio.onloadstart = () => {
          console.log('Audio loading started');
          setIsLoading(true);
        };
        
        audio.oncanplay = () => {
          console.log('Audio can play');
          setIsLoading(false);
        };
        
        audio.onplay = () => {
          console.log('Audio started playing');
          setIsPlaying(true);
        };
        
        audio.onended = () => {
          console.log('Audio ended');
          setIsPlaying(false);
          audioRef.current = null;
          onAudioEnd?.();
        };
        
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsPlaying(false);
          setIsLoading(false);
          audioRef.current = null;
          toast({
            title: "Error de audio",
            description: "No se pudo reproducir el audio",
            variant: "destructive"
          });
        };

        await audio.play();
      } else {
        throw new Error('No audio URL received');
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
      setIsPlaying(false);
      toast({
        title: "Error",
        description: "No se pudo generar el audio",
        variant: "destructive"
      });
    }
  }, [isPlaying, onAudioEnd, toast, volume]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  return {
    isPlaying,
    isLoading,
    playAudio,
    stopAudio,
    volume,
    setVolume
  };
};
