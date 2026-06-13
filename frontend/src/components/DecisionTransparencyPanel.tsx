/**
 * Decision Transparency Panel
 * ============================
 * FEATURE A: Makes the AI decision engine's reasoning visible step-by-step.
 * Animates through 4 decision steps: image analysis, demand check, value
 * comparison, and final disposition. Self-contained, read-only — receives
 * all data as props derived from existing return/marketplace response.
 */

import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, Image, BarChart2, DollarSign, Lightbulb } from 'lucide-react';

export interface DecisionTransparencyProps {
  conditionScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  category: string;
  resaleValue: number | null;
  refurbishCost: number | null;
  recycleValue: number | null;
  disposition: string;
  demandScore?: number;
}

const demandLabel = (score: number) => {
  if (score >= 100) return 'High';
  if (score >= 85) return 'Moderate';
  return 'Low';
};

const dispositionReason = (
  disposition: string,
  resaleValue: number | null,
  refurbishCost: number | null,
  recycleValue: number | null
) => {
  const r = resaleValue ?? 0;
  const f = refurbishCost ?? 0;
  const c = recycleValue ?? 0;
  // FIX 3: reason text mirrors the actual decision rule
  switch (disposition) {
    case 'Resell':
    case 'Peer-to-Peer Exchange':
      return `Direct resale (₹${r.toFixed(0)}) beats net refurb and recycle (₹${c.toFixed(0)}).`;
    case 'Refurbish':
      return `Net recovery after refurb (₹${(r - f).toFixed(0)}) exceeds direct resale and recycling.`;
    case 'Donate':
      return `Resale value is below threshold and refurb cost (₹${f.toFixed(0)}) outweighs recovery.`;
    case 'Recycle':
      return `Recycle value (₹${c.toFixed(0)}) — condition doesn't support resale or refurbishment.`;
    default:
      return 'AI selected the highest-value recovery path.';
  }
};

const steps = (props: DecisionTransparencyProps) => [
  {
    icon: Image,
    label: 'Image Analyzed',
    detail: `Condition Score: ${props.conditionScore}/100 (Grade ${props.grade})`,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: BarChart2,
    label: 'Category Demand Checked',
    detail: `${props.category} — ${demandLabel(props.demandScore ?? 90)} demand`,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: DollarSign,
    label: 'Value Comparison',
    detail: `Resale ₹${(props.resaleValue ?? 0).toFixed(0)} | Refurbish ₹${(props.refurbishCost ?? 0).toFixed(0)} | Recycle ₹${(props.recycleValue ?? 0).toFixed(0)}`,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Lightbulb,
    label: `Decision → ${props.disposition}`,
    detail: dispositionReason(props.disposition, props.resaleValue, props.refurbishCost, props.recycleValue),
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
];

export default function DecisionTransparencyPanel(props: DecisionTransparencyProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    setRevealedCount(0);
    const intervals: ReturnType<typeof setTimeout>[] = [];
    steps(props).forEach((_, i) => {
      intervals.push(setTimeout(() => setRevealedCount(i + 1), (i + 1) * 600));
    });
    return () => intervals.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.disposition, props.conditionScore]);

  const allSteps = steps(props);

  return (
    <div className="card border border-gray-200">
      <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amazon-orange" />
        AI Decision Transparency
      </h3>
      <div className="space-y-3">
        {allSteps.map((step, i) => {
          const Icon = step.icon;
          const revealed = i < revealedCount;
          const loading = i === revealedCount;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-500 ${
                revealed ? step.bg : 'bg-gray-50 opacity-40'
              }`}
            >
              {/* Step number / icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                revealed ? step.bg : 'bg-gray-100'
              }`}>
                {loading ? (
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                ) : revealed ? (
                  <CheckCircle className={`h-4 w-4 ${step.color}`} />
                ) : (
                  <Icon className="h-4 w-4 text-gray-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${revealed ? 'text-gray-800' : 'text-gray-400'}`}>
                  Step {i + 1}: {step.label}
                </p>
                {revealed && (
                  <p className={`text-xs mt-0.5 ${step.color} font-medium`}>
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
