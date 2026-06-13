"""
Returns API Routes
===================
Handles return requests, sell-unused-item submissions, AI condition assessment,
disposition recommendations, sustainability impact, and next-best-owner matching.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from models.schemas import ReturnRequest, ReturnResponse
from mock_data.database import PRODUCTS, USERS, RETURNS_HISTORY
from services.ai_engine import (
    assess_condition, recommend_disposition, calculate_green_credits,
    calculate_sustainability_impact, generate_next_best_owners
)

router = APIRouter()


class SellItemRequest(BaseModel):
    """Request model for selling an unused item (Option B flow)."""
    product_name: str
    original_price: float
    category: str
    reason: str
    description: Optional[str] = ""
    image_url: Optional[str] = None


@router.post("/submit")
async def submit_return(request: ReturnRequest):
    """
    Submit a return request. The AI engine assesses condition and recommends disposition.
    Enhanced with visual analysis, functionality estimate, sustainability impact,
    explainability, and next-best-owner matching.
    """
    # Find the product
    product = next((p for p in PRODUCTS if p["id"] == request.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get user trust score (default user for demo)
    user = USERS.get("user_001", {"trust_score": 75})
    trust_score = user.get("trust_score", 75)

    # AI condition assessment (enhanced with visual analysis + functionality)
    condition = assess_condition(
        product["category"],
        product["original_price"],
        request.reason
    )

    # AI disposition recommendation (enhanced with explainability)
    recommendation = recommend_disposition(
        condition["condition_score"],
        condition["grade"],
        product["category"],
        product["original_price"]
    )

    # FIX 6: credits = condition_score × disposition multiplier
    credits_info = calculate_green_credits(
        recommendation["disposition"],
        condition["condition_score"]
    )
    credits_earned = credits_info["credits_awarded"]

    # Enhanced: Calculate sustainability impact
    sustainability = calculate_sustainability_impact(
        recommendation["disposition"],
        product["category"],
        product["original_price"]
    )

    # Enhanced: Generate next best owners if disposition is Resell or P2P
    next_best_owners = []
    if recommendation["disposition"] in ["Resell", "Peer-to-Peer Exchange"]:
        next_best_owners = generate_next_best_owners(
            product["category"], condition["grade"]
        )

    # FEATURE C: Wear Pattern Mismatch Flag
    # If the user claims minimal use but condition score is low, flag it.
    minimal_use_reasons = ["no longer needed", "barely used", "changed mind", "unused gift", "decluttering"]
    reason_implies_minimal_use = any(kw in request.reason.lower() for kw in minimal_use_reasons)
    wear_mismatch_detected = reason_implies_minimal_use and condition["condition_score"] < 60

    # Determine if manual review is needed
    requires_manual_review = trust_score < 50 or wear_mismatch_detected

    # Create return record
    return_id = f"RET-{uuid.uuid4().hex[:8].upper()}"
    return_record = {
        "return_id": return_id,
        "product_id": request.product_id,
        "product_name": product["name"],
        "status": "pending_review" if requires_manual_review else "approved",
        "condition": condition,
        "recommendation": recommendation,
        "user_trust_score": trust_score,
        "requires_manual_review": requires_manual_review,
        "credits_earned": credits_earned,
        "credits_breakdown": credits_info,
        "sustainability_impact": sustainability,
        "next_best_owners": next_best_owners,
        "submitted_at": datetime.now().isoformat(),
        "reason": request.reason,
        "wear_mismatch_detected": wear_mismatch_detected,
        "category": product["category"],
    }

    RETURNS_HISTORY.append(return_record)

    return return_record


@router.post("/sell-item")
async def sell_unused_item(request: SellItemRequest):
    """
    Option B: Sell an unused item that wasn't purchased on Amazon.
    Runs AI analysis and generates disposition recommendation.
    """
    user = USERS.get("user_001", {"trust_score": 75})
    trust_score = user.get("trust_score", 75)

    # AI condition assessment
    condition = assess_condition(
        request.category,
        request.original_price,
        request.reason
    )

    # AI disposition recommendation
    recommendation = recommend_disposition(
        condition["condition_score"],
        condition["grade"],
        request.category,
        request.original_price
    )

    # FIX 6: credits = condition_score × disposition multiplier
    sell_credits_info = calculate_green_credits(
        recommendation["disposition"],
        condition["condition_score"]
    )
    sell_credits_earned = sell_credits_info["credits_awarded"]

    # Sustainability impact
    sustainability = calculate_sustainability_impact(
        recommendation["disposition"],
        request.category,
        request.original_price
    )

    # Next best owners for resale items
    next_best_owners = []
    if recommendation["disposition"] in ["Resell", "Peer-to-Peer Exchange"]:
        next_best_owners = generate_next_best_owners(
            request.category, condition["grade"]
        )

    return_id = f"SELL-{uuid.uuid4().hex[:8].upper()}"
    record = {
        "return_id": return_id,
        "product_id": None,
        "product_name": request.product_name,
        "status": "approved",
        "condition": condition,
        "recommendation": recommendation,
        "user_trust_score": trust_score,
        "requires_manual_review": False,
        "credits_earned": sell_credits_earned,
        "credits_breakdown": sell_credits_info,
        "sustainability_impact": sustainability,
        "next_best_owners": next_best_owners,
        "submitted_at": datetime.now().isoformat(),
        "reason": request.reason,
        "category": request.category,
    }

    RETURNS_HISTORY.append(record)
    return record


@router.get("/history")
async def get_return_history(user_id: str = "user_001"):
    """Get return history for a user."""
    return {"returns": RETURNS_HISTORY}


@router.get("/{return_id}")
async def get_return(return_id: str):
    """Get a specific return by ID."""
    ret = next((r for r in RETURNS_HISTORY if r["return_id"] == return_id), None)
    if not ret:
        raise HTTPException(status_code=404, detail="Return not found")
    return ret
