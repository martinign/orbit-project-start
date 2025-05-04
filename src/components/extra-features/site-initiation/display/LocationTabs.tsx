
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationsList } from './LocationsList';

interface LocationTabsProps {
  countries: string[];
  institutions: string[];
}

export const LocationTabs: React.FC<LocationTabsProps> = ({
  countries,
  institutions
}) => {
  const [activeTab, setActiveTab] = useState<string>("countries");
  
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="mt-4"
    >
      <TabsList>
        <TabsTrigger value="countries">Countries</TabsTrigger>
        <TabsTrigger value="institutions">Institutions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="countries">
        <LocationsList 
          type="countries" 
          items={countries} 
          noDataMessage="No countries available" 
        />
      </TabsContent>
      
      <TabsContent value="institutions">
        <LocationsList 
          type="institutions" 
          items={institutions} 
          noDataMessage="No institutions available" 
        />
      </TabsContent>
    </Tabs>
  );
};
