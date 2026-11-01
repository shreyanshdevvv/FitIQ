import json
import asyncio
from abc import ABC, abstractmethod
from typing import Type, Optional, List
from pydantic import BaseModel
from google import genai
from google.genai import types
from app.config import settings
from app.llm.schemas import WorkoutPlanResponse, ChatResponse, WeeklySummaryResponse

class LLMProvider(ABC):
    @abstractmethod
    async def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        pass

    @abstractmethod
    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_model: Type[BaseModel]
    ) -> BaseModel:
        pass

class GeminiProvider(LLMProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.primary_model = settings.LLM_MODEL
        is_valid_key = bool(self.api_key and not self.api_key.startswith("your-gemini"))
        self.client = genai.Client(api_key=self.api_key) if is_valid_key else None
        
        # Priority list of working models for automatic failover
        candidate_pool = [self.primary_model, "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash"]
        # Deduplicate while preserving order
        self.candidate_models: List[str] = list(dict.fromkeys(candidate_pool))
        self.last_used_model = self.candidate_models[0]

    async def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        if not self.client:
            return self._fallback_text_response(user_prompt)

        for model in self.candidate_models:
            try:
                response = await asyncio.wait_for(
                    self.client.aio.models.generate_content(
                        model=model,
                        contents=user_prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_prompt,
                            temperature=0.7,
                        ),
                    ),
                    timeout=30.0,
                )
                if response.text and response.text.strip():
                    self.last_used_model = model
                    return response.text.strip()
            except Exception as e:
                print(f"⚠️ Gemini API text error on model {model}: {e}")
                continue

        return self._fallback_text_response(user_prompt)

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_model: Type[BaseModel]
    ) -> BaseModel:
        if not self.client:
            return self._fallback_structured_response(response_model)

        for model in self.candidate_models:
            try:
                response = await asyncio.wait_for(
                    self.client.aio.models.generate_content(
                        model=model,
                        contents=user_prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_prompt,
                            response_mime_type="application/json",
                            response_schema=response_model,
                            temperature=0.2,
                        ),
                    ),
                    timeout=45.0,
                )
                if response.text:
                    self.last_used_model = model
                    return response_model.model_validate_json(response.text)
            except Exception as e:
                print(f"⚠️ Gemini API structured error on model {model}: {e}")
                continue

        return self._fallback_structured_response(response_model)

    def _fallback_text_response(self, user_prompt: str) -> str:
        # Extract the user's latest actual question to avoid matching previous assistant messages in the history
        actual_query = user_prompt
        if "USER QUESTION:" in user_prompt:
            actual_query = user_prompt.split("USER QUESTION:")[-1]
        lower = actual_query.strip().lower()

        if any(w in lower for w in ['tight', 'pain', 'sore', 'injury', 'hurt']):
            return "If you're experiencing tightness or joint discomfort, avoid heavy axial loading today. Prioritize active mobilization, reduce working weights by 20-30%, and focus on controlled eccentric tempo."
        if any(w in lower for w in ['protein', 'eat', 'meal', 'nutrition', 'food', 'calorie']):
            return "For optimal muscle protein synthesis, aim for 1.6 to 2.2 grams of protein per kilogram of bodyweight, distributed across 3 to 5 meals with 25-40g high-quality protein per feeding."
        if any(w in lower for w in ['hi', 'hello', 'hey', 'start']):
            return "Hey there! I am your AI Coach. How are you feeling today, and what are we working on?"
        if any(w in lower for w in ['plan', 'workout', 'routine', 'split']):
            return "Your current workout program is available under the Workout Plan tab. Let me know if you want to adapt any exercise, modify the volume, or focus on a specific movement pattern today!"

        return (
            "I'm here to help you optimize your training, movement quality, and recovery. What specific goal or exercise would you like to focus on?"
        )

    def _fallback_structured_response(self, response_model: Type[BaseModel]) -> BaseModel:
        if response_model == WeeklySummaryResponse:
            return WeeklySummaryResponse(
                summary="Solid performance this week! You logged consistent training volume across your target movement patterns.",
                adherence_assessment="You are on track with your planned training sessions. Muscle stimulus frequency was effectively distributed.",
                actionable_recommendations=[
                    "Aim to add 1-2 reps on your primary compound lifts next week before increasing load.",
                    "Ensure you maintain adequate hydration (minimum 3L daily) to support muscle recovery.",
                    "Prioritize at least 7 hours of sleep on heavy training days to maximize central nervous system recovery."
                ],
                usage_model="gemini-fallback"
            )
        return response_model()

# Export singleton provider
llm_provider = GeminiProvider()
