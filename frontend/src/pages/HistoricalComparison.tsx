import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  History,
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Download,
  FileText,
  Layers,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { HealthTrendLine } from '@/components/charts/HealthTrendLine';
import { exportComparisonReportPDF } from '@/services/reports/pdfExportService';
import {
  calculatePercentagePointDiff,
  formatPercentagePointDiff,
} from '@/utils/coralMath';
import { CoralCategoryKey } from '@/types/prediction';

export const HistoricalComparison: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { sites, assessments } = useApp();

  const initialSiteId = searchParams.get('siteId') || sites[0]?.id || '';
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSiteId);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Get chronological assessments for this site ONLY
  const siteAssessments = assessments
    .filter((a) => a.siteId === selectedSiteId)
    .sort(
      (a, b) =>
        new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime()
    );

  // Default two dates to compare: earliest and latest (or last two)
  const [assessmentIdA, setAssessmentIdA] = useState<string>(
    siteAssessments.length >= 2
      ? siteAssessments[siteAssessments.length - 2].id
      : siteAssessments[0]?.id || ''
  );
  const [assessmentIdB, setAssessmentIdB] = useState<string>(
    siteAssessments.length >= 2
      ? siteAssessments[siteAssessments.length - 1].id
      : siteAssessments[0]?.id || ''
  );

  const assessmentA = siteAssessments.find((a) => a.id === assessmentIdA);
  const assessmentB = siteAssessments.find((a) => a.id === assessmentIdB);

  // If site has < 2 assessments, show clear empty state
  const hasMultipleAssessments = siteAssessments.length >= 2;

  // Compute comparison rows across all 6 categories + combined band disease
  const categoryDefinitions: { key: CoralCategoryKey; name: string }[] = [
    { key: 'healthy_coral', name: 'Healthy Coral' },
    { key: 'bleached_coral', name: 'Bleached Coral' },
    { key: 'dead_coral', name: 'Dead Coral' },
    { key: 'black_band_disease', name: 'Black Band Disease' },
    { key: 'white_band_disease', name: 'White Band Disease' },
    { key: 'yellow_band_disease', name: 'Yellow Band Disease' },
  ];

  const comparisonRows = categoryDefinitions.map((cat) => {
    let prevPct = 0;
    let currPct = 0;

    if (assessmentA && assessmentB) {
      if (cat.key === 'healthy_coral') {
        prevPct = assessmentA.summary.healthyCoral.percentage;
        currPct = assessmentB.summary.healthyCoral.percentage;
      } else if (cat.key === 'bleached_coral') {
        prevPct = assessmentA.summary.bleachedCoral.percentage;
        currPct = assessmentB.summary.bleachedCoral.percentage;
      } else if (cat.key === 'dead_coral') {
        prevPct = assessmentA.summary.deadCoral.percentage;
        currPct = assessmentB.summary.deadCoral.percentage;
      } else if (cat.key === 'black_band_disease') {
        prevPct = assessmentA.summary.blackBandDisease.percentage;
        currPct = assessmentB.summary.blackBandDisease.percentage;
      } else if (cat.key === 'white_band_disease') {
        prevPct = assessmentA.summary.whiteBandDisease.percentage;
        currPct = assessmentB.summary.whiteBandDisease.percentage;
      } else if (cat.key === 'yellow_band_disease') {
        prevPct = assessmentA.summary.yellowBandDisease.percentage;
        currPct = assessmentB.summary.yellowBandDisease.percentage;
      }
    }

    const ppDiff = calculatePercentagePointDiff(currPct, prevPct);

    return {
      name: cat.name,
      prevPct,
      currPct,
      ppDiff,
    };
  });

  // Combined Band Disease row
  const prevBandPct = assessmentA?.summary.combinedBandDisease.percentage || 0;
  const currBandPct = assessmentB?.summary.combinedBandDisease.percentage || 0;
  const combinedBandDiff = calculatePercentagePointDiff(currBandPct, prevBandPct);

  // Bar chart comparative dataset
  const comparativeChartData = comparisonRows.map((row) => ({
    name: row.name.replace(' Disease', ''),
    Baseline: row.prevPct,
    Comparative: row.currPct,
  }));

  const handleExportPDF = () => {
    if (selectedSite && assessmentA && assessmentB) {
      exportComparisonReportPDF(selectedSite, assessmentB, assessmentA);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Longitudinal Chronological Analysis
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Historical Transect Comparison
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Evaluate temporal trajectories for a single reef station across distinct survey dates using scientific percentage-point differences. Never compares different geographical locations.
          </p>
        </div>

        {hasMultipleAssessments && assessmentA && assessmentB && (
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Comparison Report (PDF)</span>
          </button>
        )}
      </div>

      {/* Station & Survey Date Selector Card */}
      <div className="p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Site Selection */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Select Monitoring Station (Site ID):</span>
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedSiteId(newId);
                const newSiteAsms = assessments
                  .filter((a) => a.siteId === newId)
                  .sort(
                    (a, b) =>
                      new Date(a.assessmentDate).getTime() -
                      new Date(b.assessmentDate).getTime()
                  );
                if (newSiteAsms.length >= 2) {
                  setAssessmentIdA(newSiteAsms[newSiteAsms.length - 2].id);
                  setAssessmentIdB(newSiteAsms[newSiteAsms.length - 1].id);
                } else if (newSiteAsms.length === 1) {
                  setAssessmentIdA(newSiteAsms[0].id);
                  setAssessmentIdB(newSiteAsms[0].id);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.siteName} ({s.id})
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Date A (Baseline) */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>2. Baseline Survey Date:</span>
            </label>
            <select
              disabled={!hasMultipleAssessments}
              value={assessmentIdA}
              onChange={(e) => setAssessmentIdA(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              {siteAssessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assessmentDate} — {a.id}
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Date B (Comparative) */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>3. Comparative Survey Date:</span>
            </label>
            <select
              disabled={!hasMultipleAssessments}
              value={assessmentIdB}
              onChange={(e) => setAssessmentIdB(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              {siteAssessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assessmentDate} — {a.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Site metadata banner */}
        {selectedSite && (
          <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500">Station: </span>
              <span className="text-slate-200 font-bold">{selectedSite.siteName}</span>
              <span className="text-slate-500 ml-2">({selectedSite.region}, {selectedSite.country})</span>
            </div>
            <div>
              <span className="text-slate-500">Logged Surveys for this Site: </span>
              <span className="text-cyan-400 font-bold">{siteAssessments.length}</span>
            </div>
          </div>
        )}
      </div>

      {!hasMultipleAssessments ? (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-ocean-800 text-cyan-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            Insufficient Longitudinal Records for this Station
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            This reef station currently has only {siteAssessments.length} logged survey. Chronological comparison requires at least two distinct assessment dates for the same Site ID ({selectedSite.id}).
          </p>
        </div>
      ) : assessmentA && assessmentB ? (
        <>
          {/* Key Change Summary Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bleaching Change */}
            <div className="p-4 rounded-xl bg-ocean-850/90 border border-amber-500/30 shadow-lg">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 block mb-1">
                Thermal Bleaching Trajectory
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {formatPercentagePointDiff(
                    calculatePercentagePointDiff(
                      assessmentB.summary.bleachedCoral.percentage,
                      assessmentA.summary.bleachedCoral.percentage
                    )
                  )}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {assessmentA.summary.bleachedCoral.percentage}% → {assessmentB.summary.bleachedCoral.percentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Evaluated from {assessmentA.assessmentDate} to {assessmentB.assessmentDate}.
              </p>
            </div>

            {/* Combined Band Disease Change */}
            <div className="p-4 rounded-xl bg-ocean-850/90 border border-violet-500/30 shadow-lg">
              <span className="text-xs font-mono uppercase tracking-wider text-violet-400 block mb-1">
                Combined Band Disease Trajectory
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {formatPercentagePointDiff(combinedBandDiff)}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {prevBandPct}% → {currBandPct}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Sum of Black, White, and Yellow Band disease lesions.
              </p>
            </div>

            {/* Healthy Coral Change */}
            <div className="p-4 rounded-xl bg-ocean-850/90 border border-emerald-500/30 shadow-lg">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                Healthy Tissue Trajectory
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {formatPercentagePointDiff(
                    calculatePercentagePointDiff(
                      assessmentB.summary.healthyCoral.percentage,
                      assessmentA.summary.healthyCoral.percentage
                    )
                  )}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {assessmentA.summary.healthyCoral.percentage}% → {assessmentB.summary.healthyCoral.percentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Vibrant pigment and active zooxanthellae coverage.
              </p>
            </div>
          </div>

          {/* Six Category Comparison Table & Bar Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Table (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 mb-1">
                  Six Official Categories: Percentage-Point Analysis
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Note: Differences represent absolute percentage points (pp), not relative % change.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-ocean-700 text-[11px] uppercase text-slate-400">
                        <th className="py-2.5 px-3 font-sans">Category</th>
                        <th className="py-2.5 px-3">{assessmentA.assessmentDate}</th>
                        <th className="py-2.5 px-3">{assessmentB.assessmentDate}</th>
                        <th className="py-2.5 px-3 text-right">Change (pp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ocean-800">
                      {comparisonRows.map((row) => (
                        <tr key={row.name} className="hover:bg-ocean-800/40">
                          <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                            {row.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{row.prevPct}%</td>
                          <td className="py-2.5 px-3 text-slate-200 font-bold">{row.currPct}%</td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            <span
                              className={
                                row.ppDiff === null || row.ppDiff === 0
                                  ? 'text-slate-400'
                                  : row.name === 'Healthy Coral'
                                  ? row.ppDiff > 0
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                  : row.ppDiff > 0
                                  ? 'text-rose-400'
                                  : 'text-emerald-400'
                              }
                            >
                              {formatPercentagePointDiff(row.ppDiff)}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Combined Band Row */}
                      <tr className="bg-ocean-900/60 font-bold">
                        <td className="py-3 px-3 font-sans text-violet-300">
                          Combined Band Disease
                        </td>
                        <td className="py-3 px-3 text-violet-300">{prevBandPct}%</td>
                        <td className="py-3 px-3 text-violet-300">{currBandPct}%</td>
                        <td className="py-3 px-3 text-right text-rose-400">
                          {formatPercentagePointDiff(combinedBandDiff)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-ocean-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  Scientific rigor: An increase from 20.0% to 38.0% is reported as +18.0 percentage points.
                </span>
              </div>
            </div>

            {/* Comparison Bar Chart (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 mb-1">
                  Comparative Prevalence Histogram
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Visual side-by-side distribution across baseline and comparative survey phototransects.
                </p>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparativeChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1A2F50" opacity={0.6} />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit="%" />
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-ocean-900 border border-ocean-700 p-2.5 rounded-lg text-xs font-mono shadow-xl">
                                <p className="font-bold text-cyan-300 mb-1">
                                  {payload[0].payload.name}
                                </p>
                                <p className="text-teal-400">
                                  Baseline ({assessmentA.assessmentDate}): {payload[0].value}%
                                </p>
                                <p className="text-cyan-400">
                                  Comparative ({assessmentB.assessmentDate}): {payload[1].value}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(val) => (
                          <span className="text-xs text-slate-300 font-medium">{val}</span>
                        )}
                      />
                      <Bar
                        dataKey="Baseline"
                        name={`Baseline (${assessmentA.assessmentDate})`}
                        fill="#0EA5E9"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Comparative"
                        name={`Comparative (${assessmentB.assessmentDate})`}
                        fill="#2DD4BF"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Baseline ID: {assessmentA.id}</span>
                <span>Comparative ID: {assessmentB.id}</span>
              </div>
            </div>
          </div>

          {/* Full Chronological Timeline for this site */}
          <div className="rounded-2xl bg-ocean-850/90 border border-ocean-700/80 p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 mb-1">
              Station Chronological Assessment Timeline ({selectedSite.siteName})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Historical progression across all logged phototransects for this exact Site ID.
            </p>
            <HealthTrendLine assessments={siteAssessments} height={280} />
          </div>
        </>
      ) : null}
    </div>
  );
};
