"""
Marketplace API Routes
=======================
Handles certified refurbished marketplace listings with dynamic pricing
and personalized recommendations.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from mock_data.database import MARKETPLACE_LISTINGS, USERS

router = APIRouter()


@router.get("/")
async def get_marketplace_listings(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    grade: Optional[str] = None
):
    """
    Get all marketplace listings with optional filters.
    Supports filtering by category, price range, and condition grade.
    """
    listings = MARKETPLACE_LISTINGS.copy()

    if category:
        listings = [l for l in listings if l["category"] == category]
    if min_price is not None:
        listings = [l for l in listings if l["resale_price"] >= min_price]
    if max_price is not None:
        listings = [l for l in listings if l["resale_price"] <= max_price]
    if grade:
        listings = [l for l in listings if l["condition_grade"] == grade]

    return {"listings": listings, "total": len(listings)}


@router.get("/recommendations")
async def get_recommendations(user_id: str = "user_001"):
    """
    Get personalized marketplace recommendations based on user interests
    and purchase history.
    """
    user = USERS.get(user_id)
    if not user:
        return {"recommendations": MARKETPLACE_LISTINGS[:3]}

    # Filter listings matching user interests
    interests = user.get("interests", [])
    recommended = [
        l for l in MARKETPLACE_LISTINGS
        if l["category"] in interests
    ]

    # If not enough matches, add top-rated items
    if len(recommended) < 3:
        remaining = [l for l in MARKETPLACE_LISTINGS if l not in recommended]
        remaining.sort(key=lambda x: x["condition_score"], reverse=True)
        recommended.extend(remaining[:3 - len(recommended)])

    return {"recommendations": recommended}


@router.get("/{listing_id}")
async def get_listing(listing_id: str):
    """Get a specific marketplace listing by ID."""
    listing = next(
        (l for l in MARKETPLACE_LISTINGS if l["id"] == listing_id), None
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing
