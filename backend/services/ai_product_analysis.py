"""
AI Product Analysis Engine
============================
Enhanced AI pipeline that performs:
  Step 1: Product Match Verification (compare captured image to selected product)
  Step 2: Product Condition Analysis (category-adaptive physical inspection)
  Step 3: Condition Scoring Engine (score, grade, label)
  Step 4: Confidence-Based Results (AI confidence + manual review routing)

Uses mock AI logic to simulate computer vision model outputs.
All results are stored in the in-memory MongoDB-style collection for
future marketplace and resale decisions.
"""

import hashlib
import random
from datetime import datetime
from typing import Optional, List, Dict, Any


# ============================================================
# Category-specific inspection criteria
# ============================================================

CATEGORY_INSPECTION_CRITERIA: Dict[str, Dict[str, List[str]]] = {
    "Electronics": {
        "physical_checks": [
            "Screen damage", "Body scratches", "Structural damage",
            "Port condition", "Button responsiveness", "Hinge integrity"
        ],
        "accessory_checks": [
            "Missing accessories", "Cable condition", "Charger present",
            "Manual included", "Original packaging"
        ],
        "functional_checks": [
            "Power on/off", "Display quality", "Speaker output",
            "Connectivity (BT/WiFi)", "Battery health"
        ]
    },
    "Clothing": {
        "physical_checks": [
            "Stains", "Tears", "Fading", "Pilling",
            "Stretched fabric", "Wrinkles"
        ],
        "accessory_checks": [
            "Missing buttons", "Zipper condition", "Belt/strap present",
            "Tags attached"
        ],
        "functional_checks": [
            "Fabric integrity", "Elastic condition", "Color uniformity"
        ]
    },
    "Home & Kitchen": {
        "physical_checks": [
            "Surface scratches", "Dents", "Discoloration",
            "Rust spots", "Chipping"
        ],
        "accessory_checks": [
            "Missing parts", "Manual present", "All attachments included"
        ],
        "functional_checks": [
            "Mechanism working", "Motor condition", "Seal integrity",
            "Safety features"
        ]
    },
    "Books": {
        "physical_checks": [
            "Cover condition", "Spine integrity", "Page yellowing",
            "Bent corners", "Water damage"
        ],
        "accessory_checks": [
            "Dust jacket present", "CD/DVD included (if applicable)"
        ],
        "functional_checks": [
            "Pages intact", "Binding solid", "No missing pages"
        ]
    },
    "Toys & Games": {
        "physical_checks": [
            "Paint chips", "Broken parts", "Sticker residue",
            "Discoloration", "Sharp edges"
        ],
        "accessory_checks": [
            "Missing pieces", "Box condition", "Instructions included",
            "Batteries (if needed)"
        ],
        "functional_checks": [
            "Moving parts work", "Electronic features", "Safety compliance"
        ]
    },
    "Sports & Outdoors": {
        "physical_checks": [
            "Scuff marks", "Worn grip", "Faded color",
            "Dents", "Fraying"
        ],
        "accessory_checks": [
            "Missing straps", "Pump/tools included", "Carry bag present"
        ],
        "functional_checks": [
            "Structural integrity", "Inflation holds", "Locking mechanisms"
        ]
    },
    "Beauty": {
        "physical_checks": [
            "Packaging dent", "Cap/lid condition", "Pump mechanism",
            "Label condition"
        ],
        "accessory_checks": [
            "Applicator present", "Seal intact", "Box condition"
        ],
        "functional_checks": [
            "Dispenser works", "Product not expired", "Sanitized"
        ]
    },
    "Automotive": {
        "physical_checks": [
            "Scratches", "Rust", "Faded finish",
            "Dents", "Cracks"
        ],
        "accessory_checks": [
            "Mounting hardware", "Wiring harness", "Instructions"
        ],
        "functional_checks": [
            "Fit compatibility", "Electronic function", "Seal condition"
        ]
    }
}

# Shoe-specific sub-inspection (subset of Clothing)
SHOE_INSPECTION = {
    "checks": [
        "Sole wear", "Torn fabric", "Dirt level",
        "Shape deformation", "Missing laces", "Insole condition"
    ]
}

