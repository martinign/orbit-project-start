import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Collapsible, CollapsibleContent, CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SurveyResponseData } from './survey/SurveyTypes';

interface FeedbackTableProps {
  data: SurveyResponseData[];
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({ data }) => {
  // Track which rows are expanded to show feedback
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Function to format feature names for display
  const formatFeatureName = (feature: string): string => {
    switch(feature) {
      case 'project_management': return 'Project Management';
      case 'task_tracking': return 'Task Tracking';
      case 'team_collaboration': return 'Team Collaboration';
      case 'reporting': return 'Reporting';
      default: return feature;
    }
  };

  // Only show responses with additional feedback
  const responsesWithFeedback = data.filter(response => 
    response.additional_feedback && response.additional_feedback.trim() !== '');

  if (responsesWithFeedback.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No additional feedback has been provided in the survey responses.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Top Feature</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Feedback</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responsesWithFeedback.map((response) => (
              <React.Fragment key={response.id}>
                <TableRow>
                  <TableCell>{format(new Date(response.created_at), 'yyyy-MM-dd')}</TableCell>
                  <TableCell className="capitalize">{response.usage_frequency}</TableCell>
                  <TableCell>{formatFeatureName(response.most_useful_feature)}</TableCell>
                  <TableCell>{response.ease_of_use}/5</TableCell>
                  <TableCell>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-auto flex items-center"
                          onClick={() => toggleRow(response.id)}
                        >
                          {expandedRows.has(response.id) ? (
                            <ChevronUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          )}
                          {expandedRows.has(response.id) ? 'Hide' : 'View'}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 text-sm text-muted-foreground border-t pt-2">
                        {response.additional_feedback}
                      </CollapsibleContent>
                    </Collapsible>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
