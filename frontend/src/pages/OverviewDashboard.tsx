import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  ClipboardList,
  Image as ImageIcon,
  Activity,
  HeartPulse,
  SunMedium,
  Biohazard,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/common/StatCard';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { ReefMap } from '@/components/maps/ReefMap';
import { HealthConditionDonut } from '@/components/charts/HealthConditionDonut';
import { DiseaseCategoryBar } from '@/components/charts/DiseaseCategoryBar';
import { HealthTrendLine } from '@/components/charts/HealthTrendLine';
import { buildAssessmentSummary } from '@/utils/coralMath';
import { Prediction } from '@/types/prediction';

export const OverviewDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { sites, assessments, alerts } = useApp();
  const { permissions } = useAuth();

  // Aggregate stats across all completed assessments
  const totalSites = sites.length;
  const totalAssessments = assessments.length;
  const totalImages = assessments.reduce((acc, a) => acc + a.imageCount, 0);
  const totalDetections = assessments.reduce((acc, a) => acc + a.totalDetections, 0);

  // Compute aggregated detection counts for all assessments
  const allFlattenedPredictions: Prediction[] = assessments.flatMap(
    (a) => a.images?.flatMap((img) => img.detections) || []
  );

  // If flattened predictions exist, compute from them; otherwise aggregate summaries
  const totalHealthyCount = assessments.reduce(
    (acc, a) => acc + a.summary.healthyCoral.count,
    0
  );
  const totalBleachedCount = assessments.reduce(
    (acc, a) => acc + a.summary.bleachedCoral.count,
    0
  );
  const totalDeadCount = assessments.reduce(
    (acc, a) => acc + a.summary.deadCoral.count,
    0
  );
  const totalBlackBandCount = assessments.reduce(
    (acc, a) => acc + a.summary.blackBandDisease.count,
    0
  );
  const totalWhiteBandCount = assessments.reduce(
    (acc, a) => acc + a.summary.whiteBandDisease.count,
    0
  );
  const totalYellowBandCount = assessments.reduce(
    (acc, a) => acc + a.summary.yellowBandDisease.count,
    0
  );
  const totalCombinedBandCount =
    totalBlackBandCount + totalWhiteBandCount + totalYellowBandCount;

  const aggregateSummary = {
    healthyCoral: {
      count: totalHealthyCount,
      percentage: totalDetections ? Number(((totalHealthyCount / totalDetections) * 100).toFixed(1)) : 0,
    },
    bleachedCoral: {
      count: totalBleachedCount,
      percentage: totalDetections ? Number(((totalBleachedCount / totalDetections) * 100).toFixed(1)) : 0,
    },
    deadCoral: {
      count: totalDeadCount,
      percentage: totalDetections ? Number(((totalDeadCount / totalDetections) * 100).toFixed(1)) : 0,
    },
    blackBandDisease: {
      count: totalBlackBandCount,
      percentage: totalDetections ? Number(((totalBlackBandCount / totalDetections) * 100).toFixed(1)) : 0,
    },
    whiteBandDisease: {
      count: totalWhiteBandCount,
      percentage: totalDetections ? Number(((totalWhiteBandCount / totalDetections) * 100).toFixed(1)) : 0,
    },
    yellowBandDisease: {
      count: totalYellowBandCount,
      percentage: totalDetections ? Number(((totalYellowBandCount / totalDetections) * 100).toFixed(1)) : 0,
    },
    combinedBandDisease: {
      count: totalCombinedBandCount,
      percentage: totalDetections ? Number(((totalCombinedBandCount / totalDetections) * 100).toFixed(1)) : 0,
    },
  };

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE').slice(0, 3);
  const recentAssessments = [...assessments]
    .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-ocean-700/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Global Benthic Surveillance
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Coral Reef Health &amp; Disease Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous phototransect analysis applying 6-class deep learning pathology detection across marine protected areas and vulnerable reef crests.
          </p>
        </div>

        {permissions.canUploadAssessments && (
          <button
            onClick={() => navigate('/assessment')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-glow-cyan transition-all transform hover:-translate-y-0.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Assessment</span>
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <StatCard
          title="Total Reef Sites"
          value={totalSites}
          icon={MapPin}
          iconColor="text-cyan-400"
          onClick={() => navigate('/geographical')}
        />
        <StatCard
          title="Assessments"
          value={totalAssessments}
          icon={ClipboardList}
          iconColor="text-teal-400"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          title="Images Analysed"
          value={totalImages}
          icon={ImageIcon}
          iconColor="text-sky-400"
        />
        <StatCard
          title="Total Detections"
          value={totalDetections}
          icon={Activity}
          iconColor="text-indigo-400"
        />
        <StatCard
          title="Healthy Coral"
          value={`${aggregateSummary.healthyCoral.percentage}%`}
          subValue={`(${aggregateSummary.healthyCoral.count})`}
          icon={HeartPulse}
          iconColor="text-emerald-400"
          trend={{ diff: 'Dominant', isPositive: true }}
        />
        <StatCard
          title="Bleached Coral"
          value={`${aggregateSummary.bleachedCoral.percentage}%`}
          subValue={`(${aggregateSummary.bleachedCoral.count})`}
          icon={SunMedium}
          iconColor="text-amber-400"
          trend={{ diff: 'Thermal Stress', isPositive: false }}
        />
        <StatCard
          title="Diseased Coral"
          value={`${aggregateSummary.combinedBandDisease.percentage}%`}
          subValue={`(${aggregateSummary.combinedBandDisease.count})`}
          icon={Biohazard}
          iconColor="text-violet-400"
          trend={{ diff: 'Band Diseases', isPositive: false }}
        />
      </div>

      {/* Map & Health Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Geographical Overview Map (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Geographical Reef Monitoring Network</span>
              </h3>
              <p className="text-xs text-slate-400">
                Active transect stations color-coded by latest health and pathogen severity
              </p>
            </div>
            <Link
              to="/geographical"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Full Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex-1 min-h-[340px]">
            <ReefMap
              sites={sites}
              assessments={assessments}
              className="h-[340px] w-full rounded-xl overflow-hidden border border-ocean-700"
            />
          </div>
        </div>

        {/* Health Condition Donut & Disease Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-6">
          {/* Coral Health Conditions Donut */}
          <div className="rounded-2xl bg-ocean-850/90 border border-ocean-700/80 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span>Coral Health Conditions</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Healthy • Bleached • Dead
              </span>
            </div>
            <HealthConditionDonut summary={aggregateSummary} height={200} />
          </div>

          {/* Coral Disease Categories Bar */}
          <div className="rounded-2xl bg-ocean-850/90 border border-ocean-700/80 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Biohazard className="w-4 h-4 text-violet-400" />
                <span>Coral Disease Categories</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Band Diseases Only
              </span>
            </div>
            <DiseaseCategoryBar summary={aggregateSummary} height={190} />
          </div>
        </div>
      </div>

      {/* Historical Coral Health Trend Line Chart */}
      <div className="rounded-2xl bg-ocean-850/90 border border-ocean-700/80 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Historical Coral Health &amp; Pathogen Trend</span>
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated chronological progression of healthy tissue, bleaching stress, and combined band pathogens
            </p>
          </div>
          <Link
            to="/comparison"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Compare Sites</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <HealthTrendLine assessments={assessments} height={260} />
      </div>

      {/* Recent Assessments Table & Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Assessments Table (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-400" />
              <span>Recent Benthic Assessments</span>
            </h3>
            <Link
              to="/analytics"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ocean-700/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Assessment ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Site</th>
                  <th className="py-2.5 px-3">Healthy</th>
                  <th className="py-2.5 px-3">Bleached</th>
                  <th className="py-2.5 px-3">Band Disease</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ocean-800 text-xs">
                {recentAssessments.map((asm) => {
                  const site = sites.find((s) => s.id === asm.siteId);
                  return (
                    <tr
                      key={asm.id}
                      className="hover:bg-ocean-800/40 transition-colors font-mono"
                    >
                      <td className="py-3 px-3 font-bold text-cyan-300">
                        {asm.id}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {asm.assessmentDate}
                      </td>
                      <td className="py-3 px-3 text-slate-200 truncate max-w-[160px] font-sans">
                        {site?.siteName || asm.siteId}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-400 font-semibold">
                          {asm.summary.healthyCoral.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-amber-400 font-semibold">
                          {asm.summary.bleachedCoral.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-violet-400 font-semibold">
                          {asm.summary.combinedBandDisease.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/reports?assessmentId=${asm.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          <span>Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts Panel (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Surveillance Alerts</span>
            </h3>
            <Link
              to="/alerts"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>All Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {activeAlerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-ocean-900/60 border border-ocean-800 text-center text-xs text-slate-400">
                All monitoring transects within nominal biological thresholds.
              </div>
            ) : (
              activeAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3.5 rounded-xl bg-ocean-900/80 border border-ocean-700/80 hover:border-rose-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-rose-300 truncate">
                      {alt.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {alt.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {alt.alertReason}
                  </p>
                  <div className="mt-2 pt-2 border-t border-ocean-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="truncate">{alt.siteName}</span>
                    <span className="text-cyan-400 font-bold shrink-0 ml-2">
                      +{alt.percentagePointChange} pp
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
