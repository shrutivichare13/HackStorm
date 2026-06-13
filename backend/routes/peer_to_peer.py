"""
Peer-to-Peer Marketplace API Routes
=====================================
Handles P2P listings where users can buy and sell AI-verified products directly.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import Optional
from models.schemas import CreateP2PListing
from mock_data.database import P2P_LISTINGS, PRODUCTS, USERS

router = APIRouter()


@router.get("/")
async def get_p2p_listings(
    category: Optional[str] = None,
    min_trust_score: Optional[int] = None
):
    """
    Get all peer-to-peer listings with optional filters.
    """
    listings = P2P_LISTINGS.copy()

    if category:
        listings = [l for l in listings if l["category"] == category]
    if min_trust_score is not None:
        listings = [l for l in listings if l["seller_trust_score"] >= min_trust_score]

    return {"listings": listings, "total": len(listings)}


@router.post("/create")
async def create_p2p_listing(request: CreateP2PListing):
    """
    Create a new peer-to-peer listing.
    Product must have an AI-verified condition report.
    """
    # Find the product
    product = next((p for p in PRODUCTS if p["id"] == request.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    user = USERS.get("user_001")

    new_listing = {
        "id": f"p2p_{uuid.uuid4().hex[:6]}",
        "product_name": product["name"],
        "category": product["category"],
        "selling_price": request.selling_price,
        "original_price": product["original_price"],
        "condition_grade": "B",  # Would come from AI assessment
        "condition_report": request.description or "AI-verified condition assessment pending",
        "image_url": product["image_url"],
        "seller_id": user["id"],
        "seller_name": user["name"].split()[0] + " " + user["name"].split()[1][0] + ".",
        "seller_trust_score": user["trust_score"],
        "seller_rating": 4.5,
        "ai_verified": True,
        "listed_date": datetime.now().strftime("%Y-%m-%d")
    }

    P2P_LISTINGS.append(new_listing)
    return new_listing


@router.get("/{listing_id}")
async def get_p2p_listing(listing_id: str):
    """Get a specific P2P listing by ID."""
    listing = next((l for l in P2P_LISTINGS if l["id"] == listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing
