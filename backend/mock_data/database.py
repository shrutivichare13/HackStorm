"""
Mock Database
=============
In-memory data store simulating MongoDB collections.
Contains sample products, users, returns, marketplace listings, and analytics.
"""

import uuid
from datetime import datetime, timedelta
import random

# ============ USERS ============
USERS = {
    "user_001": {
        "id": "user_001",
        "name": "Sarah Johnson",
        "email": "sarah.j@email.com",
        "trust_score": 85,
        "total_returns": 3,
        "green_credits": 450,
        "interests": ["Electronics", "Home & Kitchen"],
        "purchase_history": ["prod_001", "prod_003", "prod_005", "prod_007"]
    },
    "user_002": {
        "id": "user_002",
        "name": "Mike Chen",
        "email": "mike.chen@email.com",
        "trust_score": 42,
        "total_returns": 12,
        "green_credits": 120,
        "interests": ["Clothing", "Sports & Outdoors"],
        "purchase_history": ["prod_002", "prod_004", "prod_006"]
    },
    "user_003": {
        "id": "user_003",
        "name": "Emily Davis",
        "email": "emily.d@email.com",
        "trust_score": 95,
        "total_returns": 1,
        "green_credits": 780,
        "interests": ["Books", "Beauty"],
        "purchase_history": ["prod_008", "prod_009", "prod_010"]
    }
}

# ============ PRODUCTS (User Purchased) ============
PRODUCTS = [
    {
        "id": "prod_001",
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "category": "Electronics",
        "original_price": 349.99,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        "description": "Industry-leading noise canceling with premium sound quality",
        "purchase_date": "2026-05-15",
        "order_id": "ORD-2026-001",
        "return_eligible": True
    },
    {
        "id": "prod_002",
        "name": "Nike Air Max 270 Running Shoes",
        "category": "Clothing",
        "original_price": 159.99,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        "description": "Lightweight running shoes with Air Max cushioning",
        "purchase_date": "2026-05-20",
        "order_id": "ORD-2026-002",
        "return_eligible": True
    },
    {
        "id": "prod_003",
        "name": "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
        "category": "Home & Kitchen",
        "original_price": 89.99,
        "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        "description": "Multi-use programmable pressure cooker, slow cooker, rice cooker",
        "purchase_date": "2026-04-10",
        "order_id": "ORD-2026-003",
        "return_eligible": True
    },
    {
        "id": "prod_004",
        "name": "Patagonia Better Sweater Fleece Jacket",
        "category": "Clothing",
        "original_price": 139.00,
        "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
        "description": "Fair Trade Certified sewn polyester fleece jacket",
        "purchase_date": "2026-05-01",
        "order_id": "ORD-2026-004",
        "return_eligible": True
    },
    {
        "id": "prod_005",
        "name": "Apple iPad Air M2 (2024)",
        "category": "Electronics",
        "original_price": 599.00,
        "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
        "description": "11-inch Liquid Retina display with M2 chip",
        "purchase_date": "2026-03-25",
        "order_id": "ORD-2026-005",
        "return_eligible": True
    },
    {
        "id": "prod_006",
        "name": "Hydro Flask 32oz Water Bottle",
        "category": "Sports & Outdoors",
        "original_price": 44.95,
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
        "description": "TempShield insulation keeps drinks cold 24hrs or hot 12hrs",
        "purchase_date": "2026-05-28",
        "order_id": "ORD-2026-006",
        "return_eligible": True
    },
    {
        "id": "prod_007",
        "name": "Dyson V15 Detect Cordless Vacuum",
        "category": "Home & Kitchen",
        "original_price": 749.99,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
        "description": "Laser reveals microscopic dust, piezo sensor counts particles",
        "purchase_date": "2026-04-20",
        "order_id": "ORD-2026-007",
        "return_eligible": True
    },
    {
        "id": "prod_008",
        "name": "Kindle Paperwhite Signature Edition",
        "category": "Books",
        "original_price": 189.99,
        "image_url": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400",
        "description": "6.8-inch display, wireless charging, 32GB storage",
        "purchase_date": "2026-05-10",
        "order_id": "ORD-2026-008",
        "return_eligible": True
    },
    {
        "id": "prod_009",
        "name": "LEGO Technic Porsche 911 GT3 RS",
        "category": "Toys & Games",
        "original_price": 179.99,
        "image_url": "https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400",
        "description": "2,704 pieces, 1:8 scale model with working gearbox",
        "purchase_date": "2026-04-15",
        "order_id": "ORD-2026-009",
        "return_eligible": True
    },
    {
        "id": "prod_010",
        "name": "Dyson Airwrap Complete Long",
        "category": "Beauty",
        "original_price": 599.99,
        "image_url": "https://images.unsplash.com/photo-1522338242992-e1a54571a9f7?w=400",
        "description": "Multi-styler with Coanda airflow technology",
        "purchase_date": "2026-05-05",
        "order_id": "ORD-2026-010",
        "return_eligible": True
    }
]

