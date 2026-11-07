import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { AssessmentSummary } from '@/types/assessment';

interface HealthConditionDonutProps {
  summary: AssessmentSummary;
  height?: number;
}

export const HealthConditionDonut: React.FC<HealthConditionDonutProps> = ({
  summary,
  height = 260,
}) => {
  const data = [
    {
      name: 'Healthy Coral',
      value: summary.healthyCoral.count,
      pct: summary.healthyCoral.percentage,
      color: '#29B8E6', // Coral Bay Blue (#29B8E6)
    },
    {
      name: 'Bleached Coral',
      value: summary.bleachedCoral.count,
      pct: summary.bleachedCoral.percentage,
      color: '#FB8E5F', // Sunset Foam (#FB8E5F)
    },
    {
      name: 'Dead Coral',
      value: summary.deadCoral.count,
      pct: summary.deadCoral.percentage,
      color: '#B8688B', // Seashell Blush (#B8688B)
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-reef-midnight/95 border border-reef-coralBay/40 p-3 rounded-xl shadow-2xl text-xs font-mono backdrop-blur-md">
          <p className="font-bold text-white flex items-center gap-1.5 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </p>
          <p className="text-slate-300 mt-1.5">Specimens: <span className="text-white font-bold">{item.value}</span></p>
          <p className="text-reef-coralBay font-bold">Proportion: {item.pct}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#162B42" strokeWidth={2.5} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-xs text-slate-200 font-semibold">
                  {value} ({entry.payload.pct}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
