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
  Waves,
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

  const handleDispatchEmail = async () => {
    if (!selectedAlertForEmail) return;

    await sendMockEmail({
      recipients: emailSettings.recipients,
      subject: `[ReefSentra Alert: ${selectedAlertForEmail.severity}] ${selectedAlertForEmail.title}`,
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
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl reef-glass shadow-2xl border border-reef-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-reef-pink uppercase">
              Automated Pathology Surveillance
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Surveillance Alerts &amp; Notifications</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time threshold evaluation triggered by phototransect surveys: Thermal bleaching surges (&gt;15 pp), Combined Band Disease outbreaks (&gt;15 pp), and novel pathogen arrivals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-reef-midnight border border-reef-pink/50 text-xs font-mono shadow-glow-pink/20">
            <span className="w-2.5 h-2.5 rounded-full bg-reef-pink animate-pulse" />
            <span className="text-slate-200 font-semibold">Active Alerts:</span>
            <span className="text-reef-pink font-black text-sm">{activeCount}</span>
          </div>
        </div>
      </div>

      {/* Rules Criteria Reference Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl reef-glass border border-reef-sunset/40 text-xs">
          <span className="font-extrabold text-reef-sunset block mb-1 text-sm">
            Rule 1: Bleaching Alert
          </span>
          <p className="text-slate-300 leading-relaxed">
            Bleached coral proportion increases by &gt;{alertThresholds.bleachingThresholdPP} percentage points compared to previous assessment of the same site.
          </p>
        </div>

        <div className="p-4 rounded-2xl reef-glass border border-reef-candy/40 text-xs">
          <span className="font-extrabold text-reef-candy block mb-1 text-sm">
            Rule 2: Combined Band Disease Alert
          </span>
          <p className="text-slate-300 leading-relaxed">
            Combined Black, White, and Yellow Band disease increases by &gt;{alertThresholds.bandDiseaseThresholdPP} pp compared to previous assessment of the same site.
          </p>
        </div>

        <div className="p-4 rounded-2xl reef-glass border border-reef-coralBay/40 text-xs">
          <span className="font-extrabold text-reef-coralBay block mb-1 text-sm">
            Rule 3: New Disease Category Alert
          </span>
          <p className="text-slate-300 leading-relaxed">
            A previously absent disease category (0% prior) appears in a new assessment at that site.
          </p>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="p-4 rounded-2xl reef-glass flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Filter className="w-3.5 h-3.5 text-reef-aqua" />
            <span>Severity:</span>
          </div>
          {['ALL', 'CRITICAL', 'WARNING'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl font-mono font-bold transition-all ${
                severityFilter === sev
                  ? 'bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep shadow-glow-aqua/30'
                  : 'bg-reef-midnight text-slate-300 hover:text-white hover:bg-reef-surface'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white font-bold">Status:</span>
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-mono font-bold transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-reef-seafoam to-reef-aqua text-reef-deep shadow-glow-aqua/30'
                  : 'bg-reef-midnight text-slate-300 hover:text-white hover:bg-reef-surface'
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
          <div className="p-12 rounded-3xl reef-glass text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">
              No Alerts Matching Current Filter
            </h3>
            <p className="text-xs text-slate-300">
              All monitored reef transects are currently within acceptable biological variance.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-6 rounded-3xl border transition-all shadow-xl ${
                alt.severity === 'CRITICAL'
                  ? 'reef-glass border-reef-pink/50 hover:border-reef-pink'
                  : 'reef-glass border-reef-orange/50 hover:border-reef-orange'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-black border ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-reef-pink/20 text-reef-pink border-reef-pink/50 shadow-glow-pink/30'
                          : 'bg-amber-500/20 text-reef-orange border-reef-orange/50'
                      }`}
                    >
                      {alt.severity}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-reef-midnight text-slate-200 border border-reef-border/60">
                      {alt.ruleType}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black ${
                        alt.status === 'ACTIVE'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/60'
                          : alt.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60'
                      }`}
                    >
                      {alt.status}
                    </span>

                    <span className="text-xs text-slate-400 font-mono ml-auto">
                      Alert ID: {alt.id}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        alt.severity === 'CRITICAL'
                          ? 'text-reef-pink'
                          : 'text-reef-orange'
                      }`}
                    />
                    <span>{alt.title}</span>
                  </h3>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    {alt.alertReason}
                  </p>

                  {/* Quantitative Metrics Box */}
                  <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-200">
                    <div className="flex items-center gap-1.5 font-sans font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-reef-aqua" />
                      <span>{alt.siteName}</span>
                      <span className="text-slate-400">({alt.siteId})</span>
                    </div>

                    <div>
                      <span className="text-slate-400">Survey Date: </span>
                      <span className="text-white font-bold">{alt.assessmentDate}</span>
                    </div>

                    {alt.previousPercentage !== null && (
                      <div>
                        <span className="text-slate-400">Prior Prevalence: </span>
                        <span>{alt.previousPercentage}%</span>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400">Current Prevalence: </span>
                      <span className="text-white font-extrabold">
                        {alt.currentPercentage}%
                      </span>
                    </div>

                    {alt.percentagePointChange !== null && (
                      <div>
                        <span className="text-slate-400">Surge Delta: </span>
                        <span className="text-reef-pink font-black">
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
                      className="w-full px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {alt.status !== 'RESOLVED' && permissions.canAcknowledgeAlerts && (
                    <button
                      onClick={() => resolveAlert(alt.id)}
                      className="w-full px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAlertForEmail(alt)}
                    className="w-full px-3.5 py-2 rounded-xl bg-reef-surface hover:bg-reef-surface/90 text-reef-aqua border border-reef-aqua/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    title="Simulate email alert notification to researchers"
                  >
                    <Mail className="w-3.5 h-3.5 text-reef-orange" />
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
        <div className="p-6 rounded-3xl reef-glass shadow-lg space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-reef-border/40">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-reef-aqua" />
              <span>Simulated Email Notification Dispatch Log ({sentEmails.length})</span>
            </h3>
            <span className="text-[11px] text-reef-seafoam font-mono font-semibold">
              Ready for FastAPI SMTP backend integration
            </span>
          </div>

          <div className="space-y-2">
            {sentEmails.map((em, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50 text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div>
                  <span className="text-reef-aqua font-bold block">{em.subject}</span>
                  <span className="text-slate-300 text-[11px]">
                    Recipients: {em.recipients.join(', ')}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  {new Date(em.sentAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mock Email Dispatch Dialog */}
      {selectedAlertForEmail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-reef-midnight border border-reef-aqua/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-reef-border/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-reef-aqua" />
                <span>Simulate Automated Email Notification</span>
              </h3>
              <button
                onClick={() => setSelectedAlertForEmail(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">
                  Recipient List (Configured in Settings):
                </label>
                <div className="p-2.5 rounded-xl bg-reef-deep border border-reef-border text-slate-200 font-mono">
                  {emailSettings.recipients.join(', ')}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">
                  Subject Line:
                </label>
                <div className="p-2.5 rounded-xl bg-reef-deep border border-reef-border text-reef-aqua font-mono font-bold">
                  [ReefSentra Alert: {selectedAlertForEmail.severity}] {selectedAlertForEmail.title} at {selectedAlertForEmail.siteName}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">
                  Formatted Email Payload Preview:
                </label>
                <div className="p-3.5 rounded-2xl bg-reef-deep border border-reef-border text-slate-200 font-mono text-[11px] space-y-2">
                  <p>
                    <strong className="text-reef-orange">ATTENTION RESEARCH TEAM:</strong>
                  </p>
                  <p>{selectedAlertForEmail.alertReason}</p>
                  <div className="pt-2 border-t border-reef-border/40 text-slate-300">
                    <div>Station: {selectedAlertForEmail.siteName} ({selectedAlertForEmail.siteId})</div>
                    <div>Survey Date: {selectedAlertForEmail.assessmentDate}</div>
                    <div>Surge: {formatPercentagePointDiff(selectedAlertForEmail.percentagePointChange)}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-reef-surface/70 border border-reef-aqua/30 text-[11px] text-slate-300">
                <strong className="text-reef-aqua">Prototype Notice: </strong>
                Emails are dispatched via mock client simulator. The real SMTP or SendGrid daemon will be wired by the FastAPI backend team during integration.
              </div>

              {emailSendSuccess ? (
                <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-center font-bold">
                  ✓ Mock Email Successfully Dispatched and Logged!
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-reef-border/40">
                  <button
                    onClick={() => setSelectedAlertForEmail(null)}
                    className="px-4 py-2 rounded-xl bg-reef-surface text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispatchEmail}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep font-black flex items-center gap-1.5 shadow-glow-aqua"
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
