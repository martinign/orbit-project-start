
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ErrorStateProps {
  error: Error;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error</CardTitle>
        <CardDescription>Failed to load site initiation data</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-red-500">Error: {error.message}</p>
      </CardContent>
    </Card>
  );
};
