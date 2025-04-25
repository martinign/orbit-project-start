
import React from 'react';

export const TimelineLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 items-center text-sm">
      <span className="font-medium">Status Legend:</span>
      <div className="flex items-center">
        <span className="inline-block w-3 h-3 mr-1 bg-gray-500 rounded-full"></span>
        <span>Not Started</span>
      </div>
      <div className="flex items-center">
        <span className="inline-block w-3 h-3 mr-1 bg-yellow-500 rounded-full"></span>
        <span>Pending</span>
      </div>
      <div className="flex items-center">
        <span className="inline-block w-3 h-3 mr-1 bg-blue-500 rounded-full"></span>
        <span>In Progress</span>
      </div>
      <div className="flex items-center">
        <span className="inline-block w-3 h-3 mr-1 bg-green-500 rounded-full"></span>
        <span>Completed</span>
      </div>
      <div className="flex items-center">
        <span className="inline-block w-3 h-3 mr-1 bg-red-500 rounded-full"></span>
        <span>Stucked</span>
      </div>
    </div>
  );
};
