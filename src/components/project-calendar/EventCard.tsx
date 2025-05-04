
import { format } from "date-fns";
import { PenSquare, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEffect } from "react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  event_date: string | null;
}

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void; // Updated to accept the event id
  onEdit: (event: Event) => void; // Updated to accept the event
  hasEditAccess?: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  currentUserId?: string; // Make this optional
}

export function EventCard({ 
  event, 
  onDelete, 
  onEdit, 
  hasEditAccess,
  isAuthenticated,
  isOwner
}: EventCardProps) {
  const { data: userProfile, isLoading } = useUserProfile(event.user_id);
  
  // Debug logging to track permission state
  useEffect(() => {
    console.log(`EventCard for ${event.title} - creator: ${event.user_id}, can edit: ${isOwner}`);
  }, [event.id, event.title, event.user_id, isOwner]);

  const getCreatorName = () => {
    if (isLoading) return 'Loading...';
    if (!userProfile) return 'Unknown User';
    return `${userProfile.full_name}${userProfile.last_name ? ' ' + userProfile.last_name : ''}`;
  };

  return (
    <div className="flex flex-col justify-between h-full p-4 border rounded-lg bg-card">
      <div>
        <h4 className="font-medium mb-2">{event.title}</h4>
        {event.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {event.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Created by: {getCreatorName()}
        </p>
        <p className="text-xs text-muted-foreground">
          Date: {event.event_date ? format(new Date(event.event_date), "MMMM d, yyyy") : "No date set"}
        </p>
      </div>
      {/* Only show edit/delete buttons if the user is the creator of the event */}
      {isOwner && isAuthenticated && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(event)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <PenSquare className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(event.id)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
}
