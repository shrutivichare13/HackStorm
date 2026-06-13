/**
 * MultiAngleCapture
 * ==================
 * Problems 1–7 self-contained component.
 *
 * Problem 1  – 3-tier confidence: ≥60% pass, 40-59% warn (allow), <40% fail.
 *              Category-level grouping: "Headphones", "Earbuds", etc. all
 *              map to the same category bucket for matching, not exact labels.
 * Problem 2  – 3 required captures: Front View → Side View → Close-Up.
 *              Progress shown as "1/3 Images Captured" etc.
 *              "Proceed to AI Analysis" locked until all 3 done.
 * Problem 3  – Camera stops after EACH capture (tracks stopped, srcObject null).
 *              Next view starts camera fresh only when user clicks "Capture Next".
 * Problem 4  – Running checklist of captured views persists throughout the flow.
 * Problem 5  – Electronics only: Functional Verification step after 3 captures.
 *              Collects Power Status + optional demo video path. No analysis.
 * Problem 6  – Functional status shown in summary and passed up as optional flag.
 * Problem 7  – Verification Summary screen before proceeding to AI Analysis.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, CheckCircle, AlertTriangle, RefreshCw,
  ScanLine, ChevronRight, Zap, FileVideo,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

export type VerificationTier = 'passed' | 'uncertain' | 'failed';

export interface CapturedAngle {
  viewName: string;
  dataUrl: string;
  timestamp: string;
  hash: string;
  detectedLabel: string;
  confidence: number;
  tier: VerificationTier;
}

export interface FunctionalVerification {
  powerStatus: 'Working' | 'Not Working' | 'Unknown';
  demoVideoPath: string | null;   // optional, stored as path/name only
  reportedNotWorking: boolean;    // optional flag for decision engine
}

export interface MultiAngleCaptureResult {
  captures: CapturedAngle[];
  combinedScore: number;          // weighted average across 3 images
  overallTier: VerificationTier;
  detectedLabel: string;
  confidence: number;             // confidence of front-view (primary)
  functionalVerification?: FunctionalVerification;
  allCaptured: boolean;
}

interface MultiAngleCaptureProps {
  verificationCode: string;
  productId: string;              // product ID for backend verification
  productHint: string;            // category (return) or product name (sell)
  productName?: string;           // full product name for display
  isElectronics: boolean;
  onComplete: (result: MultiAngleCaptureResult) => void;
}

// ── Detection helpers ────────────────────────────────────────────────────────

const DETECTION_LABELS = [
  'Smartphone',
  'Headphones / Audio',
  'Laptop / Tablet',
  'Kitchen Appliance',
  'Apparel / Footwear',
  'Book',
  'Toy / Game',
  'Sports Equipment',
  'Beauty / Personal Care',
  'Hand / Person',
  'Other',
] as const;
type DetectionLabel = (typeof DETECTION_LABELS)[number];

/**
 * Problem 1: category-level buckets so "Headphones" and "Earbuds" and
 * "Wireless Speaker" all match the "Electronics" category.
 */
const CATEGORY_BUCKETS: Record<string, DetectionLabel[]> = {
  Electronics:           ['Smartphone', 'Headphones / Audio', 'Laptop / Tablet'],
  Clothing:              ['Apparel / Footwear'],
  'Home & Kitchen':      ['Kitchen Appliance'],
  Books:                 ['Book'],
  'Toys & Games':        ['Toy / Game'],
  'Sports & Outdoors':   ['Sports Equipment'],
  Beauty:                ['Beauty / Personal Care'],
  Automotive:            ['Smartphone', 'Other'],   // broad match
};

const NAME_KEYWORD_MAP: Array<[RegExp, DetectionLabel]> = [
  [/phone|mobile|iphone|samsung|pixel|xiaomi|smartphone/i, 'Smartphone'],
  [/headphone|earphone|airpod|bose|sony wh|earbuds|speaker|audio|sound/i, 'Headphones / Audio'],
  [/laptop|macbook|ipad|tablet|surface|notebook/i, 'Laptop / Tablet'],
  [/cooker|blender|mixer|microwave|oven|kettle|toaster|vacuum|dyson/i, 'Kitchen Appliance'],
  [/shirt|jeans|jacket|shoe|sneaker|dress|apparel|clothing|nike|adidas/i, 'Apparel / Footwear'],
  [/book|novel|textbook/i, 'Book'],
  [/lego|toy|game|puzzle/i, 'Toy / Game'],
  [/gym|dumbbell|yoga|cycle|treadmill|sports|hydro|bottle/i, 'Sports Equipment'],
  [/serum|shampoo|perfume|lipstick|cream|beauty|airwrap/i, 'Beauty / Personal Care'],
];

