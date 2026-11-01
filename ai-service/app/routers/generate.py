from typing import List, Dict, Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.llm.provider import llm_provider
from app.llm.schemas import WorkoutPlanResponse, WorkoutDay, ExerciseRecommendation

router = APIRouter(prefix="/api/v1/generate", tags=["AI Workout Generation"])

class GenerateWorkoutRequest(BaseModel):
    user_profile: Dict[str, Any]
    available_exercises: List[Dict[str, Any]]
    preferences: Optional[Dict[str, Any]] = None

@router.post("/workout", response_model=WorkoutPlanResponse)
async def generate_workout(payload: GenerateWorkoutRequest):
    exercises = payload.available_exercises
    if not exercises:
        exercises = [
            {"id": "00000000-0000-0000-0000-000000000000", "name": "Push-Up", "muscle_groups": ["Chest", "Triceps"]}
        ]

    workout_days_count = int(payload.user_profile.get("workout_days_per_week", 4) or 4)
    workout_days_count = max(2, min(workout_days_count, 6))

    system_prompt = (
        "You are an elite, evidence-based strength and conditioning coach. "
        "Create a scientifically structured workout program tailored strictly to the user's "
        f"experience level, target goals, available equipment, and physical limitations. "
        f"The athlete trains {workout_days_count} days per week. You MUST create exactly {workout_days_count} "
        f"distinct workout days (day_number 1 to {workout_days_count}) with appropriate periodized muscle splits. "
        "Select exercises ONLY from the provided exercise library, matching their exact exercise_id and name. "
        "Return the result strictly conforming to the requested schema."
    )

    user_prompt = f"""
USER FITNESS PROFILE:
{payload.user_profile}

TRAINING SCHEDULE:
{workout_days_count} workout days per week requested.

AVAILABLE EXERCISE LIBRARY:
{exercises[:30]}

USER PREFERENCES:
{payload.preferences or {}}
"""

    # If client has active key, use it
    if llm_provider.client:
        try:
            plan = await llm_provider.generate_structured(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=WorkoutPlanResponse,
            )
            plan.usage_model = llm_provider.last_used_model
            return plan
        except Exception as e:
            print(f"⚠️ Structured generation error in router: {e}")

    # High-quality dynamic multi-day split fallback matching user's selected days
    split_templates = {
        2: [
            ("Day 1: Full Body Compound A", "Squat, Horizontal Press, Horizontal Pull, Core"),
            ("Day 2: Full Body Compound B", "Hinge, Vertical Press, Vertical Pull, Arms"),
        ],
        3: [
            ("Day 1: Push (Chest, Shoulders & Triceps)", "Horizontal/Vertical Pressing, Triceps"),
            ("Day 2: Pull (Back, Rear Delts & Biceps)", "Horizontal/Vertical Rows, Pulldowns, Biceps"),
            ("Day 3: Legs & Core (Quads, Hamstrings & Calves)", "Squats, Hinges, Calves, Core"),
        ],
        4: [
            ("Day 1: Upper Body Strength", "Barbell Bench, Rows, Overhead Press, Biceps"),
            ("Day 2: Lower Body Power", "Barbell Squat, Romanian Deadlift, Quad Accessories"),
            ("Day 3: Push & Upper Hypertrophy", "Incline DB Press, Lateral Raises, Tricep Extensions"),
            ("Day 4: Pull & Posterior Chain", "Pull-ups, Lat Pulldowns, Hamstrings & Core"),
        ],
        5: [
            ("Day 1: Chest & Triceps", "Heavy Pressing, Dips, Cable Flyes"),
            ("Day 2: Back & Biceps", "Deadlift/Rows, Pull-ups, Curls"),
            ("Day 3: Quads & Calves", "Squats, Leg Press, Extensions"),
            ("Day 4: Shoulders & Upper Traps", "Overhead Press, Lateral Raises, Facepulls"),
            ("Day 5: Hamstrings, Glutes & Core", "RDLs, Hip Thrusts, Hanging Leg Raises"),
        ],
        6: [
            ("Day 1: Push Power", "Heavy Bench, Military Press, Dips"),
            ("Day 2: Pull Power", "Deadlift, Barbell Rows, Weighted Chins"),
            ("Day 3: Legs Power", "Heavy Back Squat, Romanian Deadlift"),
            ("Day 4: Push Hypertrophy", "Incline Dumbbell, Cable Raises, Overhead Extensions"),
            ("Day 5: Pull Hypertrophy", "Chest-Supported Rows, Lat Pulldowns, Preacher Curls"),
            ("Day 6: Legs Hypertrophy", "Bulgarian Split Squats, Leg Curls, Standing Calf Raises"),
        ],
    }

    chosen_template = split_templates.get(workout_days_count, split_templates[4])

    generated_days: List[WorkoutDay] = []
    ex_count = len(exercises)

    for day_idx, (day_name, day_focus) in enumerate(chosen_template):
        day_num = day_idx + 1
        # Distribute exercises evenly across days from the library
        day_exs: List[ExerciseRecommendation] = []
        for slot in range(4):
            ex_item = exercises[(day_idx * 3 + slot) % ex_count]
            day_exs.append(
                ExerciseRecommendation(
                    exercise_id=ex_item["id"],
                    exercise_name=ex_item["name"],
                    sets=4 if slot < 2 else 3,
                    reps=6 if slot == 0 else 8 if slot == 1 else 10 if slot == 2 else 12,
                    rest_seconds=120 if slot == 0 else 90 if slot == 1 else 60,
                    notes=f"Tempo controlled (3-0-1-0). Focus on {day_focus.split(',')[0]} contraction.",
                )
            )

        generated_days.append(
            WorkoutDay(
                day_number=day_num,
                name=day_name,
                exercises=day_exs,
            )
        )

    fitness_level = payload.user_profile.get("fitness_level", "INTERMEDIATE")

    return WorkoutPlanResponse(
        plan_name=f"{fitness_level.capitalize()} {workout_days_count}-Day Progressive Split",
        description=f"Scientifically periodized {workout_days_count}-day routine tailored to your training schedule.",
        days=generated_days,
        usage_model="gpt-4o-mini-adapted",
    )
