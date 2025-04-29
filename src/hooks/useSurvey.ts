
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SurveyFormValues } from '@/components/SurveyForm';
import { SurveyResponseData } from '@/components/survey/SurveyTypes';

export function useSurvey() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSurveyResults = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast the data to the correct type
      setSurveyResponses(data as SurveyResponseData[]);
    } catch (error) {
      console.error('Error fetching survey results:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load survey results.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitSurvey = async (values: SurveyFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to submit a survey",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure all required fields are explicitly included in the insert
      const { error } = await supabase.from('survey_responses').insert({
        user_id: user.id,
        usage_frequency: values.usage_frequency,
        most_useful_feature: values.most_useful_feature,
        ease_of_use: values.ease_of_use,
        improvement_area: values.improvement_area,
        task_management_satisfaction: values.task_management_satisfaction,
        workday_codes_usage: values.workday_codes_usage,
        additional_feedback: values.additional_feedback || '',
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Survey submitted",
        description: "Thank you for your feedback!",
      });

      return true;
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your survey. Please try again.",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    surveyResponses,
    isLoading,
    isSubmitting,
    fetchSurveyResults,
    submitSurvey,
  };
}
