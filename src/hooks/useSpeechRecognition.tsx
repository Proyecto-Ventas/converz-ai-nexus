
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
  const silenceTimeoutRef = useRef<NodeJS.Timeout>();
  const isActiveRef = useRef(false);
  const { toast } = useToast();

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      console.error('Speech recognition not supported');
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
      isActiveRef.current = true;
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
        
        // Clear interim transcript after final result
        setInterimTranscript('');
        
        // Reset silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        
        // Restart after processing message (shorter delay for fluidity)
        if (autoRestart && continuous && isActiveRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isActiveRef.current && !isListening) {
              try {
                recognition.start();
              } catch (error) {
                console.log('Quick restart after result');
              }
            }
          }, 300);
        }
      } else if (currentInterimTranscript.trim()) {
        // Reset silence timeout when there's speech
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        // Start silence timeout for auto-restart
        silenceTimeoutRef.current = setTimeout(() => {
          if (isActiveRef.current && autoRestart) {
            try {
              recognition.start();
            } catch (error) {
              console.log('Auto-restart after silence');
            }
          }
        }, 1000);
      } else if (event.error === 'audio-capture') {
        toast({
          title: "Error de micrófono",
          description: "Verifica que el micrófono esté conectado y permitido",
          variant: "destructive",
        });
        setIsListening(false);
        isActiveRef.current = false;
      } else if (event.error !== 'aborted') {
        // Auto-restart for other errors
        if (autoRestart && isActiveRef.current) {
          setTimeout(() => {
            if (isActiveRef.current) {
              try {
                recognition.start();
              } catch (error) {
                console.log('Auto-restart after error');
              }
            }
          }, 1000);
        }
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      // Auto-restart for continuous conversation
      if (autoRestart && continuous && isActiveRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (isActiveRef.current) {
            try {
              recognition.start();
            } catch (error) {
              console.log('Auto-restart on end');
            }
          }
        }, 200); // Very quick restart for fluidity
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [onResult, language, continuous, autoRestart, toast]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current && !initializeRecognition()) {
      return;
    }

    if (recognitionRef.current && !isListening && !isActiveRef.current) {
      try {
        console.log('Starting continuous speech recognition...');
        isActiveRef.current = true;
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
        isActiveRef.current = false;
      }
    }
  }, [initializeRecognition, isListening]);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...');
    isActiveRef.current = false;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    setIsListening(false);
  }, [isListening]);

  const cleanup = useCallback(() => {
    console.log('Cleaning up speech recognition...');
    isActiveRef.current = false;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
