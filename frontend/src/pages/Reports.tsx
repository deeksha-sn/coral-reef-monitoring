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

  // PDF Export Triggers
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Scientific Research Documentation
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Research Reports &amp; PDF Export
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compile formal benthic survey findings and longitudinal comparison records for publication, peer review, and marine conservation archiving.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-xl bg-ocean-950 p-1 border border-ocean-700/80 text-xs">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'individual'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Individual Assessment Report
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'comparison'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Historical Comparison Report
          </button>
        </div>
      </div>

      {activeTab === 'individual' ? (
        /* INDIVIDUAL ASSESSMENT REPORT SECTION */
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-ocean-850/80 border border-ocean-700/70 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <label className="text-slate-300 font-semibold">Select Assessment to Compile:</label>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold flex items-center gap-2 shadow-glow-cyan"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Report</span>
            </button>
          </div>

          {/* Formatted Scientific Paper Preview */}
          {selectedAssessment && (
            <div className="p-8 rounded-2xl bg-ocean-900/90 border border-ocean-700 shadow-2xl space-y-6 font-sans">
              {/* Document Banner */}
              <div className="border-b border-ocean-700 pb-5">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase block mb-1">
                  OFFICIAL SCIENTIFIC SURVEY REPORT • YOLO11 DEPLOYMENT
                </span>
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  Detection and Monitoring of Coral Reef Disease and Health Condition
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  System: Coral Reef Health &amp; Disease Monitoring System | Assessment ID: {selectedAssessment.id}
                </p>
              </div>

              {/* Metadata 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-ocean-950/80 border border-ocean-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-2 font-sans">
                    Survey Metadata
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assessment Name:</span>
                    <span className="text-slate-200">{selectedAssessment.assessmentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Survey Date:</span>
                    <span className="text-slate-200">{selectedAssessment.assessmentDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Principal Investigator:</span>
                    <span className="text-slate-200">{selectedAssessment.createdBy || 'Research Team'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-ocean-950/80 border border-ocean-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-2 font-sans">
                    Monitoring Station Geospatial Details
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Site ID / Name:</span>
                    <span className="text-slate-200">{assessmentSite?.siteName} ({selectedAssessment.siteId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reef Ecosystem:</span>
                    <span className="text-slate-200">{assessmentSite?.reefName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coordinates:</span>
                    <span>Lat {assessmentSite?.latitude.toFixed(4)}, Lon {assessmentSite?.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Sample Metrics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Quadrats Analysed</span>
                  <span className="text-lg font-bold text-slate-100">{selectedAssessment.imageCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Total Specimen Detections</span>
                  <span className="text-lg font-bold text-cyan-300">{selectedAssessment.totalDetections}</span>
                </div>
                <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Healthy Tissue Ratio</span>
                  <span className="text-lg font-bold text-emerald-400">{selectedAssessment.summary.healthyCoral.percentage}%</span>
                </div>
                <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Combined Band Disease</span>
                  <span className="text-lg font-bold text-violet-400">{selectedAssessment.summary.combinedBandDisease.percentage}%</span>
                </div>
              </div>

              {/* Six Categories Full Breakdown Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Six Official Taxonomic Categories (Quantitative Summary)
                </h3>
                <div className="overflow-x-auto rounded-xl border border-ocean-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-ocean-950 border-b border-ocean-800 text-[11px] uppercase text-slate-400">
                      <tr>
                        <th className="py-2.5 px-4 font-sans">Category Label</th>
                        <th className="py-2.5 px-4">Classification Group</th>
                        <th className="py-2.5 px-4">Object Detections</th>
                        <th className="py-2.5 px-4 text-right">Prevalence Proportion (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ocean-800/80 bg-ocean-950/40">
                      <tr>
                        <td className="py-2.5 px-4 font-sans font-semibold text-emerald-400">Healthy Coral</td>
                        <td className="py-2.5 px-4 text-slate-400">Condition</td>
                        <td className="py-2.5 px-4">{selectedAssessment.summary.healthyCoral.count}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-400">{selectedAssessment.summary.healthyCoral.percentage}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-sans font-semibold text-amber-400">Bleached Coral</td>
                        <td className="py-2.5 px-4 text-slate-400">Condition</td>
                        <td className="py-2.5 px-4">{selectedAssessment.summary.bleachedCoral.count}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-amber-400">{selectedAssessment.summary.bleachedCoral.percentage}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-sans font-semibold text-red-400">Dead Coral</td>
                        <td className="py-2.5 px-4 text-slate-400">Condition</td>
                        <td className="py-2.5 px-4">{selectedAssessment.summary.deadCoral.count}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-red-400">{selectedAssessment.summary.deadCoral.percentage}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-sans font-semibold text-purple-400">Black Band Disease</td>
                        <td className="py-2.5 px-4 text-slate-400">Disease (Band)</td>
                        <td className="py-2.5 px-4">{selectedAssessment.summary.blackBandDisease.count}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-purple-400">{selectedAssessment.summary.blackBandDisease.percentage}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-sans font-semibold text-sky-400">White Band Disease</td>
                        <td className="py-2.5 px-4 text-slate-400">Disease (Band)</td>
                        <td className="py-2.5 px-4">{selectedAssessment.summary.whiteBandDisease.count}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-sky-400">{selectedAssessment.summary.whiteBandDisease.percentage}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-sans font-semibold text-yellow-400">Yellow Band Disease</td>
                        <td className="py-2.5 px-4 text-slate-400">Disease (Band)</td>
                        <td className="py-2.5 px-4">{selectedAssessment.summary.yellowBandDisease.count}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-yellow-400">{selectedAssessment.summary.yellowBandDisease.percentage}%</td>
                      </tr>
                      <tr className="bg-ocean-950 font-bold border-t-2 border-ocean-700">
                        <td className="py-3 px-4 font-sans text-violet-300">Combined Band Disease (Aggregated Pathogens)</td>
                        <td className="py-3 px-4 text-violet-400">Band Diseases Sum</td>
                        <td className="py-3 px-4 text-violet-300">{selectedAssessment.summary.combinedBandDisease.count}</td>
                        <td className="py-3 px-4 text-right text-violet-300">{selectedAssessment.summary.combinedBandDisease.percentage}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observer Notes */}
              <div className="p-4 rounded-xl bg-ocean-950/70 border border-ocean-800 text-xs text-slate-300">
                <span className="font-bold text-slate-200 block mb-1">Field Notes &amp; Marine Environmental Observations:</span>
                <p className="leading-relaxed">
                  {selectedAssessment.notes || 'Routine benthic photo transect logged under standard calm water conditions.'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* HISTORICAL COMPARISON REPORT SECTION */
        <div className="space-y-6">
          {/* Station & Survey Date Selector Card */}
          <div className="p-4 rounded-xl bg-ocean-850/80 border border-ocean-700/70 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <label className="text-slate-300 font-semibold">Station:</label>
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
                  className="px-2.5 py-1.5 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.siteName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-slate-300 font-semibold">Baseline Survey:</label>
                <select
                  value={compAsmAId}
                  onChange={(e) => setCompAsmAId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200"
                >
                  {siteAssessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assessmentDate} ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-slate-300 font-semibold">Comparative Survey:</label>
                <select
                  value={compAsmBId}
                  onChange={(e) => setCompAsmBId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200"
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
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold flex items-center gap-2 shadow-glow-cyan"
              >
                <Download className="w-4 h-4" />
                <span>Download Comparison PDF</span>
              </button>
            )}
          </div>

          {/* Formatted Comparison Report Preview */}
          {siteAssessments.length < 2 ? (
            <div className="p-12 rounded-2xl bg-ocean-850/90 border border-ocean-700 text-center text-slate-400 text-xs">
              Selected monitoring station has fewer than two historical surveys. Select a site with multiple chronological assessments (e.g., Heron Island or Ambergris Caye) to compile comparative research reports.
            </div>
          ) : compAsmA && compAsmB && comparisonSite ? (
            <div className="p-8 rounded-2xl bg-ocean-900/90 border border-ocean-700 shadow-2xl space-y-6">
              <div className="border-b border-ocean-700 pb-5">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase block mb-1">
                  CHRONOLOGICAL COMPARATIVE RESEARCH REPORT
                </span>
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  Longitudinal Coral Pathogen &amp; Health Trajectory
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Station: {comparisonSite.siteName} ({comparisonSite.id}) • Comparing {compAsmA.assessmentDate} against {compAsmB.assessmentDate}
                </p>
              </div>

              {/* Percentage Point Comparative Table */}
              <div className="overflow-x-auto rounded-xl border border-ocean-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-ocean-950 border-b border-ocean-800 text-[11px] uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4 font-sans">Category</th>
                      <th className="py-2.5 px-4">Prior ({compAsmA.assessmentDate})</th>
                      <th className="py-2.5 px-4">Recent ({compAsmB.assessmentDate})</th>
                      <th className="py-2.5 px-4 text-right">Trajectory Delta (pp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ocean-800/80 bg-ocean-950/40">
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
                        <tr key={row.name} className={row.isHighlight ? 'bg-ocean-950 font-bold' : ''}>
                          <td className="py-2.5 px-4 font-sans text-slate-200">{row.name}</td>
                          <td className="py-2.5 px-4 text-slate-400">{row.p}%</td>
                          <td className="py-2.5 px-4 text-slate-100">{row.c}%</td>
                          <td className="py-2.5 px-4 text-right font-bold">
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
              <div className="p-4 rounded-xl bg-ocean-950 border border-ocean-800 text-xs text-slate-300 space-y-1.5 font-mono">
                <span className="font-bold text-slate-200 block mb-1 font-sans">
                  Surveillance Rules Automated Evaluation:
                </span>
                <div>
                  • Thermal Bleaching Surge:{' '}
                  {compAsmB.summary.bleachedCoral.percentage - compAsmA.summary.bleachedCoral.percentage >= 15 ? (
                    <span className="text-rose-400 font-bold">CRITICAL SPIKE EXCEEDED (+15 pp)</span>
                  ) : (
                    <span className="text-emerald-400">Within Nominal Range</span>
                  )}
                </div>
                <div>
                  • Combined Band Pathogen Growth:{' '}
                  {compAsmB.summary.combinedBandDisease.percentage - compAsmA.summary.combinedBandDisease.percentage >= 15 ? (
                    <span className="text-rose-400 font-bold">CRITICAL OUTBREAK DETECTED (+15 pp)</span>
                  ) : (
                    <span className="text-emerald-400">Nominal Microbial Progression</span>
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
