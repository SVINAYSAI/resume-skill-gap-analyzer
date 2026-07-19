"""
Health check endpoint.
"""

from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import get_settings


router = APIRouter(prefix="/api/v1", tags=["health"])


class HealthResponse(BaseModel):
    status: str
    model: str
    provider: str
    timestamp: str


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Verify the API is running and configured.",
)
async def health_check() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        provider="Azure OpenAI",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
