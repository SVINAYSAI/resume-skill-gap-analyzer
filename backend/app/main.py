"""
FastAPI application entry point.

Skill Gap Checker + Fit Verdict API
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.exceptions import AppError, app_error_handler
from app.api.v1.analysis import router as analysis_router
from app.api.v1.health import router as health_router

# ─── Logging ─────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ─── App Factory ─────────────────────────────────────────────────────

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="Skill Gap Checker & Fit Verdict API",
        description=(
            "AI-powered resume vs. job description analysis. "
            "Compares candidate skills and generates fit verdicts."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception handlers
    app.add_exception_handler(AppError, app_error_handler)

    # Routers
    app.include_router(analysis_router)
    app.include_router(health_router)

    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "name": "Skill Gap Checker & Fit Verdict API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/api/v1/health",
        }

    logger.info(
        f"App started | Model: {settings.AZURE_OPENAI_DEPLOYMENT} | "
        f"Endpoint: {settings.AZURE_OPENAI_ENDPOINT}"
    )

    return app


app = create_app()
