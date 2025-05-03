
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  loading: boolean;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  loading, 
  icon: Icon,
  iconBgColor,
  iconColor
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className={`mr-2 rounded-full ${iconBgColor} p-2`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <div className="text-2xl font-bold">
            {loading ? '...' : value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
