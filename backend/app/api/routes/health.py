from fastapi import APIRouter

from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/", summary="Service information")
def service_information() -> dict[str, str]:
    return {"service": settings.app_name, "status": "available"}


@router.get("/health", response_model=HealthResponse, summary="Health check")
def health_check() -> HealthResponse:
    return HealthResponse(status="healthy", service="dr-nexus-api", environment=settings.app_env)
