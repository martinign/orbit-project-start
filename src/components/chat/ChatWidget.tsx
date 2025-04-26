
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
    isTyping,
    handleKeyDown
  } = useChatWidget();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <Card className={cn(
          "w-[380px] shadow-xl rounded-2xl border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
          "transform transition-all duration-300 ease-in-out",
          "animate-in fade-in-0 slide-in-from-bottom-5"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">AI Project Assistant</h4>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearChat} 
                disabled={messages.length === 0 || isLoading}
                className="h-8 w-8 p-0 hover:bg-muted/80"
                title="Clear chat"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleChat}
                className="h-8 w-8 p-0 hover:bg-muted/80"
                title="Close chat"
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
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-2">
                      <div className="flex flex-col max-w-[80%] space-y-1 items-start">
                        <div className="flex items-center gap-1 rounded-2xl px-4 py-2 text-sm bg-muted/50 text-foreground">
                          <span className="animate-pulse">·</span>
                          <span className="animate-pulse animation-delay-150">·</span>
                          <span className="animate-pulse animation-delay-300">·</span>
                        </div>
                        <span className="text-xs text-muted-foreground px-2">
                          Typing...
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>
          </ScrollArea>
          
          <CardFooter className="p-4 border-t">
            <div className="flex w-full gap-2">
              <Textarea
                ref={textAreaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="resize-none min-h-[44px] max-h-[120px] py-2 px-3"
                disabled={isLoading}
                rows={1}
              />
              <Button 
                onClick={sendMessage} 
                className="flex-shrink-0 h-[44px] px-4"
                disabled={isLoading || !inputMessage.trim()}
                aria-label="Send message"
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
          isOpen ? "rotate-180" : "animate-bounce-subtle"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
};
