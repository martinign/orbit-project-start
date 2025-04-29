
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSurveyAvailability } from '@/hooks/useSurveyAvailability';
import { useSurvey } from '@/hooks/useSurvey';
import { SurveyForm, SurveyFormValues } from './SurveyForm';
import { SurveyResults } from './SurveyResults';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function SurveyDialog({ open, onOpenChange, onSuccess }: SurveyDialogProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("survey");
  const [isMartin, setIsMartin] = useState(false);

  const {
    surveyResponses,
    isLoading,
    isSubmitting,
    fetchSurveyResults,
    submitSurvey
  } = useSurvey();

  useEffect(() => {
    if (user) {
      // Check if current user is Martin Paris
      setIsMartin(user.id === '83207e9f-643c-400f-ae81-a51e120afaa2');
    }
  }, [user]);

  useEffect(() => {
    // Only fetch results when the dialog is open and the user is Martin
    if (open && isMartin && activeTab === "results") {
      fetchSurveyResults();
    }
  }, [open, activeTab, isMartin, fetchSurveyResults]);

  const handleSubmit = async (values: SurveyFormValues) => {
    const success = await submitSurvey(values);
    if (success) {
      // Close the dialog and trigger success callback
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>PXL Management Tool Survey</DialogTitle>
          <DialogDescription>
            We value your feedback! Please take a moment to help us improve our tool.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="survey" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="survey">Submit Survey</TabsTrigger>
            {isMartin && (
              <TabsTrigger value="results">View Results</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="survey">
            <SurveyForm 
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
          
          {isMartin && (
            <TabsContent value="results">
              <SurveyResults 
                data={surveyResponses}
                isLoading={isLoading}
                onClose={() => onOpenChange(false)}
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
