
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";

interface TabContentWrapperProps {
  value: string;
  title: string;
  children: React.ReactNode;
}

export const TabContentWrapper: React.FC<TabContentWrapperProps> = ({ 
  value, 
  title, 
  children 
}) => {
  return (
    <TabsContent value={value} className="space-y-4">
      <div className="bg-muted p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        {children}
      </div>
    </TabsContent>
  );
};

