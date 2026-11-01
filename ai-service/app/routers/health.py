from fastapi import APIRouter
from datetime import datetime, timezone
from app.db import check_database_connection

router = APIRouter(prefix="", tags=["Health"])

@router.get("/health")
async def health_check():
    db_info = await check_database_connection()
    return {
        "status": "ok" if db_info.get("status") == "connected" else "degraded",
        "service": "fitcoach-ai-service (FastAPI)",
        "database": db_info,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
