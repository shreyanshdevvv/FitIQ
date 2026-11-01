from typing import List, Optional
from pydantic import BaseModel, Field

# Workout Generator Schemas
class ExerciseRecommendation(BaseModel):
    exercise_id: str = Field(description="UUID of the selected exercise matching the library")
    exercise_name: str = Field(description="Name of the exercise")
    sets: int = Field(description="Number of sets to perform", ge=1, le=10)
    reps: Optional[int] = Field(None, description="Target repetitions per set", ge=1, le=100)
    duration_seconds: Optional[int] = Field(None, description="Duration in seconds if timed exercise")
    rest_seconds: int = Field(60, description="Rest period in seconds between sets", ge=0, le=300)
    notes: Optional[str] = Field(None, description="Cues, progression notes, or tempo instructions")

class WorkoutDay(BaseModel):
    day_number: int = Field(description="Day number (e.g. 1, 2, 3...)", ge=1, le=7)
    name: str = Field(description="Day focus (e.g. 'Push Day', 'Upper Strength', 'Legs & Core')")
    exercises: List[ExerciseRecommendation] = Field(description="List of exercises for this day")

class WorkoutPlanResponse(BaseModel):
    plan_name: str = Field(description="Engaging title for the personalized plan")
    description: str = Field(description="Overview of how this plan meets the user's goals and equipment")
    days: List[WorkoutDay] = Field(description="Structured training days")
    usage_model: Optional[str] = None

# Chat Response Schemas
class SourceReference(BaseModel):
    source_file: str
    title: Optional[str] = None
    similarity_score: float

class ChatResponse(BaseModel):
    response: str
    sources: List[SourceReference] = []
    usage_model: Optional[str] = None

# Weekly Progress Summary Schemas
class WeeklySummaryResponse(BaseModel):
    summary: str = Field(description="Narrative progress analysis acknowledging achievements and consistency")
    adherence_assessment: str = Field(description="Evaluation of workout adherence against weekly goals")
    actionable_recommendations: List[str] = Field(description="2-3 specific, scientifically sound tips for next week")
    usage_model: Optional[str] = None
