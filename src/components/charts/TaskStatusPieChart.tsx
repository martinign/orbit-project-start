import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface TaskStatusPieChartProps {
  data: {
    name: string;
    value: number;
    color?: string;     // color will be overridden
  }[];
  onSliceClick?: (status: string) => void;
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}: any) => {
  if (percent < 0.02) return null;

  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 0.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      fontWeight="bold"
      fontSize={12}
      textAnchor="middle"
      dominantBaseline="central"
      aria-label={`${(percent * 100).toFixed(0)}% ${name}`}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export function TaskStatusPieChart({
  data,
  onSliceClick,
}: TaskStatusPieChartProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // sort & colorize
  const colorPalette = [
    "#3b82f6",
    "#22c55e",
    "#eab308",
    "#ef4444",
    "#888888",
  ];
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const enhanced = sorted.map((d, i) => ({
    ...d,
    color: colorPalette[i % colorPalette.length],
  }));
  const total = enhanced.reduce((sum, d) => sum + d.value, 0);

  const handleClick = (entry: any) => {
    const statusKey = entry.name.toLowerCase().replace(/\s+/g, "-");
    if (onSliceClick) onSliceClick(entry.name);
    else navigate("/projects", { state: { filterStatus: statusKey } });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* keep chart square by aspect ratio */}
      <ResponsiveContainer width="100%" aspect={1}>
        <PieChart>
          <Pie
            data={enhanced}
            dataKey="value"
            nameKey="name"                  {/* <-- fixes “references” to name */}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 60 : 80}  
            outerRadius={isMobile ? 90 : 120}
            labelLine={false}
            label={renderCustomizedLabel}
            onClick={handleClick}
            isAnimationActive
          >
            {enhanced.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              const percent = ((value / total) * 100).toFixed(1);
              return [`${value} tasks (${percent}%)`, name];
            }}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={8}
            formatter={(name) => (
              <span className="text-sm font-medium">{name}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
