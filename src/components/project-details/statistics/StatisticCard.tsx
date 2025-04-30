
import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { LucideIcon } from 'lucide-react';

interface StatisticCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  onClick?: () => void;
  newItemsCount?: number;
  extraContent?: React.ReactNode;
  iconColor?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  icon,
  onClick,
  newItemsCount,
  extraContent,
  iconColor = 'text-blue-500',
}) => {
  const renderBadge = () => {
    if (!newItemsCount) return null;
    
    const timeAgo = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'pp');
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="success" 
              className="absolute top-2 right-2 animate-in fade-in"
            >
              {newItemsCount} new
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Added since {timeAgo}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-accent relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {renderBadge()}
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {extraContent}
          </div>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
