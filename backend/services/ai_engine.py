"""
AI Return Intelligence Engine
==============================
Simulates AI-powered condition assessment, disposition recommendation,
fraud detection, visual condition analysis, functionality estimation,
sustainability impact calculation, and next-best-owner matching.
"""

import random
import hashlib
from datetime import datetime, timedelta
from typing import Tuple, List


# Condition multipliers by grade for dynamic pricing
CONDITION_MULTIPLIERS = {
    "A": 0.85,
    "B": 0.70,
    "C": 0.50,
    "D": 0.25
}

# Weight estimates per category (kg) for sustainability calculations
CATEGORY_WEIGHTS = {
    "Electronics": 1.2,
    "Clothing": 0.5,
    "Home & Kitchen": 3.5,
    "Books": 0.8,
    "Toys & Games": 1.5,
    "Sports & Outdoors": 2.0,
    "Beauty": 0.6,
    "Automotive": 4.0,
}

# CO2 factor per kg of waste diverted (kg CO2 saved)
CO2_FACTOR = 2.73

# Demand factors by category (simulated market demand)
DEMAND_FACTORS = {
    "Electronics": 1.1,
    "Clothing": 0.9,
    "Home & Kitchen": 1.0,
    "Books": 0.85,
    "Toys & Games": 0.95,
    "Sports & Outdoors": 0.92,
    "Beauty": 0.88,
    "Automotive": 0.95
}

# Common issues detected by AI per category
DETECTED_ISSUES_MAP = {
    "Electronics": [
        "Minor screen scratches", "Scuff marks on casing", "Missing charging cable",
        "Battery degradation (5-10%)", "Cosmetic dent on corner",
        "Fingerprints on lens", "Loose button"
    ],
    "Clothing": [
        "Minor pilling on fabric", "Slight color fade", "Missing button",
        "Small stain (removable)", "Stretched elastic", "Loose thread",
        "Minor wrinkles"
    ],
    "Home & Kitchen": [
        "Minor scratches on surface", "Missing accessory", "Dent on exterior",
        "Discoloration from use", "Worn gasket", "Scuff on base"
    ],
    "Books": [
        "Bent corner", "Spine crease", "Minor highlighting",
        "Dog-eared pages", "Cover wear"
    ],
    "Toys & Games": [
        "Missing pieces", "Box damage", "Sticker residue",
        "Minor paint chip", "Instruction manual creased"
    ],
    "Sports & Outdoors": [
        "Scuff marks", "Minor scratch", "Worn grip",
        "Faded color", "Missing strap"
    ],
    "Beauty": [
        "Packaging dent", "Used once (sanitized)", "Missing cap",
        "Slight discoloration", "Pump mechanism stiff"
    ],
    "Automotive": [
        "Minor scratch", "Packaging damage", "Missing hardware",
        "Scuff marks", "Faded finish"
    ]
}


def assess_condition(product_category: str, product_value: float, reason: str) -> dict:
    """
    Simulate AI condition assessment based on product category and return reason.
    Returns condition score, grade, label, detected issues, visual condition analysis,
    and functionality estimate.
    """
    # Base score influenced by category and reason
    base_score = random.randint(40, 95)

    # Adjust based on return reason
    reason_lower = reason.lower()
    if "defective" in reason_lower or "broken" in reason_lower:
        base_score = min(base_score, random.randint(20, 45))
    elif "wrong" in reason_lower or "size" in reason_lower:
        base_score = max(base_score, random.randint(75, 95))
    elif "not as described" in reason_lower:
        base_score = random.randint(50, 75)
    elif "changed mind" in reason_lower or "no longer needed" in reason_lower:
        base_score = random.randint(80, 98)

    # Determine grade from score
    grade, label = _score_to_grade(base_score)

    # Generate detected issues based on grade
    issues = _generate_issues(product_category, grade)

    # Generate visual report
    visual_report = _generate_visual_report(grade, label, issues, product_category)

    # Enhanced: Visual condition analysis
    visual_analysis = _generate_visual_analysis(grade, product_category)

    # Enhanced: Functionality estimate
    functionality = _estimate_functionality(base_score, reason)

    return {
        "condition_score": base_score,
        "grade": grade,
        "label": label,
        "detected_issues": issues,
        "visual_report": visual_report,
        "visual_analysis": visual_analysis,
        "functionality_estimate": functionality
    }


