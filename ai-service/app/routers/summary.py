from typing import Dict, Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.llm.provider import llm_provider
from app.llm.schemas import WeeklySummaryResponse

router = APIRouter(prefix="/api/v1/summary", tags=["AI Weekly Progress Summary"])

class WeeklySummaryRequest(BaseModel):
    user_profile: Optional[Dict[str, Any]] = None
    stats: Dict[str, Any]

@router.post("/weekly", response_model=WeeklySummaryResponse)
async def generate_weekly_summary(payload: WeeklySummaryRequest):
    system_prompt = (
        "You are an encouraging, data-informed fitness coach analyzing weekly workout metrics. "
        "Review the deterministic statistics provided (planned vs completed sessions, adherence rate, "
        "total volume, and muscle groups targeted). Provide an honest, uplifting analysis acknowledging "
        "their consistency, and deliver 2-3 realistic, high-impact recommendations for their next week."
    )

    user_prompt = f"""
USER PROFILE:
{payload.user_profile or {}}

CALCULATED PERFORMANCE METRICS:
- Planned Sessions: {payload.stats.get('planned_sessions')}
- Completed Sessions: {payload.stats.get('completed_sessions')}
- Adherence Rate: {payload.stats.get('adherence_percentage')}%
- Total Duration: {payload.stats.get('total_duration_minutes')} minutes
- Most Trained Muscles: {payload.stats.get('most_trained_muscles')}
"""

    return await llm_provider.generate_structured(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=WeeklySummaryResponse,
    )
