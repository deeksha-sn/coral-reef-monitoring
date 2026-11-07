import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { AssessmentSummary } from '../../types/assessment';

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
      color: '#10B981', // Emerald
    },
    {
      name: 'Bleached Coral',
      value: summary.bleachedCoral.count,
      pct: summary.bleachedCoral.percentage,
      color: '#F59E0B', // Amber
    },
    {
      name: 'Dead Coral',
      value: summary.deadCoral.count,
      pct: summary.deadCoral.percentage,
      color: '#EF4444', // Red
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-ocean-900 border border-ocean-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <p className="font-bold text-slate-100 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </p>
          <p className="text-slate-300 mt-1">Detections: {item.value}</p>
          <p className="text-cyan-400 font-semibold">Proportion: {item.pct}%</p>
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
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#08101E" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-xs text-slate-300 font-medium">
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
