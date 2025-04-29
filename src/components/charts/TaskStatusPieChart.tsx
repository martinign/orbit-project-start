
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label, LabelList, Legend } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface TaskStatusPieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  onSliceClick?: (status: string) => void;
}

// Custom label renderer for the pie slices
const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, name } = props;
  
  // Calculate position for the label
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  // Only show labels if the value is significant enough (at least 5% of total)
  if (percent < 0.05) return null;
  
  return (
    <text 
      x={x} 
      y={y} 
      fill="#fff" 
      fontWeight="bold"
      fontSize={12}
      textAnchor="middle" 
      dominantBaseline="central"
    >
      {value}
    </text>
  );
};

export function TaskStatusPieChart({ data, onSliceClick }: TaskStatusPieChartProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Sort data by value in descending order for better visualization
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  const handlePieClick = (data: any, index: number) => {
    if (onSliceClick) {
      onSliceClick(data.name);
    } else {
      // Default behavior: navigate to projects with status filter
      const status = data.name.toLowerCase();
      navigate('/projects', { state: { filterStatus: status } });
    }
  };

  // Format for center label to show total
  const centerLabel = (
    <tspan className="font-semibold">
      {total}
      <tspan x="0" dy="1.2em" className="text-xs font-normal">Tasks</tspan>
    </tspan>
  );

  return (
    <div className="w-full h-[240px] flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            animationDuration={800}
            onClick={handlePieClick}
            className="cursor-pointer"
            isAnimationActive={true}
            label={renderCustomLabel}
          >
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="white"
                strokeWidth={1}
              />
            ))}
            <Label
              position="center"
              fontSize={isMobile ? 16 : 20}
              className="font-medium"
              fill="#374151"
            >
              {centerLabel}
            </Label>
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                const value = Number(payload[0].value);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded"
                          style={{ background: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {value} tasks ({percentage}%)
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Click to view tasks
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            iconSize={8}
            iconType="circle"
            formatter={(value, entry, index) => {
              // TypeScript fix: Use type assertion to access color property
              // as we know the payload has the TaskStatusPieChartProps data structure
              const { payload } = entry as any;
              const item = payload;
              const percentage = ((item.value / total) * 100).toFixed(1);
              
              return (
                <HoverCard>
                  <HoverCardTrigger>
                    <span className="text-xs text-muted-foreground cursor-default flex items-center gap-1.5">
                      <span style={{ color: payload.color }}>{value}</span>
                      <span className="opacity-75">({percentage}%)</span>
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-auto p-2">
                    <div className="text-xs">
                      {value}: {item.value} tasks
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
