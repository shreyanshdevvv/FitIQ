from typing import List, Dict, Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.llm.provider import llm_provider
from app.rag.pipeline import rag_pipeline
from app.llm.schemas import ChatResponse, SourceReference

router = APIRouter(prefix="/api/v1", tags=["AI Fitness Assistant"])

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []
    user_context: Optional[Dict[str, Any]] = None
    use_rag: bool = True

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(payload: ChatRequest):
    sources = []
    retrieved_knowledge = ""

    if payload.use_rag:
        rag_result = await rag_pipeline.query_with_rag(payload.message, top_k=3)
        retrieved_knowledge = rag_result["context"]
        sources = [SourceReference(**s) for s in rag_result["sources"]]

    # Format user context clearly so LLM adapts advice directly
    user_context_str = ""
    injuries_list = []
    if payload.user_context:
        uc = payload.user_context
        injuries_list = uc.get("injuries_and_limitations", []) or uc.get("injuries", [])
        goals_list = [g.replace('_', ' ') for g in uc.get("goals", [])]
        body_stats = []
        if uc.get("weight_kg"): body_stats.append(f"{uc['weight_kg']} kg")
        if uc.get("height_cm"): body_stats.append(f"{uc['height_cm']} cm")
        if uc.get("age"): body_stats.append(f"{uc['age']} years old")
        if uc.get("gender"): body_stats.append(uc['gender'])
        body_stats_str = ", ".join(body_stats) if body_stats else "Not specified"

        np = uc.get("nutrition_plan")
        if np:
            nutrition_str = f"{np.get('daily_calories', 0)} kcal ({np.get('protein_grams', 0)}g Protein, {np.get('carbs_grams', 0)}g Carbs, {np.get('fats_grams', 0)}g Fats, {np.get('water_ml', 0)}ml Water) - Strategy: {np.get('strategy', 'BALANCED')}"
        else:
            nutrition_str = "No active nutrition plan calculated yet"

        tmc = uc.get("today_macro_consumption")
        if tmc and (tmc.get("meals_count", 0) > 0 or tmc.get("calories", 0) > 0):
            macro_consumption_str = (
                f"{tmc.get('calories', 0)} kcal consumed ({tmc.get('protein', 0)}g Protein, "
                f"{tmc.get('carbs', 0)}g Carbs, {tmc.get('fats', 0)}g Fats across {tmc.get('meals_count', 0)} logged meals). "
                f"Remaining budget today: {tmc.get('remaining_calories', 0)} kcal "
                f"({tmc.get('remaining_protein', 0)}g Protein, {tmc.get('remaining_carbs', 0)}g Carbs, {tmc.get('remaining_fats', 0)}g Fats). "
                f"Recent logged meals: {', '.join(tmc.get('recent_meals', [])) or 'None'}"
            )
        else:
            macro_consumption_str = "0 kcal logged so far today. Full daily macro budget remaining."

        user_context_str = f"""- Athlete Name: {uc.get('name', 'Athlete')}
- Body Stats: {body_stats_str}
- Experience Level: {uc.get('fitness_level', 'Not specified')}
- Primary Goals: {', '.join(goals_list) if goals_list else 'General Fitness'}
- Available Equipment: {', '.join(uc.get('available_equipment', [])) if uc.get('available_equipment') else 'Standard Gym'}
- Training Schedule: {uc.get('workout_days_per_week', 4)} days/week ({uc.get('session_duration_minutes', 60)} min per workout)
- Physical Limitations / Injuries: {', '.join(injuries_list) if injuries_list else 'None reported'}
- Active Workout Plan: {uc.get('active_plan_name', 'None currently scheduled')}
- Routine Exercises: {', '.join(uc.get('active_plan_exercises', [])) if uc.get('active_plan_exercises') else 'None'}
- Completed Workout Logs: {uc.get('recent_workouts_logged', 0)} sessions recorded in database
- Active Nutrition Plan Targets: {nutrition_str}
- Today's Current Macro Consumption & Logged Meals: {macro_consumption_str}
"""

    system_prompt = f"""You are FitIQ, a world-class, scientific personal trainer and nutrition coach.
Your mission is to provide safe, actionable, personalized, and grounded fitness guidance based on the athlete's exact profile.

ATHLETE PROFILE & REAL DATABASE CONTEXT:
{user_context_str if user_context_str else 'No profile configured yet.'}

VERIFIED SPORTS SCIENCE KNOWLEDGE BASE:
{retrieved_knowledge if retrieved_knowledge else "No specific document retrieved. Ground responses in standard exercise physiology and progressive overload."}

Guidelines:
1. Ground your answers directly in the athlete's specific goals, available equipment, and experience level.
2. If the athlete asks about their split, exercises, or progress, reference their active workout plan and schedule.
3. NEVER prescribe or encourage movements that aggravate their stated limitations ({', '.join(injuries_list) if injuries_list else 'None'}). Always suggest biomechanically safe regressions or alternatives.
4. When the athlete asks about food, meals, recovery, protein, or macros, ground your advice strictly in their latest active nutrition targets ({nutrition_str}) which reflect any custom manual updates they made, and show how it fuels their specific workout schedule.
5. If the athlete asks about their current macro consumption, calories eaten today, remaining protein/carbs/fats, or what they can still eat today, directly reference their live logged consumption: {macro_consumption_str}. If they customized their macro targets, respect those updated numbers as authoritative.
6. Be concise, motivating, and evidence-grounded.
"""

    # Assemble conversation context
    conversation_text = ""
    for msg in (payload.conversation_history or [])[-6:]:
        role = msg.get("role", "user").capitalize()
        content = msg.get("content", "")
        conversation_text += f"{role}: {content}\n"

    user_prompt = f"""
PREVIOUS MESSAGES:
{conversation_text}

USER QUESTION:
{payload.message}
"""

    response_text = await llm_provider.generate_text(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    return ChatResponse(
        response=response_text,
        sources=sources,
        usage_model=llm_provider.last_used_model
    )
