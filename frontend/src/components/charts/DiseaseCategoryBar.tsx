import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { AssessmentSummary } from '../../types/assessment';

interface DiseaseCategoryBarProps {
  summary: AssessmentSummary;
  height?: number;
}

export const DiseaseCategoryBar: React.FC<DiseaseCategoryBarProps> = ({
  summary,
  height = 260,
}) => {
  const data = [
    {
      name: 'Black Band',
      fullName: 'Black Band Disease',
      count: summary.blackBandDisease.count,
      pct: summary.blackBandDisease.percentage,
      color: '#8B5CF6',
    },
    {
      name: 'White Band',
      fullName: 'White Band Disease',
      count: summary.whiteBandDisease.count,
      pct: summary.whiteBandDisease.percentage,
      color: '#38BDF8',
    },
    {
      name: 'Yellow Band',
      fullName: 'Yellow Band Disease',
      count: summary.yellowBandDisease.count,
      pct: summary.yellowBandDisease.percentage,
      color: '#EAB308',
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
            {item.fullName}
          </p>
          <p className="text-slate-300 mt-1">Detections: {item.count} objects</p>
          <p className="text-cyan-400 font-semibold">Prevalence: {item.pct}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A2F50" opacity={0.6} />
            <XAxis
              dataKey="name"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2 border-t border-ocean-800 flex items-center justify-between text-xs font-mono px-2">
        <span className="text-slate-400">Combined Band Disease:</span>
        <span className="font-bold text-violet-400">
          {summary.combinedBandDisease.count} lesions ({summary.combinedBandDisease.percentage}%)
        </span>
      </div>
    </div>
  );
};
