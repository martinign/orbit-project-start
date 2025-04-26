
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatWidget } from '@/hooks/useChatWidget';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { MessageCircle, Send, X, Loader, RefreshCw } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useRef, useEffect } from 'react';

export const ChatWidget = () => {
  const {
    isOpen,
    toggleChat,
    messages,
    inputMessage,
    setInputMessage,
    sendMessage,
    clearChat,
    isLoading,
    handleKeyDown
  } = useChatWidget();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 shadow-lg z-40 rounded-full h-14 w-14 p-0"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat sheet */}
      <Sheet open={isOpen} onOpenChange={toggleChat}>
        <SheetContent className="sm:max-w-[400px] p-0 flex flex-col h-[600px] sm:h-[80vh] max-h-screen">
          <SheetHeader className="px-4 py-2 border-b">
            <div className="flex justify-between items-center">
              <SheetTitle>AI Project Assistant</SheetTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearChat} 
                  disabled={messages.length === 0 || isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleChat}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-center p-4">
                <div>
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation with your project AI assistant.</p>
                  <p className="text-sm mt-1">Ask about your projects, tasks, or get help with project management.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
          
          <SheetFooter className="p-4 border-t">
            <div className="flex w-full gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="resize-none min-h-[60px]"
                disabled={isLoading}
              />
              <Button 
                onClick={sendMessage} 
                className="flex-shrink-0"
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};
