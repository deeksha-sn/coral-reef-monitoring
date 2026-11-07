import React, { useState } from 'react';
import {
  MapPin,
  Filter,
  Plus,
  Compass,
  Layers,
  Calendar,
  Activity,
  ArrowRight,
  ShieldCheck,
  Save,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { ReefMap } from '@/components/maps/ReefMap';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { ReefSite } from '@/types/site';
import { Link } from 'react-router-dom';

export const GeographicalMonitoring: React.FC = () => {
  const { sites, assessments, addSite, deleteSite } = useApp();
  const { permissions } = useAuth();

  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  // New site form
  const [newSiteData, setNewSiteData] = useState<Omit<ReefSite, 'id' | 'createdAt'>>({
    country: 'Australia',
    region: 'Coral Sea Marine Park',
    reefName: 'Flinders Reef Complex',
    siteName: 'Cod Hole Protected Transect',
    latitude: -14.6732,
    longitude: 145.6583,
    description: 'Pristine oceanic reef featuring mature Porites bommies and high biodiversity.',
    depthMeters: 10,
    conservationStatus: 'Marine Protected Area',
  });

  // Filter sites
  const countries = Array.from(new Set(sites.map((s) => s.country)));
  const regions = Array.from(
    new Set(
      sites
        .filter((s) => countryFilter === 'ALL' || s.country === countryFilter)
        .map((s) => s.region)
    )
  );

  const filteredSites = sites.filter((site) => {
    const matchesCountry = countryFilter === 'ALL' || site.country === countryFilter;
    const matchesRegion = regionFilter === 'ALL' || site.region === regionFilter;
    const matchesSearch =
      searchQuery === '' ||
      site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.reefName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesRegion && matchesSearch;
  });

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || filteredSites[0] || sites[0];

  const siteAssessments = assessments
    .filter((a) => a.siteId === selectedSite?.id)
    .sort(
      (a, b) =>
        new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    );

  const latestAssessment = siteAssessments[0];

  const handleRegisterSite = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addSite(newSiteData);
    setSelectedSiteId(created.id);
    setShowRegisterModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Spatial Geospatial Intelligence
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Geographical Reef Monitoring Network
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Interactive GIS map of global coral transects, spatial pathogen distributions, and station conservation classifications.
          </p>
        </div>

        {permissions.canCreateSites && (
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Reef Site</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-ocean-850/80 border border-ocean-700/70 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filters:</span>
        </div>

        {/* Country Filter */}
        <div className="flex items-center gap-2">
          <label className="text-slate-400">Country:</label>
          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setRegionFilter('ALL');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Countries ({countries.length})</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2">
          <label className="text-slate-400">Region:</label>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transect name or reef ecosystem..."
            className="w-full px-3 py-1.5 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          Showing {filteredSites.length} of {sites.length} sites
        </span>
      </div>

      {/* Main Geographical Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <ReefMap
            sites={filteredSites}
            selectedSiteId={selectedSite?.id}
            onSelectSite={(id) => setSelectedSiteId(id)}
            assessments={assessments}
            className="h-[560px] w-full rounded-2xl overflow-hidden border border-ocean-700 shadow-2xl"
          />

          {/* Quick Site Picker Strip */}
          <div className="p-3 rounded-xl bg-ocean-850/90 border border-ocean-700/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Transect Station:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filteredSites.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSiteId(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedSite?.id === s.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-ocean-900 text-slate-300 hover:bg-ocean-800'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{s.siteName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Site Details & Longitudinal Survey Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {selectedSite ? (
            <div className="p-6 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-2xl space-y-5">
              {/* Site Header */}
              <div className="flex items-start justify-between pb-4 border-b border-ocean-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-ocean-950 border border-ocean-800">
                      {selectedSite.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedSite.region}, {selectedSite.country}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100">
                    {selectedSite.siteName}
                  </h2>
                  <p className="text-xs text-teal-400 font-medium mt-0.5">
                    {selectedSite.reefName}
                  </p>
                </div>

                {permissions.canDeleteSites && sites.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete monitoring station ${selectedSite.siteName}?`)) {
                        deleteSite(selectedSite.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
                    title="Delete reef site"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Geographic Coordinates & Spec Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Latitude
                  </span>
                  <span className="text-slate-100 font-bold text-sm">
                    {selectedSite.latitude.toFixed(4)}°
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Longitude
                  </span>
                  <span className="text-slate-100 font-bold text-sm">
                    {selectedSite.longitude.toFixed(4)}°
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Transect Depth
                  </span>
                  <span className="text-slate-100 font-bold text-sm">
                    {selectedSite.depthMeters || 8} meters
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Conservation Status
                  </span>
                  <span className="text-emerald-400 font-bold text-xs">
                    {selectedSite.conservationStatus || 'Protected'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-xl bg-ocean-950/50 border border-ocean-800/80 text-xs text-slate-300">
                <p className="leading-relaxed">
                  {selectedSite.description || 'Longitudinal benthic survey station.'}
                </p>
              </div>

              {/* Latest Health Condition Stats */}
              <div className="space-y-3 pt-3 border-t border-ocean-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 uppercase tracking-wider">
                    Latest Health Profile:
                  </span>
                  <span className="text-slate-400 font-mono">
                    {latestAssessment
                      ? `Survey: ${latestAssessment.assessmentDate}`
                      : 'No survey data'}
                  </span>
                </div>

                {latestAssessment ? (
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-700/40">
                      <span className="text-[10px] text-emerald-400 block">Healthy</span>
                      <span className="text-sm font-bold text-emerald-300">
                        {latestAssessment.summary.healthyCoral.percentage}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/40">
                      <span className="text-[10px] text-amber-400 block">Bleached</span>
                      <span className="text-sm font-bold text-amber-300">
                        {latestAssessment.summary.bleachedCoral.percentage}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-violet-950/40 border border-violet-700/40">
                      <span className="text-[10px] text-violet-400 block">Band Disease</span>
                      <span className="text-sm font-bold text-violet-300">
                        {latestAssessment.summary.combinedBandDisease.percentage}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-ocean-950 text-slate-400 text-xs text-center">
                    No assessments have been recorded for this station yet.
                  </div>
                )}
              </div>

              {/* Historical Survey Timeline for this site */}
              <div className="space-y-3 pt-3 border-t border-ocean-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    Logged Surveys ({siteAssessments.length}):
                  </span>
                  <Link
                    to={`/comparison?siteId=${selectedSite.id}`}
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Chronological Comparison</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {siteAssessments.map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 rounded-xl bg-ocean-950/90 border border-ocean-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="font-bold text-cyan-300">{a.id}</div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {a.assessmentDate} • {a.imageCount} quadrats
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold block">
                          {a.summary.healthyCoral.percentage}% Healthy
                        </span>
                        <span className="text-violet-400 text-[11px]">
                          {a.summary.combinedBandDisease.percentage}% Band
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-ocean-850/80 border border-ocean-700 text-center text-slate-400 text-xs">
              Select a reef monitoring site to view geographical metrics.
            </div>
          )}
        </div>
      </div>

      {/* Register Site Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-ocean-900 border border-ocean-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ocean-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Register Permanent Reef Monitoring Station</span>
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSite} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Country:
                  </label>
                  <input
                    required
                    type="text"
                    value={newSiteData.country}
                    onChange={(e) =>
                      setNewSiteData({ ...newSiteData, country: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    State / Region:
                  </label>
                  <input
                    required
                    type="text"
                    value={newSiteData.region}
                    onChange={(e) =>
                      setNewSiteData({ ...newSiteData, region: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Reef Ecosystem Name:
                </label>
                <input
                  required
                  type="text"
                  value={newSiteData.reefName}
                  onChange={(e) =>
                    setNewSiteData({ ...newSiteData, reefName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Site Name / Transect Designation:
                </label>
                <input
                  required
                  type="text"
                  value={newSiteData.siteName}
                  onChange={(e) =>
                    setNewSiteData({ ...newSiteData, siteName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Latitude (-90 to +90):
                  </label>
                  <input
                    required
                    step="0.0001"
                    type="number"
                    value={newSiteData.latitude}
                    onChange={(e) =>
                      setNewSiteData({
                        ...newSiteData,
                        latitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Longitude (-180 to +180):
                  </label>
                  <input
                    required
                    step="0.0001"
                    type="number"
                    value={newSiteData.longitude}
                    onChange={(e) =>
                      setNewSiteData({
                        ...newSiteData,
                        longitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Habitat Description:
                </label>
                <textarea
                  rows={2}
                  value={newSiteData.description || ''}
                  onChange={(e) =>
                    setNewSiteData({ ...newSiteData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 hover:bg-ocean-750 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Register Station</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
