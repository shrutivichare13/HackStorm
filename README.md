# Amazon Second Life Commerce

An AI-powered circular commerce ecosystem that helps reduce return-related losses, recover inventory value, prevent fraud, improve sustainability, and give returned products a second life.

## Architecture

```
amazon-second-life/
├── backend/                    # Python FastAPI backend
│   ├── main.py                # Application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── models/                # Pydantic schemas
│   │   └── schemas.py        # Request/response models
│   ├── routes/                # API route handlers
│   │   ├── products.py       # Product endpoints
│   │   ├── returns.py        # Return processing
│   │   ├── verification.py   # Live capture verification
│   │   ├── marketplace.py    # Certified marketplace
│   │   ├── peer_to_peer.py   # P2P marketplace
│   │   ├── green_credits.py  # Sustainability rewards
│   │   └── analytics.py      # Admin dashboard data
│   ├── services/              # Business logic
│   │   └── ai_engine.py      # AI assessment & recommendations
│   └── mock_data/             # In-memory mock database
│       └── database.py       # Sample data store
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── store/             # Zustand state management
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Helper utilities
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| State | Zustand |
| Icons | Lucide React |
| Backend | Python FastAPI |
| Database | In-memory mock (MongoDB-compatible schemas) |

## Modules

1. **AI Return Intelligence Engine** - Condition scoring, grading, disposition recommendations
2. **Live Verification & Anti-Fraud** - Camera capture, image hashing, duplicate detection, trust scores
3. **Smart Quality Grading** - Visual condition reports, grade badges, issue detection
4. **Certified Refurbished Marketplace** - Dynamic pricing, AI inspection summaries, trust badges
5. **Green Credits System** - Sustainability rewards, carbon tracking, credit redemption
6. **Peer-to-Peer Marketplace** - User listings, seller trust scores, AI-verified conditions
7. **Predictive Return Prevention** - Risk scoring, size guidance, alternative recommendations
8. **Admin Analytics Dashboard** - Returns, cost savings, sustainability, fraud metrics with Recharts

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products/ | List all products |
| GET | /api/products/{id}/return-risk | Get return risk assessment |
| POST | /api/returns/submit | Submit a return request |
| GET | /api/returns/history | Get return history |
| GET | /api/verification/code | Generate verification code |
| POST | /api/verification/validate | Validate live capture |
| GET | /api/marketplace/ | Browse marketplace |
| GET | /api/marketplace/recommendations | Personalized recommendations |
| GET | /api/peer-to-peer/ | Browse P2P listings |
| POST | /api/peer-to-peer/create | Create P2P listing |
| GET | /api/green-credits/{user_id} | Get user credits |
| POST | /api/green-credits/redeem | Redeem credits |
| GET | /api/analytics/dashboard | Full analytics data |

## Key Features

### Dynamic Pricing Formula
```
resalePrice = originalPrice × conditionMultiplier × demandFactor
```

| Grade | Multiplier |
|-------|-----------|
| A (Like New) | 0.85 |
| B (Good) | 0.70 |
| C (Fair) | 0.50 |
| D (Damaged) | 0.25 |

### Trust Score System
- Range: 0-100
- High (80+): Instant approval
- Medium (50-79): Standard processing
- Low (0-49): Manual review required

### Green Credits Rewards
- Donate: 100 credits
- Refurbish: 85 credits
- Peer-to-Peer: 70 credits
- Resell: 60 credits
- Recycle: 50 credits
- Redemption: 10 credits = $1.00 discount

## Design

Amazon-inspired color palette:
- Navy: `#232F3E`
- Orange: `#FF9900`
- Clean modern responsive layout
- Mobile-first approach with Tailwind CSS
