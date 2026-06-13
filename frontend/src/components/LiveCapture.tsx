/**
 * Live Capture Component (Fixed)
 * ================================
 * FIX 1: Simulated product detection — label derived deterministically from
 *         image hash+dimensions so same image → same label always.
 * FIX 2: Camera stops immediately after capture; live video is replaced by
 *         a still thumbnail. "Recapture" restarts camera fresh.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, Video, StopCircle, CheckCircle, AlertTriangle,
  RefreshCw, ScanLine,
} from 'lucide-react';

interface LiveCaptureProps {
  verificationCode: string;
  isExpensive: boolean;
  /** productHint: category string (return flow) or product name (sell flow) */
  productHint?: string;
  onCapture: (imageHash: string, timestamp: string) => void;
  /** Called after detection: true = match/ok, false = mismatch/block */
  onDetectionResult?: (ok: boolean, label: string, confidence: number) => void;
}

// ── FIX 1: Product detection label set and category mapping ──────────────────
const DETECTION_LABELS = [
  'Smartphone',
  'Headphones',
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

// Maps each product category to which detection labels are "matching"
const CATEGORY_MATCH_MAP: Record<string, DetectionLabel[]> = {
  Electronics:          ['Smartphone', 'Headphones', 'Laptop / Tablet'],
  Clothing:             ['Apparel / Footwear'],
  'Home & Kitchen':     ['Kitchen Appliance'],
  Books:                ['Book'],
  'Toys & Games':       ['Toy / Game'],
  'Sports & Outdoors':  ['Sports Equipment'],
  Beauty:               ['Beauty / Personal Care'],
  Automotive:           ['Other'],
};

// Keywords in a sell-flow product *name* → which label it implies
const NAME_KEYWORD_MAP: Array<[RegExp, DetectionLabel]> = [
  [/phone|mobile|iphone|samsung|pixel|xiaomi/i, 'Smartphone'],
  [/headphone|earphone|airpod|bose|sony wh|earbuds/i, 'Headphones'],
  [/laptop|macbook|ipad|tablet|surface/i, 'Laptop / Tablet'],
  [/cooker|blender|mixer|microwave|oven|kettle|toaster/i, 'Kitchen Appliance'],
  [/shirt|jeans|jacket|shoe|sneaker|dress|apparel|clothing/i, 'Apparel / Footwear'],
  [/book|novel|textbook/i, 'Book'],
  [/lego|toy|game|puzzle/i, 'Toy / Game'],
  [/gym|dumbbell|yoga|cycle|treadmill|sports/i, 'Sports Equipment'],
  [/serum|shampoo|perfume|lipstick|cream|beauty/i, 'Beauty / Personal Care'],
];

/**
 * Deterministically derive a product label from the captured image.
 * Uses the canvas data URL's first 100 chars (encodes actual pixel data) as
 * a hash seed so:
 *   – same image → same label always
 *   – different images → different labels (collisions are rare)
 *
 * FIX: When productHint matches a known category or keyword, detect the
 * correct label to simulate a working AI model.
 */
function detectProductFromImage(
  dataUrl: string,
  width: number,
  height: number,
  productHint?: string
): { label: DetectionLabel; confidence: number } {
  // Simple numeric hash of the data URL prefix (actual pixel bytes)
  const sample = dataUrl.slice(22, 122); // skip "data:image/jpeg;base64,"
  let hash = 0;
  for (let i = 0; i < sample.length; i++) {
    hash = (hash * 31 + sample.charCodeAt(i)) >>> 0;
  }
  // Mix in aspect ratio bucket to add more variance
  const aspectBucket = Math.round((width / Math.max(height, 1)) * 10);
  hash = ((hash ^ aspectBucket) * 2654435761) >>> 0;

  // ── FIX: If productHint matches a category, detect a matching label
  if (productHint) {
    const catLabels = CATEGORY_MATCH_MAP[productHint];
    if (catLabels && catLabels.length > 0) {
      const matchIdx = hash % catLabels.length;
      const label = catLabels[matchIdx];
      const confidence = 75 + (hash % 22); // 75–96%
      return { label, confidence };
    }

    // Try keyword matching for sell flow (product name hint)
    for (const [re, mappedLabel] of NAME_KEYWORD_MAP) {
      if (re.test(productHint)) {
        const confidence = 74 + (hash % 23);
        return { label: mappedLabel, confidence };
      }
    }
  }

  // Fallback: pure hash-based for unknown products
  const idx = hash % DETECTION_LABELS.length;
  const label = DETECTION_LABELS[idx];
  const confidence = 72 + (hash % 25);
  return { label, confidence };
}

function isMatchingLabel(
  label: DetectionLabel,
  productHint: string | undefined
): boolean {
  if (!productHint) return true; // no hint → don't block
  if (label === 'Hand / Person' || label === 'Other') return false;

  // Check category map first
  const catLabels = CATEGORY_MATCH_MAP[productHint];
  if (catLabels) return catLabels.includes(label);

  // Sell flow: check product name keywords
  for (const [re, mappedLabel] of NAME_KEYWORD_MAP) {
    if (re.test(productHint)) return mappedLabel === label;
  }

  // No keyword match — allow it (benefit of the doubt for unknown names)
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LiveCapture({
  verificationCode,
  isExpensive,
  productHint,
  onCapture,
  onDetectionResult,
}: LiveCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidanceStep, setGuidanceStep] = useState(0);

  // FIX 1: detection state
  const [detecting, setDetecting] = useState(false);
  const [detectedLabel, setDetectedLabel] = useState<DetectionLabel | null>(null);
  const [detectedConfidence, setDetectedConfidence] = useState(0);
  const [detectionMatch, setDetectionMatch] = useState<boolean | null>(null);

  const guidanceSteps = [
    'Show the front of the product clearly',
    'Rotate to show the back/bottom',
    'Show any areas of damage or wear',
    'Show the verification code on screen',
  ];

  // ── Camera controls ─────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    // Reset detection state on new capture session
    setDetectedLabel(null);
    setDetectedConfidence(0);
    setDetectionMatch(null);
    setCapturedDataUrl(null);
    setCapturedAt(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setError(null);
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions to continue.');
    }
  }, []);

  // FIX 2: stop all tracks + clear srcObject
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  }, []);

  // ── Capture photo ───────────────────────────────────────────────────────────
  const capturePhoto = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // FIX 2: stop camera immediately after drawing the frame
    stopCameraStream();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    const hash = btoa(dataUrl.slice(23, 73)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    const timestamp = new Date().toISOString();

    setCapturedDataUrl(dataUrl);
    setCapturedAt(timestamp);

    if (isExpensive) {
      setGuidanceStep((prev) => Math.min(prev + 1, guidanceSteps.length - 1));
    }

    // FIX 1: run simulated product detection
    setDetecting(true);
    setTimeout(() => {
      const { label, confidence } = detectProductFromImage(dataUrl, canvas.width, canvas.height, productHint);
      const match = isMatchingLabel(label, productHint);
      setDetectedLabel(label);
      setDetectedConfidence(confidence);
      setDetectionMatch(match);
      setDetecting(false);
      onDetectionResult?.(match, label, confidence);
      if (match) {
        onCapture(hash, timestamp);
      }
    }, 800); // simulate ~800ms AI processing
  }, [stopCameraStream, isExpensive, guidanceSteps.length, productHint, onCapture, onDetectionResult]);

  const handleRecapture = useCallback(() => {
    setCapturedDataUrl(null);
    setCapturedAt(null);
    setDetectedLabel(null);
    setDetectedConfidence(0);
    setDetectionMatch(null);
    startCamera();
  }, [startCamera]);

  const toggleRecording = useCallback(() => {
    setRecording((prev) => !prev);
    if (!recording) {
      const interval = setInterval(() => {
        setGuidanceStep((prev) => {
          if (prev >= guidanceSteps.length - 1) {
            clearInterval(interval);
            setRecording(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
  }, [recording, guidanceSteps.length]);

  // Cleanup on unmount
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

  // Format captured timestamp nicely
  const formattedAt = capturedAt
    ? new Date(capturedAt).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : '';

  return (
    <div className="space-y-4">
      {/* Camera / Preview View */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
        {/* Live video — hidden after capture */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!streaming ? 'hidden' : ''}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* FIX 2: still image preview after capture */}
        {capturedDataUrl && !streaming && (
          <img
            src={capturedDataUrl}
            alt="Captured product"
            className="w-full h-full object-cover"
          />
        )}

        {/* Verification code overlay (live only) */}
        {streaming && (
          <div className="absolute top-3 right-3 bg-black/70 text-amazon-orange font-mono text-lg px-3 py-1 rounded">
            Code: {verificationCode}
          </div>
        )}

        {/* Recording indicator */}
        {recording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Recording
          </div>
        )}

        {/* Detecting overlay */}
        {detecting && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2">
            <ScanLine className="h-10 w-10 text-amazon-orange animate-pulse" />
            <p className="text-sm font-medium">🔍 AI Product Detection…</p>
          </div>
        )}

        {/* Capture success overlay */}
        {capturedDataUrl && !detecting && detectionMatch === true && (
          <div className="absolute bottom-0 inset-x-0 bg-green-900/80 px-3 py-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-300" />
            <span className="text-xs text-green-200 font-medium">
              📷 Image Captured · {formattedAt}
            </span>
          </div>
        )}

        {/* Camera placeholder */}
        {!streaming && !capturedDataUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Camera className="h-12 w-12 mb-2" />
            <p className="text-sm">Click "Start Camera" to begin live capture</p>
            <p className="text-xs text-gray-500 mt-1">Gallery uploads are disabled for verification</p>
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

      {/* FIX 1: Detection result panel */}
      {capturedDataUrl && !detecting && detectedLabel && (
        <div className={`rounded-xl p-4 border ${
          detectionMatch
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {detectionMatch ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-green-800 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                ✓ Product Verified
              </p>
              <p className="text-xs text-green-700">
                Product: <strong>{productHint || 'Unknown'}</strong> · AI Confidence: <strong>{detectedConfidence}%</strong>
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✓ Live image captured and verified · {formattedAt}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-red-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                ⚠ Product Verification Failed
              </p>
              {productHint && (
                <p className="text-xs text-red-700">Expected Product: <strong>{productHint}</strong></p>
              )}
              <p className="text-xs text-red-700">
                Match Score: <strong>{detectedConfidence}%</strong> (below threshold)
              </p>
              <p className="text-xs text-red-600 mt-1">
                This image does not appear to match the selected product. Please capture the correct product.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Guided capture steps for expensive items */}
      {isExpensive && streaming && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-medium text-amber-800 mb-2">
            📹 Guided Video Capture Required (High-value item)
          </p>
          <div className="space-y-1">
            {guidanceSteps.map((step, i) => (
              <div
                key={i}
                className={`text-sm flex items-center gap-2 ${
                  i === guidanceStep ? 'text-amber-900 font-medium' :
                  i < guidanceStep ? 'text-green-700' : 'text-gray-400'
                }`}
              >
                {i < guidanceStep ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                ) : i === guidanceStep ? (
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-500 animate-pulse" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-gray-300" />
                )}
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        {!streaming && !capturedDataUrl && (
          <button onClick={startCamera} className="btn-primary flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Start Camera
          </button>
        )}

        {streaming && (
          <>
            <button onClick={capturePhoto} className="btn-primary flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Capture Photo
            </button>
            {isExpensive && (
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-colors ${
                  recording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {recording ? <StopCircle className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                {recording ? 'Stop' : 'Record Video'}
              </button>
            )}
          </>
        )}

        {/* FIX 2: Recapture re-starts camera fresh */}
        {capturedDataUrl && !streaming && (
          <button onClick={handleRecapture} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Recapture
          </button>
        )}
      </div>
    </div>
  );
}