def recommend_disposition(
    condition_score: int,
    grade: str,
    category: str,
    product_value: float
) -> dict:
    """
    Enhanced AI-powered disposition recommendation with explainability.
    Evaluates condition, category, demand, resale value, refurbishment cost,
    donation impact, and recycling value. Returns recommended action with
    detailed reasoning factors.
    """
    disposition, explanation, confidence = _determine_disposition(
        condition_score, grade, category, product_value
    )

    # Calculate resale price using dynamic pricing formula
    resale_price = None
    if disposition in ["Resell", "Peer-to-Peer Exchange"]:
        condition_mult = CONDITION_MULTIPLIERS.get(grade, 0.5)
        demand_factor = DEMAND_FACTORS.get(category, 1.0)
        resale_price = round(product_value * condition_mult * demand_factor, 2)

    # Enhanced: Generate explainability factors for the decision
    explainability = _generate_explainability(
        condition_score, grade, category, product_value, disposition
    )

    return {
        "disposition": disposition,
        "explanation": explanation,
        "confidence": confidence,
        "resale_price": resale_price,
        "explainability": explainability
    }


def calculate_trust_score_delta(
    is_live: bool,
    is_duplicate: bool,
    timestamp_valid: bool,
    verification_code_valid: bool
) -> int:
    """Calculate trust score change based on verification results."""
    delta = 0
    if not is_live:
        delta -= 15
    if is_duplicate:
        delta -= 25
    if not timestamp_valid:
        delta -= 10
    if not verification_code_valid:
        delta -= 20
    if is_live and not is_duplicate and timestamp_valid and verification_code_valid:
        delta += 2  # Small boost for honest behavior
    return delta


def detect_fraud(image_hash: str, timestamp: str, verification_code: str) -> dict:
    """
    Simulate fraud detection via image hashing, timestamp validation,
    and verification code checking.
    """
    from mock_data.database import IMAGE_HASH_STORE

    # Check for duplicate image
    is_duplicate = image_hash in IMAGE_HASH_STORE
    if not is_duplicate:
        IMAGE_HASH_STORE.add(image_hash)

    # Validate timestamp (must be within last 5 minutes)
    try:
        ts = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        now = datetime.now(ts.tzinfo) if ts.tzinfo else datetime.now()
        time_diff = abs((now - ts).total_seconds())
        timestamp_valid = time_diff < 300  # 5 minutes
    except (ValueError, TypeError):
        timestamp_valid = False

    # Verification code validation (simulated - just check non-empty)
    code_valid = bool(verification_code and len(verification_code) == 6)

    # Determine if image is live (simulated)
    is_live = not is_duplicate and timestamp_valid

    return {
        "is_valid": is_live and not is_duplicate and code_valid,
        "is_live": is_live,
        "is_duplicate": is_duplicate,
        "timestamp_valid": timestamp_valid,
        "verification_code_valid": code_valid,
        "trust_score_delta": calculate_trust_score_delta(
            is_live, is_duplicate, timestamp_valid, code_valid
        )
    }


def calculate_green_credits(disposition: str, product_value: float) -> int:
    """Calculate green credits earned based on disposition type."""
    credit_map = {
        "Donate": 100,
        "Recycle": 50,
        "Refurbish": 85,
        "Resell": 60,
        "Peer-to-Peer Exchange": 70
    }
    base_credits = credit_map.get(disposition, 30)
    # Bonus for higher value items
    value_bonus = int(product_value / 100) * 5
    return base_credits + value_bonus


def get_return_risk(product_id: str, category: str) -> dict:
    """Get return risk assessment for a product."""
    from mock_data.database import RETURN_RISK_DATA

    if product_id in RETURN_RISK_DATA:
        return RETURN_RISK_DATA[product_id]

    # Generate default risk data for unknown products
    risk_score = random.randint(10, 50)
    return {
        "product_id": product_id,
        "risk_score": risk_score,
        "common_return_reasons": [
            "Not as described",
            "Changed mind",
            "Found better price"
        ],
        "recommendations": [
            "Read all product specifications",
            "Check customer reviews and photos",
            "Compare with alternatives"
        ],
        "size_guidance": None if category != "Clothing" else "Check size chart before ordering",
        "alternatives": []
    }


# ============ Private Helper Functions ============

def _score_to_grade(score: int) -> Tuple[str, str]:
    """Convert numeric score to letter grade and label."""
    if score >= 85:
        return "A", "Like New"
    elif score >= 65:
        return "B", "Good"
    elif score >= 40:
        return "C", "Fair"
    else:
        return "D", "Damaged"


def _generate_issues(category: str, grade: str) -> List[str]:
    """Generate detected issues based on category and grade."""
    available_issues = DETECTED_ISSUES_MAP.get(category, ["General wear"])

    # Number of issues correlates inversely with grade
    issue_counts = {"A": (0, 1), "B": (1, 3), "C": (2, 4), "D": (3, 5)}
    min_issues, max_issues = issue_counts.get(grade, (1, 3))
    num_issues = random.randint(min_issues, min(max_issues, len(available_issues)))

    return random.sample(available_issues, num_issues) if num_issues > 0 else []


