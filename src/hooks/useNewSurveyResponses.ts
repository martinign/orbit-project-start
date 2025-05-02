
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';
import { useSurveyResponsesCount } from './useSurveyResponsesCount';

export function useNewSurveyResponses() {
  const [hasNewResponses, setHasNewResponses] = useState(false);
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);
  const isMartin = userProfile?.displayName === 'Martin Paris';
  
  const { 
    totalCount: responsesCount, 
    newCount, 
    loading, 
    resetNewResponsesCount 
  } = useSurveyResponsesCount();

  // Set hasNewResponses when newCount changes
  useEffect(() => {
    if (newCount > 0 && isMartin) {
      setHasNewResponses(true);
      toast.info('New survey response submitted');
    }
  }, [newCount, isMartin]);

  // Function to reset the "new responses" indicator
  const clearNewResponsesIndicator = () => {
    setHasNewResponses(false);
    resetNewResponsesCount();
  };

  return {
    // Only return hasNewResponses as true if the current user is Martin Paris
    hasNewResponses: isMartin ? hasNewResponses : false,
    responsesCount,
    loading,
    clearNewResponsesIndicator
  };
}
