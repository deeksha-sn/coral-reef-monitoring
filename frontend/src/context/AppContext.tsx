import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_ALERTS } from '../mock/alerts';
import { MOCK_ASSESSMENTS } from '../mock/assessments';
import { MOCK_REEF_SITES } from '../mock/sites';
import { evaluateAssessmentAlerts, findPreviousAssessmentForSite } from '../services/assessment/assessmentService';
import { checkBackendHealth, HealthCheckResult } from '../services/api/client';
import { AlertNotification, EmailNotificationPayload } from '../types/alert';
import { Assessment } from '../types/assessment';
import {
  AlertThresholdSettings,
  ApiMode,
  EmailSettings,
  ModelIntegrationSettings,
} from '../types/settings';
import { ReefSite } from '../types/site';

interface AppContextType {
  // Sites
  sites: ReefSite[];
  addSite: (siteData: Omit<ReefSite, 'id' | 'createdAt'>) => ReefSite;
  deleteSite: (id: string) => void;

  // Assessments
  assessments: Assessment[];
  addAssessment: (newAssessment: Assessment) => void;
  deleteAssessment: (id: string) => void;

  // Alerts
  alerts: AlertNotification[];
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;

  // API & Model Mode
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
  modelSettings: ModelIntegrationSettings;
  updateModelSettings: (settings: Partial<ModelIntegrationSettings>) => void;
  backendHealth: HealthCheckResult | null;
  refreshBackendHealth: () => Promise<void>;

  // Thresholds
  alertThresholds: AlertThresholdSettings;
  updateAlertThresholds: (thresholds: Partial<AlertThresholdSettings>) => void;

  // Email notifications
  emailSettings: EmailSettings;
  updateEmailSettings: (settings: Partial<EmailSettings>) => void;
  sentEmails: EmailNotificationPayload[];
  sendMockEmail: (payload: Omit<EmailNotificationPayload, 'sentAt'>) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sites, setSites] = useState<ReefSite[]>(MOCK_REEF_SITES);
  const [assessments, setAssessments] = useState<Assessment[]>(MOCK_ASSESSMENTS);
  const [alerts, setAlerts] = useState<AlertNotification[]>(MOCK_ALERTS);

  // Settings
  const [apiMode, setApiModeState] = useState<ApiMode>('MOCK');
  const [backendHealth, setBackendHealth] = useState<HealthCheckResult | null>(null);

  const [modelSettings, setModelSettings] = useState<ModelIntegrationSettings>({
    apiMode: 'MOCK',
    fastApiBaseUrl: 'http://localhost:8000',
    modelEndpoint: '/api/v1/predict',
    healthEndpoint: '/health',
    weightsName: 'yolo11x-coral-v2.pt',
    confidenceThreshold: 0.4,
    iouThreshold: 0.45,
    timeoutMs: 15000,
  });

  const [alertThresholds, setAlertThresholds] = useState<AlertThresholdSettings>({
    bleachingThresholdPP: 15,
    bandDiseaseThresholdPP: 15,
    enableNewDiseaseAlert: true,
    enableCriticalSound: false,
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    enabled: true,
    recipients: [
      'alerts@marine-research.org',
      'c.alistair@marine-research.org',
      'm.vance@reef-monitoring.edu',
    ],
    digestFrequency: 'immediate',
    smtpHost: 'smtp.marine-research.org',
    smtpPort: 587,
  });

  const [sentEmails, setSentEmails] = useState<EmailNotificationPayload[]>([]);

  // Health check
  const refreshBackendHealth = async () => {
    const result = await checkBackendHealth(
      modelSettings.fastApiBaseUrl,
      modelSettings.healthEndpoint
    );
    setBackendHealth(result);
  };

  const setApiMode = (mode: ApiMode) => {
    setApiModeState(mode);
    setModelSettings((prev) => ({ ...prev, apiMode: mode }));
    if (mode === 'LIVE') {
      refreshBackendHealth();
    }
  };

  useEffect(() => {
    if (apiMode === 'LIVE') {
      refreshBackendHealth();
    }
  }, [apiMode, modelSettings.fastApiBaseUrl]);

  // Site Operations
  const addSite = (siteData: Omit<ReefSite, 'id' | 'createdAt'>): ReefSite => {
    const newId = `SITE-REG-${String(sites.length + 1).padStart(3, '0')}`;
    const newSite: ReefSite = {
      ...siteData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setSites((prev) => [newSite, ...prev]);
    return newSite;
  };

  const deleteSite = (id: string) => {
    setSites((prev) => prev.filter((s) => s.id !== id));
  };

  // Assessment Operations
  const addAssessment = (newAssessment: Assessment) => {
    setAssessments((prev) => [newAssessment, ...prev]);

    // Check alert rules against the prior assessment of the SAME site
    const prevAssessment = findPreviousAssessmentForSite(
      newAssessment.siteId,
      newAssessment.assessmentDate,
      assessments
    );

    const site = sites.find((s) => s.id === newAssessment.siteId);
    const siteName = site ? site.siteName : newAssessment.siteId;

    const newAlerts = evaluateAssessmentAlerts(
      newAssessment,
      prevAssessment,
      siteName,
      alertThresholds
    );

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev]);

      // Automatically dispatch mock email if email enabled
      if (emailSettings.enabled) {
        newAlerts.forEach((alt) => {
          sendMockEmail({
            recipients: emailSettings.recipients,
            subject: `[Coral Alert: ${alt.severity}] ${alt.title} at ${alt.siteName}`,
            alertId: alt.id,
            siteName: alt.siteName,
            reason: alt.alertReason,
            metrics: {
              previousPct: alt.previousPercentage,
              currentPct: alt.currentPercentage,
              ppChange: alt.percentagePointChange,
            },
          });
        });
      }
    }
  };

  const deleteAssessment = (id: string) => {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
  };

  // Alert Operations
  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alt) => (alt.id === id ? { ...alt, status: 'ACKNOWLEDGED' } : alt))
    );
  };

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alt) => (alt.id === id ? { ...alt, status: 'RESOLVED' } : alt))
    );
  };

  // Settings Updates
  const updateModelSettings = (newSettings: Partial<ModelIntegrationSettings>) => {
    setModelSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateAlertThresholds = (newThresholds: Partial<AlertThresholdSettings>) => {
    setAlertThresholds((prev) => ({ ...prev, ...newThresholds }));
  };

  const updateEmailSettings = (newSettings: Partial<EmailSettings>) => {
    setEmailSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const sendMockEmail = async (payload: Omit<EmailNotificationPayload, 'sentAt'>): Promise<boolean> => {
    // Record mock dispatched email
    const fullPayload: EmailNotificationPayload = {
      ...payload,
      sentAt: new Date().toISOString(),
    };
    setSentEmails((prev) => [fullPayload, ...prev]);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        sites,
        addSite,
        deleteSite,
        assessments,
        addAssessment,
        deleteAssessment,
        alerts,
        acknowledgeAlert,
        resolveAlert,
        apiMode,
        setApiMode,
        modelSettings,
        updateModelSettings,
        backendHealth,
        refreshBackendHealth,
        alertThresholds,
        updateAlertThresholds,
        emailSettings,
        updateEmailSettings,
        sentEmails,
        sendMockEmail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
