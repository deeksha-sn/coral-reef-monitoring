import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanSearch,
  MapPin,
  Activity,
  History,
  BellRing,
  FileText,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Eye,
  Waves,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { currentUser, currentRole } = useAuth();
  const { alerts } = useApp();

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  const navItems: NavItem[] = [
    { name: 'Overview Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Image Assessment', path: '/assessment', icon: ScanSearch },
    { name: 'Geographical Monitoring', path: '/geographical', icon: MapPin },
    { name: 'Disease Analytics', path: '/analytics', icon: Activity },
    { name: 'Historical Comparison', path: '/comparison', icon: History },
    {
      name: 'Alerts & Notifications',
      path: '/alerts',
      icon: BellRing,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
    },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Dataset Management', path: '/dataset', icon: Database },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'ADMIN':
        return <ShieldCheck className="w-4 h-4 text-reef-aqua" />;
      case 'RESEARCHER':
        return <UserCheck className="w-4 h-4 text-reef-orange" />;
      case 'VIEWER':
        return <Eye className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-gradient-to-b from-reef-midnight via-reef-deep to-[#04121F] border-r border-reef-border/60 flex flex-col transition-all duration-300 ease-in-out shadow-2xl ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-reef-border/40 flex items-center justify-between relative overflow-hidden">
        {/* Subtle decorative ocean glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-reef-coralBay/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 overflow-hidden relative z-10">
          {/* Logo container: displays uploaded logo directly, slightly larger, in pure pristine fidelity */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-white/95 p-1 border border-white/40 shadow-lg shadow-reef-coralBay/25 flex items-center justify-center shrink-0 group transition-all duration-300">
            <img
              src="/assets/coral-logo.jpg"
              alt="ReefSentra Logo"
              className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Fallback icon if image fails to load */}
            <Waves className="w-7 h-7 text-reef-coralBay hidden peer-invalid:block" />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 justify-center">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight text-white flex items-center">
                  <span>Reef</span>
                  <span className="text-reef-coralBay font-extrabold">Sentra</span>
                </h1>
                <Sparkles className="w-3.5 h-3.5 text-reef-sunset animate-pulse" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 truncate leading-tight tracking-tight mt-0.5">
                Coral Reef Health &amp; Disease Monitoring
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-reef-coralBay hover:bg-reef-surface transition-colors shrink-0 relative z-10"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Official Research Paper Title Tag */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-reef-midnight/80 border border-reef-border/40 text-[10px] text-slate-300 leading-snug">
          <span className="text-reef-sunset font-bold block text-[10.5px] uppercase tracking-wider mb-0.5">
            Research Paper Title:
          </span>
          <span className="italic text-slate-200">
            Detection and Monitoring of Coral Reef Disease and Health Condition
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-reef-coralBay/20 via-reef-coralBay/10 to-transparent text-white border border-reef-coralBay/50 shadow-glow-aqua/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-reef-midnight/60 hover:border hover:border-reef-border/30'
              }`
            }
            title={collapsed ? item.name : undefined}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-gradient-to-b from-reef-aqua to-reef-teal shadow-glow-aqua" />
                )}

                <item.icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-reef-aqua' : 'text-slate-400 group-hover:text-reef-aqua'
                  }`}
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-[13.5px] tracking-tight">
                    {item.name}
                  </span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-reef-pink/20 text-reef-pink border border-reef-pink/40 animate-pulse">
                    {item.badge}
                  </span>
                )}

                {collapsed && item.badge !== undefined && (
                  <span className="absolute right-2 w-2.5 h-2.5 rounded-full bg-reef-pink animate-ping" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Demo Role Footer */}
      <div className="p-3 border-t border-reef-border/40 bg-gradient-to-t from-black/40 via-reef-deep to-transparent">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-10 h-10 rounded-xl object-cover border-2 border-reef-aqua/50 shadow-glow-aqua/30 shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser.name}
                </p>
                {getRoleIcon()}
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {currentUser.affiliation || currentUser.email}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-reef-surface text-reef-aqua border border-reef-aqua/30 font-bold uppercase tracking-wider">
                  {currentRole}
                </span>
                <span className="text-[10px] text-slate-400">Demo Role</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
