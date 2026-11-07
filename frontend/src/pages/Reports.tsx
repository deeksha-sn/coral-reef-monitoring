import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Download,
  Calendar,
  MapPin,
  Layers,
  Printer,
  FileCheck,
  History,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Waves,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { HealthConditionDonut } from '@/components/charts/HealthConditionDonut';
import { DiseaseCategoryBar } from '@/components/charts/DiseaseCategoryBar';
import {
  exportAssessmentReportPDF,
  exportComparisonReportPDF,
} from '@/services/reports/pdfExportService';
import {
  calculatePercentagePointDiff,
  formatPercentagePointDiff,
} from '@/utils/coralMath';

export const Reports: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { sites, assessments, alerts } = useApp();

  const [activeTab, setActiveTab] = useState<'individual' | 'comparison'>('individual');

  // Individual Report selection
  const queryAssessmentId = searchParams.get('assessmentId');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    queryAssessmentId || assessments[0]?.id || ''
  );

  useEffect(() => {
    if (queryAssessmentId) {
      setSelectedAssessmentId(queryAssessmentId);
      setActiveTab('individual');
    }
  }, [queryAssessmentId]);

  const selectedAssessment =
    assessments.find((a) => a.id === selectedAssessmentId) || assessments[0];
  const assessmentSite = sites.find((s) => s.id === selectedAssessment?.siteId);

  // Comparison Report selection
  const [comparisonSiteId, setComparisonSiteId] = useState<string>(sites[0]?.id || '');
  const siteAssessments = assessments
    .filter((a) => a.siteId === comparisonSiteId)
    .sort(
      (a, b) =>
        new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime()
    );

  const [compAsmAId, setCompAsmAId] = useState<string>(
    siteAssessments.length >= 2
      ? siteAssessments[siteAssessments.length - 2].id
      : siteAssessments[0]?.id || ''
  );
  const [compAsmBId, setCompAsmBId] = useState<string>(
    siteAssessments.length >= 2
      ? siteAssessments[siteAssessments.length - 1].id
      : siteAssessments[0]?.id || ''
  );

  const comparisonSite = sites.find((s) => s.id === comparisonSiteId);
  const compAsmA = siteAssessments.find((a) => a.id === compAsmAId);
  const compAsmB = siteAssessments.find((a) => a.id === compAsmBId);

  const handleExportIndividualPDF = () => {
    if (selectedAssessment) {
      exportAssessmentReportPDF(selectedAssessment, assessmentSite);
    }
  };

  const handleExportComparisonPDF = () => {
    if (comparisonSite && compAsmA && compAsmB) {
      exportComparisonReportPDF(comparisonSite, compAsmB, compAsmA);
    }
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl reef-glass shadow-2xl border border-reef-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-reef-aqua uppercase">
              Scientific Research Documentation
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Research Reports &amp; PDF Export</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Compile formal benthic survey findings and longitudinal comparison records for publication, peer review, and marine conservation archiving.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-2xl bg-reef-midnight p-1 border border-reef-border text-xs shadow-inner">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'individual'
                ? 'bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep shadow-glow-aqua/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Individual Assessment Report
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'comparison'
                ? 'bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep shadow-glow-aqua/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Historical Comparison Report
          </button>
        </div>
      </div>

      {activeTab === 'individual' ? (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl reef-glass flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <label className="text-white font-bold">Select Assessment to Compile:</label>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-reef-deep border border-reef-border text-white font-mono focus:outline-none focus:border-reef-aqua"
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.assessmentName} ({a.assessmentDate})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportIndividualPDF}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-reef-aqua to-reef-teal hover:brightness-110 text-reef-deep font-black flex items-center gap-2 shadow-glow-aqua transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Report</span>
            </button>
          </div>

          {selectedAssessment && (
            <div className="p-8 rounded-3xl reef-glass shadow-2xl space-y-6 font-sans">
              <div className="border-b border-reef-border/40 pb-5">
                <span className="text-[11px] font-mono tracking-widest text-reef-aqua font-bold uppercase block mb-1">
                  REEFSENTRA OFFICIAL SCIENTIFIC SURVEY REPORT • YOLO11 DEPLOYMENT
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Detection and Monitoring of Coral Reef Disease and Health Condition
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Application: ReefSentra | Assessment ID: <span className="font-mono text-reef-aqua font-bold">{selectedAssessment.id}</span>
                </p>
              </div>

              {/* Metadata 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-reef-midnight border border-reef-border/50 space-y-2">
                  <span className="text-[11px] font-bold text-reef-aqua uppercase tracking-wider block mb-2 font-sans">
                    Survey Metadata
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assessment Name:</span>
                    <span className="text-white font-semibold">{selectedAssessment.assessmentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Survey Date:</span>
                    <span className="text-white font-semibold">{selectedAssessment.assessmentDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Principal Investigator:</span>
                    <span className="text-white font-semibold">{selectedAssessment.createdBy || 'Research Team'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-reef-midnight border border-reef-border/50 space-y-2">
                  <span className="text-[11px] font-bold text-reef-aqua uppercase tracking-wider block mb-2 font-sans">
                    Monitoring Station Geospatial Details
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Station / ID:</span>
                    <span className="text-white font-semibold">{assessmentSite?.siteName} ({selectedAssessment.siteId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reef Ecosystem:</span>
                    <span className="text-white font-semibold">{assessmentSite?.reefName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordinates:</span>
                    <span>Lat {assessmentSite?.latitude.toFixed(4)}, Lon {assessmentSite?.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Sample Metrics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Quadrats Analysed</span>
                  <span className="text-xl font-black text-white">{selectedAssessment.imageCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Total Specimens</span>
                  <span className="text-xl font-black text-reef-aqua">{selectedAssessment.totalDetections}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Healthy Ratio</span>
                  <span className="text-xl font-black text-emerald-400">{selectedAssessment.summary.healthyCoral.percentage}%</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Combined Band</span>
                  <span className="text-xl font-black text-purple-300">{selectedAssessment.summary.combinedBandDisease.percentage}%</span>
                </div>
              </div>

              {/* Six Categories Full Breakdown Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Six Official Taxonomic Categories (Quantitative Summary)
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-reef-border/50">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-reef-midnight border-b border-reef-border/50 text-[11px] uppercase text-slate-300 font-bold">
                      <tr>
                        <th className="py-3 px-4 font-sans">Category Label</th>
                        <th className="py-3 px-4">Classification Group</th>
                        <th className="py-3 px-4">Object Detections</th>
                        <th className="py-3 px-4 text-right">Prevalence Proportion (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-reef-border/30 bg-reef-deep/60">
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-emerald-400">Healthy Coral</td>
                        <td className="py-3 px-4 text-slate-300">Condition</td>
                        <td className="py-3 px-4 text-white">{selectedAssessment.summary.healthyCoral.count}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-400">{selectedAssessment.summary.healthyCoral.percentage}%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-reef-orange">Bleached Coral</td>
                        <td className="py-3 px-4 text-slate-300">Condition</td>
                        <td className="py-3 px-4 text-white">{selectedAssessment.summary.bleachedCoral.count}</td>
                        <td className="py-3 px-4 text-right font-black text-reef-orange">{selectedAssessment.summary.bleachedCoral.percentage}%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-rose-400">Dead Coral</td>
                        <td className="py-3 px-4 text-slate-300">Condition</td>
                        <td className="py-3 px-4 text-white">{selectedAssessment.summary.deadCoral.count}</td>
                        <td className="py-3 px-4 text-right font-black text-rose-400">{selectedAssessment.summary.deadCoral.percentage}%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-purple-400">Black Band Disease</td>
                        <td className="py-3 px-4 text-slate-300">Disease (Band)</td>
                        <td className="py-3 px-4 text-white">{selectedAssessment.summary.blackBandDisease.count}</td>
                        <td className="py-3 px-4 text-right font-black text-purple-400">{selectedAssessment.summary.blackBandDisease.percentage}%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-sky-400">White Band Disease</td>
                        <td className="py-3 px-4 text-slate-300">Disease (Band)</td>
                        <td className="py-3 px-4 text-white">{selectedAssessment.summary.whiteBandDisease.count}</td>
                        <td className="py-3 px-4 text-right font-black text-sky-400">{selectedAssessment.summary.whiteBandDisease.percentage}%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-sans font-bold text-yellow-400">Yellow Band Disease</td>
                        <td className="py-3 px-4 text-slate-300">Disease (Band)</td>
                        <td className="py-3 px-4 text-white">{selectedAssessment.summary.yellowBandDisease.count}</td>
                        <td className="py-3 px-4 text-right font-black text-yellow-400">{selectedAssessment.summary.yellowBandDisease.percentage}%</td>
                      </tr>
                      <tr className="bg-reef-midnight font-black border-t-2 border-reef-border">
                        <td className="py-3.5 px-4 font-sans text-purple-300">Combined Band Disease (Aggregated Pathogens)</td>
                        <td className="py-3.5 px-4 text-purple-400 font-sans">Band Diseases Sum</td>
                        <td className="py-3.5 px-4 text-purple-200">{selectedAssessment.summary.combinedBandDisease.count}</td>
                        <td className="py-3.5 px-4 text-right text-purple-200">{selectedAssessment.summary.combinedBandDisease.percentage}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observer Notes */}
              <div className="p-4 rounded-2xl bg-reef-midnight border border-reef-border/40 text-xs text-slate-200">
                <span className="font-bold text-white block mb-1">Field Notes &amp; Marine Environmental Observations:</span>
                <p className="leading-relaxed">
                  {selectedAssessment.notes || 'Routine benthic photo transect logged under standard calm water conditions.'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl reef-glass flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <label className="text-white font-bold">Station:</label>
                <select
                  value={comparisonSiteId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setComparisonSiteId(id);
                    const asms = assessments
                      .filter((a) => a.siteId === id)
                      .sort(
                        (a, b) =>
                          new Date(a.assessmentDate).getTime() -
                          new Date(b.assessmentDate).getTime()
                      );
                    if (asms.length >= 2) {
                      setCompAsmAId(asms[asms.length - 2].id);
                      setCompAsmBId(asms[asms.length - 1].id);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-reef-deep border border-reef-border text-white"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.siteName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-white font-bold">Baseline Survey:</label>
                <select
                  value={compAsmAId}
                  onChange={(e) => setCompAsmAId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-reef-deep border border-reef-border text-white"
                >
                  {siteAssessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assessmentDate} ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-white font-bold">Comparative Survey:</label>
                <select
                  value={compAsmBId}
                  onChange={(e) => setCompAsmBId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-reef-deep border border-reef-border text-white"
                >
                  {siteAssessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assessmentDate} ({a.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {siteAssessments.length >= 2 && (
              <button
                onClick={handleExportComparisonPDF}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-reef-aqua to-reef-teal hover:brightness-110 text-reef-deep font-black flex items-center gap-2 shadow-glow-aqua"
              >
                <Download className="w-4 h-4" />
                <span>Download Comparison PDF</span>
              </button>
            )}
          </div>

          {siteAssessments.length < 2 ? (
            <div className="p-12 rounded-3xl reef-glass text-center text-slate-300 text-xs">
              Selected station has fewer than two historical surveys. Select a site with multiple chronological assessments (e.g., Heron Island or Ambergris Caye) to compile comparative research reports.
            </div>
          ) : compAsmA && compAsmB && comparisonSite ? (
            <div className="p-8 rounded-3xl reef-glass shadow-2xl space-y-6">
              <div className="border-b border-reef-border/40 pb-5">
                <span className="text-[11px] font-mono tracking-widest text-reef-aqua font-bold uppercase block mb-1">
                  REEFSENTRA CHRONOLOGICAL COMPARATIVE RESEARCH REPORT
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Longitudinal Coral Pathogen &amp; Health Trajectory
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Station: {comparisonSite.siteName} ({comparisonSite.id}) • Comparing {compAsmA.assessmentDate} against {compAsmB.assessmentDate}
                </p>
              </div>

              {/* Percentage Point Comparative Table */}
              <div className="overflow-x-auto rounded-2xl border border-reef-border/50">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-reef-midnight border-b border-reef-border/50 text-[11px] uppercase text-slate-300 font-bold">
                    <tr>
                      <th className="py-3 px-4 font-sans">Category</th>
                      <th className="py-3 px-4">Prior ({compAsmA.assessmentDate})</th>
                      <th className="py-3 px-4">Recent ({compAsmB.assessmentDate})</th>
                      <th className="py-3 px-4 text-right">Trajectory Delta (pp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-reef-border/30 bg-reef-deep/60">
                    {[
                      { name: 'Healthy Coral', p: compAsmA.summary.healthyCoral.percentage, c: compAsmB.summary.healthyCoral.percentage },
                      { name: 'Bleached Coral', p: compAsmA.summary.bleachedCoral.percentage, c: compAsmB.summary.bleachedCoral.percentage },
                      { name: 'Dead Coral', p: compAsmA.summary.deadCoral.percentage, c: compAsmB.summary.deadCoral.percentage },
                      { name: 'Black Band Disease', p: compAsmA.summary.blackBandDisease.percentage, c: compAsmB.summary.blackBandDisease.percentage },
                      { name: 'White Band Disease', p: compAsmA.summary.whiteBandDisease.percentage, c: compAsmB.summary.whiteBandDisease.percentage },
                      { name: 'Yellow Band Disease', p: compAsmA.summary.yellowBandDisease.percentage, c: compAsmB.summary.yellowBandDisease.percentage },
                      {
                        name: 'Combined Band Disease (Aggregate)',
                        p: compAsmA.summary.combinedBandDisease.percentage,
                        c: compAsmB.summary.combinedBandDisease.percentage,
                        isHighlight: true,
                      },
                    ].map((row) => {
                      const diff = calculatePercentagePointDiff(row.c, row.p);
                      return (
                        <tr key={row.name} className={row.isHighlight ? 'bg-reef-midnight font-black' : ''}>
                          <td className="py-3 px-4 font-sans text-white font-bold">{row.name}</td>
                          <td className="py-3 px-4 text-slate-300">{row.p}%</td>
                          <td className="py-3 px-4 text-white font-extrabold">{row.c}%</td>
                          <td className="py-3 px-4 text-right font-black">
                            <span
                              className={
                                diff === null || diff === 0
                                  ? 'text-slate-400'
                                  : row.name === 'Healthy Coral'
                                  ? diff > 0
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                  : diff > 0
                                  ? 'text-rose-400'
                                  : 'text-emerald-400'
                              }
                            >
                              {formatPercentagePointDiff(diff)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Research Alert Evaluation */}
              <div className="p-4 rounded-2xl bg-reef-midnight border border-reef-border/50 text-xs text-slate-200 space-y-2 font-mono">
                <span className="font-bold text-white block mb-1 font-sans">
                  Surveillance Rules Automated Evaluation:
                </span>
                <div>
                  • Thermal Bleaching Surge:{' '}
                  {compAsmB.summary.bleachedCoral.percentage - compAsmA.summary.bleachedCoral.percentage >= 15 ? (
                    <span className="text-reef-pink font-bold">CRITICAL SPIKE EXCEEDED (+15 pp)</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">Within Nominal Range</span>
                  )}
                </div>
                <div>
                  • Combined Band Pathogen Growth:{' '}
                  {compAsmB.summary.combinedBandDisease.percentage - compAsmA.summary.combinedBandDisease.percentage >= 15 ? (
                    <span className="text-reef-pink font-bold">CRITICAL OUTBREAK DETECTED (+15 pp)</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">Nominal Microbial Progression</span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
