/**
 * Type definitions for Amazon Second Life Commerce
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  original_price: number;
  image_url: string;
  description: string;
  purchase_date: string;
  order_id: string;
  return_eligible: boolean;
}

// ============ Enhanced Visual Condition Analysis ============

export interface VisualDefect {
  type: string;
  severity: string;
  location: string;
}

export interface VisualAnalysis {
  defects_detected: VisualDefect[];
  total_defects: number;
  overall_severity: string;
}

// ============ Enhanced Explainability ============

export interface Explainability {
  recommended_action: string;
  factors: string[];
  demand_score: number;
  estimated_resale_value: number;
  refurbishment_cost: number;
  donation_impact_score: number;
  recycling_value: number;
}

// ============ Sustainability Impact ============

export interface SustainabilityImpact {
  waste_prevented_kg: number;
  carbon_saved_kg: number;
  green_credits_earned: number;
}

// ============ Next Best Owner ============

export interface NextBestOwner {
  name: string;
  distance_km: number;
  interest_match: number;
  trust_score: number;
  local_match: boolean;
}

export interface ConditionAssessment {
  condition_score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  label: string;
  detected_issues: string[];
  visual_report: string;
  visual_analysis?: VisualAnalysis;
  functionality_estimate?: string;
}

export interface DispositionRecommendation {
  disposition: string;
  explanation: string;
  confidence: number;
  resale_price: number | null;
  explainability?: Explainability;
}

export interface ReturnResponse {
  return_id: string;
  product_id: string;
  product_name: string;
  status: string;
  condition: ConditionAssessment;
  recommendation: DispositionRecommendation;
  user_trust_score: number;
  requires_manual_review: boolean;
  credits_earned: number;
  sustainability_impact?: SustainabilityImpact;
  next_best_owners?: NextBestOwner[];
  submitted_at: string;
  reason: string;
}

export interface MarketplaceListing {
  id: string;
  product_name: string;
  category: string;
  original_price: number;
  resale_price: number;
  condition_grade: 'A' | 'B' | 'C' | 'D';
  condition_label: string;
  condition_score: number;
  image_url: string;
  ai_inspection_summary: string;
  trust_badge: boolean;
  badges?: string[];
  seller_id: string;
  listed_date: string;
}

export interface P2PListing {
  id: string;
  product_name: string;
  category: string;
  selling_price: number;
  original_price: number;
  condition_grade: 'A' | 'B' | 'C' | 'D';
  condition_report: string;
  image_url: string;
  seller_id: string;
  seller_name: string;
  seller_trust_score: number;
  seller_rating: number;
  ai_verified: boolean;
  listed_date: string;
}

export interface GreenCredits {
  user_id: string;
  total_credits: number;
  waste_diverted_kg: number;
  carbon_saved_kg: number;
  items_recycled: number;
  items_donated: number;
  items_refurbished: number;
  items_resold: number;
  credit_history: CreditHistoryItem[];
}

export interface CreditHistoryItem {
  date: string;
  action: string;
  credits: number;
  type: 'earned' | 'redeemed';
}

// ============ Enhanced Analytics ============

export interface RevenueTrend {
  month: string;
  recovered: number;
  potential: number;
}

export interface CarbonTrend {
  month: string;
  saved_kg: number;
}

export interface LifecycleStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  total_returns: number;
  disposition_breakdown: Record<string, number>;
  cost_savings: number;
  waste_diverted_kg: number;
  co2_reduction_kg: number;
  fraud_detections: number;
  return_prevention_rate: number;
  monthly_trends: MonthlyTrend[];
  category_breakdown: CategoryBreakdown[];
  // Enhanced fields
  products_saved?: number;
  revenue_recovered?: number;
  revenue_trend?: RevenueTrend[];
  carbon_trend?: CarbonTrend[];
  lifecycle_distribution?: LifecycleStage[];
}

export interface MonthlyTrend {
  month: string;
  returns: number;
  prevented: number;
  savings: number;
}

export interface CategoryBreakdown {
  category: string;
  returns: number;
  recovery_rate: number;
}

export interface ReturnRisk {
  product_id: string;
  risk_score: number;
  common_return_reasons: string[];
  recommendations: string[];
  size_guidance: string | null;
  alternatives: Alternative[];
}

export interface Alternative {
  name: string;
  price: number;
  return_rate: number;
}

export interface VerificationCode {
  code: string;
  expires_in_seconds: number;
}

// ============ Sell Item (Option B) ============

export interface SellItemRequest {
  product_name: string;
  original_price: number;
  category: string;
  reason: string;
  description?: string;
  image_url?: string;
}
