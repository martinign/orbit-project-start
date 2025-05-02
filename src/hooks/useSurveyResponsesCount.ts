
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';

export function useSurveyResponsesCount() {
  const [count, setCount] = useState(0);
  const [newResponsesCount, setNewResponsesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);
  const isMartin = userProfile?.displayName === 'Martin Paris';

  // Fetch initial count of survey responses
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['survey_responses_count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching survey responses count:', error);
        throw error;
      }
      
      return count || 0;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Update state when data is loaded
  useEffect(() => {
    if (!isLoading) {
      const currentCount = data || 0;
      setCount(currentCount);
      setLoading(false);
    }
  }, [data, isLoading]);

  // Set up realtime subscription for new survey responses
  useRealtimeSubscription({
    table: 'survey_responses',
    event: 'INSERT',
    onRecordChange: () => {
      console.log('Realtime survey response detected!');
      // Increment the counts
      setCount(prev => prev + 1);
      
      // Only increment new responses count for Martin
      if (isMartin) {
        setNewResponsesCount(prev => prev + 1);
        console.log('New survey response received, incrementing new responses count:', newResponsesCount + 1);
      }
      
      // Refetch to ensure count stays in sync
      refetch();
    }
  });

  // Reset the new responses counter
  const resetNewResponsesCount = () => {
    console.log('Resetting new responses count from', newResponsesCount, 'to 0');
    setNewResponsesCount(0);
  };

  return {
    totalCount: count,
    // Only return newCount if the user is Martin Paris
    newCount: isMartin ? newResponsesCount : 0,
    loading,
    resetNewResponsesCount,
  };
}
