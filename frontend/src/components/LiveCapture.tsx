/**
 * Live Capture Component
 * ========================
 * Implements live camera capture using getUserMedia().
 * Features:
 * - Live video feed from user's camera
 * - Gallery uploads disabled (camera only)
 * - Verification code overlay
 * - Timestamp validation
 * - Guided capture for expensive products
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Video, StopCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface LiveCaptureProps {
  verificationCode: string;
  isExpensive: boolean;
  onCapture: (imageHash: string, timestamp: string) => void;
}

export default function LiveCapture({ verificationCode, isExpensive, onCapture }: LiveCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidanceStep, setGuidanceStep] = useState(0);

  const guidanceSteps = [
    'Show the front of the product clearly',
    'Rotate to show the back/bottom',
    'Show any areas of damage or wear',
    'Show the verification code on screen',
  ];

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions to continue.');
      console.error('Camera error:', err);
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    // Generate a simulated image hash
    const imageData = canvas.toDataURL('image/jpeg', 0.5);
    const hash = btoa(imageData.slice(0, 50)).slice(0, 16);
    const timestamp = new Date().toISOString();

    setCaptured(true);
    onCapture(hash, timestamp);

    // If expensive product, advance guidance
    if (isExpensive) {
      setGuidanceStep(prev => Math.min(prev + 1, guidanceSteps.length - 1));
    }
  }, [onCapture, isExpensive, guidanceSteps.length]);

  // Simulate video recording for expensive items
  const toggleRecording = useCallback(() => {
    setRecording(prev => !prev);
    if (!recording) {
      // Auto-advance guidance steps
      const interval = setInterval(() => {
        setGuidanceStep(prev => {
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
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="space-y-4">
      {/* Camera View */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!streaming ? 'hidden' : ''}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Verification Code Overlay */}
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

        {/* Captured overlay */}
        {captured && !streaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-900/30">
            <CheckCircle className="h-16 w-16 text-green-400" />
          </div>
        )}

        {/* Camera placeholder */}
        {!streaming && !captured && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Camera className="h-12 w-12 mb-2" />
            <p className="text-sm">Click "Start Camera" to begin live capture</p>
            <p className="text-xs text-gray-500 mt-1">Gallery uploads are disabled for verification</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Guidance for expensive products */}
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
      <div className="flex gap-3">
        {!streaming ? (
          <button onClick={startCamera} className="btn-primary flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Start Camera
          </button>
        ) : (
          <>
            <button onClick={capturePhoto} className="btn-primary flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Capture Photo
            </button>
            {isExpensive && (
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-colors ${
                  recording ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {recording ? <StopCircle className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                {recording ? 'Stop' : 'Record Video'}
              </button>
            )}
            <button onClick={stopCamera} className="btn-secondary">
              Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
}
