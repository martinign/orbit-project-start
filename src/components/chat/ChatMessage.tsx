
import { ChatMessage as ChatMessageType } from '@/hooks/useChatWidget';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : '';

  return (
    <div
      className={cn(
        'flex gap-2',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'flex flex-col max-w-[80%] space-y-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-2 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-foreground'
          )}
        >
          {message.content}
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground px-2">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};
