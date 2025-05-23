
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import our new components
import { SurveyResultsCharts, SurveyResponseData } from './SurveyResultsCharts';
import { SurveyResultsSummary } from './SurveyResultsSummary';
import { FeedbackTable } from './FeedbackTable';
import { Loader2 } from 'lucide-react';

interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const surveySchema = z.object({
  usage_frequency: z.enum(['daily', 'weekly', 'monthly', 'rarely']),
  most_useful_feature: z.enum(['project_management', 'task_tracking', 'team_collaboration', 'reporting']),
  ease_of_use: z.number().min(1).max(5),
  improvement_area: z.enum(['ui_design', 'performance', 'feature_set', 'documentation', 'other']),
  task_management_satisfaction: z.number().min(1).max(5),
  workday_codes_usage: z.enum(['frequently', 'occasionally', 'rarely', 'never']),
  additional_feedback: z.string().optional(),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function SurveyDialog({ open, onOpenChange, onSuccess }: SurveyDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("survey");
  const [isMartin, setIsMartin] = useState(false);
  const [hasSubmittedSurvey, setHasSubmittedSurvey] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);

  useEffect(() => {
    if (user) {
      // Check if current user is Martin Paris
      setIsMartin(user.id === '83207e9f-643c-400f-ae81-a51e120afaa2');
      
      // Check if user has already submitted a survey
      const checkPreviousSubmission = async () => {
        setCheckingSubmission(true);
        try {
          const { data, error } = await supabase
            .from('survey_responses')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);
          
          if (error) throw error;
          
          setHasSubmittedSurvey(data && data.length > 0);
        } catch (error) {
          console.error('Error checking survey submission:', error);
        } finally {
          setCheckingSubmission(false);
        }
      };
      
      checkPreviousSubmission();
    }
  }, [user]);

  useEffect(() => {
    // Only fetch results when the dialog is open and the user is Martin
    if (open && isMartin && activeTab === "results") {
      fetchSurveyResults();
    }
  }, [open, activeTab, isMartin]);

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

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      usage_frequency: 'weekly',
      most_useful_feature: 'task_tracking',
      ease_of_use: 3,
      improvement_area: 'feature_set',
      task_management_satisfaction: 3,
      workday_codes_usage: 'occasionally',
      additional_feedback: '',
    },
  });

  const onSubmit = async (values: SurveyFormValues) => {
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
      // Double check user hasn't already submitted a survey
      const { data, error: checkError } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (data && data.length > 0) {
        toast({
          variant: "destructive",
          title: "Already submitted",
          description: "You have already submitted a survey response.",
        });
        setHasSubmittedSurvey(true);
        setIsSubmitting(false);
        return;
      }

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

      setHasSubmittedSurvey(true);
      
      // Close the dialog and trigger success callback
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your survey. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking submission status
  if (checkingSubmission) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>PXL Management Tool Survey</DialogTitle>
          <DialogDescription>
            We value your feedback! Please take a moment to help us improve our tool.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={hasSubmittedSurvey ? "results" : "survey"} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="survey" disabled={hasSubmittedSurvey && !isMartin}>Submit Survey</TabsTrigger>
            {(isMartin || hasSubmittedSurvey) && (
              <TabsTrigger value="results">View Results</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="survey">
            {hasSubmittedSurvey ? (
              <div className="p-6 text-center">
                <h3 className="text-xl font-medium mb-2">Thank you for your response!</h3>
                <p className="text-gray-500">You have already submitted your feedback for the survey.</p>
                {isMartin && (
                  <p className="mt-4 text-blue-600">
                    As an administrator, you can view all responses in the Results tab.
                  </p>
                )}
                <Button 
                  onClick={() => onOpenChange(false)} 
                  className="bg-blue-500 hover:bg-blue-600 text-white mt-6"
                >
                  Close
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="usage_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How frequently do you use the PXL Management Tool?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="daily" />
                              </FormControl>
                              <FormLabel className="font-normal">Daily</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="weekly" />
                              </FormControl>
                              <FormLabel className="font-normal">Weekly</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="monthly" />
                              </FormControl>
                              <FormLabel className="font-normal">Monthly</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="rarely" />
                              </FormControl>
                              <FormLabel className="font-normal">Rarely</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="most_useful_feature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Which feature of the tool do you find most useful?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="project_management" />
                              </FormControl>
                              <FormLabel className="font-normal">Project Management</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="task_tracking" />
                              </FormControl>
                              <FormLabel className="font-normal">Task Tracking</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="team_collaboration" />
                              </FormControl>
                              <FormLabel className="font-normal">Team Collaboration</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="reporting" />
                              </FormControl>
                              <FormLabel className="font-normal">Reporting</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ease_of_use"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How would you rate the ease of use? (1-5)</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(val) => field.onChange(parseInt(val))}
                            defaultValue={field.value.toString()}
                            className="flex space-x-4"
                          >
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <FormItem key={rating} className="flex items-center space-x-1 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={rating.toString()} />
                                </FormControl>
                                <FormLabel className="font-normal">{rating}</FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>1 = Very difficult, 5 = Very easy</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="improvement_area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What area needs the most improvement?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="ui_design" />
                              </FormControl>
                              <FormLabel className="font-normal">UI Design</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="performance" />
                              </FormControl>
                              <FormLabel className="font-normal">Performance</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="feature_set" />
                              </FormControl>
                              <FormLabel className="font-normal">Feature Set</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="documentation" />
                              </FormControl>
                              <FormLabel className="font-normal">Documentation</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="other" />
                              </FormControl>
                              <FormLabel className="font-normal">Other</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="task_management_satisfaction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How satisfied are you with the task management features? (1-5)</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(val) => field.onChange(parseInt(val))}
                            defaultValue={field.value.toString()}
                            className="flex space-x-4"
                          >
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <FormItem key={rating} className="flex items-center space-x-1 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={rating.toString()} />
                                </FormControl>
                                <FormLabel className="font-normal">{rating}</FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>1 = Very unsatisfied, 5 = Very satisfied</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workday_codes_usage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How often do you use the workday codes feature?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="frequently" />
                              </FormControl>
                              <FormLabel className="font-normal">Frequently</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="occasionally" />
                              </FormControl>
                              <FormLabel className="font-normal">Occasionally</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="rarely" />
                              </FormControl>
                              <FormLabel className="font-normal">Rarely</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="never" />
                              </FormControl>
                              <FormLabel className="font-normal">Never</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additional_feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional feedback or suggestions (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your thoughts on how we can improve the tool..."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
                      {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </TabsContent>
          
          {(isMartin || hasSubmittedSurvey) && (
            <TabsContent value="results" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Survey Results Analysis</h3>
                {isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : surveyResponses.length > 0 ? (
                  <div className="space-y-6">
                    {/* Summary statistics */}
                    <SurveyResultsSummary data={surveyResponses} />
                    
                    {/* Charts for data visualization */}
                    <SurveyResultsCharts data={surveyResponses} />
                    
                    {/* Additional feedback table */}
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Additional Feedback</h3>
                      <FeedbackTable data={surveyResponses} />
                    </div>
                  </div>
                ) : (
                  <p>No survey responses found.</p>
                )}
                <Button 
                  onClick={() => onOpenChange(false)} 
                  className="bg-blue-500 hover:bg-blue-600 text-white mt-4 ml-auto block"
                >
                  Close
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
