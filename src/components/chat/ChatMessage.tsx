
import { ChatMessage as ChatMessageType } from '@/hooks/useChatWidget';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : '';

  // Split message into paragraphs for better formatting
  const paragraphs = message.content.split('\n').filter(line => line.trim() !== '');

  // Check if message contains a file content section
  const hasFileContent = message.content.includes('Content of ') && 
                        message.content.includes(':\n\n');

  return (
    <div
      className={cn(
        'flex gap-2 animate-in fade-in-0 slide-in-from-bottom-2',
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
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-muted/50 text-foreground'
          )}
        >
          {hasFileContent ? (
            <div className="space-y-3">
              {paragraphs.map((paragraph, index) => 
                paragraph.startsWith('Content of ') && paragraph.includes(':\n\n') ? (
                  <div key={index} className="border-l-4 border-blue-500 pl-3 py-1 my-2 bg-slate-100 dark:bg-slate-800 rounded overflow-auto max-h-[300px]">
                    <p className="font-medium mb-1">{paragraph.split(':\n\n')[0]}</p>
                    <pre className="whitespace-pre-wrap text-xs font-mono">{paragraph.split(':\n\n')[1]}</pre>
                  </div>
                ) : (
                  <p key={index}>{paragraph}</p>
                )
              )}
            </div>
          ) : paragraphs.length > 1 ? (
            <div className="space-y-2">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : (
            message.content
          )}
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
