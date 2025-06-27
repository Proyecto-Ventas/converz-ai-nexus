
import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  language?: string;
  continuous?: boolean;
  autoRestart?: boolean;
}

export const useSpeechRecognition = ({
  onResult,
  language = 'es-ES',
  continuous = true,
  autoRestart = true
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      console.error('Speech recognition not supported');
      toast({
        title: "Error",
        description: "Tu navegador no soporta reconocimiento de voz",
        variant: "destructive",
      });
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let currentInterimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          currentInterimTranscript += transcript;
        }
      }

      setInterimTranscript(currentInterimTranscript);
      
      if (finalTranscript.trim()) {
        console.log('Speech recognition final result:', finalTranscript);
        setTranscript(finalTranscript);
        onResult(finalTranscript.trim());
        
        // Auto-restart para conversación continua
        if (autoRestart && continuous) {
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log('Recognition restart error (normal):', error);
              }
            }
          }, 1000);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech' && autoRestart) {
        // Reiniciar automáticamente si no hay habla
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.log('Auto-restart after no-speech');
            }
          }
        }, 1000);
      } else if (event.error !== 'aborted') {
        setIsListening(false);
        toast({
          title: "Error de reconocimiento",
          description: "Reintentando reconocimiento de voz...",
          variant: "default",
        });
        
        // Auto-restart en caso de error
        if (autoRestart) {
          setTimeout(() => startListening(), 2000);
        }
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      // Auto-restart para mantener la conversación fluida
      if (autoRestart && continuous) {
        restartTimeoutRef.current = setTimeout(() => {
          startListening();
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [onResult, language, continuous, autoRestart, toast]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current && !initializeRecognition()) {
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        console.log('Starting continuous speech recognition...');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    }
  }, [initializeRecognition, isListening]);

  const stopListening = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    if (recognitionRef.current && isListening) {
      console.log('Stopping speech recognition...');
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const cleanup = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    cleanup
  };
};
