
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import ConversationTranscript from './ConversationTranscript';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  isLoading = false, 
  disabled = false 
}: ChatInterfaceProps) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim() && !isLoading && !disabled) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl">
      {/* Área de conversación */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <ConversationTranscript messages={messages} />
      </div>

      {/* Área de entrada de texto mejorada */}
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje aquí..."
                disabled={disabled || isLoading}
                className="min-h-[60px] resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                {inputMessage.length}/500
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading || disabled}
              size="lg"
              className="px-6 bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${disabled ? 'bg-red-400' : 'bg-green-400'}`} />
              <span>{disabled ? 'Desconectado' : 'Conectado'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
