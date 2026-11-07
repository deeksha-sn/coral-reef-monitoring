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
  Waves,
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
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl reef-glass shadow-2xl border border-reef-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-reef-aqua uppercase">
              Spatial Geospatial Intelligence
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Geographical Reef Monitoring Network</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Interactive GIS bathymetry of global coral transects, spatial pathogen distributions, and station conservation classifications.
          </p>
        </div>

        {permissions.canCreateSites && (
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-reef-aqua to-reef-teal hover:brightness-110 text-reef-deep font-black text-xs shadow-glow-aqua transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Monitoring Station</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl reef-glass flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-white font-bold">
          <Filter className="w-3.5 h-3.5 text-reef-aqua" />
          <span>Filters:</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-300 font-semibold">Country:</label>
          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setRegionFilter('ALL');
            }}
            className="px-3 py-1.5 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua font-medium"
          >
            <option value="ALL">All Countries ({countries.length})</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-300 font-semibold">Region:</label>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua font-medium"
          >
            <option value="ALL">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transect name or reef ecosystem..."
            className="w-full px-3.5 py-1.5 rounded-xl bg-reef-deep border border-reef-border text-white placeholder-slate-400 focus:outline-none focus:border-reef-aqua text-xs"
          />
        </div>

        <span className="text-reef-seafoam font-mono text-xs font-bold">
          Showing {filteredSites.length} of {sites.length} stations
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
            className="h-[580px] w-full rounded-3xl overflow-hidden border border-reef-border/60 shadow-2xl"
          />

          {/* Quick Site Picker Strip */}
          <div className="p-4 rounded-2xl reef-glass">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
              Select Transect Station:
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {filteredSites.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSiteId(s.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedSite?.id === s.id
                      ? 'bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep shadow-glow-aqua/40'
                      : 'bg-reef-midnight text-slate-300 hover:bg-reef-surface hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-reef-orange" />
                  <span>{s.siteName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Site Details & Survey Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {selectedSite ? (
            <div className="p-6 rounded-3xl reef-glass shadow-2xl space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-reef-border/40">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-reef-aqua px-2.5 py-0.5 rounded-md bg-reef-midnight border border-reef-border">
                      {selectedSite.id}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {selectedSite.region}, {selectedSite.country}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white">
                    {selectedSite.siteName}
                  </h2>
                  <p className="text-xs text-reef-seafoam font-semibold mt-0.5">
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
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/60 hover:text-rose-300 transition-colors"
                    title="Delete reef site"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Geographic Coordinates & Spec Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                    Latitude
                  </span>
                  <span className="text-white font-extrabold text-sm">
                    {selectedSite.latitude.toFixed(4)}°
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                    Longitude
                  </span>
                  <span className="text-white font-extrabold text-sm">
                    {selectedSite.longitude.toFixed(4)}°
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                    Transect Depth
                  </span>
                  <span className="text-white font-extrabold text-sm">
                    {selectedSite.depthMeters || 8} meters
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                    Conservation Status
                  </span>
                  <span className="text-emerald-400 font-black text-xs">
                    {selectedSite.conservationStatus || 'Protected Area'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-2xl bg-reef-midnight/60 border border-reef-border/40 text-xs text-slate-200">
                <p className="leading-relaxed">
                  {selectedSite.description || 'Longitudinal benthic survey station.'}
                </p>
              </div>

              {/* Latest Health Condition Stats */}
              <div className="space-y-3 pt-3 border-t border-reef-border/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white uppercase tracking-wider">
                    Latest Health Profile:
                  </span>
                  <span className="text-slate-300 font-mono">
                    {latestAssessment
                      ? `Survey: ${latestAssessment.assessmentDate}`
                      : 'No survey data'}
                  </span>
                </div>

                {latestAssessment ? (
                  <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                    <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
                      <span className="text-[10px] text-emerald-400 block font-bold font-sans">Healthy</span>
                      <span className="text-base font-black text-emerald-300">
                        {latestAssessment.summary.healthyCoral.percentage}%
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-950/60 border border-reef-orange/40">
                      <span className="text-[10px] text-reef-orange block font-bold font-sans">Bleached</span>
                      <span className="text-base font-black text-reef-orange">
                        {latestAssessment.summary.bleachedCoral.percentage}%
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/40">
                      <span className="text-[10px] text-purple-300 block font-bold font-sans">Band Disease</span>
                      <span className="text-base font-black text-purple-200">
                        {latestAssessment.summary.combinedBandDisease.percentage}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-reef-midnight text-slate-400 text-xs text-center">
                    No assessments recorded for this station yet.
                  </div>
                )}
              </div>

              {/* Historical Survey Timeline */}
              <div className="space-y-3 pt-3 border-t border-reef-border/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white">
                    Logged Surveys ({siteAssessments.length}):
                  </span>
                  <Link
                    to={`/comparison?siteId=${selectedSite.id}`}
                    className="text-reef-aqua hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Chronological Comparison</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {siteAssessments.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-2xl bg-reef-midnight border border-reef-border/50 flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="font-bold text-reef-aqua">{a.id}</div>
                        <div className="text-[11px] text-slate-300 font-sans font-medium">
                          {a.assessmentDate} • {a.imageCount} quadrats
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold block">
                          {a.summary.healthyCoral.percentage}% Healthy
                        </span>
                        <span className="text-purple-300 text-[11px] font-semibold">
                          {a.summary.combinedBandDisease.percentage}% Band
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl reef-glass text-center text-slate-300 text-xs">
              Select a reef monitoring site to view geographical metrics.
            </div>
          )}
        </div>
      </div>

      {/* Register Site Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-reef-midnight border border-reef-aqua/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-reef-border/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-reef-aqua" />
                <span>Register Permanent Reef Monitoring Station</span>
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSite} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    Country:
                  </label>
                  <input
                    required
                    type="text"
                    value={newSiteData.country}
                    onChange={(e) =>
                      setNewSiteData({ ...newSiteData, country: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    State / Region:
                  </label>
                  <input
                    required
                    type="text"
                    value={newSiteData.region}
                    onChange={(e) =>
                      setNewSiteData({ ...newSiteData, region: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Reef Ecosystem Name:
                </label>
                <input
                  required
                  type="text"
                  value={newSiteData.reefName}
                  onChange={(e) =>
                    setNewSiteData({ ...newSiteData, reefName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Site Name / Transect Designation:
                </label>
                <input
                  required
                  type="text"
                  value={newSiteData.siteName}
                  onChange={(e) =>
                    setNewSiteData({ ...newSiteData, siteName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Habitat Description:
                </label>
                <textarea
                  rows={2}
                  value={newSiteData.description || ''}
                  onChange={(e) =>
                    setNewSiteData({ ...newSiteData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-reef-border/40">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-reef-surface text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep font-black flex items-center gap-1.5 shadow-glow-aqua"
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
