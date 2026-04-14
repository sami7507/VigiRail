"""
RailGuard AI — FastAPI Application Entry Point
Run with: uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, sensors
from app.ml.model import ml_model

# ── Boot ML model ────────────────────────────────────────────────
print("\n" + "=" * 55)
print("  RailGuard AI — Backend Initialising")
print("=" * 55)
ml_model.train()
print("=" * 55 + "\n")

# ── Create FastAPI app ───────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered predictive maintenance for Indian Railways",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS — allow React dev server ────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ─────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(sensors.router)


@app.get("/", tags=["root"])
def root():
    return {
        "app":     settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status":  "running ✅",
        "docs":    "http://localhost:8000/docs",
    }
