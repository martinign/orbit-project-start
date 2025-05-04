
import React from 'react';
import { DocPrintingRequests } from '../DocPrintingRequests';
import { DocRequest, DocStatus } from '../api/docRequestsApi';
import { AuthWarning } from './AuthWarning';

interface DocPrintingContentProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  filteredRequests: DocRequest[];
  onEdit: (request: DocRequest) => void;
  onDelete: (request: DocRequest) => void;
  onStatusChange: (requestId: string, status: DocStatus) => void;
}

export const DocPrintingContent: React.FC<DocPrintingContentProps> = ({
  isAuthenticated,
  isLoading,
  filteredRequests,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <>
      <AuthWarning isVisible={!isAuthenticated} />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading document requests...</p>
        </div>
      ) : (
        <DocPrintingRequests
          requests={filteredRequests}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      )}
    </>
  );
};
