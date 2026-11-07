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
  ArrowRight,
  ShieldAlert,
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
    `Phototransect Health Audit ${new Date().toISOString().slice(0, 10)}`
  );
  const [assessmentDate, setAssessmentDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState<string>(
    'Standard benthic 1m x 1m quadrat survey documenting thermal stress and band pathogen margins.'
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

  // Drag and drop handlers
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
      setUploadError('Failed to load sample remote assets. Please upload local files.');
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
    setProgressStatus('Initializing inference service pipeline...');

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

      // Calculate summary
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

      // Save to global state (triggers alert evaluation)
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

  // Handle New Site Registration
  const handleSaveNewSite = (e: React.FormEvent) => {
    e.preventDefault();
    const createdSite = addSite(newSiteData);
    setSelectedSiteId(createdSite.id);
    setShowNewSiteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Field Survey Workflow
            </span>
            <DemoDataBadge size="sm" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Coral Health &amp; Pathology Assessment
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Register reef transects, upload multi-image phototransects, and execute 6-class YOLO11 detection across coral conditions and band diseases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {uploadedFiles.length === 0 && (
            <button
              onClick={loadSampleCoralImages}
              className="px-3.5 py-2 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-cyan-300 border border-ocean-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileImage className="w-4 h-4 text-cyan-400" />
              <span>Load Demo Images (3)</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Restriction Banner if Viewer */}
      {!permissions.canUploadAssessments && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/60 text-amber-300 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
          <div>
            <span className="font-bold">Demonstration Role Notice: </span>
            You are currently signed in as a <strong className="underline">VIEWER</strong>. You may inspect previous assessments and run demo evaluations, but database records cannot be permanently committed. Switch to <strong className="underline">RESEARCHER</strong> or <strong className="underline">ADMIN</strong> in the top header menu to unlock all write permissions.
          </div>
        </div>
      )}

      {/* Main 2-Step Form & Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Step 1 Site Selection & Step 2 Metadata (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Select Reef Site */}
          <div className="p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ocean-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-100">
                  Select Reef Monitoring Site
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewSiteModal(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register New Site</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Saved Reef Site:
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-ocean-950/90 border border-ocean-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.siteName} ({site.region}, {site.country})
                  </option>
                ))}
              </select>
            </div>

            {selectedSite && (
              <div className="p-3 rounded-xl bg-ocean-950/70 border border-ocean-800 text-xs space-y-1 font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Site ID:</span>
                  <span className="text-cyan-400 font-bold">{selectedSite.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reef Ecosystem:</span>
                  <span className="text-slate-200">{selectedSite.reefName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Coordinates:</span>
                  <span>{selectedSite.latitude.toFixed(4)}, {selectedSite.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Depth Profile:</span>
                  <span>{selectedSite.depthMeters || 8} meters</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Assessment Metadata */}
          <div className="p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-ocean-800">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-xs font-bold font-mono">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-100">
                Assessment Metadata &amp; Survey Date
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assessment Survey Title:
                </label>
                <input
                  type="text"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  placeholder="e.g. Heron Reef Post-Bleaching Transect 2025"
                  className="w-full px-3 py-2 rounded-xl bg-ocean-950/90 border border-ocean-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Survey Date:
                </label>
                <input
                  type="date"
                  value={assessmentDate}
                  onChange={(e) => setAssessmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-ocean-950/90 border border-ocean-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Field Observer Notes &amp; Marine Conditions:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Environmental parameters, water temperature, tide level, camera setup..."
                  className="w-full px-3 py-2 rounded-xl bg-ocean-950/90 border border-ocean-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Step 3 Upload & Step 4 Run Assessment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 3: Multi-Image Uploader */}
          <div className="p-5 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ocean-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-100">
                  Upload Coral Phototransect Images (JPG / PNG)
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {uploadedFiles.length} file{uploadedFiles.length === 1 ? '' : 's'} queued
              </span>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-ocean-700 hover:border-cyan-500/70 rounded-2xl p-6 text-center bg-ocean-950/40 hover:bg-ocean-900/50 transition-all cursor-pointer flex flex-col items-center justify-center"
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
              <div className="p-3 rounded-full bg-ocean-800 text-cyan-400 border border-ocean-700 mb-3 shadow-glow-cyan/20">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">
                Drag and drop coral survey images here
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Supports JPG, JPEG, and PNG (maximum 15 MB per image)
              </p>
              <button
                type="button"
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold"
              >
                Browse Local Files
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-700/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Queued Images Preview Grid */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Queued Quadrats:</span>
                  <button
                    type="button"
                    onClick={() => setUploadedFiles([])}
                    className="text-rose-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                  {uploadedFiles.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative rounded-xl overflow-hidden border border-ocean-700 bg-ocean-950 aspect-video flex items-center justify-center"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <span className="text-[10px] text-slate-200 truncate font-mono">
                          #{index + 1} {item.file.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(item.id);
                          }}
                          className="self-end p-1 rounded bg-rose-600/80 text-white hover:bg-rose-500 transition-colors"
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
            <div className="pt-3 border-t border-ocean-800">
              <button
                type="button"
                disabled={isRunning || uploadedFiles.length === 0}
                onClick={handleRunAssessment}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isRunning || uploadedFiles.length === 0
                    ? 'bg-ocean-800 text-slate-500 cursor-not-allowed border border-ocean-700'
                    : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 hover:brightness-110 shadow-glow-cyan cursor-pointer'
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
                <div className="mt-3 p-3 rounded-xl bg-ocean-950 border border-ocean-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>{progressStatus}</span>
                </div>
              )}

              {inferenceError && (
                <div className="mt-3 p-3.5 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <div>
                    <span className="font-bold">Inference Error: </span>
                    {inferenceError}
                  </div>
                </div>
              )}

              <div className="mt-2 text-center">
                <span className="text-[11px] text-slate-500">
                  {apiMode === 'MOCK'
                    ? 'Operating in Standalone MOCK Mode (Simulated YOLO11 Bounding Boxes)'
                    : `Attempting inference via Live FastAPI endpoint: ${modelSettings.fastApiBaseUrl}${modelSettings.modelEndpoint}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 5: Display Assessment Results */}
      {assessmentResult && (
        <div className="p-6 rounded-2xl bg-ocean-850/90 border border-ocean-700/80 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ocean-700/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Assessment Completed Successfully
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-ocean-800 text-cyan-300 border border-ocean-700">
                  {assessmentResult.id}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                {assessmentResult.assessmentName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Site: {selectedSite?.siteName} • Survey Date: {assessmentResult.assessmentDate}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">Total Specimens Detected</div>
                <div className="text-2xl font-extrabold text-cyan-300">
                  {assessmentResult.totalDetections}
                </div>
              </div>
            </div>
          </div>

          {/* Six Category Summary Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Six Official Coral Categories (Object Detections Breakdown)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Total Objects: {assessmentResult.totalDetections} across {assessmentResult.imageCount} image{assessmentResult.imageCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <div className="p-3.5 rounded-xl bg-ocean-900 border border-emerald-500/30">
                <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
                  Healthy Coral
                </span>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {assessmentResult.summary.healthyCoral.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.healthyCoral.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-ocean-900 border border-amber-500/30">
                <span className="text-[11px] font-semibold text-amber-400 block mb-1">
                  Bleached Coral
                </span>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {assessmentResult.summary.bleachedCoral.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.bleachedCoral.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-ocean-900 border border-red-500/30">
                <span className="text-[11px] font-semibold text-red-400 block mb-1">
                  Dead Coral
                </span>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {assessmentResult.summary.deadCoral.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.deadCoral.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-ocean-900 border border-purple-500/30">
                <span className="text-[11px] font-semibold text-purple-400 block mb-1">
                  Black Band
                </span>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {assessmentResult.summary.blackBandDisease.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.blackBandDisease.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-ocean-900 border border-sky-500/30">
                <span className="text-[11px] font-semibold text-sky-400 block mb-1">
                  White Band
                </span>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {assessmentResult.summary.whiteBandDisease.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.whiteBandDisease.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-ocean-900 border border-yellow-500/30">
                <span className="text-[11px] font-semibold text-yellow-400 block mb-1">
                  Yellow Band
                </span>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {assessmentResult.summary.yellowBandDisease.percentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {assessmentResult.summary.yellowBandDisease.count} objects
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-ocean-900 border border-violet-500/40 shadow-glow-teal/20">
                <span className="text-[11px] font-bold text-violet-300 block mb-1">
                  Combined Band
                </span>
                <div className="text-xl font-extrabold font-mono text-violet-300">
                  {assessmentResult.summary.combinedBandDisease.percentage}%
                </div>
                <span className="text-[11px] text-violet-400 font-mono">
                  {assessmentResult.summary.combinedBandDisease.count} lesions
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Per-Image Visualizer */}
          <div className="space-y-3 pt-4 border-t border-ocean-700/80">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">
                Annotated Quadrat Inspection:
              </h3>
              {/* Image Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-md">
                {assessmentResult.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageTab(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                      activeImageTab === idx
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-ocean-900 text-slate-300 hover:bg-ocean-800'
                    }`}
                  >
                    Image {idx + 1} ({img.detections.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Current Active Image with BoundingBoxOverlay */}
            {assessmentResult.images[activeImageTab] && (
              <div className="space-y-3">
                <BoundingBoxOverlay
                  imageUrl={assessmentResult.images[activeImageTab].originalUrl}
                  predictions={assessmentResult.images[activeImageTab].detections}
                  altText={assessmentResult.images[activeImageTab].filename}
                />

                {/* Per-Image Detection List */}
                <div className="p-4 rounded-xl bg-ocean-900/80 border border-ocean-700">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                    Quadrat Bounding Box Coordinates &amp; Confidence Log:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {assessmentResult.images[activeImageTab].detections.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-lg bg-ocean-950 border border-ocean-800 text-xs flex items-center justify-between font-mono"
                      >
                        <CategoryBadge category={p.className} showDot={true} />
                        <span className="text-cyan-400 font-bold">
                          {Math.round(p.confidence * 100)}% conf
                        </span>
                        <span className="text-slate-500 text-[10px]">
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-ocean-900 border border-ocean-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ocean-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Register New Reef Monitoring Site</span>
              </h3>
              <button
                onClick={() => setShowNewSiteModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewSite} className="space-y-3 text-xs">
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
                  Site Description &amp; Benthic Habitat:
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
                  onClick={() => setShowNewSiteModal(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 hover:bg-ocean-750 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Register Site</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
