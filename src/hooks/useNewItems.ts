
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
      const counts = await Promise.all(
        types.map(async (type) => {
          const { count } = await supabase.rpc('get_new_items_count', {
            p_project_id: projectId,
            p_item_type: type
          });
          return { type, count: count || 0 };
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

  const markItemViewed = async (itemId: string, itemType: ItemType) => {
    await supabase
      .from('item_views')
      .update({ viewed_at: new Date().toISOString() })
      .eq('item_id', itemId)
      .eq('item_type', itemType);
  };

  return {
    newItemsCount,
    markItemViewed
  };
}