# Electronics sub-categories with specific checks
ELECTRONICS_SUBCHECKS = {
    "headphones": ["Ear pad wear", "Headband stretch", "Driver condition", "ANC performance"],
    "phone": ["Screen cracks", "Bezel chips", "Camera lens scratches", "Port lint"],
    "laptop": ["Keyboard wear", "Trackpad condition", "Hinge tightness", "Fan noise"],
    "tablet": ["Screen scratches", "Bezel condition", "Stylus slot", "Smart connector"],
}


# ============================================================
# Step 1: Product Match Verification
# ============================================================

def verify_product_match(
    product_id: str,
    product_name: str,
    product_category: str,
    catalog_image_url: str,
    captured_image_hash: str,
    captured_timestamp: str,
) -> Dict[str, Any]:
    """
    Simulate AI product verification by comparing the captured image
    against the selected product's metadata.

    Returns match_percentage (0-100) and verification_status.
    Threshold: 70% for passing.
    """
    # Deterministic mock: hash the product_id + image_hash for reproducibility
    seed_str = f"{product_id}:{captured_image_hash}:{captured_timestamp}"
    seed_hash = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
    random.seed(seed_hash)

    # Base match score influenced by product name keywords in hash
    base_score = random.randint(65, 98)

    # Simulate category confidence boost
    category_boost = {
        "Electronics": 3,
        "Clothing": -2,
        "Home & Kitchen": 1,
        "Books": 5,
        "Toys & Games": 2,
        "Sports & Outdoors": 0,
        "Beauty": 1,
        "Automotive": -1,
    }
    boost = category_boost.get(product_category, 0)
    match_percentage = max(0, min(100, base_score + boost))

    # Determine verification status
    if match_percentage >= 85:
        verification_status = "Verified Match"
    elif match_percentage >= 70:
        verification_status = "Possible Match"
    else:
        verification_status = "Not Matching"

    # Compute feature-level comparison scores
    title_similarity = max(0, min(100, match_percentage + random.randint(-5, 5)))
    category_match = match_percentage >= 70
    visual_similarity = max(0, min(100, match_percentage + random.randint(-8, 8)))

    # Reset random seed to avoid affecting other code
    random.seed()

    return {
        "product_id": product_id,
        "product_name": product_name,
        "product_category": product_category,
        "match_percentage": match_percentage,
        "verification_status": verification_status,
        "passed": match_percentage >= 70,
        "details": {
            "title_similarity": title_similarity,
            "category_match": category_match,
            "visual_similarity": visual_similarity,
            "catalog_image_compared": True,
            "live_image_analyzed": True,
        },
        "timestamp": captured_timestamp or datetime.now().isoformat(),
    }


# ============================================================
# Step 2: Product Condition Analysis (Category-Adaptive)
# ============================================================

def analyze_product_condition(
    product_category: str,
    product_name: str,
    product_value: float,
    image_hash: str,
) -> Dict[str, Any]:
    """
    Perform deep condition analysis adapted to product category.
    Detects physical issues, product-specific defects, and packaging condition.
    """
    # Seed for reproducibility per image
    seed_str = f"condition:{product_category}:{image_hash}"
    seed_hash = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
    random.seed(seed_hash)

    criteria = CATEGORY_INSPECTION_CRITERIA.get(
        product_category,
        CATEGORY_INSPECTION_CRITERIA["Electronics"]
    )

    # Simulate detection of issues from each check category
    detected_physical = _simulate_detections(criteria["physical_checks"], severity_range=(0.1, 0.6))
    detected_accessories = _simulate_detections(criteria["accessory_checks"], severity_range=(0.05, 0.3))
    detected_functional = _simulate_detections(criteria["functional_checks"], severity_range=(0.05, 0.25))

    # Product-specific sub-inspection
    subcategory_issues = _get_subcategory_issues(product_name, product_category)

    # Packaging assessment
    packaging_condition = _assess_packaging(seed_hash)

    # Aggregate all detected issues
    all_issues = detected_physical + detected_accessories + detected_functional + subcategory_issues

    # Reset random
    random.seed()

    return {
        "category": product_category,
        "product_name": product_name,
        "inspection_criteria_used": list(criteria.keys()),
        "physical_condition": {
            "issues_found": detected_physical,
            "count": len(detected_physical),
        },
        "accessory_condition": {
            "issues_found": detected_accessories,
            "count": len(detected_accessories),
        },
        "functional_condition": {
            "issues_found": detected_functional,
            "count": len(detected_functional),
        },
        "subcategory_inspection": {
            "issues_found": subcategory_issues,
            "count": len(subcategory_issues),
        },
        "packaging": packaging_condition,
        "all_detected_issues": all_issues,
        "total_issues": len(all_issues),
        "analysis_timestamp": datetime.now().isoformat(),
    }


