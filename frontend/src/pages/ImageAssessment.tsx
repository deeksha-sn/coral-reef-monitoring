import React, { useState } from 'react';
import {
  UploadCloud,
  FileImage,
  Trash2,
  Play,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Layers,
  MapPin,
  Calendar,
  FileText,
  Save,
  ShieldAlert,
  Sparkles,
  Waves,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { BoundingBoxOverlay } from '@/components/common/BoundingBoxOverlay';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { runInference } from '@/services/prediction/predictionService';
import { buildAssessmentSummary } from '@/utils/coralMath';
import { Assessment, AssessmentImage } from '@/types/assessment';
import { Prediction } from '@/types/prediction';
import { ReefSite } from '@/types/site';

interface UploadedFileItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
}

export const ImageAssessment: React.FC = () => {
  const { sites, addSite, addAssessment, apiMode, modelSettings } = useApp();
  const { currentUser, permissions } = useAuth();

  // Wizard state
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [showNewSiteModal, setShowNewSiteModal] = useState<boolean>(false);

  // New site form state
  const [newSiteData, setNewSiteData] = useState<Omit<ReefSite, 'id' | 'createdAt'>>({
    country: 'Australia',
    region: 'Great Barrier Reef Marine Park',
    reefName: 'Osprey Reef Benthic Zone',
    siteName: 'North Horn Deep Pinnacle Transect',
    latitude: -13.9167,
    longitude: 146.6333,
    description: 'Isolated oceanic atoll pinnacle with steep coral walls and extreme water clarity.',
    depthMeters: 14,
    conservationStatus: 'Marine Protected Area',
  });

  // Assessment info state
  const [assessmentName, setAssessmentName] = useState<string>(
    `Benthic Quadrat Survey ${new Date().toISOString().slice(0, 10)}`
  );
  const [assessmentDate, setAssessmentDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState<string>(
    'Standard phototransect quadrat audit documenting thermal bleaching margin and annular band pathogen spread.'
  );

  // Uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Execution & Results state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [assessmentResult, setAssessmentResult] = useState<Assessment | null>(null);
  const [activeImageTab, setActiveImageTab] = useState<number>(0);
  const [inferenceError, setInferenceError] = useState<string | null>(null);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processFiles(Array.from(e.target.files));
  };

  const processFiles = (files: File[]) => {
    setUploadError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const newItems: UploadedFileItem[] = [];

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setUploadError(`Invalid file type "${file.name}". Please upload JPG or PNG files.`);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds maximum allowed size (15 MB).`);
        return;
      }

      newItems.push({
        id: `FILE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 100,
      });
    }

    setUploadedFiles((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Preload sample coral images for quick demonstration
  const loadSampleCoralImages = async () => {
    setUploadError(null);
    const sampleUrls = [
      {
        name: 'quadrat_survey_sample_01.jpg',
        url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1000&auto=format&fit=crop&q=80',
      },
      {
        name: 'quadrat_survey_sample_02.jpg',
        url: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1000&auto=format&fit=crop&q=80',
      },
      {
        name: 'quadrat_survey_sample_03.jpg',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&auto=format&fit=crop&q=80',
      },
    ];

    try {
      const newItems: UploadedFileItem[] = [];
      for (const item of sampleUrls) {
        const response = await fetch(item.url);
        const blob = await response.blob();
        const file = new File([blob], item.name, { type: 'image/jpeg' });
        newItems.push({
          id: `FILE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          previewUrl: item.url,
          progress: 100,
        });
      }
      setUploadedFiles(newItems);
    } catch (e) {
      setUploadError('Failed to load remote sample images. Please upload local files.');
    }
  };

  // Run Assessment
  const handleRunAssessment = async () => {
    if (!selectedSiteId) {
      setUploadError('Please select or register a reef site.');
      return;
    }
    if (uploadedFiles.length === 0) {
      setUploadError('Please upload at least one coral phototransect image.');
      return;
    }

    setIsRunning(true);
    setInferenceError(null);
    setProgressStatus('Initializing YOLO11 inference pipeline...');

    const newAssessmentId = `ASM-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 900) + 100
    )}`;

    try {
      const processedImages: AssessmentImage[] = [];
      const allDetections: Prediction[] = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const item = uploadedFiles[i];
        setProgressStatus(
          `Analyzing quadrat ${i + 1} of ${uploadedFiles.length}: "${item.file.name}"...`
        );

        const inferenceResponse = await runInference(item.file, {
          apiMode,
          baseUrl: modelSettings.fastApiBaseUrl,
          endpoint: modelSettings.modelEndpoint,
          confidenceThreshold: modelSettings.confidenceThreshold,
          assessmentId: newAssessmentId,
          imageId: item.id,
        });

        processedImages.push({
          id: item.id,
          assessmentId: newAssessmentId,
          filename: item.file.name,
          originalUrl: item.previewUrl,
          annotatedUrl: item.previewUrl,
          detections: inferenceResponse.predictions,
        });

        allDetections.push(...inferenceResponse.predictions);
      }

      setProgressStatus('Compiling six-category pathology summary & evaluating alert rules...');

      const summary = buildAssessmentSummary(allDetections);

      const completedAssessment: Assessment = {
        id: newAssessmentId,
        siteId: selectedSiteId,
        assessmentName,
        assessmentDate,
        notes,
        imageCount: processedImages.length,
        totalDetections: allDetections.length,
        status: 'completed',
        summary,
        images: processedImages,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
      };

      addAssessment(completedAssessment);
      setAssessmentResult(completedAssessment);
      setActiveImageTab(0);
    } catch (err: any) {
      setInferenceError(err.message || 'Inference execution failed.');
    } finally {
      setIsRunning(false);
      setProgressStatus('');
    }
  };

  const handleSaveNewSite = (e: React.FormEvent) => {
    e.preventDefault();
    const createdSite = addSite(newSiteData);
    setSelectedSiteId(createdSite.id);
    setShowNewSiteModal(false);
  };

  return (
    <div className="space-y-7">
      {/* Coral-Themed Page Header */}
      <div className="relative rounded-3xl p-6 sm:p-7 reef-glass overflow-hidden shadow-2xl border border-reef-border/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-reef-aqua uppercase">
                ReefSentra Field Workflow
              </span>
              <DemoDataBadge size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Coral Health &amp; Pathology Assessment</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Register reef transects, upload multi-image benthic phototransects, and execute 6-class deep learning pathology detection across coral conditions and band diseases.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {uploadedFiles.length === 0 && (
              <button
                onClick={loadSampleCoralImages}
                className="px-4 py-2.5 rounded-xl bg-reef-surface hover:bg-reef-surface/90 text-reef-aqua border border-reef-aqua/40 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <FileImage className="w-4 h-4 text-reef-orange" />
                <span>Load Demo Images (3)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Restriction Banner if Viewer */}
      {!permissions.canUploadAssessments && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-reef-orange/60 text-amber-200 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-reef-orange" />
          <div>
            <span className="font-bold">Demonstration Role Notice: </span>
            You are signed in as a <strong className="underline">VIEWER</strong>. You may test assessment simulations, but permanent records require <strong className="underline">RESEARCHER</strong> or <strong className="underline">ADMIN</strong>. Switch roles in the top header.
          </div>
        </div>
      )}

      {/* Main 2-Column Workflow Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Step 1 Site & Step 2 Metadata (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Select Reef Site */}
          <div className="p-6 rounded-3xl reef-glass space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-reef-border/40">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-reef-aqua to-reef-teal text-reef-deep flex items-center justify-center text-xs font-black font-mono shadow-sm">
                  1
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  Select Reef Monitoring Site
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewSiteModal(true)}
                className="text-xs text-reef-aqua hover:text-white font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-reef-orange" />
                <span>Register Site</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Saved Monitoring Station:
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-reef-deep/90 border border-reef-border text-xs text-white focus:outline-none focus:border-reef-aqua font-medium"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.siteName} ({site.region}, {site.country})
                  </option>
                ))}
              </select>
            </div>

            {selectedSite && (
              <div className="p-3.5 rounded-2xl bg-reef-midnight/80 border border-reef-border/50 text-xs space-y-1.5 font-mono text-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-400">Site ID:</span>
                  <span className="text-reef-aqua font-bold">{selectedSite.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reef Ecosystem:</span>
                  <span className="text-white truncate max-w-[200px]">{selectedSite.reefName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Coordinates:</span>
                  <span>{selectedSite.latitude.toFixed(4)}, {selectedSite.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Depth Profile:</span>
                  <span>{selectedSite.depthMeters || 8} meters</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Assessment Metadata */}
          <div className="p-6 rounded-3xl reef-glass space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-reef-border/40">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-reef-aqua to-reef-teal text-reef-deep flex items-center justify-center text-xs font-black font-mono shadow-sm">
                2
              </span>
              <h3 className="text-sm font-extrabold text-white">
                Assessment Metadata &amp; Survey Date
              </h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Survey Name / Transect Label:
                </label>
                <input
                  type="text"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  placeholder="e.g. Heron Reef Post-Thermal Event 2025"
                  className="w-full px-3.5 py-2 rounded-xl bg-reef-deep/90 border border-reef-border text-xs text-white focus:outline-none focus:border-reef-aqua"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Survey Date:
                </label>
                <input
                  type="date"
                  value={assessmentDate}
                  onChange={(e) => setAssessmentDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-reef-deep/90 border border-reef-border text-xs text-white focus:outline-none focus:border-reef-aqua"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Field Observer Notes &amp; Benthic Parameters:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Environmental parameters, sea surface temperature, tide status..."
                  className="w-full px-3.5 py-2 rounded-xl bg-reef-deep/90 border border-reef-border text-xs text-white focus:outline-none focus:border-reef-aqua"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Step 3 Upload & Step 4 Run (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl reef-glass space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-reef-border/40">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-reef-orange to-reef-pink text-white flex items-center justify-center text-xs font-black font-mono shadow-sm">
                  3
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  Upload Coral Phototransect Images
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-reef-aqua">
                {uploadedFiles.length} file{uploadedFiles.length === 1 ? '' : 's'} queued
              </span>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-reef-border hover:border-reef-aqua rounded-3xl p-7 text-center bg-reef-deep/40 hover:bg-reef-midnight/60 transition-all cursor-pointer flex flex-col items-center justify-center group"
              onClick={() => document.getElementById('coral-file-input')?.click()}
            >
              <input
                id="coral-file-input"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="p-4 rounded-2xl bg-gradient-to-br from-reef-midnight to-reef-surface text-reef-aqua border border-reef-aqua/40 mb-3 shadow-glow-aqua/30 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-8 h-8 text-reef-aqua" />
              </div>
              <h4 className="text-sm font-bold text-white">
                Drag &amp; drop coral phototransect images here
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Supports JPG, JPEG, and PNG (up to 15 MB per image)
              </p>
              <button
                type="button"
                className="mt-3.5 px-4 py-1.5 rounded-xl bg-reef-aqua/20 hover:bg-reef-aqua/30 border border-reef-aqua/50 text-reef-aqua text-xs font-bold transition-colors"
              >
                Browse Local Files
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Queued Previews */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">Queued Quadrat Images:</span>
                  <button
                    type="button"
                    onClick={() => setUploadedFiles([])}
                    className="text-reef-pink hover:underline font-bold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                  {uploadedFiles.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl overflow-hidden border border-reef-border bg-black aspect-video flex items-center justify-center"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <span className="text-[10px] text-white truncate font-mono font-bold">
                          #{index + 1} {item.file.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(item.id);
                          }}
                          className="self-end p-1.5 rounded-lg bg-rose-600/80 text-white hover:bg-rose-500 transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Run Assessment Button */}
            <div className="pt-3 border-t border-reef-border/40">
              <button
                type="button"
                disabled={isRunning || uploadedFiles.length === 0}
                onClick={handleRunAssessment}
                className={`w-full py-4 px-5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-xl transition-all ${
                  isRunning || uploadedFiles.length === 0
                    ? 'bg-reef-midnight/60 text-slate-500 cursor-not-allowed border border-reef-border/30'
                    : 'bg-gradient-to-r from-reef-aqua via-reef-teal to-emerald-500 text-reef-deep hover:brightness-110 shadow-glow-aqua cursor-pointer transform hover:-translate-y-0.5'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>RUNNING INFERENCE PIPELINE...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>RUN CORAL HEALTH ASSESSMENT</span>
                  </>
                )}
              </button>

              {isRunning && (
                <div className="mt-3.5 p-3.5 rounded-2xl bg-reef-deep border border-reef-aqua/40 text-xs font-mono text-reef-aqua flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-reef-aqua animate-ping" />
                  <span>{progressStatus}</span>
                </div>
              )}

              {inferenceError && (
                <div className="mt-3.5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <div>
                    <span className="font-bold">Inference Error: </span>
                    {inferenceError}
                  </div>
                </div>
              )}

              <div className="mt-2.5 text-center">
                <span className="text-[11px] text-slate-400 font-mono">
                  {apiMode === 'MOCK'
                    ? 'Operating in Standalone MOCK Mode (Simulated YOLO11 Bounding Boxes)'
                    : `Live API Mode: ${modelSettings.fastApiBaseUrl}${modelSettings.modelEndpoint}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 5: Display Assessment Results */}
      {assessmentResult && (
        <div className="p-7 rounded-3xl reef-glass shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-reef-border/40">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Assessment Completed Successfully
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-reef-midnight text-reef-aqua border border-reef-border font-bold">
                  {assessmentResult.id}
                </span>
              </div>
              <h2 className="text-xl font-black text-white">
                {assessmentResult.assessmentName}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Station: {selectedSite?.siteName} • Survey Date: {assessmentResult.assessmentDate}
              </p>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs text-slate-300 font-bold uppercase tracking-wider">Total Specimens Detected</div>
              <div className="text-3xl font-black text-reef-aqua">
                {assessmentResult.totalDetections}
              </div>
            </div>
          </div>

          {/* Six Category Summary Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-reef-aqua" />
                <span>Six Official Coral Categories (Object Detections Breakdown)</span>
              </h3>
              <span className="text-xs text-slate-300 font-mono font-semibold">
                Total Objects: {assessmentResult.totalDetections} across {assessmentResult.imageCount} image{assessmentResult.imageCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <div className="p-3.5 rounded-2xl bg-reef-midnight/90 border border-reef-coralBay/40">
                <span className="text-[11px] font-bold text-reef-coralBay block mb-1">
                  Healthy Coral
                </span>
                <div className="text-xl font-black font-mono text-white">
                  {assessmentResult.summary.healthyCoral.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.healthyCoral.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-reef-midnight/90 border border-reef-sunset/40">
                <span className="text-[11px] font-bold text-reef-sunset block mb-1">
                  Bleached Coral
                </span>
                <div className="text-xl font-black font-mono text-white">
                  {assessmentResult.summary.bleachedCoral.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.bleachedCoral.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-reef-midnight/90 border border-reef-blush/40">
                <span className="text-[11px] font-bold text-reef-blush block mb-1">
                  Dead Coral
                </span>
                <div className="text-xl font-black font-mono text-white">
                  {assessmentResult.summary.deadCoral.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.deadCoral.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-reef-midnight/90 border border-reef-deepSea/50">
                <span className="text-[11px] font-bold text-[#5CA8FF] block mb-1">
                  Black Band
                </span>
                <div className="text-xl font-black font-mono text-white">
                  {assessmentResult.summary.blackBandDisease.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.blackBandDisease.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-reef-midnight/90 border border-reef-candy/40">
                <span className="text-[11px] font-bold text-reef-candy block mb-1">
                  White Band
                </span>
                <div className="text-xl font-black font-mono text-white">
                  {assessmentResult.summary.whiteBandDisease.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.whiteBandDisease.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-reef-midnight/90 border border-amber-400/40">
                <span className="text-[11px] font-bold text-amber-400 block mb-1">
                  Yellow Band
                </span>
                <div className="text-xl font-black font-mono text-white">
                  {assessmentResult.summary.yellowBandDisease.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.yellowBandDisease.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-reef-midnight/90 border border-reef-candy/50 shadow-glow-candy/20">
                <span className="text-[11px] font-black text-reef-candy block mb-1">
                  Combined Band
                </span>
                <div className="text-xl font-black font-mono text-white">
                  {assessmentResult.summary.combinedBandDisease.percentage}%
                </div>
                <span className="text-[11px] text-reef-candy font-mono">
                  {assessmentResult.summary.combinedBandDisease.count} lesions
                </span>
              </div>
            </div>
          </div>

          {/* Per-Image Visualizer with Bounding Boxes */}
          <div className="space-y-3.5 pt-4 border-t border-reef-border/40">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">
                Annotated Quadrat Inspection:
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-md">
                {assessmentResult.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageTab(idx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                      activeImageTab === idx
                        ? 'bg-gradient-to-r from-reef-aqua to-reef-teal text-reef-deep shadow-glow-aqua/30'
                        : 'bg-reef-midnight text-slate-300 hover:bg-reef-surface'
                    }`}
                  >
                    Image {idx + 1} ({img.detections.length})
                  </button>
                ))}
              </div>
            </div>

            {assessmentResult.images[activeImageTab] && (
              <div className="space-y-4">
                <BoundingBoxOverlay
                  imageUrl={assessmentResult.images[activeImageTab].originalUrl}
                  predictions={assessmentResult.images[activeImageTab].detections}
                  altText={assessmentResult.images[activeImageTab].filename}
                />

                <div className="p-4 rounded-2xl bg-reef-midnight/80 border border-reef-border/40">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                    Quadrat Bounding Box Coordinates &amp; Confidence Log:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {assessmentResult.images[activeImageTab].detections.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-reef-deep border border-reef-border/40 text-xs flex items-center justify-between font-mono"
                      >
                        <CategoryBadge category={p.className} showDot={true} />
                        <span className="text-reef-aqua font-bold">
                          {Math.round(p.confidence * 100)}% conf
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          [{p.boundingBox.x1}, {p.boundingBox.y1}, {p.boundingBox.x2}, {p.boundingBox.y2}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register New Site Modal */}
      {showNewSiteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-reef-midnight border border-reef-aqua/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-reef-border/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-reef-aqua" />
                <span>Register New Reef Monitoring Station</span>
              </h3>
              <button
                onClick={() => setShowNewSiteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewSite} className="space-y-3.5 text-xs">
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
                  onClick={() => setShowNewSiteModal(false)}
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
