
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatWidget } from '@/hooks/useChatWidget';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { MessageCircle, Send, X, Loader, RefreshCw } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <Card className="w-[380px] shadow-lg rounded-2xl border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h4 className="font-semibold">AI Project Assistant</h4>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearChat} 
                disabled={messages.length === 0 || isLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleChat}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <ScrollArea className="h-[400px] px-4">
            <CardContent className="pt-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center p-4">
                  <div>
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Start a conversation with your project AI assistant.</p>
                    <p className="text-sm mt-1">Ask about your projects, tasks, or get help with project management.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>
          </ScrollArea>
          
          <CardFooter className="p-4 border-t">
            <div className="flex w-full gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="resize-none min-h-[44px] max-h-[144px]"
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
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={toggleChat}
        className={cn(
          "shadow-lg rounded-full h-14 w-14 p-0",
          "transition-transform hover:scale-110",
          "bg-primary hover:bg-primary/90",
          isOpen && "rotate-180"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
};

