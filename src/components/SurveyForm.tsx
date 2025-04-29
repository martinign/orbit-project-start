
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const surveySchema = z.object({
  usage_frequency: z.enum(['daily', 'weekly', 'monthly', 'rarely']),
  most_useful_feature: z.enum(['project_management', 'task_tracking', 'team_collaboration', 'reporting']),
  ease_of_use: z.number().min(1).max(5),
  improvement_area: z.enum(['ui_design', 'performance', 'feature_set', 'documentation', 'other']),
  task_management_satisfaction: z.number().min(1).max(5),
  workday_codes_usage: z.enum(['frequently', 'occasionally', 'rarely', 'never']),
  additional_feedback: z.string().optional(),
});

export type SurveyFormValues = z.infer<typeof surveySchema>;

interface SurveyFormProps {
  onSubmit: (values: SurveyFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
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

  return (
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

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
