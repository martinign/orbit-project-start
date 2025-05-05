
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
    <div className="border-t pt-4">
      <h3 className="font-semibold mb-2">Locations</h3>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="countries" className="flex-1">Countries ({countries.length})</TabsTrigger>
          <TabsTrigger value="institutions" className="flex-1">Institutions ({institutions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="countries">
          <LocationsList type="countries" items={countries} />
        </TabsContent>
        
        <TabsContent value="institutions">
          <LocationsList type="institutions" items={institutions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
