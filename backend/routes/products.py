"""
Products API Routes
====================
Handles product listing, detail retrieval, and return risk assessment.
"""

from fastapi import APIRouter, HTTPException
from mock_data.database import PRODUCTS, RETURN_RISK_DATA
from services.ai_engine import get_return_risk

router = APIRouter()


@router.get("/")
async def get_products(user_id: str = "user_001"):
    """Get all products purchased by a user."""
    return {"products": PRODUCTS}


@router.get("/{product_id}")
async def get_product(product_id: str):
    """Get a specific product by ID."""
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/{product_id}/return-risk")
async def get_product_return_risk(product_id: str):
    """
    Get return risk assessment for a product.
    Used for predictive return prevention on product pages.
    """
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    risk_data = get_return_risk(product_id, product["category"])
    return risk_data
