import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { UserProfile } from './src/types/diet';
import {
  calculateMetrics,
  generateDailySchedule,
  generateWeeklyDietPlan,
  generateGroceryList,
  buildCompleteHealthPlan,
} from './src/utils/nutritionCalculator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini Client server-side
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API: Generate personalized diet plan & routine
app.post('/api/health/generate', async (req: Request, res: Response) => {
  try {
    const profile: UserProfile = req.body;
    if (!profile || !profile.heightCm || !profile.weightKg || !profile.age) {
      return res.status(400).json({ error: 'Missing required physical parameters' });
    }

    // Always calculate precise scientific baseline
    const metrics = calculateMetrics(profile);
    const fallbackPlan = buildCompleteHealthPlan(profile);

    // If Gemini API is available, enrich with personalized AI dietitian & lifestyle suggestions
    if (ai) {
      try {
        const prompt = `You are a world-class registered clinical dietitian and human longevity physiologist.
Create a personalized nutrition and activity assessment for this individual:
- Age: ${profile.age}, Biological Sex: ${profile.sex}
- Height: ${profile.heightCm} cm, Weight: ${profile.weightKg} kg
- Calculated BMI: ${metrics.bmi} (${metrics.bmiCategory})
- Calculated BMR: ${metrics.bmr} kcal, TDEE: ${metrics.tdee} kcal
- Recommended Calorie Target: ${metrics.targetCalories} kcal (Protein: ${metrics.macros.proteinGrams}g, Carbs: ${metrics.macros.carbsGrams}g, Fats: ${metrics.macros.fatsGrams}g, Water: ${metrics.macros.waterLiters}L)
- Routine / Occupation Type: ${profile.routine}
- Daily Schedule: Wakes up at ${profile.wakeTime}, Bedtime at ${profile.bedTime}
- Primary Health Goal: ${profile.goal}
- Diet Preference: ${profile.dietPreference}
- Allergies / Restrictions: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None'}

Provide a structured JSON output with:
1. "personalizedDietitianNote": A warm, encouraging 3-sentence clinical breakdown explaining why this exact caloric and macro split suits their body composition and routine.
2. "routineEnhancementTips": 3 practical micro-habits specifically customized to someone waking at ${profile.wakeTime} with their routine (${profile.routine}).
3. "keyNutrientFocus": 3 micronutrients they should focus on (e.g., Vitamin D3, Magnesium, Potassium, Omega-3) and why.`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text);
          return res.json({
            ...fallbackPlan,
            aiInsights: parsed,
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini enrichment encountered an issue, serving scientific fallback plan:', geminiErr);
      }
    }

    // Return the scientifically computed complete plan
    return res.json({
      ...fallbackPlan,
      aiInsights: {
        personalizedDietitianNote: `At ${profile.heightCm} cm and ${profile.weightKg} kg, your calculated baseline metabolic rate is ${metrics.bmr} kcal. With your ${profile.routine.replace('_', ' ')} routine and ${profile.goal.replace('_', ' ')} objective, your optimal daily intake is targeted at ${metrics.targetCalories} kcal, calibrated with ${metrics.macros.proteinGrams}g of protein to maintain vital lean mass and sustained hormonal equilibrium.`,
        routineEnhancementTips: [
          'Hydrate immediately upon rising to jumpstart metabolic clearance after overnight fasting.',
          'Incorporate the 10-15 minute post-meal digestive stroll to blunt glycemic spikes by up to 30%.',
          'Execute your ergonomic stretches every 90 minutes to prevent lumbar decompression.',
        ],
        keyNutrientFocus: [
          'Magnesium Glycinate (300-400mg) for neuromuscular relaxation and stage-4 sleep architecture.',
          'Omega-3 Fatty Acids (EPA/DHA) to counter cellular inflammation from work stress and training.',
          'Electrolytes (Sodium & Potassium) balanced with your 35ml/kg daily water intake.',
        ],
      },
    });
  } catch (error) {
    console.error('Error generating diet plan:', error);
    res.status(500).json({ error: 'Internal server error processing health plan' });
  }
});

// API: Swap a meal with an alternative
app.post('/api/health/swap-meal', async (req: Request, res: Response) => {
  try {
    const { category, currentMealName, calories, dietPreference, allergies } = req.body;

    if (ai) {
      try {
        const prompt = `Suggest ONE creative, wholesome, and delicious ${category} meal alternative to replace "${currentMealName}".
Target approx ${calories} calories.
Diet preference: ${dietPreference}.
Restrictions/Allergies: ${allergies && allergies.length > 0 ? allergies.join(', ') : 'None'}.
Respond in strict JSON with:
{
  "name": "Meal Title",
  "prepTimeMinutes": 15,
  "calories": ${calories},
  "protein": 25,
  "carbs": 40,
  "fats": 12,
  "ingredients": ["item 1", "item 2", "item 3", "item 4"],
  "instructions": ["step 1", "step 2", "step 3"],
  "healthBenefit": "One sentence explaining its unique physiological benefit."
}`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          const meal = JSON.parse(aiResponse.text);
          return res.json({ meal: { ...meal, id: 'swap-' + Date.now(), category, time: '12:30' } });
        }
      } catch (aiErr) {
        console.warn('AI meal swap failed, returning curated alternative:', aiErr);
      }
    }

    // Curated fallback swap
    const fallbackMeals = {
      breakfast: {
        name: 'Avocado & Hemp Seed Sourdough with Poached Pasture Eggs',
        prepTimeMinutes: 10,
        calories: calories || 450,
        protein: 24,
        carbs: 38,
        fats: 20,
        ingredients: ['Artisan sourdough (2 slices)', 'Hass avocado (1/2)', '2 poached eggs', 'Hemp hearts', 'Chili flakes & lime'],
        instructions: ['Toast sourdough to golden crunch', 'Mash avocado with lime juice and spread', 'Top with poached eggs and hemp seeds'],
        healthBenefit: 'Monounsaturated fatty acids and bioavailable choline foster prolonged cognitive alertness without insulin crashes.',
      },
      morning_snack: {
        name: 'Walnut & Dark Cherry Antioxidant Bowl',
        prepTimeMinutes: 3,
        calories: calories || 180,
        protein: 6,
        carbs: 18,
        fats: 11,
        ingredients: ['Raw walnut halves (20g)', 'Fresh or frozen dark cherries (1/2 cup)', 'Cacao nibs (1 tsp)'],
        instructions: ['Combine in a small bowl and enjoy slowly'],
        healthBenefit: 'Anthocyanins from dark cherries reduce oxidative biomarkers while walnuts nourish cerebral microvasculature.',
      },
      lunch: {
        name: 'Grilled Herb Wild Salmon with Roasted Rosemary Sweet Potato & Arugula',
        prepTimeMinutes: 20,
        calories: calories || 620,
        protein: 42,
        carbs: 45,
        fats: 22,
        ingredients: ['Wild Alaskan salmon (160g)', 'Sweet potato roasted in cubes', 'Fresh baby arugula', 'Extra virgin olive oil', 'Lemon vinaigrette'],
        instructions: ['Pan-sear salmon in olive oil for 4 minutes each side', 'Roast cubed sweet potato at 200°C until tender', 'Toss arugula with lemon and olive oil'],
        healthBenefit: 'High EPA and DHA fatty acids support joint cartilage regeneration and maintain optimal insulin receptor sensitivity.',
      },
      afternoon_snack: {
        name: 'Greek Yogurt Dip with Crisp Cucumber & Bell Pepper Batons',
        prepTimeMinutes: 5,
        calories: calories || 190,
        protein: 15,
        carbs: 12,
        fats: 5,
        ingredients: ['Greek yogurt 2% (150g)', 'Persian cucumber batons', 'Red bell pepper strips', 'Fresh dill & lemon juice'],
        instructions: ['Whisk dill and lemon into yogurt with pinch of sea salt', 'Serve alongside chilled vegetable crudites'],
        healthBenefit: 'Slow-absorbing micellar casein provides a continuous stream of amino acids into the bloodstream.',
      },
      dinner: {
        name: 'Tender Herb Chicken Breast with Steamed Broccolini & Herbed Quinoa',
        prepTimeMinutes: 25,
        calories: calories || 520,
        protein: 44,
        carbs: 42,
        fats: 14,
        ingredients: ['Free-range chicken breast (180g)', 'Cooked quinoa (1 cup)', 'Tender broccolini spears', 'Garlic cloves', 'Olive oil & thyme'],
        instructions: ['Grill seasoned chicken breast until internal temp reaches 74°C', 'Steam broccolini for 4 minutes until bright green', 'Serve over warm herbed quinoa'],
        healthBenefit: 'Packed with sulforaphane from cruciferous broccolini to activate phase-II hepatic detoxification pathways.',
      },
    };

    const chosen = fallbackMeals[category as keyof typeof fallbackMeals] || fallbackMeals.lunch;
    res.json({
      meal: {
        ...chosen,
        id: 'swap-' + Date.now(),
        category,
        time: '13:00',
      },
    });
  } catch (err) {
    console.error('Error swapping meal:', err);
    res.status(500).json({ error: 'Failed to swap meal' });
  }
});

