import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Bell,
  Calendar,
  ChevronDown,
  Radio,
  Search,
  Server,
  ShieldCheck,
  UserCheck,
  Eye,
  AlertTriangle,
  RefreshCw,
  Waves,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { UserRole } from '@/types/user';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Overview Dashboard',
    subtitle: 'Global benthic reef monitoring & real-time health indicators',
  },
  '/assessment': {
    title: 'Image Assessment',
    subtitle: 'Upload phototransects and run YOLO11 coral pathology inference',
  },
  '/geographical': {
    title: 'Geographical Monitoring',
    subtitle: 'Spatial distribution of marine monitoring transects & risk zones',
  },
  '/analytics': {
    title: 'Disease Analytics',
    subtitle: 'Six-category pathology metrics & proportional prevalence trends',
  },
  '/comparison': {
    title: 'Historical Comparison',
    subtitle: 'Chronological assessment comparison & percentage point trajectory',
  },
  '/alerts': {
    title: 'Alerts & Notifications',
    subtitle: 'Pathogen emergence, bleaching escalation, & automated surveillance',
  },
  '/reports': {
    title: 'Reports & Export',
    subtitle: 'Generate and export scientific research reports in PDF format',
  },
  '/dataset': {
    title: 'Dataset Management',
    subtitle: 'Training, validation, and benchmarking reference image repository',
  },
  '/settings': {
    title: 'System Settings',
    subtitle: 'Thresholds, model integration configuration, & user permissions',
  },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const { currentRole, switchRole } = useAuth();
  const {
    alerts,
    apiMode,
    setApiMode,
    backendHealth,
    refreshBackendHealth,
    modelSettings,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState<boolean>(false);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const pageInfo = PAGE_TITLES[location.pathname] || {
    title: 'ReefSentra Dashboard',
    subtitle: 'Detection and Monitoring of Coral Reef Disease and Health Condition',
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-reef-midnight/90 backdrop-blur-md border-b border-reef-border/40 px-6 py-3.5 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Page Title & Breadcrumb */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-300 mb-0.5">
            <Link to="/" className="hover:text-reef-aqua transition-colors flex items-center gap-1 font-medium">
              <Waves className="w-3.5 h-3.5 text-reef-aqua" />
              <span>ReefSentra</span>
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-reef-seafoam font-semibold">{pageInfo.title}</span>
          </div>
          <h2 className="text-xl font-extrabold text-white truncate tracking-tight">
            {pageInfo.title}
          </h2>
        </div>

        {/* Center: Search & Demo Data indicator */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reef sites, transects, or pathogen alerts..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-reef-deep/80 border border-reef-border/60 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-reef-aqua focus:ring-1 focus:ring-reef-aqua/40 transition-all shadow-inner"
            />
          </div>
          <DemoDataBadge />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* API Mode Switch (MOCK vs LIVE) */}
          <div className="flex items-center rounded-xl bg-reef-deep border border-reef-border/60 p-1 text-xs shadow-inner">
            <button
              onClick={() => setApiMode('MOCK')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-semibold ${
                apiMode === 'MOCK'
                  ? 'bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep font-bold shadow-glow-aqua/40'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Runs completely standalone in-browser using realistic simulated inference."
            >
              <Radio className="w-3.5 h-3.5" />
              <span>MOCK</span>
            </button>
            <button
              onClick={() => setApiMode('LIVE')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-semibold ${
                apiMode === 'LIVE'
                  ? 'bg-gradient-to-r from-reef-orange to-reef-pink text-white font-bold shadow-glow-coral/40'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Attempts direct HTTP connection to the FastAPI YOLO11 inference backend."
            >
              <Server className="w-3.5 h-3.5" />
              <span>LIVE API</span>
            </button>
          </div>

          {/* Live Status indicator when in LIVE mode */}
          {apiMode === 'LIVE' && (
            <div
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border ${
                backendHealth?.isOnline
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
              }`}
              title={`FastAPI Host: ${modelSettings.fastApiBaseUrl}\n${backendHealth?.statusText || 'Checking...'}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth?.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="font-mono text-[11px] font-medium">
                {backendHealth?.isOnline ? 'FastAPI Online' : 'FastAPI Offline'}
              </span>
              <button
                onClick={refreshBackendHealth}
                className="hover:text-white p-0.5"
                title="Retry connection"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Current Date */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-300 px-3 py-1.5 bg-reef-surface/70 border border-reef-border/40 rounded-xl font-mono shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-reef-aqua" />
            <span>{currentDate}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2.5 rounded-xl bg-reef-surface/70 text-slate-200 hover:text-reef-aqua hover:bg-reef-surface border border-reef-border/50 transition-colors shadow-sm"
              title="Alert notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-reef-pink text-[10px] font-bold text-white flex items-center justify-center font-mono shadow-glow-pink animate-bounce">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-reef-midnight border border-reef-border rounded-2xl shadow-2xl z-50 p-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-reef-border/40">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-reef-orange" />
                    <span>Active Surveillance Alerts ({activeAlerts.length})</span>
                  </span>
                  <Link
                    to="/alerts"
                    onClick={() => setNotificationOpen(false)}
                    className="text-[11px] text-reef-aqua hover:underline font-semibold"
                  >
                    View All
                  </Link>
                </div>
                <div className="py-2 max-h-64 overflow-y-auto space-y-2">
                  {activeAlerts.length === 0 ? (
                    <p className="text-xs text-slate-300 py-4 text-center">
                      No active alerts. All reef transects nominal.
                    </p>
                  ) : (
                    activeAlerts.map((alt) => (
                      <div
                        key={alt.id}
                        className="p-2.5 rounded-xl bg-reef-deep/90 border border-reef-border/50 text-xs hover:border-reef-aqua/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-reef-pink font-semibold text-[11px]">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{alt.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                          {alt.alertReason}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">
                          {alt.siteName} • {alt.assessmentDate}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-reef-surface/70 hover:bg-reef-surface border border-reef-border/60 transition-colors shadow-sm"
              title="Demonstration Role Switcher"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {currentRole === 'ADMIN' && (
                  <ShieldCheck className="w-4 h-4 text-reef-aqua" />
                )}
                {currentRole === 'RESEARCHER' && (
                  <UserCheck className="w-4 h-4 text-reef-orange" />
                )}
                {currentRole === 'VIEWER' && (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-white">{currentRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-reef-midnight border border-reef-border rounded-2xl shadow-2xl z-50 p-2">
                <div className="px-3 py-2 border-b border-reef-border/40 mb-1">
                  <p className="text-[11px] font-bold text-white">
                    Switch Demonstration Role
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Simulates frontend user access levels.
                  </p>
                </div>
                {(['ADMIN', 'RESEARCHER', 'VIEWER'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentRole === role
                        ? 'bg-reef-aqua/20 text-reef-aqua font-bold border border-reef-aqua/40'
                        : 'text-slate-300 hover:bg-reef-surface/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {role === 'ADMIN' && <ShieldCheck className="w-4 h-4 text-reef-aqua" />}
                      {role === 'RESEARCHER' && <UserCheck className="w-4 h-4 text-reef-orange" />}
                      {role === 'VIEWER' && <Eye className="w-4 h-4 text-slate-400" />}
                      <span>{role}</span>
                    </div>
                    {currentRole === role && (
                      <span className="text-[10px] text-reef-aqua uppercase font-mono font-bold">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