# ============ MARKETPLACE LISTINGS ============
MARKETPLACE_LISTINGS = [
    {
        "id": "mkt_001",
        "product_name": "Sony WH-1000XM4 Wireless Headphones",
        "category": "Electronics",
        "original_price": 299.99,
        "resale_price": 219.99,
        "condition_grade": "A",
        "condition_label": "Like New",
        "condition_score": 92,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        "ai_inspection_summary": "Minimal wear, all accessories included, fully functional noise cancellation",
        "trust_badge": True,
        "badges": ["AI Certified", "Quality Checked", "Green Choice"],
        "seller_id": "amazon_certified",
        "listed_date": "2026-06-01"
    },
    {
        "id": "mkt_002",
        "product_name": "Apple MacBook Air M2 (2023)",
        "category": "Electronics",
        "original_price": 1199.00,
        "resale_price": 899.00,
        "condition_grade": "B",
        "condition_label": "Good",
        "condition_score": 78,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        "ai_inspection_summary": "Minor cosmetic scratches on lid, battery health 94%, all ports functional",
        "trust_badge": True,
        "badges": ["AI Certified", "Quality Checked"],
        "seller_id": "amazon_certified",
        "listed_date": "2026-05-28"
    },
    {
        "id": "mkt_003",
        "product_name": "KitchenAid Artisan Stand Mixer",
        "category": "Home & Kitchen",
        "original_price": 449.99,
        "resale_price": 299.99,
        "condition_grade": "A",
        "condition_label": "Like New",
        "condition_score": 95,
        "image_url": "https://images.unsplash.com/photo-1594385208974-2f8bb07b84af?w=400",
        "ai_inspection_summary": "Used twice, complete with all attachments, no visible wear",
        "trust_badge": True,
        "badges": ["AI Certified", "Quality Checked", "Green Choice"],
        "seller_id": "amazon_certified",
        "listed_date": "2026-06-05"
    },
    {
        "id": "mkt_004",
        "product_name": "Samsung Galaxy S24 Ultra",
        "category": "Electronics",
        "original_price": 1299.99,
        "resale_price": 949.99,
        "condition_grade": "B",
        "condition_label": "Good",
        "condition_score": 82,
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
        "ai_inspection_summary": "Light screen protector marks, battery health 97%, S Pen included",
        "trust_badge": True,
        "badges": ["AI Certified", "Quality Checked"],
        "seller_id": "amazon_certified",
        "listed_date": "2026-06-03"
    },
    {
        "id": "mkt_005",
        "product_name": "Herman Miller Aeron Chair",
        "category": "Home & Kitchen",
        "original_price": 1395.00,
        "resale_price": 849.00,
        "condition_grade": "B",
        "condition_label": "Good",
        "condition_score": 80,
        "image_url": "https://images.unsplash.com/photo-1580480055497-2023f6f00f4b?w=400",
        "ai_inspection_summary": "Normal use wear on armrests, mesh intact, full tilt mechanism working",
        "trust_badge": True,
        "badges": ["AI Certified", "Quality Checked", "Green Choice"],
        "seller_id": "amazon_certified",
        "listed_date": "2026-05-30"
    },
    {
        "id": "mkt_006",
        "product_name": "Nintendo Switch OLED",
        "category": "Electronics",
        "original_price": 349.99,
        "resale_price": 259.99,
        "condition_grade": "A",
        "condition_label": "Like New",
        "condition_score": 90,
        "image_url": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400",
        "ai_inspection_summary": "Screen pristine, Joy-Cons fully functional, includes dock and charger",
        "trust_badge": True,
        "badges": ["AI Certified", "Quality Checked", "Green Choice"],
        "seller_id": "amazon_certified",
        "listed_date": "2026-06-07"
    }
]

