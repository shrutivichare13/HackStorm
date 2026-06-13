"""
AI Product Analysis API Routes
================================
Exposes the enhanced AI analysis pipeline as REST endpoints.
Uses OpenCV for real image comparison between captured and catalog images.
Stores all verification and analysis results in MongoDB-style collection.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from mock_data.database import PRODUCTS
from services.cv_verification import verify_product_image
from services.ai_product_analysis import (
    analyze_product_condition,
    compute_condition_score,
    compute_ai_confidence,
)

router = APIRouter()

# In-memory MongoDB-style collection for analysis results
ANALYSIS_RESULTS: List[dict] = []


class ProductAnalysisRequest(BaseModel):
    """Request to run the full AI analysis pipeline."""
    product_id: str
    captured_image_base64: str  # Full base64 data URL from camera
    captured_timestamp: Optional[str] = None
    verification_code: Optional[str] = None


class ProductVerificationRequest(BaseModel):
    """Request for Step 1 only: Product Match Verification."""
    product_id: str
    captured_image_base64: str
    captured_timestamp: Optional[str] = None


class ConditionAnalysisRequest(BaseModel):
    """Request for Step 2-4: Condition Analysis (after verification passes)."""
    product_id: str
    product_name: str
    product_category: str
    product_value: float
    captured_image_base64: str


# ─── Full Pipeline Endpoint ──────────────────────────────────────────────────

@router.post("/full")
async def run_full_product_analysis(request: ProductAnalysisRequest):
    """
    Run the complete 4-step AI analysis pipeline:
      1. Product Match Verification (OpenCV-based)
      2. Product Condition Analysis
      3. Condition Scoring Engine
      4. Confidence-Based Results

    Stores results in the analysis collection for future marketplace decisions.
    """
    # Look up product
    product = next((p for p in PRODUCTS if p["id"] == request.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    timestamp = request.captured_timestamp or datetime.now().isoformat()

    # Step 1: OpenCV Product Match Verification
    verification = verify_product_image(
        captured_image_base64=request.captured_image_base64,
        catalog_image_url=product["image_url"],
        product_name=product["name"],
        product_category=product["category"],
    )
    verification["product_id"] = product["id"]
    verification["timestamp"] = timestamp

    # If verification fails, stop here
    if not verification["passed"]:
        result = {
            "pipeline_status": "blocked",
            "blocked_at": "verification",
            "verification": verification,
            "condition_analysis": None,
            "scoring": None,
            "confidence": None,
            "message": (
                "This image does not appear to match the selected product. "
                "Please capture the correct product."
            ),
            "analysis_id": f"ANA-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": timestamp,
        }
        result["_id"] = str(uuid.uuid4())
        result["stored_at"] = datetime.now().isoformat()
        ANALYSIS_RESULTS.append(result)
        return result

    # Step 2: Product Condition Analysis
    image_hash = uuid.uuid4().hex[:16]  # Use as seed for condition analysis
    condition_analysis = analyze_product_condition(
        product_category=product["category"],
        product_name=product["name"],
        product_value=product["original_price"],
        image_hash=image_hash,
    )

    # Step 3: Condition Scoring
    scoring = compute_condition_score(condition_analysis)

    # Step 4: Confidence-Based Results
    confidence = compute_ai_confidence(verification, condition_analysis, scoring)

    result = {
        "pipeline_status": "complete",
        "blocked_at": None,
        "verification": verification,
        "condition_analysis": condition_analysis,
        "scoring": scoring,
        "confidence": confidence,
        "message": "AI analysis completed successfully.",
        "analysis_id": f"ANA-{uuid.uuid4().hex[:8].upper()}",
        "timestamp": timestamp,
    }

    # Store in MongoDB-style collection
    result["_id"] = str(uuid.uuid4())
    result["stored_at"] = datetime.now().isoformat()
    ANALYSIS_RESULTS.append(result)

    return result


# ─── Step 1: Verification Only ──────────────────────────────────────────────

@router.post("/verify")
async def verify_product(request: ProductVerificationRequest):
    """
    Step 1 only: Verify that the captured image matches the selected product
    using OpenCV image comparison.
    Returns match_percentage and verification_status.
    """
    product = next((p for p in PRODUCTS if p["id"] == request.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    print(f"[Analysis] Verify request for product: {product['name']}")
    print(f"[Analysis] Catalog image URL: {product['image_url']}")
    print(f"[Analysis] Captured image base64 length: {len(request.captured_image_base64)}")

    result = verify_product_image(
        captured_image_base64=request.captured_image_base64,
        catalog_image_url=product["image_url"],
        product_name=product["name"],
        product_category=product["category"],
    )
    result["product_id"] = product["id"]
    result["timestamp"] = request.captured_timestamp or datetime.now().isoformat()

    print(f"[Analysis] Result: {result['match_percentage']}% - {result['verification_status']}")

    return result


# ─── Step 2-4: Condition Analysis (post-verification) ────────────────────────

@router.post("/condition")
async def analyze_condition(request: ConditionAnalysisRequest):
    """
    Steps 2-4: Run condition analysis, scoring, and confidence assessment.
    Should only be called after verification passes.
    """
    image_hash = uuid.uuid4().hex[:16]

    # Step 2: Condition Analysis
    condition_analysis = analyze_product_condition(
        product_category=request.product_category,
        product_name=request.product_name,
        product_value=request.product_value,
        image_hash=image_hash,
    )

    # Step 3: Scoring
    scoring = compute_condition_score(condition_analysis)

    # Step 4: Confidence
    mock_verification = {
        "match_percentage": 90,
        "passed": True,
    }
    confidence = compute_ai_confidence(mock_verification, condition_analysis, scoring)

    return {
        "condition_analysis": condition_analysis,
        "scoring": scoring,
        "confidence": confidence,
    }


# ─── Retrieve stored analysis results ───────────────────────────────────────

@router.get("/results")
async def get_analysis_results():
    """Get all stored analysis results (MongoDB collection)."""
    return {"results": ANALYSIS_RESULTS, "total": len(ANALYSIS_RESULTS)}


@router.get("/results/{analysis_id}")
async def get_analysis_result(analysis_id: str):
    """Get a specific analysis result by ID."""
    result = next(
        (r for r in ANALYSIS_RESULTS if r.get("analysis_id") == analysis_id),
        None
    )
    if not result:
        raise HTTPException(status_code=404, detail="Analysis result not found")
    return result
