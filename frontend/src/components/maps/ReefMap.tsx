import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ReefSite } from '../../types/site';
import { Assessment } from '../../types/assessment';

// Fix Leaflet default marker asset issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG icon generator for scientific reef pins
function createReefIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 34 : 26;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" stroke="#08101E" stroke-width="2">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="3" fill="#08101E"/>
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
  className = 'h-[500px] w-full rounded-xl overflow-hidden border border-ocean-700/70 shadow-2xl',
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
        {/* Dark Matter CartoDB Basemap for oceanic theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
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
          let pinColor = '#22D3EE'; // default cyan
          if (latestAssessment) {
            const bleach = latestAssessment.summary.bleachedCoral.percentage;
            const band = latestAssessment.summary.combinedBandDisease.percentage;
            if (bleach >= 25 || band >= 20) {
              pinColor = '#EF4444'; // Red critical alert
            } else if (bleach >= 15 || band >= 12) {
              pinColor = '#F59E0B'; // Amber warning
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
                <div className="p-1 space-y-2 min-w-[220px]">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                      {site.region}, {site.country}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 leading-tight">
                      {site.siteName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {site.reefName}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-slate-300 py-1 border-t border-b border-ocean-700/60 space-y-0.5">
                    <div>GPS: {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}</div>
                    <div>Surveys: {siteAssessments.length} logged</div>
                    {latestAssessment ? (
                      <>
                        <div className="text-emerald-400 font-semibold">
                          Healthy: {latestAssessment.summary.healthyCoral.percentage}%
                        </div>
                        <div className="text-amber-400 font-semibold">
                          Bleached: {latestAssessment.summary.bleachedCoral.percentage}%
                        </div>
                        <div className="text-violet-400 font-semibold">
                          Band Disease: {latestAssessment.summary.combinedBandDisease.percentage}%
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-500 italic">No surveys logged yet</div>
                    )}
                  </div>

                  {onSelectSite && (
                    <button
                      onClick={() => onSelectSite(site.id)}
                      className="w-full mt-1 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
                    >
                      {isSelected ? 'Currently Selected' : 'View Site Analytics'}
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
