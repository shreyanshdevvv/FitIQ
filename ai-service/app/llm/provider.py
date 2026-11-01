from abc import ABC, abstractmethod
from typing import Type
from pydantic import BaseModel
from openai import AsyncOpenAI
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

class OpenAIProvider(LLMProvider):
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.LLM_MODEL
        # Only initialize client if user provided a valid non-placeholder API key
        is_valid_key = bool(self.api_key and not self.api_key.startswith("your-openai"))
        self.client = AsyncOpenAI(api_key=self.api_key) if is_valid_key else None

    async def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        if not self.client:
            return self._fallback_text_response(user_prompt)

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=800,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            return self._fallback_text_response(user_prompt)

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_model: Type[BaseModel]
    ) -> BaseModel:
        if not self.client:
            return self._fallback_structured_response(response_model)

        try:
            response = await self.client.beta.chat.completions.parse(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format=response_model,
                temperature=0.2,
            )
            parsed = response.choices[0].message.parsed
            if parsed:
                return parsed
        except Exception:
            pass

        return self._fallback_structured_response(response_model)

    def _fallback_text_response(self, user_prompt: str) -> str:
        return (
            "Based on evidence-based exercise science: ensure you are applying progressive overload "
            "by either increasing resistance or reps each week. Keep your rest periods between 60 to 90 seconds "
            "for hypertrophy, stay consistent with 1.6-2.2g of protein per kg of bodyweight, and prioritize 7-9 hours of sleep."
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
                usage={"model": "offline-fallback"}
            )
        return response_model()

# Export singleton provider
llm_provider = OpenAIProvider()
