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

  // Filter reference gallery
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

  // Convert dataset annotations to prediction format for BoundingBoxOverlay
  const overlayPredictions = selectedImage.annotations.map((ann) => ({
    id: ann.id,
    assessmentId: 'DATASET-REF',
    imageId: selectedImage.id,
    className: ann.className,
    confidence: 1.0, // Ground truth annotation
    boundingBox: ann.boundingBox,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Model Training &amp; Benchmarking Repository
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Reference Dataset Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Curated underwater benthic photogrammetry repository for YOLO11 training, validation, and six-category pathology ground truth inspection. Kept strictly separate from live field survey uploads.
          </p>
        </div>

        <button
          onClick={() => setShowTaxonomyModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-cyan-300 border border-ocean-700 text-xs font-semibold"
        >
          <Code className="w-4 h-4 text-cyan-400" />
          <span>Inspect Model Label Taxonomy</span>
        </button>
      </div>

      {/* Dataset Overview Metrics Banner */}
      <div className="p-6 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ocean-800">
          <div>
            <span className="text-xs text-slate-400 font-mono">Dataset Identifier:</span>
            <h3 className="text-lg font-bold text-slate-100 font-mono">
              YOLO11-Coral-Benthic-{MOCK_DATASET_STATS.version}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Source: {MOCK_DATASET_STATS.source} • License: {MOCK_DATASET_STATS.license}
            </p>
          </div>

          <div className="flex items-center gap-6 font-mono text-right text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Total Benchmark Images</span>
              <span className="text-xl font-bold text-cyan-300">
                {MOCK_DATASET_STATS.totalImages}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Annotated Ground Truths</span>
              <span className="text-xl font-bold text-teal-300">
                {MOCK_DATASET_STATS.totalAnnotations}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Train / Val / Test Split</span>
              <span className="text-slate-200 font-bold">
                {MOCK_DATASET_STATS.splitDistribution.train} / {MOCK_DATASET_STATS.splitDistribution.val} / {MOCK_DATASET_STATS.splitDistribution.test}
              </span>
            </div>
          </div>
        </div>

        {/* Category Distribution Grid */}
        <div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
            Six-Category Ground Truth Distribution:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            {Object.entries(MOCK_DATASET_STATS.categoryDistribution).map(([key, stat]) => {
              const meta = CORAL_CATEGORIES[key as CoralCategoryKey];
              return (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-ocean-950 border border-ocean-800"
                >
                  <span
                    className="font-sans font-semibold text-[11px] block truncate"
                    style={{ color: meta.color }}
                  >
                    {meta.displayName}
                  </span>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {stat.percentage}%
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {stat.count} labels
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gallery Filter Toolbar */}
      <div className="p-4 rounded-xl bg-ocean-850/80 border border-ocean-700/70 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-ocean-950 border border-ocean-700 text-slate-200"
          >
            <option value="ALL">All Six Categories</option>
            {Object.entries(CORAL_CATEGORIES).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.displayName}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-slate-300 font-semibold ml-2">
            <span>Split:</span>
          </div>
          {['ALL', 'train', 'val', 'test'].map((sp) => (
            <button
              key={sp}
              onClick={() => setSplitFilter(sp)}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${
                splitFilter === sp
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-ocean-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specimen image ID..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-ocean-950 border border-ocean-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Interactive Specimen Gallery & Inspector Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gallery Grid (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
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
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer aspect-video bg-ocean-950 transition-all ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 shadow-glow-cyan/40 scale-[1.02]'
                      : 'border-ocean-700 hover:border-ocean-600'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.filename}
                    className="w-full h-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-ocean-900/90 text-cyan-300 border border-ocean-700">
                        {img.split}
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">
                        {img.annotations.length} bbox
                      </span>
                    </div>

                    <div>
                      <span
                        className="text-[11px] font-semibold block truncate"
                        style={{ color: meta.color }}
                      >
                        {meta.displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
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
            <div className="p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-ocean-800">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {selectedImage.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 truncate">
                    {selectedImage.filename}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-ocean-950 text-teal-300 border border-ocean-800">
                  SPLIT: {selectedImage.split.toUpperCase()}
                </span>
              </div>

              {/* Bounding Box Visualizer for the reference image */}
              <BoundingBoxOverlay
                imageUrl={selectedImage.imageUrl}
                predictions={overlayPredictions}
                altText={selectedImage.filename}
              />

              {/* Annotation & Camera Info */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">
                    Image Acquisition Spec
                  </span>
                  <div>Dimensions: {selectedImage.dimensions.width} × {selectedImage.dimensions.height} px</div>
                  <div>Origin Reef: {selectedImage.sourceReef || 'Unspecified'}</div>
                  <div>Captured: {selectedImage.capturedDate || '2024'}</div>
                </div>

                <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">
                    Ground Truth Pathology
                  </span>
                  <div>Primary Category: {CORAL_CATEGORIES[selectedImage.primaryCategory].displayName}</div>
                  <div>Annotations: {selectedImage.annotations.length} bounding boxes</div>
                  <div>Benchmark Ver: {selectedImage.datasetVersion}</div>
                </div>
              </div>

              {/* Annotation Log List */}
              <div className="space-y-1.5 pt-2 border-t border-ocean-800">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Ground Truth Bounding Box Log:
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedImage.annotations.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-2 rounded-lg bg-ocean-950 border border-ocean-800 text-xs font-mono flex items-center justify-between"
                    >
                      <CategoryBadge category={ann.className} />
                      <span className="text-slate-400 text-[11px]">
                        bbox: [{ann.boundingBox.x1}, {ann.boundingBox.y1}, {ann.boundingBox.x2}, {ann.boundingBox.y2}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-ocean-850/80 border border-ocean-700 text-center text-slate-400 text-xs">
              Select a benchmark specimen from the gallery.
            </div>
          )}
        </div>
      </div>

      {/* Model Label Taxonomy Modal */}
      {showTaxonomyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-ocean-900 border border-ocean-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ocean-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>YOLO11 Model Label Taxonomy Mapping</span>
              </h3>
              <button
                onClick={() => setShowTaxonomyModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                This table maps raw integer class IDs or custom string tokens emitted by the YOLO11 model to the application's six official scientific categories. Teammates developing the FastAPI endpoint can verify their model's output labels below:
              </p>

              <div className="overflow-x-auto rounded-xl border border-ocean-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-ocean-950 border-b border-ocean-800 text-[11px] uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Raw Model String / Index</th>
                      <th className="py-2.5 px-3">Resolved Internal Key</th>
                      <th className="py-2.5 px-3 font-sans">Official Display Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ocean-800 bg-ocean-950/40">
                    {Object.entries(MODEL_LABEL_MAPPING).map(([raw, resolved]) => (
                      <tr key={raw}>
                        <td className="py-2 px-3 text-cyan-300">"{raw}"</td>
                        <td className="py-2 px-3 text-slate-300">{resolved}</td>
                        <td className="py-2 px-3 font-sans font-semibold text-slate-100">
                          {CORAL_CATEGORIES[resolved]?.displayName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-3 border-t border-ocean-800">
                <button
                  onClick={() => setShowTaxonomyModal(false)}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold"
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
