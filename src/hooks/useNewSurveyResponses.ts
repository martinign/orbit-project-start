
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from 'sonner';

export function useNewSurveyResponses() {
  const [hasNewResponses, setHasNewResponses] = useState(false);
  const [responsesCount, setResponsesCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
      setResponsesCount(currentCount);
      // Only set hasNewResponses if we have a previous count to compare to
      if (responsesCount > 0 && currentCount > responsesCount) {
        setHasNewResponses(true);
      }
      setLoading(false);
    }
  }, [data, isLoading, responsesCount]);

  // Set up realtime subscription for new survey responses
  useRealtimeSubscription({
    table: 'survey_responses',
    event: 'INSERT',
    onRecordChange: (payload) => {
      // Update count and set the badge to visible
      setResponsesCount(prev => prev + 1);
      setHasNewResponses(true);
      
      // Show toast notification for new survey response
      toast.info('New survey response submitted');
      
      // Refetch to ensure count stays in sync
      refetch();
    }
  });

  // Function to reset the "new responses" indicator
  const clearNewResponsesIndicator = () => {
    setHasNewResponses(false);
  };

  return {
    hasNewResponses,
    responsesCount,
    loading,
    clearNewResponsesIndicator
  };
}
