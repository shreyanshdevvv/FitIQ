import json
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from app.llm.provider import llm_provider
from app.rag.pipeline import rag_pipeline

router = APIRouter(prefix="/nutrition", tags=["Nutrition Agent"])

class AthleteNutritionContext(BaseModel):
    athlete_name: Optional[str] = "Athlete"
    weight_kg: float = Field(default=75.0, ge=30.0, le=300.0)
    height_cm: float = Field(default=178.0, ge=100.0, le=250.0)
    age: int = Field(default=26, ge=14, le=100)
    gender: Optional[str] = "Male"
    goals: List[str] = Field(default=["BUILD_MUSCLE"])
    workout_days_per_week: int = Field(default=4, ge=1, le=7)
    session_duration_minutes: int = Field(default=60, ge=15, le=180)
    dietary_preference: Optional[str] = "No Preference"
    active_plan_name: Optional[str] = None

class NutritionPlanResponse(BaseModel):
    daily_calories: int
    protein_grams: int
    carbs_grams: int
    fats_grams: int
    water_ml: int
    dietary_strategy: str
    strategy_label: str
    notes: str
    meal_timing_tips: List[str]

@router.post("/generate-plan", response_model=NutritionPlanResponse)
async def generate_nutrition_plan(ctx: AthleteNutritionContext):
    """
    Nutrition & Fueling Agent:
    Calculates scientific BMR & TDEE using Mifflin-St Jeor formula,
    calibrates macros based on workout frequency and goals,
    and uses sports science guidelines for nutrient timing recommendations.
    """
    try:
        # 1. Scientific BMR Calculation (Mifflin-St Jeor)
        is_female = (ctx.gender or "").strip().lower() in ["female", "woman", "f"]
        if is_female:
            bmr = 10 * ctx.weight_kg + 6.25 * ctx.height_cm - 5 * ctx.age - 161
        else:
            bmr = 10 * ctx.weight_kg + 6.25 * ctx.height_cm - 5 * ctx.age + 5

        # 2. Activity Multiplier based on real training frequency
        if ctx.workout_days_per_week <= 2:
            activity_multiplier = 1.375
        elif ctx.workout_days_per_week <= 4:
            activity_multiplier = 1.55
        elif ctx.workout_days_per_week <= 6:
            activity_multiplier = 1.725
        else:
            activity_multiplier = 1.9

        tdee = bmr * activity_multiplier

        # 3. Goal Adjustment & Strategy Determination
        goals_set = set(ctx.goals or [])
        has_muscle = "BUILD_MUSCLE" in goals_set
        has_fat_loss = "LOSE_WEIGHT" in goals_set
        has_endurance = "IMPROVE_ENDURANCE" in goals_set

        if has_muscle and has_fat_loss:
            # Body Recomposition: Slight deficit with high protein
            strategy = "BODY_RECOMPOSITION"
            strategy_label = "High-Protein Body Recomposition"
            calorie_target = round(tdee - 250)
            protein_per_kg = 2.2
            fat_per_kg = 0.85
        elif has_fat_loss:
            strategy = "FAT_LOSS_DEFICIT"
            strategy_label = "Metabolic Fat Loss Deficit"
            calorie_target = round(tdee - 450)
            protein_per_kg = 2.0
            fat_per_kg = 0.8
        elif has_muscle:
            strategy = "LEAN_BULK_SURPLUS"
            strategy_label = "Lean Hypertrophy Surplus"
            calorie_target = round(tdee + 300)
            protein_per_kg = 2.0
            fat_per_kg = 0.9
        elif has_endurance:
            strategy = "PERFORMANCE_ENDURANCE"
            strategy_label = "Endurance Glycogen Priority"
            calorie_target = round(tdee)
            protein_per_kg = 1.8
            fat_per_kg = 0.8
        else:
            strategy = "BALANCED_MAINTENANCE"
            strategy_label = "Balanced Athletic Maintenance"
            calorie_target = round(tdee)
            protein_per_kg = 1.8
            fat_per_kg = 0.9

        # Ensure healthy minimum calories
        calorie_target = max(calorie_target, 1400 if is_female else 1650)

        # 4. Macro Calculation
        protein_grams = round(ctx.weight_kg * protein_per_kg)
        fats_grams = round(ctx.weight_kg * fat_per_kg)
        
        calories_from_protein = protein_grams * 4
        calories_from_fats = fats_grams * 9
        remaining_calories = max(calorie_target - calories_from_protein - calories_from_fats, 200)
        carbs_grams = round(remaining_calories / 4)

        # Recalculate exact total calories based on rounded macros
        final_calories = (protein_grams * 4) + (carbs_grams * 4) + (fats_grams * 9)

        # Water target: 35ml/kg + 500ml per hour of training
        water_ml = round((ctx.weight_kg * 35) + ((ctx.session_duration_minutes / 60) * 500))
        # Round to nearest 250ml
        water_ml = max(round(water_ml / 250) * 250, 2500)

        # 5. Retrieve nutrition science guidelines from RAG
        rag_context = ""
        try:
            chunks = await rag_pipeline.retrieve("protein synthesis nutrient timing hydration macronutrients", top_k=2)
            if chunks:
                rag_context = "\n".join([f"- {c.get('content', '')[:200]}" for c in chunks])
        except Exception:
            pass

        # 6. Generate nuanced athlete nutrient timing tips via Gemini
        prompt = f"""You are the FitCoach Nutrition & Fueling Specialist.
Generate 4 concise, high-impact nutrient timing and dietary execution tips for this athlete.

ATHLETE DATA:
- Name: {ctx.athlete_name}
- Weight: {ctx.weight_kg} kg | Height: {ctx.height_cm} cm | Age: {ctx.age}
- Goals: {', '.join(ctx.goals)}
- Weekly Schedule: {ctx.workout_days_per_week} days/week, {ctx.session_duration_minutes} min/session
- Active Routine: {ctx.active_plan_name or 'Strength & Hypertrophy'}
- Dietary Preference: {ctx.dietary_preference or 'No specific restriction'}
- Calculated Targets: {final_calories} kcal ({protein_grams}g Protein, {carbs_grams}g Carbs, {fats_grams}g Fats, {water_ml}ml Water)

KNOWLEDGE BASE CONTEXT:
{rag_context if rag_context else 'Standard ISSN sports nutrition guidelines on protein distribution and glycogen replenishment.'}

REQUIREMENTS:
1. Return ONLY a valid JSON object with two fields:
   - "notes": A 2-sentence encouraging summary of their nutrition phase and caloric objective.
   - "meal_timing_tips": An array of exactly 4 strings focusing on:
     (a) Pre-workout fueling timing (carbs + light protein 60-90m before).
     (b) Post-workout muscle protein synthesis (30-40g protein + recovery carbs).
     (c) Daily protein distribution (e.g. 3-4 meals spaced 3-4 hours apart).
     (d) Hydration and dietary preference advice tailored to {ctx.dietary_preference}.
2. Do NOT wrap in markdown fences other than json if necessary.
"""
        system_prompt = "You are the FitCoach Nutrition & Fueling Specialist. Output valid JSON only."
        response_text = await llm_provider.generate_text(system_prompt=system_prompt, user_prompt=prompt)
        
        # Clean response
        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            if cleaned.endswith("```"):
                cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()

        try:
            parsed = json.loads(cleaned)
            notes = parsed.get("notes", f"Targeting {final_calories} kcal calibrated for {strategy_label.lower()}.")
            tips = parsed.get("meal_timing_tips", [])
            if not tips or len(tips) < 3:
                raise ValueError("Incomplete tips")
        except Exception:
            notes = f"Your daily target is {final_calories} kcal ({protein_grams}g protein) designed to fuel your {ctx.workout_days_per_week}-day training split while advancing your physique goals."
            tips = [
                f"Distribute your {protein_grams}g of protein evenly across 3 to 4 meals (roughly {round(protein_grams / 3.5)}g per meal) to maximize muscle protein synthesis.",
                "Consume 30-45g of complex carbohydrates 60-90 minutes prior to your workout to ensure optimal muscle glycogen availability.",
                "Prioritize 30-40g of rapid-digesting protein and moderate carbohydrates within 2 hours post-workout for tissue repair.",
                f"Drink at least {water_ml / 1000:.1f} liters of water daily, adding an extra 500ml during high-intensity training sessions."
            ]

        return NutritionPlanResponse(
            daily_calories=final_calories,
            protein_grams=protein_grams,
            carbs_grams=carbs_grams,
            fats_grams=fats_grams,
            water_ml=water_ml,
            dietary_strategy=strategy,
            strategy_label=strategy_label,
            notes=notes,
            meal_timing_tips=tips[:4]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate nutrition plan: {str(e)}")