# ============ PEER-TO-PEER LISTINGS ============
P2P_LISTINGS = [
    {
        "id": "p2p_001",
        "product_name": "Bose QuietComfort 45 Headphones",
        "category": "Electronics",
        "selling_price": 179.99,
        "original_price": 279.99,
        "condition_grade": "B",
        "condition_report": "Slight wear on headband padding, sound quality excellent, ANC works perfectly",
        "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
        "seller_id": "user_001",
        "seller_name": "Sarah J.",
        "seller_trust_score": 85,
        "seller_rating": 4.7,
        "ai_verified": True,
        "listed_date": "2026-06-08"
    },
    {
        "id": "p2p_002",
        "product_name": "Lululemon Align Leggings Size M",
        "category": "Clothing",
        "selling_price": 55.00,
        "original_price": 98.00,
        "condition_grade": "A",
        "condition_report": "Worn once, no pilling, color intact, tags removed",
        "image_url": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400",
        "seller_id": "user_003",
        "seller_name": "Emily D.",
        "seller_trust_score": 95,
        "seller_rating": 4.9,
        "ai_verified": True,
        "listed_date": "2026-06-10"
    },
    {
        "id": "p2p_003",
        "product_name": "Weber Spirit II E-310 Gas Grill",
        "category": "Home & Kitchen",
        "selling_price": 299.00,
        "original_price": 499.00,
        "condition_grade": "C",
        "condition_report": "Surface rust on grates (replaceable), igniter works, all burners functional",
        "image_url": "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400",
        "seller_id": "user_002",
        "seller_name": "Mike C.",
        "seller_trust_score": 42,
        "seller_rating": 3.8,
        "ai_verified": True,
        "listed_date": "2026-06-05"
    },
    {
        "id": "p2p_004",
        "product_name": "Canon EOS R6 Mark II Camera Body",
        "category": "Electronics",
        "selling_price": 1599.00,
        "original_price": 2499.00,
        "condition_grade": "A",
        "condition_report": "12k shutter count, no scratches, sensor clean, includes original box",
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
        "seller_id": "user_003",
        "seller_name": "Emily D.",
        "seller_trust_score": 95,
        "seller_rating": 4.9,
        "ai_verified": True,
        "listed_date": "2026-06-11"
    }
]

# ============ GREEN CREDITS DATA ============
GREEN_CREDITS_DATA = {
    "user_001": {
        "user_id": "user_001",
        "total_credits": 450,
        "waste_diverted_kg": 12.5,
        "carbon_saved_kg": 34.2,
        "items_recycled": 2,
        "items_donated": 3,
        "items_refurbished": 1,
        "items_resold": 4,
        "credit_history": [
            {"date": "2026-06-01", "action": "Resold Sony Headphones", "credits": 75, "type": "earned"},
            {"date": "2026-05-20", "action": "Donated Kitchen Items", "credits": 100, "type": "earned"},
            {"date": "2026-05-15", "action": "Recycled Electronics", "credits": 50, "type": "earned"},
            {"date": "2026-05-10", "action": "Resold Running Shoes", "credits": 60, "type": "earned"},
            {"date": "2026-04-28", "action": "Refurbished Tablet", "credits": 85, "type": "earned"},
            {"date": "2026-04-15", "action": "Redeemed Discount", "credits": -50, "type": "redeemed"},
            {"date": "2026-04-01", "action": "Donated Books", "credits": 130, "type": "earned"}
        ]
    }
}

