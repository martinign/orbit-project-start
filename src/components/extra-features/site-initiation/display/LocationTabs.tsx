
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
    <div>
      <h3 className="text-base font-medium mb-2">Locations</h3>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="countries">
          <LocationsList items={countries} type="countries" />
        </TabsContent>
        
        <TabsContent value="institutions">
          <LocationsList items={institutions} type="institutions" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
