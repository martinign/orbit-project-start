
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
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
  onDelete: () => void;
  onEdit: () => void;
  hasEditAccess: boolean;
  currentUserId: string | undefined; // Add the current user ID prop
}

export function EventCard({ 
  event, 
  onDelete, 
  onEdit, 
  hasEditAccess,
  currentUserId
}: EventCardProps) {
  const { data: userProfile, isLoading } = useUserProfile(event.user_id);
  
  // Check if the current user is the creator of the event
  const isEventCreator = currentUserId === event.user_id;

  // Debug logging to track permission state
  useEffect(() => {
    console.log(`EventCard for ${event.title} - creator: ${event.user_id}, current user: ${currentUserId}, can edit: ${isEventCreator}`);
  }, [event.id, event.title, event.user_id, currentUserId, isEventCreator]);

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
      {isEventCreator && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Edit className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
}
