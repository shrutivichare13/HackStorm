/**
 * Return Result Component
 * ========================
 * FIX 3: Shows full consistent value breakdown (resale / refurb / recycle).
 * FIX 4: Range-based pricing when brand is unknown (sell flow).
 * FIX 5: ONE "Next Best Owner" section — removed duplicate from backend list.
 * FIX 6: Green credits breakdown formula shown explicitly.
 * FIX 7: Sustainability numbers sourced from lookup table; ℹ tooltip shown.
 */

import { useState } from 'react';
import type { ReturnResponse, CreditsBreakdown } from '../types';
import GradeBadge from './GradeBadge';
import ConditionScore from './ConditionScore';
import TrustBadge from './TrustBadge';
import DecisionTransparencyPanel from './DecisionTransparencyPanel';
import NextOwnerMatch from './NextOwnerMatch';
import {
  AlertTriangle, CheckCircle, Leaf, ArrowRight, Zap, Eye,
  Recycle, Wind, Info,
} from 'lucide-react';
import sustainabilityFactors from '../data/sustainabilityFactors.json';

interface ReturnResultProps {
  result: ReturnResponse;
  /** FIX 4: brand from sell form — empty/undefined = return flow (no range needed) */
  sellBrand?: string;
  /** Problem 6: functional verification data from multi-angle capture */
  functionalVerification?: {
    powerStatus: 'Working' | 'Not Working' | 'Unknown';
    demoVideoPath: string | null;
    reportedNotWorking: boolean;
  };
}

// ── FIX 6: Green credits breakdown ──────────────────────────────────────────
function CreditsBreakdownPanel({ bd }: { bd: CreditsBreakdown }) {
  return (
    <div className="mt-3 pt-3 border-t border-green-200 text-xs text-green-700 space-y-0.5">
      <p>Condition Score = <strong>{bd.condition_score}</strong></p>
      <p>Decision = <strong>{bd.disposition}</strong></p>
      <p>Multiplier = <strong>{bd.multiplier}</strong></p>
      <p>
        Credits = {bd.condition_score} × {bd.multiplier} = <strong>{bd.credits_raw}</strong>
      </p>
      <p className="font-semibold text-green-800">Awarded = {bd.credits_awarded}</p>
    </div>
  );
}

// ── FIX 7: Sustainability tooltip ────────────────────────────────────────────
function SustainabilityTooltip({
  category, avgWeightKg, carbonFactor, co2Saved,
}: {
  category: string; avgWeightKg: number; carbonFactor: number; co2Saved: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-green-500 hover:text-green-700 ml-1 align-middle"
        title="How is this calculated?"
      >
        <Info className="h-3.5 w-3.5 inline" />
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-700">
          <p className="font-semibold text-gray-800 mb-1">{category} Category</p>
          <p>Average Weight = {avgWeightKg} kg</p>
          <p>Carbon Factor = {carbonFactor}</p>
          <p className="mt-1 font-medium">
            CO₂ Saved = {avgWeightKg} × {carbonFactor} = {co2Saved} kg
          </p>
          <button onClick={() => setOpen(false)} className="mt-2 text-gray-400 hover:text-gray-600 block">close ×</button>
        </div>
      )}
    </span>
  );
}

