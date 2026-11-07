import React, { useState } from 'react';
import { CORAL_CATEGORIES } from '@/constants/categories';
import { Prediction } from '@/types/prediction';
import { Eye, EyeOff, Layers, Sparkles } from 'lucide-react';

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
    <div className={`relative overflow-hidden rounded-2xl border border-reef-border/60 bg-reef-midnight shadow-xl ${className}`}>
      {/* Visual Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowBoxes(!showBoxes)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-reef-midnight/90 text-reef-aqua border border-reef-aqua/40 shadow-glow-aqua/20 backdrop-blur hover:bg-reef-surface transition-all"
          title={showBoxes ? 'Hide detection annotations' : 'Display YOLO11 bounding boxes'}
        >
          {showBoxes ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-reef-orange" />
              <span>Show Original</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-reef-aqua" />
              <span>Show Detections ({predictions.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
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
                  className={`absolute pointer-events-auto rounded transition-all duration-150 cursor-pointer ${
                    isHovered
                      ? 'border-4 shadow-[0_0_20px_rgba(56,214,208,0.7)] z-30 bg-white/15'
                      : 'border-2 opacity-95 shadow-md'
                  }`}
                >
                  {/* Category Tag & Confidence Pill */}
                  <div
                    style={{ backgroundColor: meta.color }}
                    className="absolute -top-6 left-0 px-2 py-0.5 rounded-t-md text-[10.5px] font-black text-slate-950 font-mono flex items-center gap-1.5 shadow-lg whitespace-nowrap z-30"
                  >
                    <span>{meta.displayName}</span>
                    <span className="opacity-90 font-bold">
                      {Math.round(pred.confidence * 100)}%
                    </span>
                  </div>

                  {/* On-hover Detailed Coords Pill */}
                  {isHovered && (
                    <div className="absolute -bottom-7 left-0 px-2 py-0.5 rounded-md bg-reef-midnight/95 border border-reef-aqua/60 text-[10px] text-reef-aqua font-mono shadow-2xl whitespace-nowrap z-30">
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
        <div className="px-4 py-3 bg-gradient-to-r from-reef-midnight via-reef-surface to-reef-midnight border-t border-reef-border/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Layers className="w-4 h-4 text-reef-aqua" />
            <span className="font-semibold">Detected Specimen Count:</span>
            <span className="font-bold font-mono text-reef-aqua">
              {predictions.length} objects
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {predictions.map((p) => {
              const meta = CORAL_CATEGORIES[p.className];
              return (
                <span
                  key={p.id}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border font-mono flex items-center gap-1.5 shadow-sm"
                  style={{
                    backgroundColor: `${meta.color}20`,
                    borderColor: `${meta.color}50`,
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
