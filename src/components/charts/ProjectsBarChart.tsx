
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { useMediaQuery } from "@/hooks/use-mobile";

interface ProjectsBarChartProps {
  data: {
    name: string;
    value: number;
    color: string;
    status: string;
  }[];
  onBarClick?: (status: string) => void;
}

export function ProjectsBarChart({ data, onBarClick }: ProjectsBarChartProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const handleBarClick = (entry: any) => {
    if (onBarClick && entry?.status) {
      onBarClick(entry.status);
    }
  };

  // For mobile view, adjust the layout
  const chartLayout = isMobile ? "vertical" : "horizontal";
  const chartHeight = isMobile ? 300 : 200;
  
  return (
    <div className="w-full h-[200px] sm:h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout={chartLayout}
          margin={{ top: 5, right: 20, left: 15, bottom: 15 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={true} 
            vertical={false} 
            stroke="#e5e7eb" 
          />
          <XAxis 
            dataKey="name" 
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#d1d5db" }}
            stroke="#94a3b8"
          />
          <YAxis 
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#d1d5db" }}
            stroke="#94a3b8"
            label={{ 
              value: "Number of projects", 
              angle: -90, 
              position: 'insideLeft',
              style: { 
                textAnchor: 'middle',
                fill: '#94a3b8',
                fontSize: 12
              }
            }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            cursor={{ fill: 'rgba(229, 231, 235, 0.4)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded"
                          style={{ background: payload[0].payload.color }}
                        />
                        <span className="font-medium">{payload[0].payload.name}</span>
                      </div>
                      <div className="text-right font-medium">
                        {payload[0].value}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Click to view all {payload[0].payload.name.toLowerCase()} projects
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            onClick={handleBarClick}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
