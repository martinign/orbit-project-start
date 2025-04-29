
import { useState, useEffect } from 'react';
import { addMonths, isBefore } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useSurveyAvailability() {
  const { user } = useAuth();
  const [canSubmitSurvey, setCanSubmitSurvey] = useState(true);
  const [lastSubmissionDate, setLastSubmissionDate] = useState<Date | null>(null);
  const [nextAvailableDate, setNextAvailableDate] = useState<Date | null>(null);
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
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error checking survey availability:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // User has submitted at least one survey
          const lastSubmissionDateStr = data[0].created_at;
          const lastDate = new Date(lastSubmissionDateStr);
          const nextDate = addMonths(lastDate, 3);
          
          // Check if 3 months have passed since the last submission
          const canSubmit = isBefore(nextDate, new Date());
          
          setLastSubmissionDate(lastDate);
          setNextAvailableDate(nextDate);
          setCanSubmitSurvey(canSubmit);
        } else {
          // User has never submitted a survey
          setCanSubmitSurvey(true);
          setLastSubmissionDate(null);
          setNextAvailableDate(null);
        }
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
    lastSubmissionDate,
    nextAvailableDate,
    loading
  };
}
