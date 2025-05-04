
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
      <h3 className="text-lg font-medium mb-3">Locations</h3>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="countries">Countries ({countries.length})</TabsTrigger>
          <TabsTrigger value="institutions">Institutions ({institutions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="countries">
          <LocationsList 
            items={countries} 
            type="countries" 
            noDataMessage="No countries available" 
          />
        </TabsContent>
        
        <TabsContent value="institutions">
          <LocationsList 
            items={institutions} 
            type="institutions"
            noDataMessage="No institutions available" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
