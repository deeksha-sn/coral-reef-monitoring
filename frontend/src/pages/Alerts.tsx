import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Mail,
  Send,
  Filter,
  Check,
  RotateCcw,
  Clock,
  Layers,
  MapPin,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { AlertNotification, AlertSeverity, AlertStatus } from '@/types/alert';
import { formatPercentagePointDiff } from '@/utils/coralMath';

export const Alerts: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    resolveAlert,
    emailSettings,
    sendMockEmail,
    sentEmails,
    alertThresholds,
  } = useApp();
  const { permissions } = useAuth();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAlertForEmail, setSelectedAlertForEmail] =
    useState<AlertNotification | null>(null);
  const [emailSendSuccess, setEmailSendSuccess] = useState<boolean>(false);

  const filteredAlerts = alerts.filter((alt) => {
    const matchesSeverity =
      severityFilter === 'ALL' || alt.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || alt.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const acknowledgedCount = alerts.filter(
    (a) => a.status === 'ACKNOWLEDGED'
  ).length;

  const handleDispatchEmail = async () => {
    if (!selectedAlertForEmail) return;

    await sendMockEmail({
      recipients: emailSettings.recipients,
      subject: `[Coral Health Alert: ${selectedAlertForEmail.severity}] ${selectedAlertForEmail.title}`,
      alertId: selectedAlertForEmail.id,
      siteName: selectedAlertForEmail.siteName,
      reason: selectedAlertForEmail.alertReason,
      metrics: {
        previousPct: selectedAlertForEmail.previousPercentage,
        currentPct: selectedAlertForEmail.currentPercentage,
        ppChange: selectedAlertForEmail.percentagePointChange,
      },
    });

    setEmailSendSuccess(true);
    setTimeout(() => {
      setEmailSendSuccess(false);
      setSelectedAlertForEmail(null);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase">
              Automated Pathology Surveillance
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Alerts &amp; Surveillance Notifications
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time threshold evaluation triggered by phototransect surveys: Thermal bleaching surges (&gt;15 pp), Combined Band Disease outbreaks (&gt;15 pp), and novel pathogen arrivals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ocean-950 border border-ocean-700 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-300">Active Alerts:</span>
            <span className="text-rose-400 font-bold">{activeCount}</span>
          </div>
        </div>
      </div>

      {/* Rules Criteria Reference Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-3.5 rounded-xl bg-ocean-850/80 border border-amber-500/30 text-xs">
          <span className="font-bold text-amber-400 block mb-0.5">
            Rule 1: Bleaching Alert
          </span>
          <p className="text-slate-300">
            Bleached coral proportion increases by &gt;{alertThresholds.bleachingThresholdPP} percentage points compared to previous assessment of the same site.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-ocean-850/80 border border-violet-500/30 text-xs">
          <span className="font-bold text-violet-400 block mb-0.5">
            Rule 2: Combined Band Disease Alert
          </span>
          <p className="text-slate-300">
            Combined Black, White, and Yellow Band disease increases by &gt;{alertThresholds.bandDiseaseThresholdPP} pp compared to previous assessment of the same site.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-ocean-850/80 border border-cyan-500/30 text-xs">
          <span className="font-bold text-cyan-400 block mb-0.5">
            Rule 3: New Disease Category Alert
          </span>
          <p className="text-slate-300">
            A previously absent disease category (0% prior) appears in a new assessment at that site.
          </p>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="p-4 rounded-xl bg-ocean-850/80 border border-ocean-700/70 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Severity:</span>
          </div>
          {['ALL', 'CRITICAL', 'WARNING'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${
                severityFilter === sev
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-ocean-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-semibold">Status:</span>
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-ocean-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">
              No Alerts Matching Current Filter
            </h3>
            <p className="text-xs text-slate-400">
              All monitored reef transects are currently within acceptable biological variance.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-5 rounded-2xl border transition-all shadow-lg ${
                alt.severity === 'CRITICAL'
                  ? 'bg-ocean-850/90 border-rose-500/40 hover:border-rose-500/70'
                  : 'bg-ocean-850/90 border-amber-500/40 hover:border-amber-500/70'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {alt.severity}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-ocean-950 text-slate-300 border border-ocean-800">
                      {alt.ruleType}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        alt.status === 'ACTIVE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-700'
                          : alt.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      }`}
                    >
                      {alt.status}
                    </span>

                    <span className="text-xs text-slate-500 font-mono ml-auto">
                      Alert ID: {alt.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        alt.severity === 'CRITICAL'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    />
                    <span>{alt.title}</span>
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alt.alertReason}
                  </p>

                  {/* Quantitative Metrics Box */}
                  <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-800 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{alt.siteName}</span>
                      <span className="text-slate-500">({alt.siteId})</span>
                    </div>

                    <div>
                      <span className="text-slate-500">Survey Date: </span>
                      <span>{alt.assessmentDate}</span>
                    </div>

                    {alt.previousPercentage !== null && (
                      <div>
                        <span className="text-slate-500">Previous Prevalence: </span>
                        <span>{alt.previousPercentage}%</span>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-500">Current Prevalence: </span>
                      <span className="text-slate-100 font-bold">
                        {alt.currentPercentage}%
                      </span>
                    </div>

                    {alt.percentagePointChange !== null && (
                      <div>
                        <span className="text-slate-500">Surge Delta: </span>
                        <span className="text-rose-400 font-bold">
                          {formatPercentagePointDiff(alt.percentagePointChange)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex md:flex-col items-center gap-2 shrink-0">
                  {alt.status === 'ACTIVE' && permissions.canAcknowledgeAlerts && (
                    <button
                      onClick={() => acknowledgeAlert(alt.id)}
                      className="w-full px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {alt.status !== 'RESOLVED' && permissions.canAcknowledgeAlerts && (
                    <button
                      onClick={() => resolveAlert(alt.id)}
                      className="w-full px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAlertForEmail(alt)}
                    className="w-full px-3 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-750 text-cyan-300 border border-ocean-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                    title="Simulate email alert notification to researchers"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Mock Email</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispatched Mock Email Audit Log */}
      {sentEmails.length > 0 && (
        <div className="p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-ocean-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Simulated Email Notification Dispatch Log ({sentEmails.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Ready for FastAPI SMTP backend integration
            </span>
          </div>

          <div className="space-y-2">
            {sentEmails.map((em, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-ocean-950 border border-ocean-800 text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div>
                  <span className="text-cyan-400 font-bold block">{em.subject}</span>
                  <span className="text-slate-400 text-[11px]">
                    Recipients: {em.recipients.join(', ')}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 shrink-0">
                  {new Date(em.sentAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mock Email Dispatch Dialog */}
      {selectedAlertForEmail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-ocean-900 border border-ocean-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ocean-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Simulate Automated Email Notification</span>
              </h3>
              <button
                onClick={() => setSelectedAlertForEmail(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Recipient List (Configured in Settings):
                </label>
                <div className="p-2 rounded-lg bg-ocean-950 border border-ocean-800 text-slate-300 font-mono">
                  {emailSettings.recipients.join(', ')}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Subject Line:
                </label>
                <div className="p-2 rounded-lg bg-ocean-950 border border-ocean-800 text-cyan-300 font-mono font-bold">
                  [Coral Alert: {selectedAlertForEmail.severity}] {selectedAlertForEmail.title} at {selectedAlertForEmail.siteName}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Formatted Email Payload Preview:
                </label>
                <div className="p-3 rounded-lg bg-ocean-950 border border-ocean-800 text-slate-300 font-mono text-[11px] space-y-2">
                  <p>
                    <strong>ATTENTION RESEARCH TEAM:</strong>
                  </p>
                  <p>{selectedAlertForEmail.alertReason}</p>
                  <div className="pt-2 border-t border-ocean-800">
                    <div>Station: {selectedAlertForEmail.siteName} ({selectedAlertForEmail.siteId})</div>
                    <div>Survey Date: {selectedAlertForEmail.assessmentDate}</div>
                    <div>Surge: {formatPercentagePointDiff(selectedAlertForEmail.percentagePointChange)}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-[11px] text-cyan-300">
                <strong>Prototype Notice: </strong>
                Emails are dispatched via mock client simulator. The real SMTP or SendGrid daemon will be wired by the FastAPI backend team during integration.
              </div>

              {emailSendSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-center font-bold">
                  ✓ Mock Email Successfully Dispatched and Logged!
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-ocean-800">
                  <button
                    onClick={() => setSelectedAlertForEmail(null)}
                    className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispatchEmail}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Mock Notification</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