// API: Dietitian & Coach Q&A
app.post('/api/health/ask-coach', async (req: Request, res: Response) => {
  try {
    const { question, userContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (ai) {
      try {
        const prompt = `You are NutriLife's head registered dietitian and clinical exercise specialist.
User Context:
${userContext ? JSON.stringify(userContext) : 'Health enthusiast looking for proper nutrition & activity guidance.'}

Question: "${question}"

Provide a concise, scientifically accurate, encouraging response (max 3 short paragraphs). Include practical advice, food suggestions, or routine adjustments if relevant.`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        if (aiResponse.text) {
          return res.json({ answer: aiResponse.text });
        }
      } catch (err) {
        console.warn('AI coach Q&A fallback triggered:', err);
      }
    }

    // Fallback response for common questions
    const qLower = question.toLowerCase();
    let answer = `Consistency in whole-food nutrition and circadian daily rhythm is the foundation of long-term vitality.`;
    if (qLower.includes('protein') || qLower.includes('muscle')) {
      answer = `To maximize protein synthesis, aim to distribute your protein intake across 3 to 4 meals throughout the day, providing 25-40g of complete protein per feeding. Good sources include pasture-raised eggs, Greek yogurt, wild fish, lean poultry, tofu, lentils, and tempeh.`;
    } else if (qLower.includes('water') || qLower.includes('hydration')) {
      answer = `Hydration is critical for cognitive function and metabolic rate. Aim for 35ml per kilogram of bodyweight daily. Drink a large glass of water within 15 minutes of waking to jumpstart your digestive tract and replace fluids lost during overnight respiration.`;
    } else if (qLower.includes('snack') || qLower.includes('cravings') || qLower.includes('sweet')) {
      answer = `Afternoon cravings are often caused by blood glucose volatility from high-glycemic lunches or dehydration. First drink 300ml of water, then pair a protein with healthy fiber, such as Greek yogurt with berries or raw almonds with an apple slice.`;
    } else if (qLower.includes('exercise') || qLower.includes('workout') || qLower.includes('walk')) {
      answer = `For a desk routine, the single most transformative habit is a 10-15 minute digestive walk after lunch. It activates muscle glucose uptake independently of insulin, blunting post-meal fatigue and keeping your metabolic engine humming.`;
    } else if (qLower.includes('sleep') || qLower.includes('tired') || qLower.includes('night')) {
      answer = `Prioritize a 'digital sunset' by dimming screens and overhead lights 45 minutes before bedtime. Ensure your dinner is finished at least 2.5 to 3 hours prior to sleep so that nocturnal body temperature drops smoothly into restorative stage-4 sleep.`;
    }

    res.json({ answer });
  } catch (err) {
    console.error('Error handling coach Q&A:', err);
    res.status(500).json({ error: 'Error generating answer' });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer();
