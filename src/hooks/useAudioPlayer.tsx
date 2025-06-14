
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseAudioPlayerProps {
  onAudioEnd?: () => void;
}

export const useAudioPlayer = ({ onAudioEnd }: UseAudioPlayerProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1); // ADDED
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const playAudio = useCallback(async (text: string, voice: string = 'Sarah') => {
    if (isPlaying) return;

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice,
          model: 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;

      if (data.audioUrl) {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const audio = new Audio(data.audioUrl);
        audio.volume = volume; // ADDED
        audioRef.current = audio;
        
        audio.onloadstart = () => setIsLoading(true);
        audio.oncanplay = () => setIsLoading(false);
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
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
