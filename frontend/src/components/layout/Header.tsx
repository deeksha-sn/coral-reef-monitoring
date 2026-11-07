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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { DemoDataBadge } from '../common/DemoDataBadge';
import { UserRole } from '../../types/user';

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
  const { currentUser, currentRole, switchRole } = useAuth();
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
    title: 'Coral Reef Health & Disease Monitoring System',
    subtitle: 'Detection and Monitoring of Coral Reef Disease and Health Condition',
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-ocean-900/95 backdrop-blur border-b border-ocean-700/70 px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Page Title & Breadcrumb */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
            <Link to="/" className="hover:text-cyan-400 transition-colors">
              Monitoring System
            </Link>
            <span>/</span>
            <span className="text-cyan-300 font-medium">{pageInfo.title}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 truncate tracking-tight">
            {pageInfo.title}
          </h2>
        </div>

        {/* Center: Search & Demo Data indicator */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reef sites, assessments, or alerts..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-ocean-950/80 border border-ocean-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <DemoDataBadge />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* API Mode Switch (MOCK vs LIVE) */}
          <div className="flex items-center rounded-lg bg-ocean-950 border border-ocean-700/80 p-0.5 text-xs">
            <button
              onClick={() => setApiMode('MOCK')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                apiMode === 'MOCK'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Runs completely standalone in-browser using realistic simulated inference."
            >
              <Radio className="w-3.5 h-3.5" />
              <span>MOCK</span>
            </button>
            <button
              onClick={() => setApiMode('LIVE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                apiMode === 'LIVE'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${
                backendHealth?.isOnline
                  ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-700/60 text-rose-300'
              }`}
              title={`FastAPI Host: ${modelSettings.fastApiBaseUrl}\n${backendHealth?.statusText || 'Checking...'}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth?.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="font-mono text-[11px]">
                {backendHealth?.isOnline ? 'FastAPI Online' : 'FastAPI Offline'}
              </span>
              <button
                onClick={refreshBackendHealth}
                className="hover:text-slate-100 p-0.5"
                title="Retry connection"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Current Date */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 px-2 py-1 bg-ocean-850/60 border border-ocean-800 rounded-lg font-mono">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentDate}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-lg bg-ocean-850 text-slate-300 hover:text-cyan-300 hover:bg-ocean-800 border border-ocean-700/70 transition-colors"
              title="Alert notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center font-mono animate-bounce">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-ocean-900 border border-ocean-700 rounded-xl shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 border-b border-ocean-800">
                  <span className="text-xs font-bold text-slate-200">
                    Active Surveillance Alerts ({activeAlerts.length})
                  </span>
                  <Link
                    to="/alerts"
                    onClick={() => setNotificationOpen(false)}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="py-2 max-h-64 overflow-y-auto space-y-2">
                  {activeAlerts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      No active alerts. All reef transects nominal.
                    </p>
                  ) : (
                    activeAlerts.map((alt) => (
                      <div
                        key={alt.id}
                        className="p-2 rounded bg-ocean-950/80 border border-ocean-800 text-xs hover:border-cyan-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{alt.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                          {alt.alertReason}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ocean-850 hover:bg-ocean-800 border border-ocean-700/80 transition-colors"
              title="Demonstration Role Switcher"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {currentRole === 'ADMIN' && (
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                )}
                {currentRole === 'RESEARCHER' && (
                  <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                )}
                {currentRole === 'VIEWER' && (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="text-slate-200">{currentRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-ocean-900 border border-ocean-700 rounded-xl shadow-2xl z-50 p-2">
                <div className="px-2 py-1.5 border-b border-ocean-800 mb-1">
                  <p className="text-[11px] font-bold text-slate-300">
                    Switch Demonstration Role
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
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
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentRole === role
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-ocean-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {role === 'ADMIN' && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
                      {role === 'RESEARCHER' && <UserCheck className="w-4 h-4 text-teal-400" />}
                      {role === 'VIEWER' && <Eye className="w-4 h-4 text-slate-400" />}
                      <span>{role}</span>
                    </div>
                    {currentRole === role && (
                      <span className="text-[10px] text-cyan-400 uppercase font-mono">
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
