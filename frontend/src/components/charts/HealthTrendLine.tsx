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
import { Assessment } from '../../types/assessment';

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
        <div className="bg-ocean-900 border border-ocean-700 p-3 rounded-lg shadow-2xl text-xs font-mono space-y-1">
          <p className="font-bold text-cyan-300 mb-1.5">{label}</p>
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: p.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}:
              </span>
              <span className="font-bold text-slate-100">{p.value}%</span>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#1A2F50" opacity={0.6} />
          <XAxis
            dataKey="date"
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
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-slate-300 font-medium capitalize">
                {value}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="healthy"
            name="Healthy Coral"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#10B981' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="bleached"
            name="Bleached Coral"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ r: 4, fill: '#F59E0B' }}
          />
          <Line
            type="monotone"
            dataKey="dead"
            name="Dead Coral"
            stroke="#EF4444"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: '#EF4444' }}
          />
          <Line
            type="monotone"
            dataKey="combinedBand"
            name="Combined Band Disease"
            stroke="#8B5CF6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#8B5CF6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
