import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  BellRing,
  Mail,
  ShieldCheck,
  User,
  Sliders,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Radio,
  Save,
  Users,
  Eye,
  UserCheck,
  Sparkles,
  Waves,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { ROLE_PERMISSIONS } from '@/mock/users';
import { UserRole } from '@/types/user';

export const Settings: React.FC = () => {
  const {
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
  } = useApp();

  const { currentUser, currentRole, switchRole } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'integration' | 'thresholds' | 'email' | 'roles' | 'profile'
  >('integration');

  // Local form state for model integration
  const [fastApiBaseUrl, setFastApiBaseUrl] = useState<string>(
    modelSettings.fastApiBaseUrl
  );
  const [modelEndpoint, setModelEndpoint] = useState<string>(
    modelSettings.modelEndpoint
  );
  const [healthEndpoint, setHealthEndpoint] = useState<string>(
    modelSettings.healthEndpoint
  );
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(
    modelSettings.confidenceThreshold
  );

  // Local form state for thresholds
  const [bleachThreshold, setBleachThreshold] = useState<number>(
    alertThresholds.bleachingThresholdPP
  );
  const [bandThreshold, setBandThreshold] = useState<number>(
    alertThresholds.bandDiseaseThresholdPP
  );
  const [enableNewDiseaseAlert, setEnableNewDiseaseAlert] = useState<boolean>(
    alertThresholds.enableNewDiseaseAlert
  );

  // Local email form
  const [recipientInput, setRecipientInput] = useState<string>(
    emailSettings.recipients.join(', ')
  );

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showSaveSuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleSaveModelSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateModelSettings({
      fastApiBaseUrl,
      modelEndpoint,
      healthEndpoint,
      confidenceThreshold,
    });
    showSaveSuccess('Model integration configuration successfully updated.');
  };

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateAlertThresholds({
      bleachingThresholdPP: bleachThreshold,
      bandDiseaseThresholdPP: bandThreshold,
      enableNewDiseaseAlert,
    });
    showSaveSuccess('Surveillance alert thresholds successfully updated.');
  };

  const handleSaveEmailSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const list = recipientInput
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
    updateEmailSettings({ recipients: list });
    showSaveSuccess('Email notification recipient list updated.');
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl reef-glass shadow-2xl border border-reef-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-reef-aqua uppercase">
              System Architecture &amp; Configuration
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>ReefSentra Settings &amp; Integration Hub</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Configure YOLO11 endpoint parameters, research alert thresholds, user demonstration access permissions, and automated email dispatch channels.
          </p>
        </div>

        {saveSuccessMsg && (
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-reef-border/40 pb-2.5 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('integration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
            activeTab === 'integration'
              ? 'bg-gradient-to-r from-reef-coralBay to-reef-deepSea text-white shadow-glow-aqua/30'
              : 'text-slate-300 hover:text-white hover:bg-reef-midnight/60'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Model Integration &amp; API Mode</span>
        </button>

        <button
          onClick={() => setActiveTab('thresholds')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
            activeTab === 'thresholds'
              ? 'bg-gradient-to-r from-reef-coralBay to-reef-deepSea text-white shadow-glow-aqua/30'
              : 'text-slate-300 hover:text-white hover:bg-reef-midnight/60'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Surveillance Alert Thresholds</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
            activeTab === 'email'
              ? 'bg-gradient-to-r from-reef-coralBay to-reef-deepSea text-white shadow-glow-aqua/30'
              : 'text-slate-300 hover:text-white hover:bg-reef-midnight/60'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Notification Channels</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
            activeTab === 'roles'
              ? 'bg-gradient-to-r from-reef-coralBay to-reef-deepSea text-white shadow-glow-aqua/30'
              : 'text-slate-300 hover:text-white hover:bg-reef-midnight/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Role Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-reef-coralBay to-reef-deepSea text-white shadow-glow-aqua/30'
              : 'text-slate-300 hover:text-white hover:bg-reef-midnight/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Demonstration Profile</span>
        </button>
      </div>

      {/* TAB 1: MODEL INTEGRATION & API MODE */}
      {activeTab === 'integration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-7 rounded-3xl reef-glass shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-reef-border/40">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-reef-aqua" />
                <span>FastAPI &amp; YOLO11 Inference Configuration</span>
              </h3>
              <div className="flex items-center rounded-xl bg-reef-deep border border-reef-border p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setApiMode('MOCK')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    apiMode === 'MOCK'
                      ? 'bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  MOCK
                </button>
                <button
                  type="button"
                  onClick={() => setApiMode('LIVE')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    apiMode === 'LIVE'
                      ? 'bg-gradient-to-r from-reef-orange to-reef-pink text-white shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  LIVE API
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveModelSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  FastAPI Server Base URL (Environment / Endpoint):
                </label>
                <input
                  type="text"
                  value={fastApiBaseUrl}
                  onChange={(e) => setFastApiBaseUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-reef-deep border border-reef-border text-white font-mono focus:outline-none focus:border-reef-aqua"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Defaults to VITE_API_BASE_URL or http://localhost:8000
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    Prediction Route:
                  </label>
                  <input
                    type="text"
                    value={modelEndpoint}
                    onChange={(e) => setModelEndpoint(e.target.value)}
                    placeholder="/api/v1/predict"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-reef-deep border border-reef-border text-white font-mono focus:outline-none focus:border-reef-aqua"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    Health Check Route:
                  </label>
                  <input
                    type="text"
                    value={healthEndpoint}
                    onChange={(e) => setHealthEndpoint(e.target.value)}
                    placeholder="/health"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-reef-deep border border-reef-border text-white font-mono focus:outline-none focus:border-reef-aqua"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-200">
                    Confidence Detection Threshold:
                  </label>
                  <span className="text-reef-aqua font-mono font-black text-sm">
                    {Math.round(confidenceThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.95"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) =>
                    setConfidenceThreshold(parseFloat(e.target.value))
                  }
                  className="w-full accent-reef-aqua cursor-pointer"
                />
                <span className="text-[11px] text-slate-400">
                  Minimum confidence required for bounding boxes to be accepted as positive pathology detections.
                </span>
              </div>

              <div className="pt-3 border-t border-reef-border/40 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep font-black flex items-center gap-1.5 shadow-glow-aqua hover:brightness-110 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Integration Settings</span>
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 p-7 rounded-3xl reef-glass shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-reef-border/40">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-reef-aqua" />
                <span>Backend Connection Status</span>
              </h3>
              <button
                type="button"
                onClick={refreshBackendHealth}
                className="p-2 rounded-xl bg-reef-midnight border border-reef-border text-reef-aqua hover:text-white"
                title="Test health connection"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-reef-midnight border border-reef-border/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Operating Mode:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-bold ${
                      apiMode === 'MOCK'
                        ? 'bg-reef-aqua/20 text-reef-aqua border border-reef-aqua/40'
                        : 'bg-reef-orange/20 text-reef-orange border border-reef-orange/40'
                    }`}
                  >
                    {apiMode} MODE
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">FastAPI Host:</span>
                  <span className="text-white font-semibold">{fastApiBaseUrl}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Live Health Check:</span>
                  <span
                    className={`font-black flex items-center gap-1.5 ${
                      backendHealth?.isOnline
                        ? 'text-emerald-400'
                        : 'text-reef-pink'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        backendHealth?.isOnline ? 'bg-emerald-400' : 'bg-reef-pink'
                      }`}
                    />
                    {backendHealth?.isOnline ? 'ONLINE' : 'UNREACHABLE'}
                  </span>
                </div>

                {backendHealth?.statusText && (
                  <div className="pt-2 border-t border-reef-border/40 text-[11px] text-slate-300 font-sans">
                    {backendHealth.statusText}
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-reef-midnight/60 border border-reef-border/40 text-[11px] text-slate-300 font-sans leading-relaxed">
                <span className="font-bold text-white block mb-1">
                  Architecture Compliance:
                </span>
                In MOCK mode, ReefSentra operates 100% client-side with simulated inference. In LIVE API mode, inference requests are sent directly to the configured FastAPI server. If the backend is offline, the app displays genuine connection errors without falling back silently to mock data.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SURVEILLANCE ALERT THRESHOLDS */}
      {activeTab === 'thresholds' && (
        <div className="max-w-2xl p-7 rounded-3xl reef-glass shadow-2xl space-y-5">
          <div className="pb-3 border-b border-reef-border/40">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-reef-aqua" />
              <span>Research Alert Threshold Parameters</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Defines the statistical percentage-point increase criteria required to trigger active surveillance alerts.
            </p>
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-reef-midnight border border-reef-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-reef-orange">
                  Rule 1: Bleaching Increase Threshold:
                </label>
                <span className="text-reef-orange font-mono font-black text-base">
                  +{bleachThreshold} pp
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={bleachThreshold}
                onChange={(e) => setBleachThreshold(parseInt(e.target.value))}
                className="w-full accent-reef-orange cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">
                Default: 15 percentage points. Bleaching surge over previous survey triggers CRITICAL alert.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-reef-midnight border border-reef-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-purple-300">
                  Rule 2: Combined Band Disease Increase Threshold:
                </label>
                <span className="text-purple-300 font-mono font-black text-base">
                  +{bandThreshold} pp
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={bandThreshold}
                onChange={(e) => setBandThreshold(parseInt(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">
                Default: 15 percentage points. Summed Black, White, and Yellow Band disease increase.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-reef-midnight border border-reef-border/50 flex items-center justify-between">
              <div>
                <label className="font-bold text-reef-aqua block">
                  Rule 3: New Disease Category Alert
                </label>
                <span className="text-[11px] text-slate-400">
                  Triggers WARNING when a disease category previously at 0% appears for the first time.
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableNewDiseaseAlert}
                onChange={(e) => setEnableNewDiseaseAlert(e.target.checked)}
                className="w-4 h-4 accent-reef-aqua rounded cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-reef-border/40 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep font-black flex items-center gap-1.5 shadow-glow-aqua"
              >
                <Save className="w-4 h-4" />
                <span>Save Alert Thresholds</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: EMAIL NOTIFICATION CONFIGURATION */}
      {activeTab === 'email' && (
        <div className="max-w-2xl p-7 rounded-3xl reef-glass shadow-2xl space-y-5">
          <div className="pb-3 border-b border-reef-border/40">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-reef-aqua" />
              <span>Surveillance Email Recipient Configuration</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Target email addresses to be notified upon active surveillance trigger events.
            </p>
          </div>

          <form onSubmit={handleSaveEmailSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Recipient Email Addresses (Comma-Separated):
              </label>
              <textarea
                rows={3}
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="alerts@reefsentra.org, lab@university.edu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-reef-deep border border-reef-border text-white font-mono focus:outline-none focus:border-reef-aqua"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Mock SMTP Host:
                </label>
                <input
                  type="text"
                  disabled
                  value={emailSettings.smtpHost || 'smtp.reefsentra.org'}
                  className="w-full px-3.5 py-2 rounded-xl bg-reef-midnight/60 border border-reef-border text-slate-400 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  SMTP Port:
                </label>
                <input
                  type="text"
                  disabled
                  value={emailSettings.smtpPort || '587'}
                  className="w-full px-3.5 py-2 rounded-xl bg-reef-midnight/60 border border-reef-border text-slate-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-reef-border/40 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep font-black flex items-center gap-1.5 shadow-glow-aqua"
              >
                <Save className="w-4 h-4" />
                <span>Save Email Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: ROLE PERMISSIONS & ACCESS */}
      {activeTab === 'roles' && (
        <div className="p-7 rounded-3xl reef-glass shadow-2xl space-y-5">
          <div className="pb-3 border-b border-reef-border/40">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-reef-aqua" />
              <span>Demonstration Role Permissions Matrix</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Overview of capabilities across the three demonstrated roles: ADMIN, RESEARCHER, and VIEWER.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['ADMIN', 'RESEARCHER', 'VIEWER'] as UserRole[]).map((role) => {
              const perm = ROLE_PERMISSIONS[role];
              const isActive = currentRole === role;
              return (
                <div
                  key={role}
                  className={`p-5 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-reef-aqua/10 border-reef-aqua shadow-glow-aqua/30'
                      : 'bg-reef-midnight border-reef-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-white font-mono text-base">
                      {role}
                    </span>
                    {isActive ? (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-reef-aqua text-reef-deep font-mono uppercase">
                        Active Role
                      </span>
                    ) : (
                      <button
                        onClick={() => switchRole(role)}
                        className="text-xs text-reef-aqua hover:underline font-bold"
                      >
                        Switch Role
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mb-3">{perm.description}</p>
                  <div className="space-y-1.5 text-[11px] font-mono border-t border-reef-border/40 pt-2.5 text-slate-200">
                    <div className="flex justify-between">
                      <span>Create Sites:</span>
                      <span className={perm.canCreateSites ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {perm.canCreateSites ? '✓ Yes' : '✕ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upload Surveys:</span>
                      <span className={perm.canUploadAssessments ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {perm.canUploadAssessments ? '✓ Yes' : '✕ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Run Predictions:</span>
                      <span className={perm.canRunPredictions ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {perm.canRunPredictions ? '✓ Yes' : '✕ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Manage Settings:</span>
                      <span className={perm.canManageSettings ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {perm.canManageSettings ? '✓ Yes' : '✕ No'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: USER PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-xl p-7 rounded-3xl reef-glass shadow-2xl space-y-4">
          <div className="pb-3 border-b border-reef-border/40">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-reef-aqua" />
              <span>Current Demonstration Profile</span>
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-reef-aqua shadow-glow-aqua/30"
            />
            <div>
              <h4 className="text-lg font-black text-white">{currentUser.name}</h4>
              <p className="text-xs text-slate-300 font-medium">{currentUser.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-reef-aqua/20 text-reef-aqua border border-reef-aqua/40">
                  {currentUser.role}
                </span>
                <span className="text-xs text-slate-300">{currentUser.affiliation}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