# ============ ANALYTICS DATA ============
ANALYTICS_DATA = {
    "total_returns": 15847,
    "disposition_breakdown": {
        "Resell": 5280,
        "Refurbish": 3962,
        "Donate": 2854,
        "Recycle": 2109,
        "Peer-to-Peer": 1642
    },
    "cost_savings": 2847650.00,
    "waste_diverted_kg": 45230.5,
    "co2_reduction_kg": 123450.8,
    "fraud_detections": 342,
    "return_prevention_rate": 23.7,
    "monthly_trends": [
        {"month": "Jan", "returns": 1120, "prevented": 265, "savings": 198500},
        {"month": "Feb", "returns": 1050, "prevented": 248, "savings": 186200},
        {"month": "Mar", "returns": 1380, "prevented": 327, "savings": 245100},
        {"month": "Apr", "returns": 1290, "prevented": 305, "savings": 229800},
        {"month": "May", "returns": 1450, "prevented": 344, "savings": 258400},
        {"month": "Jun", "returns": 1557, "prevented": 369, "savings": 277200}
    ],
    "category_breakdown": [
        {"category": "Electronics", "returns": 4890, "recovery_rate": 78},
        {"category": "Clothing", "returns": 4250, "recovery_rate": 65},
        {"category": "Home & Kitchen", "returns": 3120, "recovery_rate": 82},
        {"category": "Books", "returns": 1580, "recovery_rate": 91},
        {"category": "Toys & Games", "returns": 1207, "recovery_rate": 74},
        {"category": "Sports & Outdoors", "returns": 800, "recovery_rate": 70}
    ]
}

# ============ RETURN RISK DATA (for prevention) ============
RETURN_RISK_DATA = {
    "prod_001": {
        "product_id": "prod_001",
        "risk_score": 18,
        "common_return_reasons": [
            "Noise cancellation not as expected",
            "Comfort issues for extended wear",
            "Bluetooth connectivity problems"
        ],
        "recommendations": [
            "Try in-store before purchasing",
            "Check compatibility with your devices",
            "Read size guide for head measurements"
        ],
        "size_guidance": None,
        "alternatives": [
            {"name": "Bose QuietComfort Ultra", "price": 329.99, "return_rate": 12},
            {"name": "Apple AirPods Max", "price": 449.99, "return_rate": 15}
        ]
    },
    "prod_002": {
        "product_id": "prod_002",
        "risk_score": 45,
        "common_return_reasons": [
            "Size too small/large",
            "Color differs from photos",
            "Uncomfortable for wide feet"
        ],
        "recommendations": [
            "Order half size up if between sizes",
            "Check width options available",
            "Review customer fit photos"
        ],
        "size_guidance": "Runs small - recommend ordering 0.5 size up. Wide feet should consider Wide option.",
        "alternatives": [
            {"name": "Adidas Ultraboost 22", "price": 149.99, "return_rate": 28},
            {"name": "New Balance Fresh Foam", "price": 134.99, "return_rate": 22}
        ]
    },
    "prod_004": {
        "product_id": "prod_004",
        "risk_score": 35,
        "common_return_reasons": [
            "Size runs large",
            "Material thinner than expected",
            "Color slightly different in person"
        ],
        "recommendations": [
            "Size down if between sizes",
            "Check material weight in description",
            "View in natural lighting photos"
        ],
        "size_guidance": "Relaxed fit - consider sizing down for a more fitted look.",
        "alternatives": [
            {"name": "Arc'teryx Covert Cardigan", "price": 159.00, "return_rate": 18},
            {"name": "The North Face Canyonlands", "price": 99.00, "return_rate": 20}
        ]
    },
    "prod_005": {
        "product_id": "prod_005",
        "risk_score": 12,
        "common_return_reasons": [
            "Expected more storage",
            "Pencil sold separately",
            "Performance same as previous gen"
        ],
        "recommendations": [
            "Verify storage needs before purchase",
            "Budget for Apple Pencil separately",
            "Compare specs with your current device"
        ],
        "size_guidance": None,
        "alternatives": [
            {"name": "Samsung Galaxy Tab S9", "price": 549.99, "return_rate": 14},
            {"name": "iPad Pro 11-inch", "price": 799.00, "return_rate": 8}
        ]
    }
}

# ============ IMAGE HASH STORE (for duplicate detection) ============
IMAGE_HASH_STORE = set()

# ============ RETURNS HISTORY ============
RETURNS_HISTORY = []
