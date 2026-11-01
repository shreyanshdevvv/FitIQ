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

    system_prompt = f"""You are FitCoach AI, an empathetic, scientific personal trainer and nutrition coach.
Your mission is to provide safe, actionable, and grounded fitness guidance.

USER PROFILE & CONTEXT:
{payload.user_context or {}}

VERIFIED FITNESS KNOWLEDGE BASE (Use this context to ground your answer):
{retrieved_knowledge if retrieved_knowledge else "No specific document retrieved. Use standard evidence-based sports science."}

Guidelines:
1. Always adapt advice to the user's specific experience level and limitations.
2. If an exercise or movement might aggravate their stated injury, recommend safe modifications.
3. Be concise, encouraging, and clear. Avoid dangerous or extreme recommendations.
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
