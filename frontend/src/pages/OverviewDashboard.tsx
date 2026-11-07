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
  Sparkles,
  Waves,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/common/StatCard';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { ReefMap } from '@/components/maps/ReefMap';
import { HealthConditionDonut } from '@/components/charts/HealthConditionDonut';
import { DiseaseCategoryBar } from '@/components/charts/DiseaseCategoryBar';
import { HealthTrendLine } from '@/components/charts/HealthTrendLine';

export const OverviewDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { sites, assessments, alerts } = useApp();
  const { permissions } = useAuth();

  // Aggregate stats across all completed assessments
  const totalSites = sites.length;
  const totalAssessments = assessments.length;
  const totalImages = assessments.reduce((acc, a) => acc + a.imageCount, 0);
  const totalDetections = assessments.reduce((acc, a) => acc + a.totalDetections, 0);

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
    <div className="space-y-7">
      {/* Immersive Underwater Hero Section with Photo Background */}
      <div className="relative rounded-3xl overflow-hidden border border-reef-border/60 shadow-2xl">
        {/* Background photo with deep water overlay and sunlight caustics */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform hover:scale-105"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(6, 27, 44, 0.55) 0%, rgba(8, 42, 58, 0.75) 50%, rgba(6, 27, 44, 0.94) 100%), url('/assets/coral-hero.jpg')`,
          }}
        />

        {/* Ambient sun rays and caustics effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-reef-deep via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 p-7 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-reef-midnight/90 text-reef-aqua border border-reef-aqua/40 shadow-glow-aqua/30 backdrop-blur">
                <Waves className="w-3.5 h-3.5 text-reef-aqua" />
                <span>Marine Ecological Surveillance</span>
              </span>
              <DemoDataBadge size="sm" />
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-md">
                <span>Welcome to</span>
                <span className="text-gradient-aqua">ReefSentra</span>
              </h1>
              <p className="text-sm sm:text-base font-medium text-reef-seafoam mt-1 drop-shadow">
                Monitor coral reef health, assess disease conditions and track changes across reef sites.
              </p>
            </div>

            <p className="text-xs text-slate-200/90 max-w-2xl leading-relaxed">
              Autonomous phototransect analysis applying 6-class deep learning pathology detection across marine protected areas, fragile barrier reefs, and vulnerable crests.
            </p>
          </div>

          {permissions.canUploadAssessments && (
            <div className="shrink-0">
              <button
                onClick={() => navigate('/assessment')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-reef-aqua via-reef-teal to-[#076C78] hover:from-[#42ded8] hover:to-[#087E8B] text-reef-deep font-black text-sm shadow-glow-aqua transition-all transform hover:-translate-y-1 cursor-pointer border border-white/20"
              >
                <PlusCircle className="w-5 h-5 fill-current" />
                <span>Create New Assessment</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <StatCard
          title="Total Reef Sites"
          value={totalSites}
          icon={MapPin}
          iconColor="text-reef-aqua"
          iconBg="bg-reef-midnight/80 border-reef-aqua/40"
          onClick={() => navigate('/geographical')}
        />
        <StatCard
          title="Assessments"
          value={totalAssessments}
          icon={ClipboardList}
          iconColor="text-reef-seafoam"
          iconBg="bg-reef-midnight/80 border-reef-seafoam/40"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          title="Images Analysed"
          value={totalImages}
          icon={ImageIcon}
          iconColor="text-sky-300"
          iconBg="bg-reef-midnight/80 border-sky-400/40"
        />
        <StatCard
          title="Total Detections"
          value={totalDetections}
          icon={Activity}
          iconColor="text-purple-300"
          iconBg="bg-reef-midnight/80 border-purple-400/40"
        />
        <StatCard
          title="Healthy Coral"
          value={`${aggregateSummary.healthyCoral.percentage}%`}
          subValue={`(${aggregateSummary.healthyCoral.count})`}
          icon={HeartPulse}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-950/80 border-emerald-500/40"
          trend={{ diff: 'Dominant Cover', isPositive: true }}
        />
        <StatCard
          title="Bleached Coral"
          value={`${aggregateSummary.bleachedCoral.percentage}%`}
          subValue={`(${aggregateSummary.bleachedCoral.count})`}
          icon={SunMedium}
          iconColor="text-reef-orange"
          iconBg="bg-amber-950/80 border-reef-orange/40"
          trend={{ diff: 'Thermal Stress', isPositive: false }}
        />
        <StatCard
          title="Diseased Coral"
          value={`${aggregateSummary.combinedBandDisease.percentage}%`}
          subValue={`(${aggregateSummary.combinedBandDisease.count})`}
          icon={Biohazard}
          iconColor="text-reef-pink"
          iconBg="bg-purple-950/80 border-reef-pink/40"
          trend={{ diff: 'Band Pathogens', isPositive: false }}
        />
      </div>

      {/* Map & Health Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Geographical Overview Map (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl reef-glass p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-reef-aqua" />
                <span>Geographical Reef Monitoring Network</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Bathymetric GIS stations color-coded by health state and pathogen severity
              </p>
            </div>
            <Link
              to="/geographical"
              className="text-xs font-bold text-reef-aqua hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Full Screen Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 min-h-[350px]">
            <ReefMap
              sites={sites}
              assessments={assessments}
              className="h-[350px] w-full rounded-2xl overflow-hidden border border-reef-border/60"
            />
          </div>
        </div>

        {/* Health Condition Donut & Disease Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-6">
          {/* Coral Health Conditions Donut */}
          <div className="rounded-3xl reef-glass p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span>Coral Health Conditions</span>
              </h3>
              <span className="text-[11px] font-mono text-reef-seafoam font-semibold">
                Healthy • Bleached • Dead
              </span>
            </div>
            <HealthConditionDonut summary={aggregateSummary} height={200} />
          </div>

          {/* Coral Disease Categories Bar */}
          <div className="rounded-3xl reef-glass p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Biohazard className="w-4 h-4 text-purple-300" />
                <span>Coral Disease Categories</span>
              </h3>
              <span className="text-[11px] font-mono text-purple-300 font-bold">
                Band Diseases Only
              </span>
            </div>
            <DiseaseCategoryBar summary={aggregateSummary} height={190} />
          </div>
        </div>
      </div>

      {/* Historical Coral Health Trend Line Chart */}
      <div className="rounded-3xl reef-glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-reef-aqua" />
              <span>Historical Coral Health &amp; Pathogen Trend</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Aggregated chronological progression of healthy tissue, bleaching stress, and combined band pathogens
            </p>
          </div>
          <Link
            to="/comparison"
            className="text-xs font-bold text-reef-aqua hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Compare Sites</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <HealthTrendLine assessments={assessments} height={270} />
      </div>

      {/* Recent Assessments Table & Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Assessments Table (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl reef-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-reef-seafoam" />
              <span>Recent Benthic Assessments</span>
            </h3>
            <Link
              to="/analytics"
              className="text-xs font-bold text-reef-aqua hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-reef-border/60 text-[11px] font-mono uppercase tracking-wider text-slate-300">
                  <th className="py-2.5 px-3">Assessment ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Site</th>
                  <th className="py-2.5 px-3">Healthy</th>
                  <th className="py-2.5 px-3">Bleached</th>
                  <th className="py-2.5 px-3">Band Disease</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-reef-border/30 text-xs">
                {recentAssessments.map((asm) => {
                  const site = sites.find((s) => s.id === asm.siteId);
                  return (
                    <tr
                      key={asm.id}
                      className="hover:bg-reef-surface/50 transition-colors font-mono"
                    >
                      <td className="py-3 px-3 font-bold text-reef-aqua">
                        {asm.id}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {asm.assessmentDate}
                      </td>
                      <td className="py-3 px-3 text-white truncate max-w-[160px] font-sans font-semibold">
                        {site?.siteName || asm.siteId}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-400 font-bold">
                          {asm.summary.healthyCoral.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-reef-orange font-bold">
                          {asm.summary.bleachedCoral.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-purple-300 font-bold">
                          {asm.summary.combinedBandDisease.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/reports?assessmentId=${asm.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-reef-aqua hover:text-white transition-colors"
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
        <div className="lg:col-span-4 rounded-3xl reef-glass p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-reef-pink" />
                <span>Surveillance Alerts</span>
              </h3>
              <Link
                to="/alerts"
                className="text-xs font-bold text-reef-pink hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>All Alerts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {activeAlerts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-reef-midnight/60 border border-reef-border/40 text-center text-xs text-slate-300">
                  All monitoring transects within nominal biological thresholds.
                </div>
              ) : (
                activeAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3.5 rounded-2xl bg-reef-midnight/90 border border-reef-pink/40 hover:border-reef-pink transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-reef-pink truncate">
                        {alt.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-reef-pink/20 text-reef-pink border border-reef-pink/50">
                        {alt.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {alt.alertReason}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-reef-border/30 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="truncate text-slate-300">{alt.siteName}</span>
                      <span className="text-reef-pink font-bold shrink-0 ml-2">
                        +{alt.percentagePointChange} pp
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-reef-border/30 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Alert Rules: +15 pp Spikes</span>
            <span className="text-reef-aqua font-semibold">Active Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
