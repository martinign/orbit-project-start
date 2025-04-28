
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalRealtimeSubscription, TableSubscription } from '@/hooks/useGlobalRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';

interface RealtimeContextType {
  lastUpdates: Record<string, Date>;
  isSubscribed: boolean;
  addSubscription: (subscription: TableSubscription) => void;
  removeSubscription: (table: string, queryKey: string | string[]) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<TableSubscription[]>([]);

  // Define the core subscriptions that should always be active when logged in
  const coreSubscriptions: TableSubscription[] = [
    { table: 'projects', queryKey: ['projects'] },
    { table: 'project_tasks', queryKey: ['tasks'] },
    { table: 'project_notes', queryKey: ['project_notes'] },
    { table: 'project_invitations', queryKey: ['project_invitations'] },
    { table: 'project_team_members', queryKey: ['team_members'] }
  ];

  // Set up core subscriptions when user is logged in
  useEffect(() => {
    if (user) {
      setSubscriptions(prevSubscriptions => {
        // Add core subscriptions that don't already exist
        const existingTables = new Set(prevSubscriptions.map(s => s.table));
        const newSubscriptions = coreSubscriptions.filter(s => !existingTables.has(s.table));
        return [...prevSubscriptions, ...newSubscriptions];
      });
    } else {
      // Clear subscriptions when user is logged out
      setSubscriptions([]);
    }
  }, [user]);

  // Set up global real-time subscriptions
  const { lastUpdates, isSubscribed } = useGlobalRealtimeSubscription({
    subscriptions,
    enabled: !!user,
    debounceMs: 100,
    onError: (error) => {
      console.error('Realtime subscription error:', error);
      toast({
        title: 'Connection issue',
        description: 'There was a problem with real-time updates',
        variant: 'destructive',
      });
    }
  });

  // Function to add a new subscription
  const addSubscription = (subscription: TableSubscription) => {
    setSubscriptions(prevSubscriptions => {
      // Don't add duplicate subscriptions
      const exists = prevSubscriptions.some(s => 
        s.table === subscription.table && 
        s.queryKey.toString() === subscription.queryKey.toString() &&
        s.filter === subscription.filter &&
        s.filterValue === subscription.filterValue
      );
      
      if (exists) return prevSubscriptions;
      return [...prevSubscriptions, subscription];
    });
  };

  // Function to remove a subscription
  const removeSubscription = (table: string, queryKey: string | string[]) => {
    setSubscriptions(prevSubscriptions => 
      prevSubscriptions.filter(s => 
        !(s.table === table && s.queryKey.toString() === queryKey.toString())
      )
    );
  };

  return (
    <RealtimeContext.Provider 
      value={{ 
        lastUpdates, 
        isSubscribed,
        addSubscription,
        removeSubscription
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};
