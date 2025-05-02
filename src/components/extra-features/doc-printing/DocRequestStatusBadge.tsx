
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { DocStatus } from './api/docRequestsApi';

const getStatusColor = (status: DocStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'approved':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

interface DocRequestStatusBadgeProps {
  status: DocStatus;
}

export const DocRequestStatusBadge: React.FC<DocRequestStatusBadgeProps> = ({ status }) => {
  return (
    <Badge className={`${getStatusColor(status)} font-medium`} variant="outline">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
