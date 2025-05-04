
import React from 'react';

interface DocPrintingStatsProps {
  statusCounts: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
    cancelled?: number;
  };
}

export const DocPrintingStats: React.FC<DocPrintingStatsProps> = ({ statusCounts }) => {
  return (
    <div className="flex gap-4">
      <div className="text-sm">
        <span className="text-gray-500">Total: </span>
        <span className="font-medium">{statusCounts.total}</span>
      </div>
      <div className="text-sm">
        <span className="text-yellow-500">Pending: </span>
        <span className="font-medium">{statusCounts.pending}</span>
      </div>
      <div className="text-sm">
        <span className="text-blue-500">Approved: </span>
        <span className="font-medium">{statusCounts.approved}</span>
      </div>
      <div className="text-sm">
        <span className="text-green-500">Completed: </span>
        <span className="font-medium">{statusCounts.completed}</span>
      </div>
    </div>
  );
};
