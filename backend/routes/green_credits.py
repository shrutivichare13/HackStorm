"""
Green Credits API Routes
=========================
Manages sustainability rewards, credit history, and redemption.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import RedeemCreditsRequest
from mock_data.database import GREEN_CREDITS_DATA, USERS
from datetime import datetime

router = APIRouter()


@router.get("/{user_id}")
async def get_green_credits(user_id: str):
    """Get green credits dashboard data for a user."""
    credits_data = GREEN_CREDITS_DATA.get(user_id)
    if not credits_data:
        # Return default data for unknown users
        return {
            "user_id": user_id,
            "total_credits": 0,
            "waste_diverted_kg": 0,
            "carbon_saved_kg": 0,
            "items_recycled": 0,
            "items_donated": 0,
            "items_refurbished": 0,
            "items_resold": 0,
            "credit_history": []
        }
    return credits_data


@router.post("/redeem")
async def redeem_credits(request: RedeemCreditsRequest):
    """
    Redeem green credits for a discount.
    10 credits = $1 discount.
    """
    credits_data = GREEN_CREDITS_DATA.get(request.user_id)
    if not credits_data:
        raise HTTPException(status_code=404, detail="User credits not found")

    if credits_data["total_credits"] < request.credits_to_redeem:
        raise HTTPException(status_code=400, detail="Insufficient credits")

    if request.credits_to_redeem < 10:
        raise HTTPException(status_code=400, detail="Minimum redemption is 10 credits")

    # Calculate discount value
    discount_value = request.credits_to_redeem / 10

    # Update credits
    credits_data["total_credits"] -= request.credits_to_redeem
    credits_data["credit_history"].insert(0, {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "action": f"Redeemed ${discount_value:.2f} discount",
        "credits": -request.credits_to_redeem,
        "type": "redeemed"
    })

    return {
        "success": True,
        "discount_value": discount_value,
        "remaining_credits": credits_data["total_credits"],
        "message": f"Successfully redeemed {request.credits_to_redeem} credits for ${discount_value:.2f} discount"
    }


@router.get("/{user_id}/impact")
async def get_sustainability_impact(user_id: str):
    """Get sustainability impact metrics for a user."""
    credits_data = GREEN_CREDITS_DATA.get(user_id)
    if not credits_data:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "waste_diverted_kg": credits_data["waste_diverted_kg"],
        "carbon_saved_kg": credits_data["carbon_saved_kg"],
        "trees_equivalent": round(credits_data["carbon_saved_kg"] / 21.77, 1),
        "items_given_second_life": (
            credits_data["items_recycled"] +
            credits_data["items_donated"] +
            credits_data["items_refurbished"] +
            credits_data["items_resold"]
        ),
        "sustainability_rank": "Gold",
        "percentile": 85
    }