export default function ReturnResult({ result, sellBrand, functionalVerification }: ReturnResultProps) {
  const { condition, recommendation, requires_manual_review, credits_earned, credits_breakdown } = result;
  const expl = recommendation.explainability;

  // FIX 7: pull sustainability factors from JSON (same table as backend)
  const cat = result.category ?? 'Other';
  type FactorKey = keyof typeof sustainabilityFactors;
  const sfKey = (Object.keys(sustainabilityFactors) as FactorKey[]).find(k => k === cat) ?? 'Other' as FactorKey;
  const sf = sustainabilityFactors[sfKey] ?? { avgWeightKg: 1.0, carbonFactor: 2.0 };

  const si = result.sustainability_impact;
  // Use backend values when available; fall back to computed from JSON
  const wasteKg = si?.waste_prevented_kg ?? sf.avgWeightKg;
  const co2Kg = si?.carbon_saved_kg ?? parseFloat((sf.avgWeightKg * sf.carbonFactor).toFixed(2));
  const avgWeightKg = si?.avg_weight_kg ?? sf.avgWeightKg;
  const carbonFactor = si?.carbon_factor ?? sf.carbonFactor;

  // FIX 4: range-based pricing for unknown brand in sell flow
  const isSellFlow = sellBrand !== undefined;
  const brandUnknown = isSellFlow && (!sellBrand || sellBrand === 'Unknown');
  const baseResale = expl?.resale_as_is ?? recommendation.resale_price ?? 0;
  const lowEstimate = Math.round(baseResale * 0.82);
  const highEstimate = Math.round(baseResale * 1.18);

  return (
    <div className="space-y-6 animate-in">
      {/* Status Banner */}
      <div className={`p-4 rounded-xl flex items-center gap-3 ${
        requires_manual_review
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-green-50 border border-green-200'
      }`}>
        {requires_manual_review
          ? <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
          : <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />}
        <div>
          <p className="font-semibold text-gray-900">
            {requires_manual_review ? 'Routed to Manual Review' : 'Return Approved'}
          </p>
          <p className="text-sm text-gray-600">
            {requires_manual_review
              ? 'Your return requires additional verification due to trust score.'
              : `Return ID: ${result.return_id}`}
          </p>
        </div>
      </div>

      {/* Condition Assessment */}
      <div className="card">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">AI Condition Assessment</h3>
        <div className="flex items-start gap-6">
          <ConditionScore score={condition.condition_score} size={100} />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <GradeBadge grade={condition.grade} size="lg" />
              {condition.functionality_estimate && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  condition.functionality_estimate === 'Likely Working'
                    ? 'bg-green-100 text-green-800'
                    : condition.functionality_estimate === 'Needs Inspection'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <Zap className="h-3 w-3" />
                  {condition.functionality_estimate}
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-2">{condition.visual_report}</p>
            {/* Problem 6: Functional status from multi-angle verification */}
            {functionalVerification && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  functionalVerification.powerStatus === 'Working'
                    ? 'bg-green-100 text-green-800'
                    : functionalVerification.powerStatus === 'Not Working'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  <Zap className="h-3 w-3" />
                  Functional Status: {functionalVerification.powerStatus} (Self Verified)
                </span>
                {functionalVerification.demoVideoPath && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    Demo Video: Uploaded
                  </span>
                )}
              </div>
            )}
            {condition.detected_issues.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Detected Issues:</p>
                <ul className="space-y-1">
                  {condition.detected_issues.map((issue, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Condition Analysis */}
      {condition.visual_analysis && condition.visual_analysis.defects_detected.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-lg text-gray-900">Visual Condition Analysis</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {condition.visual_analysis.defects_detected.map((defect, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  defect.severity === 'Minor' ? 'bg-green-400' :
                  defect.severity === 'Moderate' ? 'bg-amber-400' :
                  defect.severity === 'Significant' ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{defect.type}</p>
                  <p className="text-xs text-gray-500">{defect.severity} · {defect.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disposition Recommendation — FIX 3: consistent value table */}
      <div className="card border-l-4 border-amazon-orange">
        <h3 className="font-semibold text-lg text-gray-900 mb-3">AI Recommendation</h3>
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="h-5 w-5 text-amazon-orange" />
          <span className="text-xl font-bold text-amazon-navy">{recommendation.disposition}</span>
          <span className="text-sm text-gray-500 ml-2">
            ({(recommendation.confidence * 100).toFixed(0)}% confidence)
          </span>
        </div>
        <p className="text-gray-600 mb-4">{recommendation.explanation}</p>

        {/* FIX 3: value breakdown table */}
        {expl && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1.5 mb-4">
            <p className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wide">
              Value Breakdown
            </p>
            {/* Resale as-is — show "Not Recommended" if below floor */}
            <div className="flex justify-between">
              <span className="text-gray-600">Resale Value (As-Is)</span>
              <span className={`font-medium ${expl.show_resale_as_is == null ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                {expl.show_resale_as_is != null
                  ? `₹${expl.show_resale_as_is.toFixed(0)}`
                  : 'Not Recommended'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Refurbishment Cost</span>
              <span className="font-medium text-gray-900">₹{expl.refurbishment_cost.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Resale After Refurbishment</span>
              <span className="font-medium text-gray-900">₹{expl.resale_after_refurb.toFixed(0)}</span>
            </div>
            <div className="flex justify-between border-t pt-1.5 mt-1">
              <span className="text-gray-600">Net Recovery After Refurb</span>
              <span className={`font-semibold ${expl.net_after_refurb > 0 ? 'text-green-700' : 'text-red-600'}`}>
                ₹{expl.net_after_refurb.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recycle Value</span>
              <span className="font-medium text-gray-900">₹{expl.recycling_value.toFixed(0)}</span>
            </div>
          </div>
        )}

        {/* FIX 4: range vs single price */}
        {brandUnknown ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700 font-medium mb-1">
              Product: {result.product_name} · Brand: Unknown
            </p>
            <p className="text-sm font-semibold text-amber-900">
              Estimated Resale Range: ₹{lowEstimate} – ₹{highEstimate}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Add a brand name for a more precise estimate.
            </p>
          </div>
        ) : (
          recommendation.resale_price != null && recommendation.resale_price > 0 && (
            <p className="text-lg font-semibold text-green-700">
              Estimated Resale Value: ₹{recommendation.resale_price.toFixed(0)}
            </p>
          )
        )}

        {/* Explainability tags */}
        {expl && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Why this recommendation:</p>
            <div className="flex flex-wrap gap-2">
              {expl.factors.map((factor, i) => (
                <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  factor.startsWith('✓') ? 'bg-green-50 text-green-700' :
                  factor.startsWith('△') ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FIX 7: Sustainability Impact with ℹ tooltip */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          Sustainability Impact
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Recycle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">{wasteKg} kg</p>
            <p className="text-xs text-gray-500">
              Waste Prevented
              <SustainabilityTooltip
                category={cat}
                avgWeightKg={avgWeightKg}
                carbonFactor={carbonFactor}
                co2Saved={co2Kg}
              />
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Wind className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">{co2Kg} kg</p>
            <p className="text-xs text-gray-500">
              CO₂ Saved
              <SustainabilityTooltip
                category={cat}
                avgWeightKg={avgWeightKg}
                carbonFactor={carbonFactor}
                co2Saved={co2Kg}
              />
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Leaf className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">+{credits_earned}</p>
            <p className="text-xs text-gray-500">Green Credits</p>
          </div>
        </div>
      </div>

      {/* FIX 5: SINGLE "Next Best Owner" section — the DecisionTransparencyPanel's
               NextOwnerMatch component (from the FEATURE B component).
               The inline block from result.next_best_owners has been removed.
               We keep only NextOwnerMatch here, positioned correctly:
               Transparency → NextOwnerMatch → Green Credits */}

      {/* AI Decision Transparency */}
      {expl && (
        <DecisionTransparencyPanel
          conditionScore={condition.condition_score}
          grade={condition.grade}
          category={cat}
          resaleValue={expl.resale_as_is}
          refurbishCost={expl.refurbishment_cost}
          recycleValue={expl.recycling_value}
          disposition={recommendation.disposition}
          demandScore={expl.demand_score}
        />
      )}

      {/* FIX 5: One authoritative Next Owner Match (FEATURE B component) */}
      <NextOwnerMatch disposition={recommendation.disposition} />

      {/* FIX 6: Green Credits Earned with formula breakdown */}
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <Leaf className="h-6 w-6 text-green-600" />
          <div className="flex-1">
            <p className="font-semibold text-green-800">
              +{credits_earned} Green Credits Earned!
            </p>
            <p className="text-sm text-green-700">
              Thank you for giving this product a second life.
            </p>
          </div>
        </div>
        {/* FIX 6: show breakdown if available */}
        {credits_breakdown && <CreditsBreakdownPanel bd={credits_breakdown} />}
      </div>

      {/* Trust Score */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">Your Trust Score</span>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {result.wear_mismatch_detected && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
              <AlertTriangle className="h-3 w-3" /> Usage pattern mismatch detected
            </span>
          )}
          <TrustBadge score={result.user_trust_score} />
        </div>
      </div>
    </div>
  );
}
