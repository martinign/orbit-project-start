
import React from 'react';
import { Button } from '@/components/ui/button';
import { SurveyResultsSummary } from './SurveyResultsSummary';
import { SurveyResultsCharts, SurveyResponseData } from './SurveyResultsCharts';
import { FeedbackTable } from './FeedbackTable';

interface SurveyResultsProps {
  data: SurveyResponseData[];
  isLoading: boolean;
  onClose: () => void;
}

export const SurveyResults: React.FC<SurveyResultsProps> = ({
  data,
  isLoading,
  onClose,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Survey Results Analysis</h3>
      {isLoading ? (
        <p>Loading survey responses...</p>
      ) : data.length > 0 ? (
        <div className="space-y-6">
          {/* Summary statistics */}
          <SurveyResultsSummary data={data} />
          
          {/* Charts for data visualization */}
          <SurveyResultsCharts data={data} />
          
          {/* Additional feedback table */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Additional Feedback</h3>
            <FeedbackTable data={data} />
          </div>
        </div>
      ) : (
        <p>No survey responses found.</p>
      )}
      <Button 
        onClick={onClose} 
        className="bg-blue-500 hover:bg-blue-600 text-white mt-4 ml-auto block"
      >
        Close
      </Button>
    </div>
  );
};
