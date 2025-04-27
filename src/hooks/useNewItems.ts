
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ItemType = 'note' | 'contact' | 'task' | 'event' | 'team_member';

interface NewItemsCount {
  [key: string]: number;
}

export function useNewItems(projectId: string) {
  const [newItemsCount, setNewItemsCount] = useState<NewItemsCount>({});

  const { data: counts } = useQuery({
    queryKey: ['new_items_count', projectId],
    queryFn: async () => {
      const types: ItemType[] = ['note', 'contact', 'task', 'event', 'team_member'];
      
      // Directly query the database for each item type
      const counts = await Promise.all(
        types.map(async (type) => {
          // Get counts of items created in the last 24 hours
          const { data, error } = await supabase
            .from(`project_${type}s`)
            .select('id', { count: 'exact', head: true })
            .eq('project_id', projectId)
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            
          if (error) {
            console.error(`Error fetching new ${type}s count:`, error);
            return { type, count: 0 };
          }
          
          return { type, count: data || 0 };
        })
      );
      
      return Object.fromEntries(counts.map(({ type, count }) => [type, count]));
    },
    enabled: !!projectId,
    refetchInterval: 60000, // Refresh every minute to update badge visibility
  });

  useEffect(() => {
    if (counts) {
      setNewItemsCount(counts);
    }
  }, [counts]);

  // Simplified function to mark an item as viewed
  // Instead of updating a separate table, we'll track this in local state
  const markItemViewed = async (itemId: string, itemType: ItemType) => {
    // Update local state to remove the badge for this item type
    setNewItemsCount(prev => ({
      ...prev,
      [itemType]: Math.max(0, (prev[itemType] || 0) - 1)
    }));
  };

  return {
    newItemsCount,
    markItemViewed
  };
}
