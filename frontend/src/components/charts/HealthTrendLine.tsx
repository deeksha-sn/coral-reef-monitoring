import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Assessment } from '@/types/assessment';

interface HealthTrendLineProps {
  assessments: Assessment[];
  height?: number;
}

export const HealthTrendLine: React.FC<HealthTrendLineProps> = ({
  assessments,
  height = 280,
}) => {
  // Sort chronological
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime()
  );

  const data = sorted.map((a) => ({
    date: a.assessmentDate,
    name: a.assessmentName,
    healthy: a.summary.healthyCoral.percentage,
    bleached: a.summary.bleachedCoral.percentage,
    dead: a.summary.deadCoral.percentage,
    combinedBand: a.summary.combinedBandDisease.percentage,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-reef-midnight/95 border border-reef-aqua/40 p-3.5 rounded-xl shadow-2xl text-xs font-mono space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-reef-aqua mb-2 text-sm border-b border-reef-border/40 pb-1">
            Survey Date: {label}
          </p>
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center justify-between gap-5">
              <span className="flex items-center gap-1.5" style={{ color: p.color }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}:
              </span>
              <span className="font-extrabold text-white">{p.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 214, 208, 0.12)" />
          <XAxis
            dataKey="date"
            stroke="#8DE2C5"
            fontSize={11}
            tickLine={false}
            fontWeight={500}
          />
          <YAxis
            stroke="#8DE2C5"
            fontSize={11}
            tickLine={false}
            unit="%"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-slate-200 font-semibold capitalize">
                {value}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="healthy"
            name="Healthy Coral"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ r: 4, fill: '#10B981', stroke: '#061B2C', strokeWidth: 1.5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="bleached"
            name="Bleached Coral"
            stroke="#FF8066"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#FF8066', stroke: '#061B2C', strokeWidth: 1.5 }}
          />
          <Line
            type="monotone"
            dataKey="dead"
            name="Dead Coral"
            stroke="#EF4444"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: '#EF4444' }}
          />
          <Line
            type="monotone"
            dataKey="combinedBand"
            name="Combined Band Disease"
            stroke="#8B5CF6"
            strokeWidth={3}
            dot={{ r: 4, fill: '#8B5CF6', stroke: '#061B2C', strokeWidth: 1.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
