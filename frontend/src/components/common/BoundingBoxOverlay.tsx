import React, { useState } from 'react';
import { CORAL_CATEGORIES } from '../../constants/categories';
import { Prediction } from '../../types/prediction';
import { Eye, EyeOff, Layers } from 'lucide-react';

interface BoundingBoxOverlayProps {
  imageUrl: string;
  predictions: Prediction[];
  altText?: string;
  className?: string;
  initialShowBoxes?: boolean;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  imageUrl,
  predictions,
  altText = 'Coral specimen transect',
  className = '',
  initialShowBoxes = true,
}) => {
  const [showBoxes, setShowBoxes] = useState<boolean>(initialShowBoxes);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-ocean-700/70 bg-ocean-950 ${className}`}>
      {/* Visual Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowBoxes(!showBoxes)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-ocean-900/90 text-cyan-300 border border-ocean-700/80 shadow-md backdrop-blur hover:bg-ocean-800 transition-colors"
          title={showBoxes ? 'Hide detection annotations' : 'Display YOLO11 bounding boxes'}
        >
          {showBoxes ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Original Image</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Show Detections ({predictions.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-full object-cover select-none"
        />

        {/* Bounding Box SVG Layer */}
        {showBoxes && (
          <div className="absolute inset-0 pointer-events-none">
            {predictions.map((pred) => {
              const meta = CORAL_CATEGORIES[pred.className] || CORAL_CATEGORIES['healthy_coral'];
              const isHovered = activeBoxId === pred.id;

              // Normalized coordinates 0-100%
              const left = Math.min(pred.boundingBox.x1, pred.boundingBox.x2);
              const top = Math.min(pred.boundingBox.y1, pred.boundingBox.y2);
              const width = Math.abs(pred.boundingBox.x2 - pred.boundingBox.x1);
              const height = Math.abs(pred.boundingBox.y2 - pred.boundingBox.y1);

              return (
                <div
                  key={pred.id}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    borderColor: meta.color,
                  }}
                  onMouseEnter={() => setActiveBoxId(pred.id)}
                  onMouseLeave={() => setActiveBoxId(null)}
                  className={`absolute pointer-events-auto border-2 rounded transition-all duration-150 cursor-pointer ${
                    isHovered
                      ? 'border-4 shadow-[0_0_15px_rgba(255,255,255,0.4)] z-30 bg-white/10'
                      : 'border-2 opacity-90'
                  }`}
                >
                  {/* Category Tag & Confidence */}
                  <div
                    style={{ backgroundColor: meta.color }}
                    className="absolute -top-6 left-0 px-2 py-0.5 rounded-t text-[11px] font-bold text-slate-950 font-mono flex items-center gap-1.5 shadow whitespace-nowrap z-30"
                  >
                    <span>{meta.displayName}</span>
                    <span className="opacity-90">
                      {Math.round(pred.confidence * 100)}%
                    </span>
                  </div>

                  {/* On-hover Detailed Coords Pill */}
                  {isHovered && (
                    <div className="absolute -bottom-7 left-0 px-2 py-0.5 rounded bg-ocean-950/95 border border-ocean-700 text-[10px] text-cyan-300 font-mono shadow-lg whitespace-nowrap z-30">
                      bbox: [{Math.round(pred.boundingBox.x1)}, {Math.round(pred.boundingBox.y1)}, {Math.round(pred.boundingBox.x2)}, {Math.round(pred.boundingBox.y2)}]
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detection Objects Footer Strip */}
      {predictions.length > 0 && (
        <div className="px-4 py-3 bg-ocean-900/90 border-t border-ocean-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Detected Specimen Count:</span>
            <span className="font-bold font-mono text-cyan-300">
              {predictions.length} objects
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {predictions.map((p) => {
              const meta = CORAL_CATEGORIES[p.className];
              return (
                <span
                  key={p.id}
                  className="px-2 py-0.5 rounded text-[11px] font-medium border font-mono flex items-center gap-1"
                  style={{
                    backgroundColor: `${meta.color}15`,
                    borderColor: `${meta.color}40`,
                    color: meta.color,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  {meta.displayName}: {Math.round(p.confidence * 100)}%
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
