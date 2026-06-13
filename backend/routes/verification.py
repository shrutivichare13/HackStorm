"""
Verification API Routes
========================
Handles live image verification, fraud detection, and trust score updates.
"""

import random
import string
from fastapi import APIRouter, HTTPException
from models.schemas import VerificationRequest
from services.ai_engine import detect_fraud
from mock_data.database import USERS

router = APIRouter()


@router.get("/code")
async def generate_verification_code():
    """
    Generate a random 6-digit verification code.
    User must display this code on screen during live capture.
    """
    code = ''.join(random.choices(string.digits, k=6))
    return {"code": code, "expires_in_seconds": 120}


@router.post("/validate")
async def validate_capture(request: VerificationRequest):
    """
    Validate a live capture submission.
    Checks image hash for duplicates, timestamp validity, and verification code.
    """
    result = detect_fraud(
        image_hash=request.image_hash,
        timestamp=request.timestamp,
        verification_code=request.verification_code
    )

    # Update user trust score
    user = USERS.get("user_001")
    if user:
        new_score = max(0, min(100, user["trust_score"] + result["trust_score_delta"]))
        user["trust_score"] = new_score

    message = "Verification successful" if result["is_valid"] else _get_failure_message(result)

    return {
        "is_valid": result["is_valid"],
        "is_live": result["is_live"],
        "is_duplicate": result["is_duplicate"],
        "trust_score_delta": result["trust_score_delta"],
        "message": message
    }


@router.get("/trust-score/{user_id}")
async def get_trust_score(user_id: str):
    """Get current trust score for a user."""
    user = USERS.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user_id,
        "trust_score": user["trust_score"],
        "level": _get_trust_level(user["trust_score"])
    }


def _get_failure_message(result: dict) -> str:
    """Generate appropriate failure message based on verification result."""
    issues = []
    if result["is_duplicate"]:
        issues.append("Duplicate image detected")
    if not result.get("timestamp_valid", True):
        issues.append("Timestamp validation failed")
    if not result.get("verification_code_valid", True):
        issues.append("Verification code invalid")
    if not result["is_live"]:
        issues.append("Live capture not confirmed")
    return "; ".join(issues) if issues else "Verification failed"


def _get_trust_level(score: int) -> str:
    """Categorize trust score into levels."""
    if score >= 80:
        return "High"
    elif score >= 50:
        return "Medium"
    else:
        return "Low"
