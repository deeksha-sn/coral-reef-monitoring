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
import { AssessmentSummary } from '@/types/assessment';

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
      color: '#0A5CAB', // Deep Sea Dive (#0A5CAB)
    },
    {
      name: 'White Band',
      fullName: 'White Band Disease',
      count: summary.whiteBandDisease.count,
      pct: summary.whiteBandDisease.percentage,
      color: '#C94889', // Ocean Candy (#C94889)
    },
    {
      name: 'Yellow Band',
      fullName: 'Yellow Band Disease',
      count: summary.yellowBandDisease.count,
      pct: summary.yellowBandDisease.percentage,
      color: '#F5B838', // Distinct Yellow Band
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
            {item.fullName}
          </p>
          <p className="text-slate-300 mt-1.5">Specimens: <span className="text-white font-bold">{item.count}</span> objects</p>
          <p className="text-reef-coralBay font-bold">Prevalence: {item.pct}%</p>
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 214, 208, 0.15)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#8DE2C5"
              fontSize={11}
              tickLine={false}
              fontWeight={600}
            />
            <YAxis
              stroke="#8DE2C5"
              fontSize={11}
              tickLine={false}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2.5 border-t border-reef-border/40 flex items-center justify-between text-xs font-mono px-2">
        <span className="text-slate-300 font-semibold">Combined Band Disease:</span>
        <span className="font-black text-reef-candy bg-reef-midnight/90 px-2.5 py-0.5 rounded-md border border-reef-candy/40">
          {summary.combinedBandDisease.count} lesions ({summary.combinedBandDisease.percentage}%)
        </span>
      </div>
    </div>
  );
};
