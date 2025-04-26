
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export const useChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !user) return;
    
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const formattedHistory = messages.map(({ role, content }) => ({ role, content }));

      console.log('Calling AI chat function with:', {
        message: inputMessage,
        historyLength: formattedHistory.length,
        userId: user.id
      });

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: inputMessage,
          history: formattedHistory,
          userId: user.id
        }
      });

      if (error) {
        console.error('Error from AI chat function:', error);
        throw new Error(error.message || 'Error calling AI function');
      }

      if (!data || !data.message) {
        console.error('Invalid response data:', data);
        throw new Error('Received invalid response from AI');
      }

      // Reset retry count on success
      setRetryCount(0);
      
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling AI chat function:', error);
      
      let errorMessage = 'Failed to get a response from the AI. Please try again.';
      let retryAfterSeconds = 0;
      
      // Check for specific known errors
      if (error.message?.includes('quota') || error.message?.includes('billing')) {
        errorMessage = 'OpenAI API quota exceeded. The API key may need to be updated or billing limits increased.';
      } else if (error.message?.includes('API key')) {
        errorMessage = 'OpenAI API key issue. Please check that a valid API key has been configured.';
      } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        // Extract retry time if available
        const retryMatch = error.message?.match(/try again in (\d+\.?\d*)/i);
        retryAfterSeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
        
        errorMessage = `OpenAI API rate limit reached. Please try again in ${retryAfterSeconds} seconds.`;
        
        // If we have a retry time and haven't retried too many times, set up automatic retry
        if (retryAfterSeconds > 0 && retryCount < 2) {
          // Clear any existing timeout
          if (retryTimeout) clearTimeout(retryTimeout);
          
          const timeout = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            sendMessage();
          }, retryAfterSeconds * 1000);
          
          setRetryTimeout(timeout);
          
          errorMessage += ` (Will retry automatically in ${retryAfterSeconds} seconds)`;
        }
      } else if (error.message?.includes('401')) {
        errorMessage = 'OpenAI API authentication failed. Please check your API key.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. ' + errorMessage,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, messages, user, toast, retryCount, retryTimeout]);

  const clearChat = useCallback(() => {
    setMessages([]);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
    setRetryCount(0);
    toast({
      title: 'Chat cleared',
      description: 'All chat messages have been cleared.',
    });
  }, [toast, retryTimeout]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage, isLoading]);

  // Clean up timeout on unmount
  useCallback(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);

  return {
    isOpen,
    toggleChat,
    messages,
    inputMessage,
    setInputMessage,
    sendMessage,
    clearChat,
    isLoading,
    handleKeyDown
  };
};
