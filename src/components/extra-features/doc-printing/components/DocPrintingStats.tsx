
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusCounts {
  pending: number;
  approved: number;
  completed: number;
  cancelled: number;
  total: number;
  totalAmount?: number;
}

interface DocPrintingStatsProps {
  statusCounts: StatusCounts;
}

export const DocPrintingStats: React.FC<DocPrintingStatsProps> = ({ statusCounts }) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Badge variant="outline" className="py-1">
        <span className="mr-1">All:</span>
        <span>{statusCounts.total}</span>
      </Badge>

      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 py-1">
        <span className="mr-1">Pending:</span>
        <span>{statusCounts.pending}</span>
      </Badge>
      
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 py-1">
        <span className="mr-1">Approved:</span>
        <span>{statusCounts.approved}</span>
      </Badge>
      
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 py-1">
        <span className="mr-1">Completed:</span>
        <span>{statusCounts.completed}</span>
      </Badge>

      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 py-1">
        <span className="mr-1">Cancelled:</span>
        <span>{statusCounts.cancelled}</span>
      </Badge>
      
      {statusCounts.totalAmount !== undefined && (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 py-1">
          <span className="mr-1">Total Copies:</span>
          <span>{statusCounts.totalAmount}</span>
        </Badge>
      )}
    </div>
  );
};
