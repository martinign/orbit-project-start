
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoaderIcon } from "lucide-react";
import { Profile } from "@/hooks/useProjectInvitesDialog";

interface UsersListProps {
  profiles: Profile[] | undefined;
  isLoading: boolean;
  selectedUsers: string[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onUserSelect: (userId: string) => void;
}

export function UsersList({
  profiles,
  isLoading,
  selectedUsers,
  searchQuery,
  onSearchChange,
  onUserSelect
}: UsersListProps) {
  // Generate initials for avatar
  const getInitials = (profile: Profile) => {
    const firstName = profile.full_name || '';
    const lastName = profile.last_name || '';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    return firstInitial + (lastInitial || '');
  };

  // Generate random pastel color based on user id
  const getAvatarColor = (userId: string) => {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate pastel color
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">Select Users</h3>
      <Input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="mb-2"
      />
      
      <div className="border rounded-md max-h-60 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            Loading users...
          </div>
        ) : profiles?.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="p-1">
            {profiles?.map((profile) => (
              <div 
                key={profile.id} 
                className="flex items-center p-2 hover:bg-slate-100 rounded-sm"
              >
                <Checkbox
                  checked={selectedUsers.includes(profile.id)}
                  onCheckedChange={() => onUserSelect(profile.id)}
                  id={`user-${profile.id}`}
                  className="mr-2"
                />
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-2" 
                  style={{ backgroundColor: getAvatarColor(profile.id) }}
                >
                  <span className="text-xs font-medium">{getInitials(profile)}</span>
                </div>
                <label 
                  htmlFor={`user-${profile.id}`} 
                  className="text-sm cursor-pointer flex-grow"
                >
                  {profile.full_name} {profile.last_name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
