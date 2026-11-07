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
  Waves,
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

  const siteAssessments = assessments
    .filter((a) => a.siteId === selectedSiteId)
    .sort(
      (a, b) =>
        new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime()
    );

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

  const hasMultipleAssessments = siteAssessments.length >= 2;

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

  const prevBandPct = assessmentA?.summary.combinedBandDisease.percentage || 0;
  const currBandPct = assessmentB?.summary.combinedBandDisease.percentage || 0;
  const combinedBandDiff = calculatePercentagePointDiff(currBandPct, prevBandPct);

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
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl reef-glass shadow-2xl border border-reef-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-reef-aqua uppercase">
              Longitudinal Chronological Analysis
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Historical Transect Comparison</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Evaluate temporal trajectories for a single reef station across distinct survey dates using scientific percentage-point differences. Never compares different geographical locations.
          </p>
        </div>

        {hasMultipleAssessments && assessmentA && assessmentB && (
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-reef-aqua to-reef-teal hover:brightness-110 text-reef-deep font-black text-xs shadow-glow-aqua transition-all shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Comparison Report (PDF)</span>
          </button>
        )}
      </div>

      {/* Station & Survey Date Selector Card */}
      <div className="p-6 rounded-3xl reef-glass space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-reef-aqua" />
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua font-medium"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.siteName} ({s.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-reef-seafoam" />
              <span>2. Baseline Survey Date:</span>
            </label>
            <select
              disabled={!hasMultipleAssessments}
              value={assessmentIdA}
              onChange={(e) => setAssessmentIdA(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua font-medium disabled:opacity-50"
            >
              {siteAssessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assessmentDate} — {a.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-reef-aqua" />
              <span>3. Comparative Survey Date:</span>
            </label>
            <select
              disabled={!hasMultipleAssessments}
              value={assessmentIdB}
              onChange={(e) => setAssessmentIdB(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua font-medium disabled:opacity-50"
            >
              {siteAssessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assessmentDate} — {a.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedSite && (
          <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-400">Station: </span>
              <span className="text-white font-bold">{selectedSite.siteName}</span>
              <span className="text-reef-seafoam ml-2 font-semibold">({selectedSite.region}, {selectedSite.country})</span>
            </div>
            <div>
              <span className="text-slate-400">Logged Surveys for this Site: </span>
              <span className="text-reef-aqua font-black">{siteAssessments.length}</span>
            </div>
          </div>
        )}
      </div>

      {!hasMultipleAssessments ? (
        <div className="p-12 rounded-3xl reef-glass text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-reef-midnight text-reef-aqua border border-reef-border flex items-center justify-center mx-auto shadow-md">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">
            Insufficient Longitudinal Records for this Station
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            This reef station currently has only {siteAssessments.length} logged survey. Chronological comparison requires at least two distinct assessment dates for the same Site ID ({selectedSite.id}).
          </p>
        </div>
      ) : assessmentA && assessmentB ? (
        <>
          {/* Key Trajectory Delta Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl reef-glass border border-reef-sunset/40 shadow-lg">
              <span className="text-xs font-mono uppercase tracking-wider text-reef-sunset font-bold block mb-1">
                Thermal Bleaching Trajectory
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black font-mono text-white">
                  {formatPercentagePointDiff(
                    calculatePercentagePointDiff(
                      assessmentB.summary.bleachedCoral.percentage,
                      assessmentA.summary.bleachedCoral.percentage
                    )
                  )}
                </span>
                <span className="text-xs font-mono text-slate-300 font-semibold">
                  {assessmentA.summary.bleachedCoral.percentage}% → {assessmentB.summary.bleachedCoral.percentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-sans">
                Evaluated from {assessmentA.assessmentDate} to {assessmentB.assessmentDate}.
              </p>
            </div>

            <div className="p-5 rounded-3xl reef-glass border border-reef-candy/40 shadow-lg">
              <span className="text-xs font-mono uppercase tracking-wider text-reef-candy font-bold block mb-1">
                Combined Band Disease Trajectory
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black font-mono text-reef-candy">
                  {formatPercentagePointDiff(combinedBandDiff)}
                </span>
                <span className="text-xs font-mono text-slate-300 font-semibold">
                  {prevBandPct}% → {currBandPct}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-sans">
                Sum of Black, White, and Yellow Band disease lesions.
              </p>
            </div>

            <div className="p-5 rounded-3xl reef-glass border border-reef-coralBay/40 shadow-lg">
              <span className="text-xs font-mono uppercase tracking-wider text-reef-coralBay font-bold block mb-1">
                Healthy Tissue Trajectory
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black font-mono text-reef-coralBay">
                  {formatPercentagePointDiff(
                    calculatePercentagePointDiff(
                      assessmentB.summary.healthyCoral.percentage,
                      assessmentA.summary.healthyCoral.percentage
                    )
                  )}
                </span>
                <span className="text-xs font-mono text-slate-300 font-semibold">
                  {assessmentA.summary.healthyCoral.percentage}% → {assessmentB.summary.healthyCoral.percentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-sans">
                Vibrant pigment and active photosynthetic zooxanthellae coverage.
              </p>
            </div>
          </div>

          {/* Six Category Comparison Table & Bar Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-3xl reef-glass p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white mb-1">
                  Six Official Categories: Percentage-Point Analysis
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  Note: Differences represent absolute percentage points (pp), not relative % change.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-reef-border/60 text-[11px] uppercase text-slate-300 font-bold">
                        <th className="py-2.5 px-3 font-sans">Category</th>
                        <th className="py-2.5 px-3">{assessmentA.assessmentDate}</th>
                        <th className="py-2.5 px-3">{assessmentB.assessmentDate}</th>
                        <th className="py-2.5 px-3 text-right">Change (pp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-reef-border/30">
                      {comparisonRows.map((row) => (
                        <tr key={row.name} className="hover:bg-reef-surface/40 transition-colors">
                          <td className="py-2.5 px-3 font-sans font-bold text-white">
                            {row.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{row.prevPct}%</td>
                          <td className="py-2.5 px-3 text-white font-extrabold">{row.currPct}%</td>
                          <td className="py-2.5 px-3 text-right font-black">
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

                      <tr className="bg-reef-midnight/90 font-black">
                        <td className="py-3 px-3 font-sans text-purple-300">
                          Combined Band Disease
                        </td>
                        <td className="py-3 px-3 text-purple-300">{prevBandPct}%</td>
                        <td className="py-3 px-3 text-purple-200">{currBandPct}%</td>
                        <td className="py-3 px-3 text-right text-reef-pink">
                          {formatPercentagePointDiff(combinedBandDiff)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-reef-border/40 text-[11px] text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-reef-aqua shrink-0" />
                <span>
                  Scientific rigor: An increase from 20.0% to 38.0% is reported as +18.0 percentage points.
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 rounded-3xl reef-glass p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white mb-1">
                  Comparative Prevalence Histogram
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  Side-by-side distribution across baseline and comparative survey phototransects.
                </p>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparativeChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 214, 208, 0.12)" />
                      <XAxis dataKey="name" stroke="#8DE2C5" fontSize={10} tickLine={false} fontWeight={600} />
                      <YAxis stroke="#8DE2C5" fontSize={11} tickLine={false} unit="%" />
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-reef-midnight/95 border border-reef-aqua/40 p-3 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md">
                                <p className="font-bold text-reef-aqua mb-1 text-sm">
                                  {payload[0].payload.name}
                                </p>
                                <p className="text-reef-seafoam font-semibold">
                                  Baseline ({assessmentA.assessmentDate}): {payload[0].value}%
                                </p>
                                <p className="text-reef-aqua font-semibold">
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
                          <span className="text-xs text-slate-200 font-semibold">{val}</span>
                        )}
                      />
                      <Bar
                        dataKey="Baseline"
                        name={`Baseline (${assessmentA.assessmentDate})`}
                        fill="#0A5CAB"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Comparative"
                        name={`Comparative (${assessmentB.assessmentDate})`}
                        fill="#29B8E6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/40 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Baseline ID: <strong className="text-white">{assessmentA.id}</strong></span>
                <span>Comparative ID: <strong className="text-white">{assessmentB.id}</strong></span>
              </div>
            </div>
          </div>

          {/* Full Chronological Timeline */}
          <div className="rounded-3xl reef-glass p-6">
            <h3 className="text-sm font-extrabold text-white mb-1">
              Station Chronological Assessment Timeline ({selectedSite.siteName})
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Historical progression across all logged phototransects for this exact Site ID.
            </p>
            <HealthTrendLine assessments={siteAssessments} height={280} />
          </div>
        </>
      ) : null}
    </div>
  );
};