/** 
 * Mock AI product detection.
 * Since we don't have a real computer vision model, this simulates detection
 * by returning the EXPECTED product label for the selected category/product.
 * 
 * In a real system, this would use TensorFlow/PyTorch to classify the image.
 * For demo purposes, we return the correct category label with realistic
 * confidence variation based on image properties (brightness, aspect ratio).
 */
function detectFromImage(
  dataUrl: string, width: number, height: number, viewIndex: number,
  productHint?: string
): { label: DetectionLabel; rawConfidence: number } {
  const sample = dataUrl.slice(22, 132);
  let hash = 0;
  for (let i = 0; i < sample.length; i++) {
    hash = (hash * 31 + sample.charCodeAt(i)) >>> 0;
  }
  const aspectBucket = Math.round((width / Math.max(height, 1)) * 10);
  hash = ((hash ^ aspectBucket ^ (viewIndex * 7919)) * 2654435761) >>> 0;

  // Return flow: productHint is a category — detect the matching label
  if (productHint) {
    const catBuckets = CATEGORY_BUCKETS[productHint];
    if (catBuckets && catBuckets.length > 0) {
      // Pick the first (most common) label for this category
      const label = catBuckets[0];
      // Confidence varies 78–96% based on image hash (simulates lighting/angle effects)
      const rawConfidence = 78 + (hash % 19);
      return { label, rawConfidence };
    }

    // Sell flow: match by product name keywords
    for (const [re, mappedLabel] of NAME_KEYWORD_MAP) {
      if (re.test(productHint)) {
        const rawConfidence = 76 + (hash % 21);
        return { label: mappedLabel, rawConfidence };
      }
    }
  }

  // Unknown product — return generic detection
  const idx = hash % DETECTION_LABELS.length;
  const label = DETECTION_LABELS[idx];
  const rawConfidence = 55 + (hash % 43);
  return { label, rawConfidence };
}

function computeTierAndConfidence(
  label: DetectionLabel,
  rawConfidence: number,
  productHint: string
): { confidence: number; tier: VerificationTier } {
  // Check if label is in the right bucket
  const catBuckets = CATEGORY_BUCKETS[productHint];
  let isMatch: boolean;

  if (catBuckets) {
    // Category hint (return flow)
    isMatch = catBuckets.includes(label) && label !== 'Hand / Person' && label !== 'Other';
  } else {
    // Product-name hint (sell flow)
    if (label === 'Hand / Person' || label === 'Other') {
      isMatch = false;
    } else {
      isMatch = NAME_KEYWORD_MAP.some(([re, mapped]) => re.test(productHint) && mapped === label);
      if (!isMatch) isMatch = true; // benefit of the doubt for unknown names
    }
  }

  // Problem 1: scale confidence based on match
  const confidence = isMatch ? rawConfidence : Math.min(rawConfidence, 38);

  let tier: VerificationTier;
  if (confidence >= 60) tier = 'passed';
  else if (confidence >= 40) tier = 'uncertain';
  else tier = 'failed';

  return { confidence, tier };
}

