
import React from 'react';
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
  return (
    <div className="mt-4">
      <h3 className="font-medium text-base mb-2">Locations</h3>
      <Tabs defaultValue="countries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="countries">Countries ({countries.length})</TabsTrigger>
          <TabsTrigger value="institutions">Institutions ({institutions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="countries">
          <LocationsList items={countries} />
        </TabsContent>
        <TabsContent value="institutions">
          <LocationsList items={institutions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
