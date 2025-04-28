
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface TaskStatusPieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export function TaskStatusPieChart({ data }: TaskStatusPieChartProps) {
  // Map colors to CSS variables or direct values
  const getCellFill = (color: string) => {
    if (color.startsWith('var(--')) {
      // Extract the CSS variable name and use it
      const varName = color.substring(6, color.length - 1);
      return `var(--${varName})`;
    }
    return color;
  };
  
  const calculatePercentage = (value: number): number => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="flex justify-center w-full">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCellFill(entry.color)} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const value = Number(payload[0].value);
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded"
                          style={{ background: getCellFill(payload[0].payload.color) }}
                        />
                        <span className="font-medium">{payload[0].payload.name}</span>
                      </div>
                      <div className="text-right font-medium">
                        {value} ({calculatePercentage(value)}%)
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
