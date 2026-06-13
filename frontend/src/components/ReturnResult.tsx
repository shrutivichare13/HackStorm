/**
 * Return Result Component (Enhanced)
 * ====================================
 * Displays the AI assessment results after a return/sell submission.
 * Now includes: visual condition analysis, functionality estimate,
 * explainability section, sustainability impact card, and next-best-owner matching.
 */

import type { ReturnResponse } from '../types';
import GradeBadge from './GradeBadge';
import ConditionScore from './ConditionScore';
import TrustBadge from './TrustBadge';
import { AlertTriangle, CheckCircle, Leaf, ArrowRight, MapPin, Zap, Eye, Recycle, Wind } from 'lucide-react';

interface ReturnResultProps {
  result: ReturnResponse;
}

export default function ReturnResult({ result }: ReturnResultProps) {
  const { condition, recommendation, requires_manual_review, credits_earned } = result;

  return (
    <div className="space-y-6 animate-in">
      {/* Status Banner */}
      <div className={`p-4 rounded-xl flex items-center gap-3 ${
        requires_manual_review 
          ? 'bg-amber-50 border border-amber-200' 
          : 'bg-green-50 border border-green-200'
      }`}>
        {requires_manual_review ? (
          <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
        ) : (
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
        )}
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

      {/* Condition Assessment with Functionality Estimate */}
      <div className="card">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">AI Condition Assessment</h3>
        <div className="flex items-start gap-6">
          <ConditionScore score={condition.condition_score} size={100} />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <GradeBadge grade={condition.grade} size="lg" />
              {/* Functionality Estimate Badge */}
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

      {/* Visual Condition Analysis (Enhanced) */}
      {condition.visual_analysis && condition.visual_analysis.defects_detected.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-amazon-blue" />
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

      {/* Disposition Recommendation with Explainability */}
      <div className="card border-l-4 border-amazon-orange">
        <h3 className="font-semibold text-lg text-gray-900 mb-3">
          AI Recommendation
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="h-5 w-5 text-amazon-orange" />
          <span className="text-xl font-bold text-amazon-navy">
            {recommendation.disposition}
          </span>
          <span className="text-sm text-gray-500 ml-2">
            ({(recommendation.confidence * 100).toFixed(0)}% confidence)
          </span>
        </div>
        <p className="text-gray-600">{recommendation.explanation}</p>
        {recommendation.resale_price && (
          <p className="mt-3 text-lg font-semibold text-green-700">
            Estimated Resale Value: ${recommendation.resale_price.toFixed(2)}
          </p>
        )}

        {/* Explainability Section */}
        {recommendation.explainability && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Why this recommendation:</p>
            <div className="flex flex-wrap gap-2">
              {recommendation.explainability.factors.map((factor, i) => (
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

      {/* Sustainability Impact Card */}
      {result.sustainability_impact && (
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
              <p className="text-lg font-bold text-gray-900">
                {result.sustainability_impact.waste_prevented_kg} kg
              </p>
              <p className="text-xs text-gray-500">Waste Prevented</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Wind className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {result.sustainability_impact.carbon_saved_kg} kg
              </p>
              <p className="text-xs text-gray-500">CO₂ Saved</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Leaf className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                +{result.sustainability_impact.green_credits_earned}
              </p>
              <p className="text-xs text-gray-500">Green Credits</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Best Owner Matching */}
      {result.next_best_owners && result.next_best_owners.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-amazon-teal" />
            <h3 className="font-semibold text-lg text-gray-900">Next Best Owner Match</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Nearby buyers interested in this product — reducing logistics cost and carbon footprint.
          </p>
          <div className="space-y-3">
            {result.next_best_owners.map((owner, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amazon-navy text-white flex items-center justify-center text-sm font-bold">
                    {owner.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {owner.name}
                      {owner.local_match && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                          🌱 Local Match
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{owner.distance_km} km away · {owner.interest_match}% match</p>
                  </div>
                </div>
                <TrustBadge score={owner.trust_score} showLabel={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Green Credits Earned */}
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <Leaf className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">
              +{credits_earned} Green Credits Earned!
            </p>
            <p className="text-sm text-green-700">
              Thank you for giving this product a second life.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Score */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">Your Trust Score</span>
        <TrustBadge score={result.user_trust_score} />
      </div>
    </div>
  );
}
