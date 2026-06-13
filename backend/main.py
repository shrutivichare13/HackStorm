"""
Amazon Second Life Commerce - Backend API
==========================================
AI-powered circular commerce ecosystem that helps reduce return-related losses,
recover inventory value, prevent fraud, and improve sustainability.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import products, returns, marketplace, peer_to_peer, green_credits, analytics, verification

app = FastAPI(
    title="Amazon Second Life Commerce API",
    description="AI-powered circular commerce ecosystem",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(returns.router, prefix="/api/returns", tags=["Returns"])
app.include_router(marketplace.router, prefix="/api/marketplace", tags=["Marketplace"])
app.include_router(peer_to_peer.router, prefix="/api/peer-to-peer", tags=["Peer-to-Peer"])
app.include_router(green_credits.router, prefix="/api/green-credits", tags=["Green Credits"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(verification.router, prefix="/api/verification", tags=["Verification"])


@app.get("/")
async def root():
    return {"message": "Amazon Second Life Commerce API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "amazon-second-life-commerce"}
