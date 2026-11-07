export type AlertRuleType =
  | 'BLEACHING_SPIKE'
  | 'BAND_DISEASE_SPIKE'
  | 'NEW_DISEASE_CATEGORY';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface AlertNotification {
  id: string;
  title: string;
  siteId: string;
  siteName: string;
  assessmentId: string;
  assessmentDate: string;
  ruleType: AlertRuleType;
  alertReason: string;
  previousPercentage: number | null;
  currentPercentage: number;
  percentagePointChange: number | null;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  emailNotified?: boolean;
}

export interface EmailNotificationPayload {
  recipients: string[];
  subject: string;
  alertId: string;
  siteName: string;
  reason: string;
  metrics: {
    previousPct: number | null;
    currentPct: number;
    ppChange: number | null;
  };
  sentAt: string;
}