def _simulate_detections(checks: List[str], severity_range: tuple) -> List[Dict[str, str]]:
    """Randomly detect issues from a checklist with severity assignment."""
    detected = []
    for check in checks:
        if random.random() < severity_range[1]:
            severity = random.choice(["Minor", "Moderate", "Significant"])
            # Weight toward Minor for most items
            if random.random() < 0.6:
                severity = "Minor"
            detected.append({
                "issue": check,
                "severity": severity,
                "confidence": round(random.uniform(0.7, 0.98), 2),
            })
    return detected


def _get_subcategory_issues(product_name: str, category: str) -> List[Dict[str, str]]:
    """Run product-specific sub-inspections based on product name keywords."""
    issues = []
    name_lower = product_name.lower()

    # Shoe-specific
    if category == "Clothing" and any(kw in name_lower for kw in ["shoe", "sneaker", "boot", "sandal", "running"]):
        for check in SHOE_INSPECTION["checks"]:
            if random.random() < 0.3:
                issues.append({
                    "issue": check,
                    "severity": random.choice(["Minor", "Moderate"]),
                    "confidence": round(random.uniform(0.72, 0.95), 2),
                    "subcategory": "Footwear"
                })

    # Electronics sub-types
    if category == "Electronics":
        for keyword, checks in ELECTRONICS_SUBCHECKS.items():
            if keyword in name_lower:
                for check in checks:
                    if random.random() < 0.25:
                        issues.append({
                            "issue": check,
                            "severity": random.choice(["Minor", "Moderate"]),
                            "confidence": round(random.uniform(0.75, 0.96), 2),
                            "subcategory": keyword.capitalize()
                        })
                break

    return issues


def _assess_packaging(seed: int) -> Dict[str, Any]:
    """Assess packaging condition."""
    conditions = ["Pristine", "Good", "Minor Damage", "Significant Damage", "Missing"]
    # Weighted toward better conditions
    weights = [0.25, 0.35, 0.25, 0.10, 0.05]
    packaging_state = random.choices(conditions, weights=weights, k=1)[0]

    return {
        "condition": packaging_state,
        "original_box": random.random() > 0.3,
        "protective_materials": random.random() > 0.4,
        "seal_intact": random.random() > 0.5,
    }


# ============================================================
# Step 3: Condition Scoring Engine
# ============================================================

