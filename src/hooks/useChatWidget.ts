import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

// Local storage key for chat history
const CHAT_HISTORY_KEY = 'chat_history';

// Debounce helper function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Cache last context fetch time to avoid excessive fetch calls
  const lastContextFetchRef = useRef<number>(0);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`${CHAT_HISTORY_KEY}_${user.id}`);
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            setMessages(parsedHistory);
          }
        } catch (e) {
          console.error('Error parsing chat history from localStorage:', e);
        }
      }
    }
  }, [user]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (user && messages.length > 0) {
      // Only save last 50 messages to prevent local storage issues
      const messagesToSave = messages.slice(-50);
      localStorage.setItem(`${CHAT_HISTORY_KEY}_${user.id}`, JSON.stringify(messagesToSave));
    }
  }, [messages, user]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Create a debounced version of the send message function
  const debouncedSendMessage = debounce(() => {
    if (inputMessage.trim().length > 0) {
      sendMessageInternal();
    }
  }, 300);

  // Simulate typing effect for better UX
  const simulateTyping = useCallback(() => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1500 + Math.random() * 1000);
  }, []);

  // Check if the query is related to files, documents, or similar
  const isFileRelatedQuery = useCallback((query: string) => {
    const fileKeywords = [
      'file', 'document', 'attachment', 'upload', 'download',
      'pdf', 'excel', 'image', 'picture', 'photo', 'repository',
      'protocol', 'study', 'clinical', 'spreadsheet', 'presentation',
      'powerpoint', 'word', 'doc', 'docx', 'xlsx', 'pptx', 'csv',
      // Additional keywords for document content
      'content', 'read', 'text', 'inside', 'written', 'says', 'contain', 
      'information in', 'details in', 'paragraph', 'section',
      // More specific content requests
      'what does it say', 'what is in', 'can you read', 'tell me about the content',
      'extract', 'summarize', 'analyze'
    ];
    
    const lowerQuery = query.toLowerCase();
    
    // Match if the query contains file-related words or phrases
    const hasFileKeyword = fileKeywords.some(keyword => lowerQuery.includes(keyword));
    
    // Match if the query looks like it's asking about a specific file
    const possibleFilePattern = /\b\d{5,}\b|\.(pdf|doc|xlsx|ppt|jpg|png|txt|csv)\b/i;
    const hasFilePattern = possibleFilePattern.test(lowerQuery);
    
    // Match if asking about reading or understanding a file
    const readingPattern = /(read|open|view|show|display|understand|extract from|summarize|look at)\s+(this|the|that|these|those)\s+(file|document|attachment|spreadsheet|presentation|image|pdf|doc)/i;
    const isReadingRequest = readingPattern.test(lowerQuery);
    
    return hasFileKeyword || hasFilePattern || isReadingRequest;
  }, []);

  // Check if the query is specifically asking about file content
  const isFileContentQuery = useCallback((query: string) => {
    const contentKeywords = [
      'content', 'read', 'inside', 'written', 'says', 'contain', 'text in',
      'what does it say', 'what is in', 'can you read', 'tell me about the content',
      'extract', 'summarize', 'analyze', 'understand', 'parse'
    ];
    
    const lowerQuery = query.toLowerCase();
    return contentKeywords.some(keyword => lowerQuery.includes(keyword));
  }, []);

  const sendMessageInternal = useCallback(async () => {
    if (!inputMessage.trim() || !user) return;
    
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);
    simulateTyping();

    try {
      const formattedHistory = messages.map(({ role, content }) => ({ role, content }));

      console.log('Calling AI chat function with:', {
        messageLength: inputMessage.length,
        historyLength: formattedHistory.length,
        userId: user.id
      });

      // Check if the query might be about files or attachments
      const isFileQuery = isFileRelatedQuery(inputMessage);
      const needsContentExtraction = isFileContentQuery(inputMessage);

      let forceRefreshContext = false;
      
      // If it's a file query, let the user know we're retrieving file information
      if (isFileQuery) {
        console.log('File-related query detected:', inputMessage);
        
        // Add temporary message if specifically asking for file content
        if (needsContentExtraction) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'Let me read that file for you. This might take a moment...',
              timestamp: new Date().toISOString()
            }
          ]);
        }
        
        // Force refresh context for file queries to get the latest attachments
        const now = Date.now();
        const timeSinceLastFetch = now - lastContextFetchRef.current;
        
        // Always force refresh for content requests, otherwise only if it's been a while
        if (needsContentExtraction || timeSinceLastFetch > 30000) {
          console.log('Forcing context refresh for file query');
          forceRefreshContext = true;
          lastContextFetchRef.current = now;
        }
      }

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: inputMessage,
          history: formattedHistory,
          userId: user.id,
          forceRefreshContext
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

      // Replace the temporary message if it exists
      if (needsContentExtraction) {
        setMessages(prev => [...prev.slice(0, -1), aiResponse]);
      } else {
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error: any) {
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
            sendMessageInternal();
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
      setIsTyping(false);
    }
  }, [inputMessage, messages, user, toast, retryCount, retryTimeout, simulateTyping, isFileRelatedQuery, isFileContentQuery]);

  const sendMessage = useCallback(() => {
    debouncedSendMessage();
  }, [debouncedSendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
    setRetryCount(0);
    if (user) {
      localStorage.removeItem(`${CHAT_HISTORY_KEY}_${user.id}`);
    }
    toast({
      title: 'Chat cleared',
      description: 'All chat messages have been cleared.',
    });
  }, [toast, retryTimeout, user]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage, isLoading]);

  // Clean up timeout on unmount
  useEffect(() => {
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
    isTyping,
    handleKeyDown
  };
};
