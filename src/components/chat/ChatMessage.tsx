
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { ChatMessage as ChatMessageType } from '@/hooks/useChatWidget';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Scroll to message when it appears
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div 
      ref={messageRef}
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "flex max-w-[80%] gap-3",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div className="flex-shrink-0">
          <Avatar className={cn(
            "h-8 w-8",
            isUser ? "bg-primary" : "bg-secondary"
          )}>
            <div className="flex items-center justify-center h-full">
              {isUser ? (
                <User className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Bot className="h-4 w-4 text-secondary-foreground" />
              )}
            </div>
          </Avatar>
        </div>
        
        <div className={cn(
          "rounded-lg px-4 py-2 text-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-foreground"
        )}>
          <div className="whitespace-pre-wrap">{content}</div>
          {timestamp && (
            <div className={cn(
              "text-xs mt-1 opacity-70",
              isUser ? "text-right" : "text-left"
            )}>
              {new Date(timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
