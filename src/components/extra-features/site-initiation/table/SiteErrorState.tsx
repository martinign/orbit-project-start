
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SiteErrorStateProps {
  error: Error;
}

export const SiteErrorState: React.FC<SiteErrorStateProps> = ({ error }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error</CardTitle>
        <CardDescription>Failed to load site data</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-red-500">Error: {error.message}</p>
      </CardContent>
    </Card>
  );
};
