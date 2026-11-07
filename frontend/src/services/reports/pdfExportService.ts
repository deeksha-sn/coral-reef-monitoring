import { jsPDF } from 'jspdf';
import { Assessment } from '../../types/assessment';
import { ReefSite } from '../../types/site';
import { formatPercentagePointDiff } from '../../utils/coralMath';

/**
 * Generates an Individual Assessment Scientific Report PDF
 */
export function exportAssessmentReportPDF(
  assessment: Assessment,
  site: ReefSite | undefined
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner - Midnight Current (#162B42) Base
  doc.setFillColor(22, 43, 66);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(41, 184, 230); // Coral Bay Blue (#29B8E6)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REEFSENTRA — CORAL REEF HEALTH & DISEASE MONITORING', 14, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(
    'Research Paper: Detection and Monitoring of Coral Reef Disease and Health Condition',
    14,
    18
  );
  doc.text('INDIVIDUAL REEF ASSESSMENT SCIENTIFIC REPORT', 14, 23);

  // Document Metadata Box
  y = 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 32, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Metadata', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Assessment ID: ${assessment.id}`, 18, y + 13);
  doc.text(`Survey Date: ${assessment.assessmentDate}`, 18, y + 19);
  doc.text(`Lead Observer: ${assessment.createdBy || 'Research Team'}`, 18, y + 25);

  doc.text(`Site ID: ${site?.id || assessment.siteId}`, 105, y + 13);
  doc.text(`Site Name: ${site?.siteName || 'Unknown Site'}`, 105, y + 19);
  doc.text(
    `Location: ${site?.region || 'N/A'}, ${site?.country || 'N/A'} (${site?.latitude?.toFixed(4) || '0'}, ${site?.longitude?.toFixed(4) || '0'})`,
    105,
    y + 25
  );

  // Survey Overview Metrics
  y = 74;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Survey Sampling Overview', 14, y);

  y += 5;
  const metrics = [
    { label: 'Total Images Analysed', value: `${assessment.imageCount} quadrats` },
    { label: 'Total Detected Objects', value: `${assessment.totalDetections} specimens` },
    { label: 'Combined Band Disease', value: `${assessment.summary.combinedBandDisease.percentage}%` },
    { label: 'Thermal Bleaching Rate', value: `${assessment.summary.bleachedCoral.percentage}%` },
  ];

  const colWidth = (pageWidth - 28) / 4;
  metrics.forEach((m, idx) => {
    const xPos = 14 + idx * colWidth;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(xPos, y, colWidth - 2, 16, 1.5, 1.5, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, xPos + 3, y + 5);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, xPos + 3, y + 12);
  });

  // Six-Category Scientific Distribution Table
  y += 24;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Six Official Category Health & Pathogen Breakdown', 14, y);

  y += 4;
  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Classification Category', 18, y + 5);
  doc.text('Type', 85, y + 5);
  doc.text('Detection Count', 125, y + 5);
  doc.text('Class Percentage (%)', 165, y + 5);

  const categoriesData = [
    { name: 'Healthy Coral', type: 'Health Condition', c: assessment.summary.healthyCoral },
    { name: 'Bleached Coral', type: 'Health Condition', c: assessment.summary.bleachedCoral },
    { name: 'Dead Coral', type: 'Health Condition', c: assessment.summary.deadCoral },
    { name: 'Black Band Disease', type: 'Disease (Band)', c: assessment.summary.blackBandDisease },
    { name: 'White Band Disease', type: 'Disease (Band)', c: assessment.summary.whiteBandDisease },
    { name: 'Yellow Band Disease', type: 'Disease (Band)', c: assessment.summary.yellowBandDisease },
  ];

  y += 7;
  categoriesData.forEach((cat, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(cat.name, 18, y + 4.5);
    doc.setTextColor(71, 85, 105);
    doc.text(cat.type, 85, y + 4.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cat.c.count}`, 130, y + 4.5);
    doc.text(`${cat.c.percentage}%`, 170, y + 4.5);
    y += 6.5;
  });

  // Table summary row: Combined Band Disease
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Combined Band Disease (Black + White + Yellow)', 18, y + 5);
  doc.text('Aggregated Pathogens', 85, y + 5);
  doc.text(`${assessment.summary.combinedBandDisease.count}`, 130, y + 5);
  doc.text(`${assessment.summary.combinedBandDisease.percentage}%`, 170, y + 5);

  // Field Notes Section
  y += 14;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Field Observer Notes & Environmental Context', 14, y);

  y += 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const notesText =
    assessment.notes ||
    'Standard survey phototransect protocol executed. No anomalous equipment deviation reported.';
  const splitNotes = doc.splitTextToSize(notesText, pageWidth - 36);
  doc.text(splitNotes, 18, y + 6);

  // Disclaimer & Scientific Sign-off
  y = 260;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);

  y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Demonstration Data Notice: Prototype report generated by Coral Reef Health & Disease Monitoring System frontend.',
    14,
    y
  );
  doc.text(
    `Report generated: ${new Date().toISOString()} | Evaluation taxonomy: 6-Class YOLO11 Marine Benchmark.`,
    14,
    y + 4
  );

  doc.save(`Assessment_Report_${assessment.id}.pdf`);
}

/**
 * Generates a Historical Comparison Scientific Report PDF between two assessments of the SAME site
 */
export function exportComparisonReportPDF(
  site: ReefSite,
  currentAssessment: Assessment,
  previousAssessment: Assessment
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner - Midnight Current (#162B42) Base
  doc.setFillColor(22, 43, 66);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(41, 184, 230); // Coral Bay Blue (#29B8E6)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REEFSENTRA — CORAL REEF HEALTH & DISEASE MONITORING', 14, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Research Paper: Detection and Monitoring of Coral Reef Disease and Health Condition',
    14,
    18
  );
  doc.text('HISTORICAL CHRONOLOGICAL COMPARISON SCIENTIFIC REPORT', 14, 23);

  // Site Header Box
  y = 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Site: ${site.siteName} (${site.id})`, 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Reef Ecosystem: ${site.reefName}`, 18, y + 12);
  doc.text(
    `Coordinates: Lat ${site.latitude.toFixed(4)}, Lon ${site.longitude.toFixed(4)} | Depth: ${site.depthMeters || 'N/A'}m`,
    18,
    y + 18
  );
  doc.text(`Baseline Survey: ${previousAssessment.assessmentDate} (${previousAssessment.id})`, 105, y + 12);
  doc.text(`Comparative Survey: ${currentAssessment.assessmentDate} (${currentAssessment.id})`, 105, y + 18);

  // Six-Category Comparative Analysis Table
  y = 72;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Six-Category Chronological Trajectory (Percentage Points Difference)', 14, y);

  y += 5;
  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Category', 18, y + 5);
  doc.text(`Prior (${previousAssessment.assessmentDate})`, 75, y + 5);
  doc.text(`Recent (${currentAssessment.assessmentDate})`, 120, y + 5);
  doc.text('Diff (pp)', 165, y + 5);

  const compareRows = [
    {
      name: 'Healthy Coral',
      prev: previousAssessment.summary.healthyCoral.percentage,
      curr: currentAssessment.summary.healthyCoral.percentage,
    },
    {
      name: 'Bleached Coral',
      prev: previousAssessment.summary.bleachedCoral.percentage,
      curr: currentAssessment.summary.bleachedCoral.percentage,
    },
    {
      name: 'Dead Coral',
      prev: previousAssessment.summary.deadCoral.percentage,
      curr: currentAssessment.summary.deadCoral.percentage,
    },
    {
      name: 'Black Band Disease',
      prev: previousAssessment.summary.blackBandDisease.percentage,
      curr: currentAssessment.summary.blackBandDisease.percentage,
    },
    {
      name: 'White Band Disease',
      prev: previousAssessment.summary.whiteBandDisease.percentage,
      curr: currentAssessment.summary.whiteBandDisease.percentage,
    },
    {
      name: 'Yellow Band Disease',
      prev: previousAssessment.summary.yellowBandDisease.percentage,
      curr: currentAssessment.summary.yellowBandDisease.percentage,
    },
    {
      name: 'Combined Band Disease (Aggregate)',
      prev: previousAssessment.summary.combinedBandDisease.percentage,
      curr: currentAssessment.summary.combinedBandDisease.percentage,
      isHighlight: true,
    },
  ];

  y += 7;
  compareRows.forEach((row) => {
    const diff = Number((row.curr - row.prev).toFixed(1));
    const diffText = formatPercentagePointDiff(diff);

    if (row.isHighlight) {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(row.name, 18, y + 4.5);
    doc.text(`${row.prev}%`, 80, y + 4.5);
    doc.text(`${row.curr}%`, 125, y + 4.5);

    if (diff > 0 && row.name !== 'Healthy Coral') {
      doc.setTextColor(220, 38, 38); // Red warning
    } else if (diff < 0 && row.name === 'Healthy Coral') {
      doc.setTextColor(220, 38, 38); // Loss of health
    } else if (diff > 0 && row.name === 'Healthy Coral') {
      doc.setTextColor(16, 185, 129); // Health recovery
    } else {
      doc.setTextColor(71, 85, 105);
    }
    doc.text(diffText, 168, y + 4.5);

    y += 6.5;
  });

  // Scientific Interpretation Notes
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Key Research Findings & Alert Evaluation', 14, y);

  y += 5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 40, 2, 2, 'FD');

  const bleachDiff = Number(
    (currentAssessment.summary.bleachedCoral.percentage -
      previousAssessment.summary.bleachedCoral.percentage).toFixed(1)
  );
  const bandDiff = Number(
    (currentAssessment.summary.combinedBandDisease.percentage -
      previousAssessment.summary.combinedBandDisease.percentage).toFixed(1)
  );

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  let alertText = `• Bleaching trajectory: ${formatPercentagePointDiff(bleachDiff)}. ${
    bleachDiff >= 15 ? 'CRITICAL: Bleaching spike exceeded +15 pp research threshold.' : 'Within standard bounds.'
  }\n• Combined Band Disease trajectory: ${formatPercentagePointDiff(bandDiff)}. ${
    bandDiff >= 15 ? 'CRITICAL: Severe pathogen spread exceeding +15 pp threshold.' : 'Pathogen growth nominal.'
  }`;

  if (
    previousAssessment.summary.yellowBandDisease.count === 0 &&
    currentAssessment.summary.yellowBandDisease.count > 0
  ) {
    alertText += '\n• Pathogen Emergence: Yellow Band Disease detected at this site for the first time.';
  }

  const splitAlertText = doc.splitTextToSize(alertText, pageWidth - 36);
  doc.text(splitAlertText, 18, y + 8);

  // Footer
  y = 260;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);
  y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Comparative report compiled for ${site.siteName}. DEMO RESEARCH DATA - Not actual field measurements.`,
    14,
    y
  );
  doc.text(`Generated: ${new Date().toISOString()} | Algorithm: YOLO11-Coral-Benchmark`, 14, y + 4);

  doc.save(`Comparison_Report_${site.id}_${previousAssessment.id}_vs_${currentAssessment.id}.pdf`);
}
