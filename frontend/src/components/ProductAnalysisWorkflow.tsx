/**
 * Product Analysis Workflow Component
 * =====================================
 * Visual workflow for the enhanced AI Product Analysis pipeline:
 *   Step 1: Product Verification
 *   Step 2: Condition Analysis
 *   Step 3: AI Results
 *
 * Shows progress indicators, step status badges, and detailed results.
 * Amazon-style design with reusable sub-components.
 */

import { useState, useCallback } from 'react';
import {
  CheckCircle, XCircle, AlertTriangle, Loader2,
  ShieldCheck, Search, BarChart3, Brain, ChevronRight,
} from 'lucide-react';
import ConditionScore from './ConditionScore';
import GradeBadge from './GradeBadge';

// ── Types ────────────────────────────────────────────────────────────────────

interface VerificationDetails {
  title_similarity: number;
  category_match: boolean;
  visual_similarity: number;
  catalog_image_compared: boolean;
  live_image_analyzed: boolean;
}

interface VerificationResult {
  product_id: string;
  product_name: string;
  product_category: string;
  match_percentage: number;
  verification_status: string;
  passed: boolean;
  details: VerificationDetails;
  timestamp: string;
}

interface DetectedIssue {
  issue: string;
  severity: string;
  confidence: number;
  subcategory?: string;
}

interface ConditionAnalysis {
  category: string;
  product_name: string;
  physical_condition: { issues_found: DetectedIssue[]; count: number };
  accessory_condition: { issues_found: DetectedIssue[]; count: number };
  functional_condition: { issues_found: DetectedIssue[]; count: number };
  subcategory_inspection: { issues_found: DetectedIssue[]; count: number };
  packaging: { condition: string; original_box: boolean; protective_materials: boolean; seal_intact: boolean };
  total_issues: number;
}

interface ScoringResult {
  condition_score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  condition_label: string;
  total_issues_detected: number;
  detected_issues: string[];
  packaging_condition: string;
  has_original_box: boolean;
}

interface ConfidenceResult {
  ai_confidence: number;
  needs_manual_review: boolean;
  review_message: string;
  confidence_factors: {
    verification_confidence: number;
    analysis_confidence: number;
    consistency_factor: number;
  };
}

interface FullAnalysisResult {
  pipeline_status: 'complete' | 'blocked';
  blocked_at: string | null;
  verification: VerificationResult;
  condition_analysis: ConditionAnalysis | null;
  scoring: ScoringResult | null;
  confidence: ConfidenceResult | null;
  message: string;
  analysis_id: string;
  timestamp: string;
}

interface ProductAnalysisWorkflowProps {
  productId: string;
  productName: string;
  productCategory: string;
  capturedImageBase64: string;  // Full base64 data URL from camera
  capturedTimestamp: string;
  /** Called when analysis completes — parent can use scoring result */
  onAnalysisComplete?: (result: FullAnalysisResult) => void;
  /** Called if verification fails — parent should prompt recapture */
  onVerificationFailed?: (result: FullAnalysisResult) => void;
}

type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'warning';

// ── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step, status, label }: { step: number; status: StepStatus; label: string }) {
  const bgColor = {
    pending: 'bg-gray-200 text-gray-400',
    running: 'bg-amazon-orange text-white animate-pulse',
    success: 'bg-green-500 text-white',
    failed: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
  }[status];

  const icon = {
    pending: <span className="text-xs font-bold">{step}</span>,
    running: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    success: <CheckCircle className="h-3.5 w-3.5" />,
    failed: <XCircle className="h-3.5 w-3.5" />,
    warning: <AlertTriangle className="h-3.5 w-3.5" />,
  }[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${bgColor}`}>
        {icon}
      </div>
      <span className={`text-sm ${status === 'running' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}

function ProgressBar({ steps }: { steps: { label: string; status: StepStatus }[] }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-1">
          <StepIndicator step={i + 1} status={s.status} label={s.label} />
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-1 ${
              s.status === 'success' ? 'bg-green-400' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ProductAnalysisWorkflow({
  productId,
  productName,
  productCategory,
  capturedImageBase64,
  capturedTimestamp,
  onAnalysisComplete,
  onVerificationFailed,
}: ProductAnalysisWorkflowProps) {
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0=not started, 1-3

  const runAnalysis = useCallback(async () => {
    setIsRunning(true);
    setCurrentStep(1);

    try {
      // Simulate step-by-step progression with delays for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(3);

      const response = await fetch('/api/analysis/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          captured_image_base64: capturedImageBase64,
          captured_timestamp: capturedTimestamp,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result: FullAnalysisResult = await response.json();
      setAnalysisResult(result);

      if (result.pipeline_status === 'blocked') {
        onVerificationFailed?.(result);
      } else {
        onAnalysisComplete?.(result);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisResult({
        pipeline_status: 'blocked',
        blocked_at: 'network',
        verification: {} as VerificationResult,
        condition_analysis: null,
        scoring: null,
        confidence: null,
        message: 'Analysis failed. Please try again.',
        analysis_id: '',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsRunning(false);
    }
  }, [productId, capturedImageBase64, capturedTimestamp, onAnalysisComplete, onVerificationFailed]);

  // Derive step statuses
  const getStepStatuses = (): { label: string; status: StepStatus }[] => {
    if (!analysisResult && !isRunning) {
      return [
        { label: 'Product Verification', status: 'pending' },
        { label: 'Condition Analysis', status: 'pending' },
        { label: 'AI Results', status: 'pending' },
      ];
    }
    if (isRunning) {
      return [
        { label: 'Product Verification', status: currentStep >= 1 ? (currentStep > 1 ? 'success' : 'running') : 'pending' },
        { label: 'Condition Analysis', status: currentStep >= 2 ? (currentStep > 2 ? 'success' : 'running') : 'pending' },
        { label: 'AI Results', status: currentStep >= 3 ? 'running' : 'pending' },
      ];
    }
    if (analysisResult) {
      const blocked = analysisResult.pipeline_status === 'blocked';
      if (blocked && analysisResult.blocked_at === 'verification') {
        return [
          { label: 'Product Verification', status: 'failed' },
          { label: 'Condition Analysis', status: 'pending' },
          { label: 'AI Results', status: 'pending' },
        ];
      }
      const confidence = analysisResult.confidence;
      return [
        { label: 'Product Verification', status: 'success' },
        { label: 'Condition Analysis', status: 'success' },
        { label: 'AI Results', status: confidence?.needs_manual_review ? 'warning' : 'success' },
      ];
    }
    return [
      { label: 'Product Verification', status: 'pending' },
      { label: 'Condition Analysis', status: 'pending' },
      { label: 'AI Results', status: 'pending' },
    ];
  };

  return (
    <div className="space-y-5">
      {/* Progress Bar */}
      <ProgressBar steps={getStepStatuses()} />

      {/* Start Button (before analysis) */}
      {!analysisResult && !isRunning && (
        <div className="card text-center py-8">
          <Brain className="h-12 w-12 text-amazon-orange mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Product Analysis
          </h3>
          <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
            Our AI will verify your product, analyze its condition, and generate a detailed
            assessment with confidence scoring.
          </p>
          <button onClick={runAnalysis} className="btn-primary inline-flex items-center gap-2">
            <Search className="h-4 w-4" />
            Start AI Analysis
          </button>
        </div>
      )}

      {/* Running State */}
      {isRunning && (
        <div className="card text-center py-8">
          <Loader2 className="h-10 w-10 text-amazon-orange mx-auto mb-3 animate-spin" />
          <p className="text-sm font-medium text-gray-700">
            {currentStep === 1 && '🔍 Verifying product match...'}
            {currentStep === 2 && '🔬 Analyzing condition...'}
            {currentStep === 3 && '🧠 Computing AI results...'}
          </p>
          <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
        </div>
      )}

      {/* Results */}
      {analysisResult && !isRunning && (
        <div className="space-y-4">
          {/* Verification Result */}
          <VerificationPanel verification={analysisResult.verification} blocked={analysisResult.pipeline_status === 'blocked'} />

          {/* Condition & Scoring (only if not blocked) */}
          {analysisResult.pipeline_status === 'complete' && analysisResult.scoring && (
            <>
              <ConditionPanel
                conditionAnalysis={analysisResult.condition_analysis!}
                scoring={analysisResult.scoring}
              />
              <ConfidencePanel confidence={analysisResult.confidence!} />
            </>
          )}

          {/* Blocked message */}
          {analysisResult.pipeline_status === 'blocked' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Analysis Blocked</p>
                  <p className="text-sm text-red-700 mt-1">{analysisResult.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Badges */}
          {analysisResult.pipeline_status === 'complete' && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex flex-wrap gap-3 items-center justify-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-100 text-green-800 px-3 py-1.5 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" /> Product Verified
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-100 text-green-800 px-3 py-1.5 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" /> Analysis Complete
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-100 text-green-800 px-3 py-1.5 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" /> Recommendation Generated
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ── Verification Panel ───────────────────────────────────────────────────────

function VerificationPanel({ verification, blocked }: { verification: VerificationResult; blocked: boolean }) {
  if (!verification?.match_percentage) return null;

  const matchPct = verification.match_percentage;
  const statusColor = blocked
    ? 'border-red-200 bg-red-50'
    : matchPct >= 85
    ? 'border-green-200 bg-green-50'
    : 'border-amber-200 bg-amber-50';

  return (
    <div className={`rounded-xl border p-4 ${statusColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className={`h-5 w-5 ${blocked ? 'text-red-600' : 'text-green-600'}`} />
        <h4 className="font-semibold text-gray-900">Step 1: Product Verification</h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">{matchPct}%</p>
          <p className="text-xs text-gray-500">Match Score</p>
        </div>
        <div>
          <p className={`text-sm font-semibold ${
            verification.verification_status === 'Verified Match' ? 'text-green-700' :
            verification.verification_status === 'Possible Match' ? 'text-amber-700' :
            'text-red-700'
          }`}>
            {verification.verification_status}
          </p>
          <p className="text-xs text-gray-500">Status</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {verification.details?.title_similarity}%
          </p>
          <p className="text-xs text-gray-500">Title Similarity</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {verification.details?.visual_similarity}%
          </p>
          <p className="text-xs text-gray-500">Visual Similarity</p>
        </div>
      </div>
    </div>
  );
}


// ── Condition Analysis Panel ─────────────────────────────────────────────────

function ConditionPanel({
  conditionAnalysis, scoring,
}: { conditionAnalysis: ConditionAnalysis; scoring: ScoringResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-gray-900">Step 2: Condition Analysis</h4>
      </div>

      {/* Score + Grade */}
      <div className="flex items-center gap-6 mb-4">
        <ConditionScore score={scoring.condition_score} size={90} />
        <div>
          <GradeBadge grade={scoring.grade} size="lg" />
          <p className="text-sm text-gray-600 mt-1">{scoring.condition_label}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {scoring.total_issues_detected} issue{scoring.total_issues_detected !== 1 ? 's' : ''} detected
          </p>
        </div>
      </div>

      {/* Detected Issues */}
      {scoring.detected_issues.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Detected Issues:</p>
          <ul className="space-y-1">
            {scoring.detected_issues.slice(0, expanded ? undefined : 4).map((issue, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
          {scoring.detected_issues.length > 4 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-amazon-teal hover:underline mt-1"
            >
              {expanded ? 'Show less' : `+${scoring.detected_issues.length - 4} more issues`}
            </button>
          )}
        </div>
      )}

      {/* Breakdown cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        <MiniStatCard
          label="Physical"
          count={conditionAnalysis.physical_condition.count}
          color="blue"
        />
        <MiniStatCard
          label="Accessories"
          count={conditionAnalysis.accessory_condition.count}
          color="purple"
        />
        <MiniStatCard
          label="Functional"
          count={conditionAnalysis.functional_condition.count}
          color="amber"
        />
        <MiniStatCard
          label="Packaging"
          count={0}
          text={conditionAnalysis.packaging.condition}
          color="gray"
        />
      </div>
    </div>
  );
}

function MiniStatCard({ label, count, text, color }: {
  label: string; count: number; text?: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-800',
    purple: 'bg-purple-50 text-purple-800',
    amber: 'bg-amber-50 text-amber-800',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <div className={`rounded-lg p-2.5 text-center ${colorMap[color] || colorMap.gray}`}>
      <p className="text-lg font-bold">{text || count}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}


// ── Confidence Panel ─────────────────────────────────────────────────────────

function ConfidencePanel({ confidence }: { confidence: ConfidenceResult }) {
  const isLow = confidence.needs_manual_review;

  return (
    <div className={`rounded-xl border p-4 ${
      isLow ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Brain className={`h-5 w-5 ${isLow ? 'text-amber-600' : 'text-green-600'}`} />
        <h4 className="font-semibold text-gray-900">Step 3: AI Confidence</h4>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className={`text-3xl font-bold ${isLow ? 'text-amber-700' : 'text-green-700'}`}>
            {confidence.ai_confidence}%
          </p>
          <p className="text-xs text-gray-500">AI Confidence</p>
        </div>
        <div className="flex-1">
          {/* Confidence bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLow ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${confidence.ai_confidence}%` }}
            />
          </div>
          <p className={`text-xs mt-1 ${isLow ? 'text-amber-700' : 'text-green-700'}`}>
            {confidence.review_message}
          </p>
        </div>
      </div>

      {isLow && (
        <div className="mt-3 flex items-center gap-2 bg-amber-100 rounded-lg p-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800 font-medium">
            Additional inspection recommended. This item will be routed for manual review.
          </p>
        </div>
      )}
    </div>
  );
}
