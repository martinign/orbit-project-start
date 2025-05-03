
import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-10 text-muted-foreground">
      <p>No site initiation data available.</p>
      <p className="text-sm">Use the Import CSV tab to upload site data.</p>
    </div>
  );
};
