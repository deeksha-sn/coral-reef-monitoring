import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Layers,
  Image as ImageIcon,
  Tag,
  CheckCircle2,
  Calendar,
  Camera,
  ExternalLink,
  Code,
  Info,
  Sparkles,
} from 'lucide-react';
import {
  MOCK_DATASET_STATS,
  MOCK_DATASET_IMAGES,
} from '@/mock/dataset';
import { CORAL_CATEGORIES, MODEL_LABEL_MAPPING } from '@/constants/categories';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { BoundingBoxOverlay } from '@/components/common/BoundingBoxOverlay';
import { CoralCategoryKey } from '@/types/prediction';
import { DatasetImage } from '@/types/dataset';

export const DatasetManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [splitFilter, setSplitFilter] = useState<string>('ALL');
  const [selectedImage, setSelectedImage] = useState<DatasetImage>(
    MOCK_DATASET_IMAGES[0]
  );
  const [showTaxonomyModal, setShowTaxonomyModal] = useState<boolean>(false);

  const filteredImages = MOCK_DATASET_IMAGES.filter((img) => {
    const matchesCategory =
      categoryFilter === 'ALL' ||
      img.primaryCategory === categoryFilter ||
      img.annotations.some((a) => a.className === categoryFilter);

    const matchesSplit = splitFilter === 'ALL' || img.split === splitFilter;

    const matchesSearch =
      searchQuery === '' ||
      img.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.sourceReef && img.sourceReef.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSplit && matchesSearch;
  });

  const overlayPredictions = selectedImage.annotations.map((ann) => ({
    id: ann.id,
    assessmentId: 'DATASET-REF',
    imageId: selectedImage.id,
    className: ann.className,
    confidence: 1.0,
    boundingBox: ann.boundingBox,
  }));

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl reef-glass shadow-2xl border border-reef-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-reef-aqua uppercase">
              Model Training &amp; Benchmarking Repository
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Reference Dataset Management</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Curated underwater benthic photogrammetry repository for YOLO11 training, validation, and six-category ground truth inspection. Kept strictly separate from live field survey uploads.
          </p>
        </div>

        <button
          onClick={() => setShowTaxonomyModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-reef-surface hover:bg-reef-surface/90 text-reef-aqua border border-reef-aqua/40 text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Code className="w-4 h-4 text-reef-orange" />
          <span>Inspect Model Label Taxonomy</span>
        </button>
      </div>

      {/* Dataset Overview Metrics Banner */}
      <div className="p-6 sm:p-7 rounded-3xl reef-glass shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-reef-border/40">
          <div>
            <span className="text-xs text-slate-400 font-mono">Dataset Identifier:</span>
            <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
              <span>YOLO11-Coral-Benthic-{MOCK_DATASET_STATS.version}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Source: {MOCK_DATASET_STATS.source} • License: {MOCK_DATASET_STATS.license}
            </p>
          </div>

          <div className="flex items-center gap-6 font-mono text-right text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Total Benchmark Images</span>
              <span className="text-2xl font-black text-reef-aqua">
                {MOCK_DATASET_STATS.totalImages}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Annotated Ground Truths</span>
              <span className="text-2xl font-black text-reef-seafoam">
                {MOCK_DATASET_STATS.totalAnnotations}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Train / Val / Test Split</span>
              <span className="text-white font-bold">
                {MOCK_DATASET_STATS.splitDistribution.train} / {MOCK_DATASET_STATS.splitDistribution.val} / {MOCK_DATASET_STATS.splitDistribution.test}
              </span>
            </div>
          </div>
        </div>

        {/* Category Distribution Grid */}
        <div>
          <span className="text-xs font-extrabold text-white uppercase tracking-wider block mb-2.5">
            Six-Category Ground Truth Distribution:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            {Object.entries(MOCK_DATASET_STATS.categoryDistribution).map(([key, stat]) => {
              const meta = CORAL_CATEGORIES[key as CoralCategoryKey];
              return (
                <div
                  key={key}
                  className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50 group hover:border-reef-aqua/60 transition-all"
                >
                  <span
                    className="font-sans font-bold text-[11px] block truncate"
                    style={{ color: meta.color }}
                  >
                    {meta.displayName}
                  </span>
                  <div className="text-lg font-black text-white mt-1">
                    {stat.percentage}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans">
                    {stat.count} labels
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gallery Filter Toolbar */}
      <div className="p-4 rounded-2xl reef-glass flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Filter className="w-3.5 h-3.5 text-reef-aqua" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-reef-deep border border-reef-border text-white focus:outline-none focus:border-reef-aqua font-medium"
          >
            <option value="ALL">All Six Categories</option>
            {Object.entries(CORAL_CATEGORIES).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.displayName}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-white font-bold ml-2">
            <span>Split:</span>
          </div>
          {['ALL', 'train', 'val', 'test'].map((sp) => (
            <button
              key={sp}
              onClick={() => setSplitFilter(sp)}
              className={`px-3 py-1.5 rounded-xl font-mono font-bold transition-all ${
                splitFilter === sp
                  ? 'bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep shadow-glow-aqua/30'
                  : 'bg-reef-midnight text-slate-300 hover:text-white hover:bg-reef-surface'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specimen image ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-reef-deep border border-reef-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-reef-aqua"
          />
        </div>
      </div>

      {/* Specimen Gallery & Inspector Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gallery Grid (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-mono font-semibold">
            <span>Reference Library Images ({filteredImages.length})</span>
            <span>Click any tile to inspect ground truth</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto p-1">
            {filteredImages.map((img) => {
              const isSelected = selectedImage.id === img.id;
              const meta = CORAL_CATEGORIES[img.primaryCategory];
              return (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className={`group relative rounded-2xl overflow-hidden border cursor-pointer aspect-video bg-black transition-all ${
                    isSelected
                      ? 'border-reef-aqua ring-2 ring-reef-aqua/40 shadow-glow-aqua/40 scale-[1.02]'
                      : 'border-reef-border hover:border-reef-aqua/60'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.filename}
                    className="w-full h-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-black bg-reef-midnight/90 text-reef-aqua border border-reef-border">
                        {img.split}
                      </span>
                      <span className="text-[10px] font-mono text-white font-bold bg-black/50 px-1.5 py-0.5 rounded">
                        {img.annotations.length} bbox
                      </span>
                    </div>

                    <div>
                      <span
                        className="text-[11px] font-bold block truncate"
                        style={{ color: meta.color }}
                      >
                        {meta.displayName}
                      </span>
                      <span className="text-[10px] text-slate-300 font-mono block truncate">
                        {img.filename}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspector Detail Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {selectedImage ? (
            <div className="p-6 rounded-3xl reef-glass shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-reef-border/40">
                <div>
                  <span className="text-xs font-mono font-bold text-reef-aqua">
                    {selectedImage.id}
                  </span>
                  <h3 className="text-sm font-black text-white truncate">
                    {selectedImage.filename}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-reef-midnight text-reef-seafoam border border-reef-border">
                  SPLIT: {selectedImage.split.toUpperCase()}
                </span>
              </div>

              {/* Bounding Box Visualizer */}
              <BoundingBoxOverlay
                imageUrl={selectedImage.imageUrl}
                predictions={overlayPredictions}
                altText={selectedImage.filename}
              />

              {/* Annotation & Camera Info */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">
                    Acquisition Rig Spec
                  </span>
                  <div>Resolution: {selectedImage.dimensions.width} × {selectedImage.dimensions.height} px</div>
                  <div>Origin Reef: {selectedImage.sourceReef || 'Unspecified'}</div>
                  <div>Captured: {selectedImage.capturedDate || '2024'}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-reef-midnight border border-reef-border/50 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">
                    Ground Truth Pathology
                  </span>
                  <div>Primary Category: {CORAL_CATEGORIES[selectedImage.primaryCategory].displayName}</div>
                  <div>Annotations: {selectedImage.annotations.length} bounding boxes</div>
                  <div>Benchmark Ver: {selectedImage.datasetVersion}</div>
                </div>
              </div>

              {/* Annotation Log List */}
              <div className="space-y-2 pt-2 border-t border-reef-border/40">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Ground Truth Bounding Box Log:
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedImage.annotations.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-2.5 rounded-xl bg-reef-midnight border border-reef-border/50 text-xs font-mono flex items-center justify-between"
                    >
                      <CategoryBadge category={ann.className} />
                      <span className="text-slate-300 text-[11px]">
                        bbox: [{ann.boundingBox.x1}, {ann.boundingBox.y1}, {ann.boundingBox.x2}, {ann.boundingBox.y2}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl reef-glass text-center text-slate-300 text-xs">
              Select a benchmark specimen from the gallery.
            </div>
          )}
        </div>
      </div>

      {/* Model Label Taxonomy Modal */}
      {showTaxonomyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-reef-midnight border border-reef-aqua/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-reef-border/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-reef-aqua" />
                <span>YOLO11 Model Label Taxonomy Mapping</span>
              </h3>
              <button
                onClick={() => setShowTaxonomyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-slate-200">
                This table maps raw integer class IDs or custom string tokens emitted by the YOLO11 model to the application's six official scientific categories. Teammates developing the FastAPI endpoint can verify their model's output labels below:
              </p>

              <div className="overflow-x-auto rounded-2xl border border-reef-border/50">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-reef-deep border-b border-reef-border/50 text-[11px] uppercase text-slate-300 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Raw Model String / Index</th>
                      <th className="py-2.5 px-3">Resolved Internal Key</th>
                      <th className="py-2.5 px-3 font-sans">Official Display Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-reef-border/30 bg-reef-midnight/60">
                    {Object.entries(MODEL_LABEL_MAPPING).map(([raw, resolved]) => (
                      <tr key={raw}>
                        <td className="py-2.5 px-3 text-reef-aqua font-bold">"{raw}"</td>
                        <td className="py-2.5 px-3 text-slate-300">{resolved}</td>
                        <td className="py-2.5 px-3 font-sans font-bold text-white">
                          {CORAL_CATEGORIES[resolved]?.displayName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-3 border-t border-reef-border/40">
                <button
                  onClick={() => setShowTaxonomyModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep font-black shadow-glow-aqua"
                >
                  Close Taxonomy Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
