
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from 'sonner';
import { useUserProfile } from './useUserProfile';
import { useAuth } from '@/contexts/AuthContext';

export function useNewSurveyResponses() {
  const [hasNewResponses, setHasNewResponses] = useState(false);
  const [responsesCount, setResponsesCount] = useState(0);
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
      setResponsesCount(currentCount);
      // Only set hasNewResponses if we have a previous count to compare to
      if (responsesCount > 0 && currentCount > responsesCount) {
        // Only show notification for Martin Paris
        if (isMartin) {
          setHasNewResponses(true);
        }
      }
      setLoading(false);
    }
  }, [data, isLoading, responsesCount, isMartin]);

  // Set up realtime subscription for new survey responses
  useRealtimeSubscription({
    table: 'survey_responses',
    event: 'INSERT',
    onRecordChange: (payload) => {
      // Update count and set the badge to visible only for Martin Paris
      setResponsesCount(prev => prev + 1);
      
      if (isMartin) {
        setHasNewResponses(true);
        // Show toast notification for new survey response
        toast.info('New survey response submitted');
      }
      
      // Refetch to ensure count stays in sync
      refetch();
    }
  });

  // Function to reset the "new responses" indicator
  const clearNewResponsesIndicator = () => {
    setHasNewResponses(false);
  };

  return {
    // Only return hasNewResponses as true if the current user is Martin Paris
    hasNewResponses: isMartin ? hasNewResponses : false,
    responsesCount,
    loading,
    clearNewResponsesIndicator
  };
}
