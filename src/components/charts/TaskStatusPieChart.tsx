
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface TaskStatusPieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  onSliceClick?: (status: string) => void;
}

// Custom label renderer for inside the pie slices
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, name } = props;
  
  // Skip rendering labels for very small slices (less than 2% of total)
  if (percent < 0.02) return null;
  
  const RADIAN = Math.PI / 180;
  // Position label closer to the outer edge of the slice (80% of radius)
  const radius = outerRadius * 0.8;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  return (
    <text 
      x={x} 
      y={y} 
      fill="#fff" 
      fontWeight="bold"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      aria-label={`${(percent * 100).toFixed(0)}% ${name} tasks`}
      role="img"
    >
      {(percent * 100).toFixed(0)}%
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

  // Enhanced colorblind-friendly palette
  const colorPalette = [
    "#3b82f6", // blue for completed
    "#22c55e", // green for in progress
    "#eab308", // yellow for pending
    "#ef4444", // red for stucked
    "#888888", // gray for not started
  ];

  // Reassign colors to make sure they're colorblind friendly
  const enhancedData = sortedData.map((item, index) => ({
    ...item,
    color: colorPalette[index % colorPalette.length]
  }));

  return (
    <div className="w-full h-[380px] flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enhancedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={isMobile ? 130 : 160}
            dataKey="value"
            animationDuration={800}
            onClick={handlePieClick}
            className="cursor-pointer"
            isAnimationActive={true}
            label={renderCustomizedLabel} // Labels inside the pie slices
            // For screen readers
            role="graphics-document"
            aria-label="Task status distribution pie chart"
          >
            {enhancedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="white"
                strokeWidth={2}
              />
            ))}
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
