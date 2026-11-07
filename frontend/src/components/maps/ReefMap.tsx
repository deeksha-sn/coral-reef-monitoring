import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ReefSite } from '@/types/site';
import { Assessment } from '@/types/assessment';

// Fix Leaflet default marker asset issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG icon generator for scientific reef pins with vibrant glowing colors
function createReefIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 36 : 28;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" stroke="#061B2C" stroke-width="2">
      <defs>
        <filter id="glow-${size}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.6"/>
        </filter>
      </defs>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" filter="url(#glow-${size})"/>
      <circle cx="12" cy="9" r="3.2" fill="#061B2C"/>
      <circle cx="12" cy="9" r="1.5" fill="#FFFFFF"/>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-reef-pin',
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// Controller component to smoothly pan/zoom when selected site changes
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({
  center,
  zoom = 6,
}) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

interface ReefMapProps {
  sites: ReefSite[];
  selectedSiteId?: string | null;
  onSelectSite?: (siteId: string) => void;
  assessments?: Assessment[];
  className?: string;
  zoom?: number;
  center?: [number, number];
}

export const ReefMap: React.FC<ReefMapProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  assessments = [],
  className = 'h-[500px] w-full rounded-2xl overflow-hidden border border-reef-border/60 shadow-2xl',
  zoom = 3,
  center = [10.0, 30.0],
}) => {
  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const activeCenter: [number, number] = selectedSite
    ? [selectedSite.latitude, selectedSite.longitude]
    : center;

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={activeCenter}
        zoom={selectedSite ? 6 : zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/*
          Esri World Ocean Basemap:
          Official marine bathymetry basemap designed for oceanographic research.
          Free, public, high performance, and NO "API KEY REQUIRED" watermark!
        */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a>, GEBCO, NOAA, National Geographic'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={13}
        />

        {selectedSite && <MapRecenter center={[selectedSite.latitude, selectedSite.longitude]} zoom={6} />}

        {sites.map((site) => {
          const isSelected = site.id === selectedSiteId;
          const siteAssessments = assessments.filter((a) => a.siteId === site.id);
          const latestAssessment = siteAssessments.sort(
            (a, b) =>
              new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
          )[0];

          // Determine pin color based on latest health status
          let pinColor = '#38D6D0'; // Aqua
          if (latestAssessment) {
            const bleach = latestAssessment.summary.bleachedCoral.percentage;
            const band = latestAssessment.summary.combinedBandDisease.percentage;
            if (bleach >= 25 || band >= 20) {
              pinColor = '#FF6F91'; // Coral pink alert
            } else if (bleach >= 15 || band >= 12) {
              pinColor = '#FF8066'; // Coral orange warning
            } else {
              pinColor = '#10B981'; // Green healthy
            }
          }

          return (
            <Marker
              key={site.id}
              position={[site.latitude, site.longitude]}
              icon={createReefIcon(pinColor, isSelected)}
              eventHandlers={{
                click: () => onSelectSite && onSelectSite(site.id),
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[240px]">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-reef-aqua uppercase tracking-wider block">
                      {site.region}, {site.country}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {site.siteName}
                    </h4>
                    <p className="text-[11px] text-reef-seafoam mt-0.5">
                      {site.reefName}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-slate-200 py-1.5 border-t border-b border-reef-border/40 space-y-1">
                    <div>Coordinates: {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}</div>
                    <div>Surveys: {siteAssessments.length} recorded</div>
                    {latestAssessment ? (
                      <div className="grid grid-cols-3 gap-1 pt-1 text-center font-bold">
                        <div className="text-emerald-400 bg-emerald-950/40 p-1 rounded">
                          {latestAssessment.summary.healthyCoral.percentage}% H
                        </div>
                        <div className="text-reef-orange bg-amber-950/40 p-1 rounded">
                          {latestAssessment.summary.bleachedCoral.percentage}% B
                        </div>
                        <div className="text-reef-pink bg-purple-950/40 p-1 rounded">
                          {latestAssessment.summary.combinedBandDisease.percentage}% D
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 italic">No surveys recorded yet</div>
                    )}
                  </div>

                  {onSelectSite && (
                    <button
                      onClick={() => onSelectSite(site.id)}
                      className="w-full mt-1 py-1.5 rounded-lg bg-gradient-to-r from-reef-teal to-reef-aqua text-reef-deep text-xs font-bold hover:brightness-110 transition-all shadow-sm"
                    >
                      {isSelected ? 'Currently Selected' : 'Inspect Transect Data'}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
