import { AlertNotification } from '../../types/alert';
import { Assessment } from '../../types/assessment';
import { CoralCategoryKey } from '../../types/prediction';
import { AlertThresholdSettings } from '../../types/settings';
import { calculatePercentagePointDiff } from '../../utils/coralMath';

/**
 * Finds the immediately preceding assessment for the same site ID based on chronological date.
 */
export function findPreviousAssessmentForSite(
  siteId: string,
  currentAssessmentDate: string,
  allAssessments: Assessment[]
): Assessment | null {
  const siteAssessments = allAssessments
    .filter(
      (a) =>
        a.siteId === siteId &&
        new Date(a.assessmentDate).getTime() < new Date(currentAssessmentDate).getTime()
    )
    .sort(
      (a, b) =>
        new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    );

  return siteAssessments.length > 0 ? siteAssessments[0] : null;
}

/**
 * Evaluates the three research alert rules for a newly created or evaluated assessment:
 * Rule 1: Bleached Coral percentage increases by >15 pp compared to previous assessment of the same site.
 * Rule 2: Combined Band Disease percentage increases by >15 pp compared to previous assessment of the same site.
 * Rule 3: A previously absent disease category appears in the new assessment.
 */
export function evaluateAssessmentAlerts(
  assessment: Assessment,
  previousAssessment: Assessment | null,
  siteName: string,
  thresholds: AlertThresholdSettings
): AlertNotification[] {
  const triggeredAlerts: AlertNotification[] = [];

  if (!previousAssessment) {
    // Only calculate comparison alerts when valid previous assessment data exists for the same site
    return triggeredAlerts;
  }

  // Rule 1: Bleaching Alert
  const prevBleachPct = previousAssessment.summary.bleachedCoral.percentage;
  const currBleachPct = assessment.summary.bleachedCoral.percentage;
  const bleachPpDiff = calculatePercentagePointDiff(currBleachPct, prevBleachPct);

  if (bleachPpDiff !== null && bleachPpDiff >= thresholds.bleachingThresholdPP) {
    triggeredAlerts.push({
      id: `ALT-${Date.now()}-BLCH`,
      title: 'Bleaching Alert: Thermal Stress Threshold Exceeded',
      siteId: assessment.siteId,
      siteName,
      assessmentId: assessment.id,
      assessmentDate: assessment.assessmentDate,
      ruleType: 'BLEACHING_SPIKE',
      alertReason: `Bleached Coral percentage increased by ${bleachPpDiff} percentage points (from ${prevBleachPct}% to ${currBleachPct}%), exceeding the ${thresholds.bleachingThresholdPP} pp research threshold.`,
      previousPercentage: prevBleachPct,
      currentPercentage: currBleachPct,
      percentagePointChange: bleachPpDiff,
      severity: 'CRITICAL',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      emailNotified: false,
    });
  }

  // Rule 2: Combined Band Disease Alert
  const prevBandPct = previousAssessment.summary.combinedBandDisease.percentage;
  const currBandPct = assessment.summary.combinedBandDisease.percentage;
  const bandPpDiff = calculatePercentagePointDiff(currBandPct, prevBandPct);

  if (bandPpDiff !== null && bandPpDiff >= thresholds.bandDiseaseThresholdPP) {
    triggeredAlerts.push({
      id: `ALT-${Date.now()}-BAND`,
      title: 'Combined Band Disease Outbreak Alert',
      siteId: assessment.siteId,
      siteName,
      assessmentId: assessment.id,
      assessmentDate: assessment.assessmentDate,
      ruleType: 'BAND_DISEASE_SPIKE',
      alertReason: `Combined Band Disease (Black, White, Yellow Band) percentage increased by ${bandPpDiff} percentage points (from ${prevBandPct}% to ${currBandPct}%), exceeding the ${thresholds.bandDiseaseThresholdPP} pp alert threshold.`,
      previousPercentage: prevBandPct,
      currentPercentage: currBandPct,
      percentagePointChange: bandPpDiff,
      severity: 'CRITICAL',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      emailNotified: false,
    });
  }

  // Rule 3: New Disease Category Alert
  if (thresholds.enableNewDiseaseAlert) {
    const diseaseChecks: {
      key: CoralCategoryKey;
      name: string;
      prevCount: number;
      currCount: number;
      currPct: number;
    }[] = [
      {
        key: 'black_band_disease',
        name: 'Black Band Disease',
        prevCount: previousAssessment.summary.blackBandDisease.count,
        currCount: assessment.summary.blackBandDisease.count,
        currPct: assessment.summary.blackBandDisease.percentage,
      },
      {
        key: 'white_band_disease',
        name: 'White Band Disease',
        prevCount: previousAssessment.summary.whiteBandDisease.count,
        currCount: assessment.summary.whiteBandDisease.count,
        currPct: assessment.summary.whiteBandDisease.percentage,
      },
      {
        key: 'yellow_band_disease',
        name: 'Yellow Band Disease',
        prevCount: previousAssessment.summary.yellowBandDisease.count,
        currCount: assessment.summary.yellowBandDisease.count,
        currPct: assessment.summary.yellowBandDisease.percentage,
      },
    ];

    for (const d of diseaseChecks) {
      if (d.prevCount === 0 && d.currCount > 0) {
        triggeredAlerts.push({
          id: `ALT-${Date.now()}-NEW-${d.key}`,
          title: `New Disease Category Alert: ${d.name} Detected`,
          siteId: assessment.siteId,
          siteName,
          assessmentId: assessment.id,
          assessmentDate: assessment.assessmentDate,
          ruleType: 'NEW_DISEASE_CATEGORY',
          alertReason: `${d.name} was identified at ${d.currPct}% (${d.currCount} detections), having been previously absent (0 detections) at this site.`,
          previousPercentage: 0.0,
          currentPercentage: d.currPct,
          percentagePointChange: d.currPct,
          severity: 'WARNING',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          emailNotified: false,
        });
      }
    }
  }

  return triggeredAlerts;
}
