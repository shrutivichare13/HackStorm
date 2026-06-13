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

# ============================================================
# FIX 7: Sustainability factors lookup table
# (mirrors frontend sustainabilityFactors.json exactly)
# ============================================================
SUSTAINABILITY_FACTORS = {
    "Electronics":      {"avg_weight_kg": 1.2, "carbon_factor": 2.73},
    "Clothing":         {"avg_weight_kg": 0.4, "carbon_factor": 3.5},
    "Home & Kitchen":   {"avg_weight_kg": 2.5, "carbon_factor": 1.8},
    "Books":            {"avg_weight_kg": 0.8, "carbon_factor": 2.0},
    "Toys & Games":     {"avg_weight_kg": 1.5, "carbon_factor": 2.0},
    "Sports & Outdoors":{"avg_weight_kg": 2.0, "carbon_factor": 2.0},
    "Beauty":           {"avg_weight_kg": 0.6, "carbon_factor": 2.0},
    "Automotive":       {"avg_weight_kg": 4.0, "carbon_factor": 2.0},
}
DEFAULT_SUSTAINABILITY = {"avg_weight_kg": 1.0, "carbon_factor": 2.0}

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
    """
    base_score = random.randint(40, 95)

    reason_lower = reason.lower()
    if "defective" in reason_lower or "broken" in reason_lower:
        base_score = min(base_score, random.randint(20, 45))
    elif "wrong" in reason_lower or "size" in reason_lower:
        base_score = max(base_score, random.randint(75, 95))
    elif "not as described" in reason_lower:
        base_score = random.randint(50, 75)
    elif "changed mind" in reason_lower or "no longer needed" in reason_lower:
        base_score = random.randint(80, 98)

    grade, label = _score_to_grade(base_score)
    issues = _generate_issues(product_category, grade)
    visual_report = _generate_visual_report(grade, label, issues, product_category)
    visual_analysis = _generate_visual_analysis(grade, product_category)
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


# ============================================================
# FIX 3: Consistent decision engine with unified value calc
# ============================================================
def _compute_values(grade: str, category: str, product_value: float) -> dict:
    """
    Compute all monetary values used by both the decision logic AND
    the explainability panel — single source of truth.

    Returns:
        resale_as_is           – what the item fetches today, as-is
        refurbish_cost         – cost to refurbish
        resale_after_refurb    – resale value if refurbished
        net_after_refurb       – resale_after_refurb - refurbish_cost
        recycle_value          – scrap/parts value
    """
    demand = DEMAND_FACTORS.get(category, 1.0)
    cond_mult = CONDITION_MULTIPLIERS.get(grade, 0.5)

    resale_as_is = round(product_value * cond_mult * demand, 2)

    # Refurbishment cost: 15% of value for A/B, 35% for C/D
    refurb_pct = 0.15 if grade in ("A", "B") else 0.35
    refurbish_cost = round(product_value * refurb_pct, 2)

    # After refurb the item grades up by one tier
    refurb_grade_mult = {"A": 0.85, "B": 0.85, "C": 0.70, "D": 0.50}
    resale_after_refurb = round(product_value * refurb_grade_mult.get(grade, 0.70) * demand, 2)

    net_after_refurb = round(resale_after_refurb - refurbish_cost, 2)
    recycle_value = round(product_value * 0.08, 2)

    return {
        "resale_as_is": resale_as_is,
        "refurbish_cost": refurbish_cost,
        "resale_after_refurb": resale_after_refurb,
        "net_after_refurb": net_after_refurb,
        "recycle_value": recycle_value,
    }


def recommend_disposition(
    condition_score: int,
    grade: str,
    category: str,
    product_value: float
) -> dict:
    """
    FIX 3: Disposition is now derived deterministically from the computed
    values — the decision always matches the displayed numbers.
    """
    vals = _compute_values(grade, category, product_value)
    resale_as_is    = vals["resale_as_is"]
    net_after_refurb = vals["net_after_refurb"]
    recycle_value    = vals["recycle_value"]

    RESALE_FLOOR = 50.0   # below this, don't recommend bare resale

    # Rule-based decision — consistent with displayed numbers
    if net_after_refurb > resale_as_is and net_after_refurb > recycle_value:
        disposition = "Refurbish"
        explanation = (
            f"Net recovery after refurbishment (₹{net_after_refurb:.0f}) exceeds "
            f"direct resale (₹{resale_as_is:.0f}) and recycling (₹{recycle_value:.0f})."
        )
        confidence = 0.87
        resale_price = None
    elif resale_as_is >= RESALE_FLOOR and resale_as_is >= net_after_refurb and resale_as_is > recycle_value:
        if product_value > 200 or grade in ("A",):
            disposition = "Resell"
        else:
            disposition = "Peer-to-Peer Exchange"
        explanation = (
            f"Direct resale value (₹{resale_as_is:.0f}) is the strongest recovery path."
        )
        confidence = 0.91
        resale_price = resale_as_is
    elif condition_score >= 40:
        # Usable but low value — donate
        disposition = "Donate"
        explanation = (
            "Resale value is low and refurbishment cost outweighs recovery. "
            "Donation provides social impact and sustainability credits."
        )
        confidence = 0.78
        resale_price = None
    else:
        disposition = "Recycle"
        explanation = (
            "Item condition does not support resale or refurbishment. "
            "Responsible recycling recovers raw material value."
        )
        confidence = 0.85
        resale_price = None

    explainability = _generate_explainability(
        condition_score, grade, category, product_value, disposition, vals
    )

    return {
        "disposition": disposition,
        "explanation": explanation,
        "confidence": confidence,
        "resale_price": resale_price,
        "explainability": explainability,
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
        delta += 2
    return delta


def detect_fraud(image_hash: str, timestamp: str, verification_code: str) -> dict:
    """Simulate fraud detection via image hashing, timestamp and code validation."""
    from mock_data.database import IMAGE_HASH_STORE

    is_duplicate = image_hash in IMAGE_HASH_STORE
    if not is_duplicate:
        IMAGE_HASH_STORE.add(image_hash)

    try:
        ts = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        now = datetime.now(ts.tzinfo) if ts.tzinfo else datetime.now()
        time_diff = abs((now - ts).total_seconds())
        timestamp_valid = time_diff < 300
    except (ValueError, TypeError):
        timestamp_valid = False

    code_valid = bool(verification_code and len(verification_code) == 6)
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


# ============================================================
# FIX 6: Green credits formula – condition_score × multiplier
# ============================================================
DISPOSITION_CREDIT_MULTIPLIERS = {
    "Donate":               0.9,
    "Recycle":              0.8,
    "Resell":               0.7,
    "Refurbish":            0.7,
    "Peer-to-Peer Exchange": 0.8,
}

def calculate_green_credits(disposition: str, condition_score: int) -> dict:
    """
    FIX 6: Credits = round(condition_score × dispositionMultiplier).
    Returns a dict with the full breakdown so the UI can show the formula.
    `condition_score` replaces the old `product_value` parameter.
    """
    multiplier = DISPOSITION_CREDIT_MULTIPLIERS.get(disposition, 0.7)
    credits_raw = condition_score * multiplier
    credits_awarded = round(credits_raw)
    return {
        "credits_awarded": credits_awarded,
        "condition_score": condition_score,
        "multiplier": multiplier,
        "credits_raw": round(credits_raw, 1),
        "disposition": disposition,
    }


def get_return_risk(product_id: str, category: str) -> dict:
    """Get return risk assessment for a product."""
    from mock_data.database import RETURN_RISK_DATA

    if product_id in RETURN_RISK_DATA:
        return RETURN_RISK_DATA[product_id]

    risk_score = random.randint(10, 50)
    return {
        "product_id": product_id,
        "risk_score": risk_score,
        "common_return_reasons": ["Not as described", "Changed mind", "Found better price"],
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
    if score >= 85:
        return "A", "Like New"
    elif score >= 65:
        return "B", "Good"
    elif score >= 40:
        return "C", "Fair"
    else:
        return "D", "Damaged"


def _generate_issues(category: str, grade: str) -> List[str]:
    available_issues = DETECTED_ISSUES_MAP.get(category, ["General wear"])
    issue_counts = {"A": (0, 1), "B": (1, 3), "C": (2, 4), "D": (3, 5)}
    min_issues, max_issues = issue_counts.get(grade, (1, 3))
    num_issues = random.randint(min_issues, min(max_issues, len(available_issues)))
    return random.sample(available_issues, num_issues) if num_issues > 0 else []


def _generate_visual_report(grade: str, label: str, issues: List[str], category: str) -> str:
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


def _generate_visual_analysis(grade: str, category: str) -> dict:
    defect_probabilities = {
        "A": {"scratches": 0.1, "broken_parts": 0.0, "color_fading": 0.05, "damaged_packaging": 0.1, "missing_accessories": 0.05},
        "B": {"scratches": 0.5, "broken_parts": 0.05, "color_fading": 0.2, "damaged_packaging": 0.3, "missing_accessories": 0.15},
        "C": {"scratches": 0.7, "broken_parts": 0.2, "color_fading": 0.4, "damaged_packaging": 0.5, "missing_accessories": 0.35},
        "D": {"scratches": 0.9, "broken_parts": 0.6, "color_fading": 0.5, "damaged_packaging": 0.7, "missing_accessories": 0.6},
    }
    probs = defect_probabilities.get(grade, defect_probabilities["C"])
    detected = []
    severity_map = {"A": "Minor", "B": "Moderate", "C": "Significant", "D": "Severe"}
    severity = severity_map.get(grade, "Moderate")

    if random.random() < probs["scratches"]:
        detected.append({"type": "Scratches", "severity": severity, "location": "Surface"})
    if random.random() < probs["broken_parts"]:
        detected.append({"type": "Broken Parts", "severity": severity, "location": "Structural"})
    if random.random() < probs["color_fading"]:
        detected.append({"type": "Color Fading", "severity": severity, "location": "Exterior"})
    if random.random() < probs["damaged_packaging"]:
        detected.append({"type": "Damaged Packaging", "severity": severity, "location": "Box/Case"})
    if random.random() < probs["missing_accessories"]:
        detected.append({"type": "Missing Accessories", "severity": severity, "location": "Contents"})

    return {"defects_detected": detected, "total_defects": len(detected), "overall_severity": severity}


def _estimate_functionality(score: int, reason: str) -> str:
    reason_lower = reason.lower()
    if "defective" in reason_lower or "broken" in reason_lower:
        return "Likely Faulty" if score < 30 else "Needs Inspection"
    elif score >= 75:
        return "Likely Working"
    elif score >= 45:
        return "Needs Inspection"
    else:
        return "Likely Faulty"


def _generate_explainability(
    score: int, grade: str, category: str, value: float, disposition: str,
    vals: dict = None
) -> dict:
    """
    FIX 3: Uses pre-computed vals dict — same numbers shown in the
    DecisionTransparencyPanel and in the decision logic itself.
    """
    if vals is None:
        vals = _compute_values(grade, category, value)

    demand_score = int(DEMAND_FACTORS.get(category, 1.0) * 100)
    resale_as_is       = vals["resale_as_is"]
    refurbish_cost     = vals["refurbish_cost"]
    resale_after_refurb = vals["resale_after_refurb"]
    net_after_refurb   = vals["net_after_refurb"]
    recycle_value      = vals["recycle_value"]

    RESALE_FLOOR = 50.0
    show_resale_as_is = resale_as_is if resale_as_is >= RESALE_FLOOR else None

    factors = []
    if demand_score >= 100:
        factors.append("✓ High demand")
    elif demand_score >= 85:
        factors.append("✓ Moderate demand")
    else:
        factors.append("△ Low demand")

    if score >= 75:
        factors.append("✓ Good condition")
    elif score >= 50:
        factors.append("△ Fair condition")
    else:
        factors.append("✗ Poor condition")

    if resale_as_is > value * 0.5:
        factors.append("✓ Strong resale value")
    elif resale_as_is > value * 0.3:
        factors.append("△ Moderate resale value")
    else:
        factors.append("✗ Low resale value")

    if refurbish_cost < value * 0.2:
        factors.append("✓ Low refurbishment requirement")
    elif refurbish_cost < value * 0.3:
        factors.append("△ Moderate refurbishment cost")
    else:
        factors.append("✗ High refurbishment cost")

    return {
        "recommended_action": disposition.upper(),
        "factors": factors,
        "demand_score": demand_score,
        # FIX 3: all four values exported for the UI
        "resale_as_is": resale_as_is,
        "show_resale_as_is": show_resale_as_is,   # None if below floor
        "refurbishment_cost": refurbish_cost,
        "resale_after_refurb": resale_after_refurb,
        "net_after_refurb": net_after_refurb,
        "recycling_value": recycle_value,
        # keep legacy field names so existing UI doesn't break
        "estimated_resale_value": resale_as_is,
        "donation_impact_score": random.randint(60, 95),
    }


# ============================================================
# FIX 7: Sustainability using lookup table
# ============================================================
def calculate_sustainability_impact(disposition: str, category: str, product_value: float) -> dict:
    """
    FIX 7: Uses SUSTAINABILITY_FACTORS lookup table — no more arbitrary weights.
    Returns derivation metadata so the UI can show ℹ️ tooltip.
    """
    factors = SUSTAINABILITY_FACTORS.get(category, DEFAULT_SUSTAINABILITY)
    avg_weight_kg = factors["avg_weight_kg"]
    carbon_factor = factors["carbon_factor"]

    waste_multiplier = {
        "Resell": 1.0, "Refurbish": 0.9, "Donate": 0.85,
        "Recycle": 0.6, "Peer-to-Peer Exchange": 1.0
    }
    mult = waste_multiplier.get(disposition, 0.7)
    waste_prevented = round(avg_weight_kg * mult, 2)
    carbon_saved = round(waste_prevented * carbon_factor, 2)

    return {
        "waste_prevented_kg": waste_prevented,
        "carbon_saved_kg": carbon_saved,
        # derivation metadata for tooltip
        "category": category,
        "avg_weight_kg": avg_weight_kg,
        "carbon_factor": carbon_factor,
        "waste_multiplier": mult,
    }


def generate_next_best_owners(category: str, condition_grade: str) -> list:
    mock_buyers = [
        {"name": "Neha S.", "distance_km": 2.3, "interest_match": 94, "trust_score": 88},
        {"name": "Rahul M.", "distance_km": 5.1, "interest_match": 87, "trust_score": 91},
        {"name": "Ananya K.", "distance_km": 7.8, "interest_match": 82, "trust_score": 76},
        {"name": "Priya D.", "distance_km": 3.5, "interest_match": 91, "trust_score": 85},
        {"name": "Arjun P.", "distance_km": 4.2, "interest_match": 78, "trust_score": 92},
        {"name": "Kavitha R.", "distance_km": 6.0, "interest_match": 85, "trust_score": 79},
    ]
    selected = random.sample(mock_buyers, min(3, len(mock_buyers)))
    selected.sort(key=lambda x: x["distance_km"])
    for buyer in selected:
        buyer["local_match"] = buyer["distance_km"] <= 5.0
    return selected
