
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";
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

// Custom label renderer for the pie slices with arrows pointing outward
const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, name, index } = props;
  
  // Calculate position for the label
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.4; // Increased from 1.2 to position labels further outside
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  // Calculate arrow points
  const arrowStartX = cx + (outerRadius * 0.95) * Math.cos(-midAngle * RADIAN);
  const arrowStartY = cy + (outerRadius * 0.95) * Math.sin(-midAngle * RADIAN);
  
  // Only show labels for slices with reasonable size (at least 3% of total)
  if (percent < 0.03) return null;
  
  return (
    <g>
      {/* Arrow line */}
      <line 
        x1={arrowStartX} 
        y1={arrowStartY} 
        x2={x} 
        y2={y} 
        stroke="#666" 
        strokeWidth={1}
      />
      
      {/* Label text with value */}
      <text 
        x={x} 
        y={y} 
        fill="#333" 
        fontSize={12}
        fontWeight="500"
        textAnchor={x > cx ? "start" : "end"} 
        dominantBaseline="central"
        aria-label={`${name}: ${value} tasks (${(percent * 100).toFixed(1)}%)`}
        role="img"
      >
        {name}: {value}
      </text>
    </g>
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

  // Corrected center label to show total tasks count
  const renderCenterLabel = () => {
    return (
      <>
        <tspan x="0" dy="0" fontSize={isMobile ? 16 : 20} fontWeight="600">
          {total}
        </tspan>
        <tspan x="0" dy="1.2em" fontSize={isMobile ? 12 : 14} fontWeight="normal">
          Tasks
        </tspan>
      </>
    );
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
    <div className="w-full h-[240px] flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enhancedData}
            cx="50%"
            cy="50%"
            innerRadius={50} // Decreased from 60
            outerRadius={70} // Decreased from 80
            paddingAngle={2}
            dataKey="value"
            animationDuration={800}
            onClick={handlePieClick}
            className="cursor-pointer"
            isAnimationActive={true}
            label={renderCustomLabel}
            labelLine={false} // Remove default label lines
            // For screen readers
            role="graphics-document"
            aria-label="Task status distribution pie chart"
          >
            {enhancedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="white"
                strokeWidth={1}
              />
            ))}
            <Label
              position="center"
              content={() => (
                <g>
                  {renderCenterLabel()}
                </g>
              )}
            />
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
          {/* Legend has been removed as requested */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
