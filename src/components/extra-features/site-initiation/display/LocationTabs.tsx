
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationsList } from './LocationsList';

interface LocationTabsProps {
  countries: string[];
  institutions: string[];
}

export const LocationTabs: React.FC<LocationTabsProps> = ({ countries, institutions }) => {
  return (
    <Tabs defaultValue="countries">
      <TabsList className="w-full md:w-auto">
        <TabsTrigger value="countries">Countries</TabsTrigger>
        <TabsTrigger value="institutions">Institutions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="countries" className="pt-4">
        <LocationsList 
          items={countries} 
          type="countries" 
          noDataMessage="No country data available"
        />
      </TabsContent>
      
      <TabsContent value="institutions" className="pt-4">
        <LocationsList 
          items={institutions} 
          type="institutions" 
          noDataMessage="No institution data available"
        />
      </TabsContent>
    </Tabs>
  );
};
