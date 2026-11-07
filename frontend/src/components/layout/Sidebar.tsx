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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

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
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'RESEARCHER':
        return <UserCheck className="w-4 h-4 text-teal-400" />;
      case 'VIEWER':
        return <Eye className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-ocean-900 border-r border-ocean-700/70 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-ocean-700/70 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-glow-cyan shrink-0">
            <Waves className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
                Marine AI System
              </span>
              <h1 className="text-sm font-extrabold text-slate-100 truncate leading-tight">
                Coral Reef Health &amp; Disease
              </h1>
              <span className="text-[10px] text-slate-400 truncate">
                Monitoring System
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-ocean-800 transition-colors shrink-0"
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
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-ocean-950/80 border border-ocean-800 text-[10.5px] text-slate-400 leading-snug">
          <span className="text-cyan-400 font-semibold block mb-0.5">
            Research Paper:
          </span>
          Detection and Monitoring of Coral Reef Disease and Health Condition
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-800/60'
              }`
            }
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
            {!collapsed && (
              <span className="truncate flex-1 text-[13.5px]">{item.name}</span>
            )}
            {!collapsed && item.badge !== undefined && (
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                {item.badge}
              </span>
            )}
            {collapsed && item.badge !== undefined && (
              <span className="absolute right-2 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Demo Role Footer */}
      <div className="p-3 border-t border-ocean-700/70 bg-ocean-950/60">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-cyan-500/40 shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {currentUser.name}
                </p>
                {getRoleIcon()}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {currentUser.affiliation || currentUser.email}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ocean-800 text-cyan-400 border border-ocean-700 font-semibold">
                  {currentRole}
                </span>
                <span className="text-[10px] text-slate-500">Demo Role</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
