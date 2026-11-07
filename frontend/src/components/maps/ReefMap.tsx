import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Compass } from 'lucide-react';
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
  const size = isSelected ? 38 : 30;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" stroke="#162B42" stroke-width="2">
      <defs>
        <filter id="glow-${size}" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" flood-color="${color}" flood-opacity="0.8"/>
        </filter>
      </defs>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" filter="url(#glow-${size})"/>
      <circle cx="12" cy="9" r="3.2" fill="#162B42"/>
      <circle cx="12" cy="9" r="1.5" fill="#F3FAFC"/>
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
  className = 'h-[500px] w-full rounded-3xl overflow-hidden border border-reef-border/60 shadow-2xl',
  zoom = 3,
  center = [10.0, 30.0],
}) => {
  const [mapStyle, setMapStyle] = useState<'bathymetry' | 'canvas'>('bathymetry');
  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const activeCenter: [number, number] = selectedSite
    ? [selectedSite.latitude, selectedSite.longitude]
    : center;

  return (
    <div className={`relative ${className} bg-[#0c1f33]`}>
      {/* Interactive Basemap Layer Selector Pill */}
      <div className="absolute top-3.5 right-3.5 z-[1000] flex items-center gap-1.5 p-1 rounded-xl bg-reef-midnight/90 backdrop-blur-md border border-reef-border/60 shadow-lg text-[11px] font-mono">
        <button
          onClick={() => setMapStyle('bathymetry')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-semibold ${
            mapStyle === 'bathymetry'
              ? 'bg-reef-coralBay text-reef-deep font-bold shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Dark ocean bathymetry with visible depth contours & coastlines"
        >
          <Compass className="w-3 h-3" />
          <span>Bathymetric Depth</span>
        </button>
        <button
          onClick={() => setMapStyle('canvas')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-semibold ${
            mapStyle === 'canvas'
              ? 'bg-reef-coralBay text-reef-deep font-bold shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Esri World Dark Marine Canvas"
        >
          <Layers className="w-3 h-3" />
          <span>Dark Canvas</span>
        </button>
      </div>

      <MapContainer
        center={activeCenter}
        zoom={selectedSite ? 6 : zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/*
          Dark Ocean Bathymetry Basemaps:
          1. Esri World Ocean Base with oceanic invert/bathymetry filter:
             Converts pale tiles to deep marine blue (#12273D) with radiant depth contours!
          2. Esri World Dark Gray Canvas:
             Natively dark marine basemap with high-contrast coastlines and topography.
          Both are 100% free, require zero API keys, and have no watermark!
        */}
        {mapStyle === 'bathymetry' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com">Esri</a>, GEBCO, NOAA, National Geographic'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
            className="dark-ocean-tiles"
            maxZoom={13}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com">Esri</a>, DeLorme, NAVTEQ'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            className="dark-canvas-tiles"
            maxZoom={16}
          />
        )}

        {selectedSite && <MapRecenter center={[selectedSite.latitude, selectedSite.longitude]} zoom={6} />}

        {sites.map((site) => {
          const isSelected = site.id === selectedSiteId;
          const siteAssessments = assessments.filter((a) => a.siteId === site.id);
          const latestAssessment = siteAssessments.sort(
            (a, b) =>
              new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
          )[0];

          // Determine pin color based on latest health status using the 6-color system:
          // Healthy -> Coral Bay Blue (#29B8E6)
          // Bleached -> Sunset Foam (#FB8E5F)
          // High Band Pathogen -> Ocean Candy (#C94889) or Deep Sea Dive (#0A5CAB)
          let pinColor = '#29B8E6'; // Coral Bay Blue default
          if (latestAssessment) {
            const bleach = latestAssessment.summary.bleachedCoral.percentage;
            const band = latestAssessment.summary.combinedBandDisease.percentage;
            if (band >= 15) {
              pinColor = '#C94889'; // Ocean Candy alert (pathogen outbreak)
            } else if (bleach >= 20) {
              pinColor = '#FB8E5F'; // Sunset Foam warning (thermal bleaching)
            } else if (bleach >= 12 || band >= 8) {
              pinColor = '#B8688B'; // Seashell Blush moderate condition
            } else {
              pinColor = '#29B8E6'; // Coral Bay Blue healthy dominant
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
                    <span className="text-[10px] font-mono font-bold text-reef-coralBay uppercase tracking-wider block">
                      {site.region}, {site.country}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {site.siteName}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {site.reefName}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-slate-200 py-1.5 border-t border-b border-reef-border/40 space-y-1">
                    <div>Coordinates: {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}</div>
                    <div>Surveys: {siteAssessments.length} recorded</div>
                    {latestAssessment ? (
                      <div className="grid grid-cols-3 gap-1 pt-1 text-center font-bold">
                        <div className="text-reef-coralBay bg-reef-midnight/90 border border-reef-coralBay/30 p-1 rounded">
                          {latestAssessment.summary.healthyCoral.percentage}% H
                        </div>
                        <div className="text-reef-sunset bg-reef-midnight/90 border border-reef-sunset/30 p-1 rounded">
                          {latestAssessment.summary.bleachedCoral.percentage}% B
                        </div>
                        <div className="text-reef-candy bg-reef-midnight/90 border border-reef-candy/30 p-1 rounded">
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
                      className="w-full mt-1 py-1.5 rounded-lg bg-gradient-to-r from-reef-coralBay to-reef-deepSea text-white text-xs font-bold hover:brightness-110 transition-all shadow-sm cursor-pointer"
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
