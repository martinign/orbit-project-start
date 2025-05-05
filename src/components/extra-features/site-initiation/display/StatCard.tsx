
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  loading: boolean;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  loading,
  icon: Icon,
  iconBgColor,
  iconColor,
  highlight = false
}) => {
  return (
    <Card className={cn("overflow-hidden", highlight && "ring-2 ring-yellow-300")}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-full", iconBgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className={cn("text-2xl font-bold", highlight && "text-blue-600")}>
                {value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
