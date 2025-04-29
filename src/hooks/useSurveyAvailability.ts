
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useSurveyAvailability() {
  const { user } = useAuth();
  const [canSubmitSurvey, setCanSubmitSurvey] = useState(true);
  const [hasSubmittedSurvey, setHasSubmittedSurvey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSurveyAvailability() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get the most recent survey submission for the current user
        const { data, error } = await supabase
          .from('survey_responses')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.error('Error checking survey availability:', error);
          setLoading(false);
          return;
        }

        // User has submitted at least one survey
        setHasSubmittedSurvey(data && data.length > 0);
        setCanSubmitSurvey(!(data && data.length > 0));
      } catch (error) {
        console.error('Error checking survey availability:', error);
      } finally {
        setLoading(false);
      }
    }

    checkSurveyAvailability();
  }, [user]);

  return {
    canSubmitSurvey,
    hasSubmittedSurvey,
    loading
  };
}