def _generate_visual_report(grade: str, label: str, issues: List[str], category: str) -> str:
    """Generate a human-readable visual condition report."""
    report_parts = [
        f"Condition Grade: {grade} ({label})",
        f"Category: {category}",
        f"Overall Assessment: {'Excellent' if grade == 'A' else 'Good' if grade == 'B' else 'Fair' if grade == 'C' else 'Poor'} condition"
    ]

    if issues:
        report_parts.append(f"Detected Issues: {', '.join(issues)}")
    else:
        report_parts.append("No significant issues detected")

    return " | ".join(report_parts)


def _determine_disposition(
    score: int, grade: str, category: str, value: float
) -> Tuple[str, str, float]:
    """Determine optimal disposition based on multiple factors."""
    if grade == "A":
        if value > 200:
            return (
                "Resell",
                f"Product is in {grade} condition (Like New) with high market value. "
                f"Recommended for certified resale at premium recovery rate.",
                0.94
            )
        else:
            return (
                "Peer-to-Peer Exchange",
                f"Product is in excellent condition. Lower value items recover well "
                f"through peer-to-peer marketplace with lower overhead costs.",
                0.88
            )
    elif grade == "B":
        if value > 300:
            return (
                "Refurbish",
                f"Product shows minor wear but has high original value. "
                f"Professional refurbishment will maximize recovery value.",
                0.85
            )
        else:
            return (
                "Resell",
                f"Product in good condition with moderate value. "
                f"Can be resold as-is with appropriate condition disclosure.",
                0.82
            )
    elif grade == "C":
        if category in ["Electronics", "Home & Kitchen"]:
            return (
                "Refurbish",
                f"Product needs attention but category supports cost-effective refurbishment. "
                f"Expected recovery after refurb: {int(value * 0.6)}.",
                0.75
            )
        else:
            return (
                "Donate",
                f"Product condition is fair and refurbishment cost exceeds recovery value. "
                f"Donation provides tax benefit and sustainability credits.",
                0.78
            )
    else:  # Grade D
        if category == "Electronics":
            return (
                "Recycle",
                f"Product is significantly damaged. Electronic components can be "
                f"responsibly recycled to recover valuable materials.",
                0.90
            )
        else:
            return (
                "Recycle",
                f"Product condition does not support resale or refurbishment. "
                f"Recycling ensures materials are properly recovered.",
                0.85
            )


# ============ Enhanced Feature Functions ============

def calculate_sustainability_impact(disposition: str, category: str, product_value: float) -> dict:
    """
    Calculate sustainability impact metrics for a transaction.
    Returns waste prevented, carbon saved, and green credits earned.
    """
    weight = CATEGORY_WEIGHTS.get(category, 1.0)

    # Waste prevented depends on disposition
    waste_multiplier = {
        "Resell": 1.0,
        "Refurbish": 0.9,
        "Donate": 0.85,
        "Recycle": 0.6,
        "Peer-to-Peer Exchange": 1.0
    }
    waste_prevented = round(weight * waste_multiplier.get(disposition, 0.7), 2)
    carbon_saved = round(waste_prevented * CO2_FACTOR, 2)
    credits = calculate_green_credits(disposition, product_value)

    return {
        "waste_prevented_kg": waste_prevented,
        "carbon_saved_kg": carbon_saved,
        "green_credits_earned": credits
    }


def generate_next_best_owners(category: str, condition_grade: str) -> list:
    """
    Generate mock nearby buyers for 'Next Best Owner' matching.
    Simulates local matching to reduce logistics cost and carbon footprint.
    """
    mock_buyers = [
        {"name": "Neha S.", "distance_km": 2.3, "interest_match": 94, "trust_score": 88},
        {"name": "Rahul M.", "distance_km": 5.1, "interest_match": 87, "trust_score": 91},
        {"name": "Ananya K.", "distance_km": 7.8, "interest_match": 82, "trust_score": 76},
        {"name": "Priya D.", "distance_km": 3.5, "interest_match": 91, "trust_score": 85},
        {"name": "Arjun P.", "distance_km": 4.2, "interest_match": 78, "trust_score": 92},
        {"name": "Kavitha R.", "distance_km": 6.0, "interest_match": 85, "trust_score": 79},
    ]

    # Select 3 buyers randomly and sort by distance
    selected = random.sample(mock_buyers, min(3, len(mock_buyers)))
    selected.sort(key=lambda x: x["distance_km"])

    # Add local match badge for buyers within 5km
    for buyer in selected:
        buyer["local_match"] = buyer["distance_km"] <= 5.0

    return selected


