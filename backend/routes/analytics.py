"""
Analytics API Routes
=====================
Provides admin dashboard data including returns, cost savings,
sustainability metrics, fraud detection, revenue recovery trends,
carbon savings trends, and product lifecycle distribution.
"""

from fastapi import APIRouter
from mock_data.database import ANALYTICS_DATA

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_analytics():
    """Get complete analytics dashboard data with enhanced KPIs."""
    enhanced = {
        **ANALYTICS_DATA,
        # Additional KPIs
        "products_saved": int(ANALYTICS_DATA["total_returns"] * 0.78),
        "revenue_recovered": ANALYTICS_DATA["cost_savings"] * 0.65,
        # Revenue recovery trend (monthly)
        "revenue_trend": [
            {"month": "Jan", "recovered": 142000, "potential": 185000},
            {"month": "Feb", "recovered": 138000, "potential": 178000},
            {"month": "Mar", "recovered": 168000, "potential": 212000},
            {"month": "Apr", "recovered": 155000, "potential": 198000},
            {"month": "May", "recovered": 178000, "potential": 224000},
            {"month": "Jun", "recovered": 192000, "potential": 238000},
        ],
        # Carbon savings trend (monthly)
        "carbon_trend": [
            {"month": "Jan", "saved_kg": 18200},
            {"month": "Feb", "saved_kg": 17800},
            {"month": "Mar", "saved_kg": 21400},
            {"month": "Apr", "saved_kg": 19600},
            {"month": "May", "saved_kg": 22800},
            {"month": "Jun", "saved_kg": 23650},
        ],
        # Product lifecycle distribution
        "lifecycle_distribution": [
            {"stage": "Resold (Like New)", "count": 3840, "percentage": 24.2},
            {"stage": "Resold (Good)", "count": 2950, "percentage": 18.6},
            {"stage": "Refurbished & Sold", "count": 3962, "percentage": 25.0},
            {"stage": "Donated", "count": 2854, "percentage": 18.0},
            {"stage": "Recycled", "count": 2109, "percentage": 13.3},
            {"stage": "In Processing", "count": 132, "percentage": 0.9},
        ]
    }
    return enhanced


@router.get("/returns-summary")
async def get_returns_summary():
    """Get returns processing summary."""
    return {
        "total_returns": ANALYTICS_DATA["total_returns"],
        "disposition_breakdown": ANALYTICS_DATA["disposition_breakdown"],
        "return_prevention_rate": ANALYTICS_DATA["return_prevention_rate"]
    }


@router.get("/sustainability")
async def get_sustainability_metrics():
    """Get sustainability-focused metrics."""
    return {
        "waste_diverted_kg": ANALYTICS_DATA["waste_diverted_kg"],
        "co2_reduction_kg": ANALYTICS_DATA["co2_reduction_kg"],
        "trees_equivalent": round(ANALYTICS_DATA["co2_reduction_kg"] / 21.77),
        "landfill_items_saved": int(ANALYTICS_DATA["waste_diverted_kg"] / 2.5)
    }


@router.get("/financial")
async def get_financial_metrics():
    """Get financial recovery metrics."""
    return {
        "cost_savings": ANALYTICS_DATA["cost_savings"],
        "monthly_trends": ANALYTICS_DATA["monthly_trends"],
        "avg_recovery_rate": 72.5,
        "projected_annual_savings": ANALYTICS_DATA["cost_savings"] * 2
    }


@router.get("/fraud")
async def get_fraud_metrics():
    """Get fraud detection statistics."""
    return {
        "total_detections": ANALYTICS_DATA["fraud_detections"],
        "detection_rate": 94.2,
        "false_positive_rate": 2.1,
        "savings_from_prevention": ANALYTICS_DATA["fraud_detections"] * 245.50
    }
