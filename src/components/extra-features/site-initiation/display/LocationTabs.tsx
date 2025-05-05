
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="countries">Countries ({countries.length})</TabsTrigger>
        <TabsTrigger value="institutions">Institutions ({institutions.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="countries">
        <LocationsList items={countries} type="countries" />
      </TabsContent>
      
      <TabsContent value="institutions">
        <LocationsList items={institutions} type="institutions" />
      </TabsContent>
    </Tabs>
  );
};
