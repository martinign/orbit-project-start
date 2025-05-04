
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AuthWarningProps {
  isVisible: boolean;
}

export const AuthWarning: React.FC<AuthWarningProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4 flex items-center gap-2">
      <AlertTriangle className="h-5 w-5 text-yellow-500" />
      <p className="text-yellow-700 text-sm">Please sign in to create and manage document requests</p>
    </div>
  );
};