def _generate_visual_analysis(grade: str, category: str) -> dict:
    """
    Generate enhanced visual condition analysis detecting specific issues:
    scratches, broken parts, color fading, damaged packaging, missing accessories.
    """
    # Probabilities of each defect type based on grade
    defect_probabilities = {
        "A": {"scratches": 0.1, "broken_parts": 0.0, "color_fading": 0.05, "damaged_packaging": 0.1, "missing_accessories": 0.05},
        "B": {"scratches": 0.5, "broken_parts": 0.05, "color_fading": 0.2, "damaged_packaging": 0.3, "missing_accessories": 0.15},
        "C": {"scratches": 0.7, "broken_parts": 0.2, "color_fading": 0.4, "damaged_packaging": 0.5, "missing_accessories": 0.35},
        "D": {"scratches": 0.9, "broken_parts": 0.6, "color_fading": 0.5, "damaged_packaging": 0.7, "missing_accessories": 0.6},
    }

    probs = defect_probabilities.get(grade, defect_probabilities["C"])

    analysis = {
        "scratches": random.random() < probs["scratches"],
        "broken_parts": random.random() < probs["broken_parts"],
        "color_fading": random.random() < probs["color_fading"],
        "damaged_packaging": random.random() < probs["damaged_packaging"],
        "missing_accessories": random.random() < probs["missing_accessories"],
    }

    # Generate severity for detected issues
    detected = []
    severity_map = {"A": "Minor", "B": "Moderate", "C": "Significant", "D": "Severe"}
    severity = severity_map.get(grade, "Moderate")

    if analysis["scratches"]:
        detected.append({"type": "Scratches", "severity": severity, "location": "Surface"})
    if analysis["broken_parts"]:
        detected.append({"type": "Broken Parts", "severity": severity, "location": "Structural"})
    if analysis["color_fading"]:
        detected.append({"type": "Color Fading", "severity": severity, "location": "Exterior"})
    if analysis["damaged_packaging"]:
        detected.append({"type": "Damaged Packaging", "severity": severity, "location": "Box/Case"})
    if analysis["missing_accessories"]:
        detected.append({"type": "Missing Accessories", "severity": severity, "location": "Contents"})

    return {
        "defects_detected": detected,
        "total_defects": len(detected),
        "overall_severity": severity
    }


def _estimate_functionality(score: int, reason: str) -> str:
    """
    Estimate product functionality based on condition score and return reason.
    Returns: 'Likely Working', 'Needs Inspection', or 'Likely Faulty'
    """
    reason_lower = reason.lower()

    if "defective" in reason_lower or "broken" in reason_lower:
        if score < 30:
            return "Likely Faulty"
        return "Needs Inspection"
    elif score >= 75:
        return "Likely Working"
    elif score >= 45:
        return "Needs Inspection"
    else:
        return "Likely Faulty"


def _generate_explainability(
    score: int, grade: str, category: str, value: float, disposition: str
) -> dict:
    """
    Generate explainability factors for the disposition decision.
    Shows why the AI recommended this particular action.
    """
    demand_score = int(DEMAND_FACTORS.get(category, 1.0) * 100)
    condition_mult = CONDITION_MULTIPLIERS.get(grade, 0.5)
    estimated_resale = round(value * condition_mult * DEMAND_FACTORS.get(category, 1.0), 2)
    refurbishment_cost = round(value * (0.15 if grade in ["A", "B"] else 0.35), 2)
    recycling_value = round(value * 0.08, 2)

    factors = []
    if demand_score >= 90:
        factors.append("✓ High demand")
    elif demand_score >= 80:
        factors.append("✓ Moderate demand")
    else:
        factors.append("△ Low demand")

    if score >= 75:
        factors.append("✓ Good condition")
    elif score >= 50:
        factors.append("△ Fair condition")
    else:
        factors.append("✗ Poor condition")

    if estimated_resale > value * 0.5:
        factors.append("✓ Strong resale value")
    elif estimated_resale > value * 0.3:
        factors.append("△ Moderate resale value")
    else:
        factors.append("✗ Low resale value")

    if refurbishment_cost < value * 0.2:
        factors.append("✓ Low refurbishment requirement")
    elif refurbishment_cost < value * 0.3:
        factors.append("△ Moderate refurbishment cost")
    else:
        factors.append("✗ High refurbishment cost")

    return {
        "recommended_action": disposition.upper(),
        "factors": factors,
        "demand_score": demand_score,
        "estimated_resale_value": estimated_resale,
        "refurbishment_cost": refurbishment_cost,
        "donation_impact_score": random.randint(60, 95),
        "recycling_value": recycling_value
    }
