"""
Pydantic models for request/response validation.
Defines the data structures used across the application.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ConditionGrade(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"


class ConditionLabel(str, Enum):
    LIKE_NEW = "Like New"
    GOOD = "Good"
    FAIR = "Fair"
    DAMAGED = "Damaged"


class Disposition(str, Enum):
    RESELL = "Resell"
    REFURBISH = "Refurbish"
    DONATE = "Donate"
    RECYCLE = "Recycle"
    PEER_TO_PEER = "Peer-to-Peer Exchange"


class ProductCategory(str, Enum):
    ELECTRONICS = "Electronics"
    CLOTHING = "Clothing"
    HOME = "Home & Kitchen"
    BOOKS = "Books"
    TOYS = "Toys & Games"
    SPORTS = "Sports & Outdoors"
    BEAUTY = "Beauty"
    AUTOMOTIVE = "Automotive"


# ============ Product Models ============

class Product(BaseModel):
    id: str
    name: str
    category: ProductCategory
    original_price: float
    image_url: str
    description: str
    purchase_date: str
    order_id: str
    return_eligible: bool = True


# ============ Return Models ============

class ReturnRequest(BaseModel):
    product_id: str
    reason: str
    description: Optional[str] = ""
    image_hash: Optional[str] = None
    verification_code: Optional[str] = None
    timestamp: Optional[str] = None


class ConditionAssessment(BaseModel):
    condition_score: int = Field(ge=0, le=100)
    grade: ConditionGrade
    label: ConditionLabel
    detected_issues: List[str] = []
    visual_report: str = ""


class DispositionRecommendation(BaseModel):
    disposition: Disposition
    explanation: str
    confidence: float = Field(ge=0, le=1)
    resale_price: Optional[float] = None


class ReturnResponse(BaseModel):
    return_id: str
    product_id: str
    status: str
    condition: ConditionAssessment
    recommendation: DispositionRecommendation
    user_trust_score: int
    requires_manual_review: bool = False


# ============ Verification Models ============

class VerificationRequest(BaseModel):
    product_id: str
    image_hash: str
    timestamp: str
    verification_code: str


class VerificationResult(BaseModel):
    is_valid: bool
    is_live: bool
    is_duplicate: bool
    trust_score_delta: int
    message: str


# ============ Marketplace Models ============

class MarketplaceListing(BaseModel):
    id: str
    product_name: str
    category: ProductCategory
    original_price: float
    resale_price: float
    condition_grade: ConditionGrade
    condition_label: ConditionLabel
    condition_score: int
    image_url: str
    ai_inspection_summary: str
    trust_badge: bool = True
    seller_id: str
    listed_date: str


# ============ Peer-to-Peer Models ============

class P2PListing(BaseModel):
    id: str
    product_name: str
    category: ProductCategory
    selling_price: float
    original_price: float
    condition_grade: ConditionGrade
    condition_report: str
    image_url: str
    seller_id: str
    seller_name: str
    seller_trust_score: int
    seller_rating: float
    ai_verified: bool = True
    listed_date: str


class CreateP2PListing(BaseModel):
    product_id: str
    selling_price: float
    description: Optional[str] = ""


# ============ Green Credits Models ============

class GreenCredits(BaseModel):
    user_id: str
    total_credits: int
    waste_diverted_kg: float
    carbon_saved_kg: float
    items_recycled: int
    items_donated: int
    items_refurbished: int
    items_resold: int
    credit_history: List[dict] = []


class RedeemCreditsRequest(BaseModel):
    user_id: str
    credits_to_redeem: int


# ============ Analytics Models ============

class AnalyticsData(BaseModel):
    total_returns: int
    disposition_breakdown: dict
    cost_savings: float
    waste_diverted_kg: float
    co2_reduction_kg: float
    fraud_detections: int
    return_prevention_rate: float
    monthly_trends: List[dict]
    category_breakdown: List[dict]


# ============ Return Prevention Models ============

class ReturnRiskAssessment(BaseModel):
    product_id: str
    risk_score: int = Field(ge=0, le=100)
    common_return_reasons: List[str]
    recommendations: List[str]
    size_guidance: Optional[str] = None
    alternatives: List[dict] = []
