
import React from 'react';
import { Globe, Users, MapPin, Building, PackageCheck } from 'lucide-react';
import { StatCard } from './StatCard';

interface SummaryStatsProps {
  summary: {
    totalSites: number;
    personnel: number;
    institutions: string[];
    countries: string[];
    labpSites: number;
  };
  loading: boolean;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ summary, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Sites"
        value={summary.totalSites}
        loading={loading}
        icon={MapPin}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        highlight={true} // Highlight this card to match the image
      />
      
      <StatCard
        title="Total Personnel"
        value={summary.personnel}
        loading={loading}
        icon={Users}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
      />
      
      <StatCard
        title="Institutions"
        value={summary.institutions.length}
        loading={loading}
        icon={Building}
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
      />
      
      <StatCard
        title="Countries"
        value={summary.countries.length}
        loading={loading}
        icon={Globe}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      />
      
      <StatCard
        title="LABP Sites"
        value={summary.labpSites}
        loading={loading}
        icon={PackageCheck}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
      />
    </div>
  );
};