def compute_condition_score(condition_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate:
      - Condition Score (0-100)
      - Grade: A, B, C, D
      - Condition Label: Like New, Good, Fair, Damaged
      - Detected Issues summary
    """
    total_issues = condition_analysis["total_issues"]
    all_issues = condition_analysis["all_detected_issues"]

    # Base score starts at 100, deducted per issue by severity
    score = 100
    severity_penalties = {"Minor": 3, "Moderate": 8, "Significant": 15}

    for issue in all_issues:
        penalty = severity_penalties.get(issue.get("severity", "Minor"), 5)
        score -= penalty

    # Packaging penalty
    pkg = condition_analysis["packaging"]
    pkg_penalties = {"Pristine": 0, "Good": 2, "Minor Damage": 5, "Significant Damage": 10, "Missing": 15}
    score -= pkg_penalties.get(pkg["condition"], 5)

    # Clamp score
    score = max(0, min(100, score))

    # Grade mapping
    if score >= 85:
        grade = "A"
        label = "Like New"
    elif score >= 65:
        grade = "B"
        label = "Good"
    elif score >= 40:
        grade = "C"
        label = "Fair"
    else:
        grade = "D"
        label = "Damaged"

    # Summarize detected issues (top issues)
    issue_summary = []
    for issue in all_issues[:8]:  # Cap at 8 displayed issues
        issue_summary.append(f"{issue['issue']} ({issue['severity']})")

    return {
        "condition_score": score,
        "grade": grade,
        "condition_label": label,
        "total_issues_detected": total_issues,
        "detected_issues": issue_summary,
        "packaging_condition": pkg["condition"],
        "has_original_box": pkg.get("original_box", False),
    }


# ============================================================
# Step 4: Confidence-Based Results
# ============================================================

def compute_ai_confidence(
    verification_result: Dict[str, Any],
    condition_analysis: Dict[str, Any],
    scoring_result: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate overall AI confidence score.
    If confidence < 75%, route to manual review.
    """
    # Factors affecting confidence
    verification_score = verification_result["match_percentage"]
    total_issues = condition_analysis["total_issues"]
    condition_score = scoring_result["condition_score"]

    # Base confidence from verification match
    base_confidence = verification_score * 0.4

    # Condition analysis clarity (fewer ambiguous issues = higher confidence)
    issue_confidences = [
        issue.get("confidence", 0.8)
        for issue in condition_analysis["all_detected_issues"]
    ]
    avg_issue_confidence = (
        sum(issue_confidences) / len(issue_confidences)
        if issue_confidences else 0.90
    )
    analysis_confidence = avg_issue_confidence * 100 * 0.35

    # Score consistency factor
    consistency = 25 if condition_score > 20 else 15
    base_confidence += analysis_confidence + consistency

    # Clamp to 0-100
    ai_confidence = max(0, min(99, int(base_confidence)))

    # Determine if manual review is needed
    needs_manual_review = ai_confidence < 75
    review_message = (
        "Additional inspection recommended."
        if needs_manual_review
        else "AI analysis complete with high confidence."
    )

    return {
        "ai_confidence": ai_confidence,
        "needs_manual_review": needs_manual_review,
        "review_message": review_message,
        "confidence_factors": {
            "verification_confidence": round(verification_score * 0.4, 1),
            "analysis_confidence": round(analysis_confidence, 1),
            "consistency_factor": consistency,
        },
    }


# ============================================================
# Full Pipeline: Run all 4 steps
# ============================================================

def run_full_analysis(
    product_id: str,
    product_name: str,
    product_category: str,
    product_value: float,
    catalog_image_url: str,
    captured_image_hash: str,
    captured_timestamp: str,
) -> Dict[str, Any]:
    """
    Execute the complete AI Product Analysis pipeline:
      1. Product Match Verification
      2. Product Condition Analysis
      3. Condition Scoring
      4. Confidence-Based Results

    Returns full analysis results or stops at Step 1 if verification fails.
    """
    # Step 1: Product Match Verification
    verification = verify_product_match(
        product_id=product_id,
        product_name=product_name,
        product_category=product_category,
        catalog_image_url=catalog_image_url,
        captured_image_hash=captured_image_hash,
        captured_timestamp=captured_timestamp,
    )

    # If verification fails, stop here
    if not verification["passed"]:
        return {
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
            "analysis_id": f"ANA-{hashlib.md5(f'{product_id}:{captured_image_hash}'.encode()).hexdigest()[:8].upper()}",
            "timestamp": datetime.now().isoformat(),
        }

    # Step 2: Product Condition Analysis
    condition_analysis = analyze_product_condition(
        product_category=product_category,
        product_name=product_name,
        product_value=product_value,
        image_hash=captured_image_hash,
    )

    # Step 3: Condition Scoring
    scoring = compute_condition_score(condition_analysis)

    # Step 4: Confidence-Based Results
    confidence = compute_ai_confidence(verification, condition_analysis, scoring)

    return {
        "pipeline_status": "complete",
        "blocked_at": None,
        "verification": verification,
        "condition_analysis": condition_analysis,
        "scoring": scoring,
        "confidence": confidence,
        "message": "AI analysis completed successfully.",
        "analysis_id": f"ANA-{hashlib.md5(f'{product_id}:{captured_image_hash}'.encode()).hexdigest()[:8].upper()}",
        "timestamp": datetime.now().isoformat(),
    }
