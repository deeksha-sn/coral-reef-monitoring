import React, { useState } from 'react';
import {
  Activity,
  Filter,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Biohazard,
  HeartPulse,
  Layers,
  Calendar,
  MapPin,
  Download,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { CORAL_CATEGORIES } from '@/constants/categories';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { HealthTrendLine } from '@/components/charts/HealthTrendLine';
import { CoralCategoryKey } from '@/types/prediction';

export const DiseaseAnalytics: React.FC = () => {
  const { sites, assessments } = useApp();

  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL');

  // Filter assessments
  const filteredAssessments = assessments.filter((a) => {
    const matchesSite = siteFilter === 'ALL' || a.siteId === siteFilter;
    let matchesDate = true;
    if (dateRangeFilter === '2025') {
      matchesDate = a.assessmentDate.startsWith('2025');
    } else if (dateRangeFilter === '2024') {
      matchesDate = a.assessmentDate.startsWith('2024');
    }
    return matchesSite && matchesDate;
  });

  const totalDetections = filteredAssessments.reduce(
    (acc, a) => acc + a.totalDetections,
    0
  );

  const counts: Record<CoralCategoryKey, number> = {
    healthy_coral: 0,
    bleached_coral: 0,
    dead_coral: 0,
    black_band_disease: 0,
    white_band_disease: 0,
    yellow_band_disease: 0,
  };

  filteredAssessments.forEach((a) => {
    counts.healthy_coral += a.summary.healthyCoral.count;
    counts.bleached_coral += a.summary.bleachedCoral.count;
    counts.dead_coral += a.summary.deadCoral.count;
    counts.black_band_disease += a.summary.blackBandDisease.count;
    counts.white_band_disease += a.summary.whiteBandDisease.count;
    counts.yellow_band_disease += a.summary.yellowBandDisease.count;
  });

  const getPercentage = (count: number) => {
    if (totalDetections <= 0) return 0;
    return Number(((count / totalDetections) * 100).toFixed(1));
  };

  const combinedBandCount =
    counts.black_band_disease +
    counts.white_band_disease +
    counts.yellow_band_disease;
  const combinedBandPct = getPercentage(combinedBandCount);

  const sixCategoriesData = [
    {
      key: 'healthy_coral',
      name: 'Healthy Coral',
      count: counts.healthy_coral,
      pct: getPercentage(counts.healthy_coral),
      color: '#10B981',
      group: 'Condition',
    },
    {
      key: 'bleached_coral',
      name: 'Bleached Coral',
      count: counts.bleached_coral,
      pct: getPercentage(counts.bleached_coral),
      color: '#FF8066',
      group: 'Condition',
    },
    {
      key: 'dead_coral',
      name: 'Dead Coral',
      count: counts.dead_coral,
      pct: getPercentage(counts.dead_coral),
      color: '#EF4444',
      group: 'Condition',
    },
    {
      key: 'black_band_disease',
      name: 'Black Band Disease',
      count: counts.black_band_disease,
      pct: getPercentage(counts.black_band_disease),
      color: '#8B5CF6',
      group: 'Band Disease',
    },
    {
      key: 'white_band_disease',
      name: 'White Band Disease',
      count: counts.white_band_disease,
      pct: getPercentage(counts.white_band_disease),
      color: '#38BDF8',
      group: 'Band Disease',
    },
    {
      key: 'yellow_band_disease',
      name: 'Yellow Band Disease',
      count: counts.yellow_band_disease,
      pct: getPercentage(counts.yellow_band_disease),
      color: '#EAB308',
      group: 'Band Disease',
    },
  ];

  const bandDiseaseData = sixCategoriesData.filter(
    (c) => c.group === 'Band Disease'
  );
  const healthConditionData = sixCategoriesData.filter(
    (c) => c.group === 'Condition'
  );

  const siteComparisonData = sites.map((s) => {
    const siteAsms = assessments.filter((a) => a.siteId === s.id);
    const totalSiteDetections = siteAsms.reduce(
      (acc, a) => acc + a.totalDetections,
      0
    );
    const siteHealthy = siteAsms.reduce(
      (acc, a) => acc + a.summary.healthyCoral.count,
      0
    );
    const siteBleached = siteAsms.reduce(
      (acc, a) => acc + a.summary.bleachedCoral.count,
      0
    );
    const siteBand = siteAsms.reduce(
      (acc, a) => acc + a.summary.combinedBandDisease.count,
      0
    );

    return {
      siteName: s.siteName.split(' ')[0] + '...',
      fullName: s.siteName,
      healthyPct: totalSiteDetections
        ? Number(((siteHealthy / totalSiteDetections) * 100).toFixed(1))
        : 0,
      bleachedPct: totalSiteDetections
        ? Number(((siteBleached / totalSiteDetections) * 100).toFixed(1))
        : 0,
      bandPct: totalSiteDetections
        ? Number(((siteBand / totalSiteDetections) * 100).toFixed(1))
        : 0,
    };
  });

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl reef-glass shadow-2xl border border-reef-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-reef-aqua uppercase">
              Epidemiological Pathology Analytics
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Coral Health &amp; Disease Analytics</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Proportional object detection metrics across the six official taxonomic categories, distinguishing environmental thermal bleaching from infectious bacterial band diseases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-reef-surface hover:bg-reef-surface/90 text-reef-aqua border border-reef-aqua/40 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-reef-orange" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl reef-glass flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-white font-bold">
          <Filter className="w-3.5 h-3.5 text-reef-aqua" />
          <span>Analytics Filter:</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-300 font-semibold">Monitoring Station:</label>
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua font-medium"
          >
            <option value="ALL">All Stations ({sites.length})</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.siteName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-300 font-semibold">Time Window:</label>
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua font-medium"
          >
            <option value="ALL">All Recorded Surveys</option>
            <option value="2025">Year 2025</option>
            <option value="2024">Year 2024</option>
          </select>
        </div>

        <div className="ml-auto text-xs font-mono text-reef-seafoam font-bold">
          Aggregated Detections: <span className="text-white font-black">{totalDetections}</span> objects across{' '}
          <span className="text-white font-black">{filteredAssessments.length}</span> surveys
        </div>
      </div>

      {/* Six Categories Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {sixCategoriesData.map((cat) => (
          <div
            key={cat.key}
            className="p-4 rounded-2xl reef-glass shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block mb-1">
              {cat.name}
            </span>
            <div className="text-2xl font-black font-mono text-white">
              {cat.pct}%
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-slate-300 font-semibold">{cat.count} objects</span>
              <span className="text-[10px] text-slate-400 font-sans font-medium">{cat.group}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Distribution Charts: Health Conditions vs Band Diseases */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coral Health Conditions (Donut) (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl reef-glass p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span>Coral Health Condition Distribution</span>
            </h3>
            <span className="text-xs text-reef-seafoam font-mono font-bold">
              Healthy • Bleached • Dead
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-4">
            Physiological health status breakdown based on symbiotic zooxanthellae density and bare skeletal exposure.
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthConditionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {healthConditionData.map((entry, index) => (
                    <Cell key={`cell-h-${index}`} fill={entry.color} stroke="#061B2C" strokeWidth={2.5} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-reef-midnight/95 border border-reef-aqua/40 p-3 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md">
                          <p className="font-bold text-white text-sm" style={{ color: item.color }}>
                            {item.name}
                          </p>
                          <p className="text-slate-300 mt-1">Detections: <span className="text-white font-bold">{item.count}</span> objects</p>
                          <p className="text-reef-aqua font-bold">Proportion: {item.pct}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
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

        {/* Coral Disease Categories (Bar) (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl reef-glass p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Biohazard className="w-4 h-4 text-purple-300" />
                <span>Coral Disease Category Distribution</span>
              </h3>
              <span className="text-xs text-purple-300 font-mono font-bold bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-500/40">
                Combined Band: {combinedBandPct}% ({combinedBandCount} lesions)
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Specific bacterial and cyanobacterial annular band pathogens. Bleaching is excluded from band disease calculations.
            </p>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bandDiseaseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 214, 208, 0.15)" vertical={false} />
                  <XAxis dataKey="name" stroke="#8DE2C5" fontSize={11} tickLine={false} fontWeight={600} />
                  <YAxis stroke="#8DE2C5" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-reef-midnight/95 border border-reef-aqua/40 p-3 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md">
                            <p className="font-bold text-white text-sm" style={{ color: item.color }}>
                              {item.name}
                            </p>
                            <p className="text-slate-300 mt-1">Detections: <span className="text-white font-bold">{item.count}</span> lesions</p>
                            <p className="text-reef-aqua font-bold">Proportion: {item.pct}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                    {bandDiseaseData.map((entry, index) => (
                      <Cell key={`cell-d-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-reef-midnight/90 border border-reef-border/40 text-xs text-slate-300">
            <span className="font-bold text-white">Pathology Metric Formula: </span>
            Combined Band Disease = <code className="text-reef-aqua font-mono font-bold">((Black + White + Yellow Band Detections) / Total Detections) × 100</code>.
          </div>
        </div>
      </div>

      {/* Cross-Station Comparative Bar Chart */}
      <div className="rounded-3xl reef-glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-reef-aqua" />
              <span>Cross-Station Comparative Health &amp; Pathology Profile</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Proportions of healthy tissue, thermal bleaching, and combined band pathogens across monitored reef stations
            </p>
          </div>
          <span className="text-xs font-mono text-reef-seafoam font-bold">
            {sites.length} Active Stations
          </span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={siteComparisonData}
              margin={{ top: 10, right: 15, left: -15, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 214, 208, 0.12)" />
              <XAxis dataKey="siteName" stroke="#8DE2C5" fontSize={11} tickLine={false} fontWeight={600} />
              <YAxis stroke="#8DE2C5" fontSize={11} tickLine={false} unit="%" />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-reef-midnight/95 border border-reef-aqua/40 p-3.5 rounded-xl text-xs font-mono shadow-2xl space-y-1.5 backdrop-blur-md">
                        <p className="font-bold text-reef-aqua text-sm">{item.fullName}</p>
                        <p className="text-emerald-400 font-semibold">Healthy: {item.healthyPct}%</p>
                        <p className="text-reef-orange font-semibold">Bleached: {item.bleachedPct}%</p>
                        <p className="text-purple-300 font-semibold">Band Disease: {item.bandPct}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="healthyPct" name="Healthy Coral" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bleachedPct" name="Bleached Coral" fill="#FF8066" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bandPct" name="Combined Band" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assessment-wise Trends */}
      <div className="rounded-3xl reef-glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-reef-aqua" />
              <span>Assessment-Wise Chronological Trends</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Longitudinal tracking of all survey phototransects in current filter
            </p>
          </div>
        </div>
        <HealthTrendLine assessments={filteredAssessments} height={280} />
      </div>
    </div>
  );
};