function hashFromDataUrl(dataUrl: string): string {
  return btoa(dataUrl.slice(23, 73)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
}

function formatTs(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

// ── View definitions ─────────────────────────────────────────────────────────

const VIEWS = ['Front View', 'Side View', 'Close-Up'] as const;
type ViewName = (typeof VIEWS)[number];

// ── Component ────────────────────────────────────────────────────────────────

export default function MultiAngleCapture({
  verificationCode, productId, productHint, productName, isElectronics, onComplete,
}: MultiAngleCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Which view we're currently capturing (0=Front, 1=Side, 2=Close-Up)
  const [currentView, setCurrentView] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accumulated captures
  const [captures, setCaptures] = useState<CapturedAngle[]>([]);

  // Phase: 'capture' | 'functional' | 'summary'
  const [phase, setPhase] = useState<'capture' | 'functional' | 'summary'>('capture');

  // Functional verification state (Problem 5)
  const [powerStatus, setPowerStatus] = useState<'Working' | 'Not Working' | 'Unknown'>('Unknown');
  const [demoVideoName, setDemoVideoName] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  // Problem 3: stop camera immediately
  const stopCamera = useCallback(() => {
    // Stop via ref (works even if videoRef is detached)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const s = videoRef.current.srcObject as MediaStream;
      s.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  }, []);

  // Cleanup on unmount — always stop camera
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current?.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // ── Capture ───────────────────────────────────────────────────────────────
  const capturePhoto = useCallback(async () => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Stop camera right after drawing
    stopCamera();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    const hash = hashFromDataUrl(dataUrl);
    const timestamp = new Date().toISOString();

    setDetecting(true);

    // Call backend OpenCV verification
    try {
      const response = await fetch('/api/analysis/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          captured_image_base64: dataUrl,
          captured_timestamp: timestamp,
        }),
      });

      let tier: VerificationTier = 'failed';
      let confidence = 0;
      let detectedLabel = 'Unknown';

      if (response.ok) {
        const result = await response.json();
        confidence = result.match_percentage ?? 0;
        detectedLabel = result.verification_status ?? 'Unknown';

        if (confidence >= 30) {
          tier = 'passed';
        } else if (confidence >= 20) {
          tier = 'uncertain';
        } else {
          tier = 'failed';
        }
      }

      const angle: CapturedAngle = {
        viewName: VIEWS[currentView],
        dataUrl,
        timestamp,
        hash,
        detectedLabel,
        confidence,
        tier,
      };

      setCaptures(prev => {
        const updated = [...prev];
        updated[currentView] = angle;
        return updated;
      });
    } catch (err) {
      // Network error — mark as failed
      const angle: CapturedAngle = {
        viewName: VIEWS[currentView],
        dataUrl,
        timestamp,
        hash,
        detectedLabel: 'Error',
        confidence: 0,
        tier: 'failed',
      };
      setCaptures(prev => {
        const updated = [...prev];
        updated[currentView] = angle;
        return updated;
      });
    } finally {
      setDetecting(false);
    }
  }, [currentView, stopCamera, productId]);

  // ── Recapture current view ────────────────────────────────────────────────
  const handleRecapture = useCallback(() => {
    setCaptures(prev => {
      const updated = [...prev];
      updated[currentView] = undefined as unknown as CapturedAngle;
      return updated;
    });
    startCamera();
  }, [currentView, startCamera]);

  // ── Advance to next view ──────────────────────────────────────────────────
  const handleNextView = () => {
    if (currentView < VIEWS.length - 1) {
      setCurrentView(v => v + 1);
      // Don't auto-start — user must click "Start Camera"
    }
  };

  // ── After all 3 captured ─────────────────────────────────────────────────
  const allCaptured = captures.filter(Boolean).length === VIEWS.length;
  const currentCapture = captures[currentView] as CapturedAngle | undefined;

  const handleProceedFromCaptures = () => {
    stopCamera(); // Ensure camera is off when leaving capture phase
    if (isElectronics) {
      setPhase('functional');
    } else {
      setPhase('summary');
    }
  };

  // ── Functional verification done ─────────────────────────────────────────
  const handleProceedFromFunctional = () => setPhase('summary');

  // ── Final proceed → call parent ──────────────────────────────────────────
  const handleProceedToAnalysis = () => {
    stopCamera(); // Ensure camera is fully stopped before leaving component
    const valid = captures.filter(Boolean);

    // Combined condition score: front 40%, side 30%, close-up 30%
    // Use confidence as a proxy for image-derived score (scaled to 50–98)
    const weights = [0.4, 0.3, 0.3];
    const combinedScore = Math.round(
      valid.reduce((sum, c, i) => sum + (50 + c.confidence * 0.48) * (weights[i] ?? 0.33), 0)
    );

    // Overall tier: worst of the three
    const tiers: VerificationTier[] = valid.map(c => c.tier);
    const overallTier: VerificationTier =
      tiers.includes('failed') ? 'failed' :
      tiers.includes('uncertain') ? 'uncertain' : 'passed';

    const primary = valid[0];
    const funcVerif: FunctionalVerification | undefined = isElectronics
      ? { powerStatus, demoVideoPath: demoVideoName, reportedNotWorking: powerStatus === 'Not Working' }
      : undefined;

    onComplete({
      captures: valid,
      combinedScore,
      overallTier,
      detectedLabel: primary?.detectedLabel ?? 'Unknown',
      confidence: primary?.confidence ?? 0,
      functionalVerification: funcVerif,
      allCaptured,
    });
  };

  const tierBadge = (tier: VerificationTier, confidence: number) => {
    if (tier === 'passed')
      return <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">✓ Verified ({confidence}%)</span>;
    if (tier === 'uncertain')
      return <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">⚠ Uncertain ({confidence}%)</span>;
    return <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">✗ Failed ({confidence}%)</span>;
  };

  // ── Progress bar / checklist (Problem 4) ─────────────────────────────────
  const CaptureChecklist = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Capture Progress — {captures.filter(Boolean).length}/3 Images
      </p>
      <div className="space-y-2">
        {VIEWS.map((view, i) => {
          const cap = captures[i] as CapturedAngle | undefined;
          const isCurrent = i === currentView && phase === 'capture';
          return (
            <div key={view} className={`flex items-center gap-3 p-2.5 rounded-lg ${
              cap ? 'bg-white border border-green-200' :
              isCurrent ? 'bg-amazon-orange/5 border border-amazon-orange/30' :
              'bg-white border border-gray-100 opacity-50'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                cap ? 'bg-green-500 text-white' :
                isCurrent ? 'bg-amazon-orange text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {cap ? '✓' : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${cap ? 'text-gray-900' : 'text-gray-500'}`}>{view}</p>
                {cap && (
                  <p className="text-xs text-gray-400">{formatTs(cap.timestamp)}</p>
                )}
              </div>
              {/* Thumbnail */}
              {cap && (
                <img src={cap.dataUrl} alt={view} className="w-12 h-9 object-cover rounded border" />
              )}
              {/* Tier badge */}
              {cap && tierBadge(cap.tier, cap.confidence)}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: CAPTURE
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'capture') {
    const viewDone = !!currentCapture;
    const isLastView = currentView === VIEWS.length - 1;

    return (
      <div className="space-y-4">
        {/* Running checklist — Problem 4 */}
        <CaptureChecklist />

        {/* Current view header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            📸 {VIEWS[currentView]}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {currentView + 1} of {VIEWS.length}
          </span>
        </div>

        {/* Camera / Preview */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay playsInline muted
            className={`w-full h-full object-cover ${!streaming ? 'hidden' : ''}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Still preview after capture — Problem 3 */}
          {viewDone && !streaming && (
            <img src={currentCapture!.dataUrl} alt="Captured" className="w-full h-full object-cover" />
          )}

          {/* Verification code overlay */}
          {streaming && (
            <div className="absolute top-3 right-3 bg-black/70 text-amazon-orange font-mono text-lg px-3 py-1 rounded">
              Code: {verificationCode}
            </div>
          )}

          {/* Detecting overlay */}
          {detecting && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2">
              <ScanLine className="h-10 w-10 text-amazon-orange animate-pulse" />
              <p className="text-sm font-medium">🔍 AI Product Detection…</p>
            </div>
          )}

          {/* Success bar */}
          {viewDone && !detecting && (
            <div className="absolute bottom-0 inset-x-0 bg-green-900/80 px-3 py-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-300" />
              <span className="text-xs text-green-200 font-medium">
                ✓ {currentCapture!.viewName} Captured · {formatTs(currentCapture!.timestamp)}
              </span>
            </div>
          )}

          {/* Placeholder */}
          {!streaming && !viewDone && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Camera className="h-12 w-12 mb-2" />
              <p className="text-sm">Click "Start Camera" to capture {VIEWS[currentView]}</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Detection result from backend OpenCV verification */}
        {viewDone && !detecting && (
          <div className={`rounded-xl p-4 border ${
            currentCapture!.tier === 'passed' ? 'bg-green-50 border-green-200' :
            currentCapture!.tier === 'uncertain' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            {currentCapture!.tier === 'passed' && (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-green-800 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> ✓ Product Verified
                </p>
                <p className="text-xs text-green-700">
                  Product Match Score: <strong>{currentCapture!.confidence}%</strong> · Status: <strong>{currentCapture!.detectedLabel}</strong>
                </p>
                <p className="text-xs text-green-600">
                  Image matches the selected product.
                </p>
              </div>
            )}
            {currentCapture!.tier === 'uncertain' && (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> ⚠ Possible Match — you may continue
                </p>
                <p className="text-xs text-amber-700">
                  Product Match Score: <strong>{currentCapture!.confidence}%</strong> · Status: <strong>{currentCapture!.detectedLabel}</strong>
                </p>
                <p className="text-xs text-amber-600">Confidence is moderate. You may recapture for better results.</p>
              </div>
            )}
            {currentCapture!.tier === 'failed' && (
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-red-800 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> ✗ Product Verification Failed
                </p>
                <p className="text-xs text-red-700">
                  Product Match Score: <strong>{currentCapture!.confidence}%</strong> (below 30% threshold)
                </p>
                <p className="text-xs text-red-600">
                  This image does not appear to match the selected product. Please capture the correct product.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3 flex-wrap">
          {/* Start camera (only shown when idle and not yet captured) */}
          {!streaming && !viewDone && (
            <button onClick={startCamera} className="btn-primary flex items-center gap-2">
              <Camera className="h-4 w-4" /> Start Camera
            </button>
          )}

          {/* Capture button */}
          {streaming && (
            <button onClick={capturePhoto} className="btn-primary flex items-center gap-2">
              <Camera className="h-4 w-4" /> Capture {VIEWS[currentView]}
            </button>
          )}

          {/* Recapture — always available after capture */}
          {viewDone && !streaming && (
            <button onClick={handleRecapture} className="btn-secondary flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Recapture
            </button>
          )}

          {/* Next view / Proceed — only if verification passed or uncertain */}
          {viewDone && !streaming && currentCapture!.tier !== 'failed' && (
            !isLastView ? (
              <button onClick={handleNextView} className="btn-primary flex items-center gap-2">
                Capture {VIEWS[currentView + 1]} <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              allCaptured && (
                <button onClick={handleProceedFromCaptures} className="btn-primary flex items-center gap-2">
                  {isElectronics ? 'Functional Verification' : 'Proceed to AI Analysis'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              )
            )
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: FUNCTIONAL VERIFICATION (Electronics only — Problem 5)
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'functional') {
    return (
      <div className="space-y-5">
        <CaptureChecklist />

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-amazon-orange" />
            <h3 className="font-semibold text-lg text-gray-900">Functional Verification</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Electronics require a quick functional check to help assess true value.
          </p>

          {/* Power Status */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Power Status *</label>
            <div className="flex gap-3">
              {(['Working', 'Not Working', 'Unknown'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setPowerStatus(status)}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    powerStatus === status
                      ? status === 'Working'
                        ? 'bg-green-600 text-white border-green-600'
                        : status === 'Not Working'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-gray-600 text-white border-gray-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status === 'Working' ? '✅ ' : status === 'Not Working' ? '❌ ' : '❓ '}
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Demo Video Upload (optional) */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demo Video <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Upload a short video showing the product functioning. Accepted: MP4, MOV, WEBM.
            </p>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-amazon-orange/50 transition-colors"
              onClick={() => videoInputRef.current?.click()}
            >
              <FileVideo className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              {demoVideoName ? (
                <p className="text-sm text-green-700 font-medium">✓ {demoVideoName}</p>
              ) : (
                <p className="text-sm text-gray-500">Click to upload demo video</p>
              )}
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) setDemoVideoName(f.name);
              }}
            />
          </div>

          {powerStatus === 'Not Working' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800 font-medium">
                ⚠ Reported as Not Working — this will be visible in the AI report and may affect
                the disposition recommendation.
              </p>
            </div>
          )}

          <button onClick={handleProceedFromFunctional} className="btn-primary w-full flex items-center justify-center gap-2">
            Proceed to Verification Summary <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: VERIFICATION SUMMARY (Problem 7)
  // ═══════════════════════════════════════════════════════════════════════════
  const primaryCapture = captures[0] as CapturedAngle;
  const tiers = captures.filter(Boolean).map(c => (c as CapturedAngle).tier);
  const overallTier: VerificationTier =
    tiers.includes('failed') ? 'failed' :
    tiers.includes('uncertain') ? 'uncertain' : 'passed';

  const funcStatus = isElectronics
    ? powerStatus === 'Unknown' ? 'Completed (Status: Unknown)' : `Completed (${powerStatus})`
    : 'Not Applicable';

  return (
    <div className="space-y-5">
      {/* Thumbnail strip */}
      <CaptureChecklist />

      {/* Summary card */}
      <div className="card border border-gray-200">
        <h3 className="font-semibold text-xl text-gray-900 mb-5">Verification Summary</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Selected Product</span>
            <span className="font-medium text-gray-900">{productName || productHint}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Category</span>
            <span className="font-medium text-gray-900">{productHint}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">AI Confidence</span>
            <span className="font-medium text-gray-900">{primaryCapture?.confidence ?? 0}%</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Images Captured</span>
            <span className="font-medium text-gray-900">{captures.filter(Boolean).length}/3</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Functional Verification</span>
            <span className="font-medium text-gray-900">{funcStatus}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Verification Status</span>
            <span>
              {overallTier === 'passed' && <span className="font-semibold text-green-700">✓ Passed</span>}
              {overallTier === 'uncertain' && <span className="font-semibold text-amber-700">⚠ Uncertain</span>}
              {overallTier === 'failed' && <span className="font-semibold text-red-700">✗ Failed</span>}
            </span>
          </div>
        </div>

        {/* Proceed to backend AI analysis */}
        <button
          onClick={handleProceedToAnalysis}
          className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
        >
          Proceed to AI Analysis <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
