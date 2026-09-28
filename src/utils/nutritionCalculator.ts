import {
  UserProfile,
  MetricsSummary,
  DayDietPlan,
  ScheduledActivity,
  FullHealthPlan,
  MealItem,
} from '../types/diet';

export function calculateMetrics(profile: UserProfile): MetricsSummary {
  const { age, sex, heightCm, weightKg, routine, goal } = profile;

  // 1. BMI calculation: weight (kg) / (height (m))^2
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let bmiCategory: MetricsSummary['bmiCategory'] = 'Normal weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal weight';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obesity';

  // Ideal weight range based on BMI 19.5 - 24.5
  const idealMin = parseFloat((19.5 * heightM * heightM).toFixed(1));
  const idealMax = parseFloat((24.5 * heightM * heightM).toFixed(1));

  // 2. Mifflin-St Jeor Equation for BMR
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  // 3. TDEE Multiplier
  let activityMultiplier = 1.2;
  switch (routine) {
    case 'desk_sedentary':
      activityMultiplier = 1.2;
      break;
    case 'hybrid_light':
      activityMultiplier = 1.375;
      break;
    case 'moderate_active':
      activityMultiplier = 1.55;
      break;
    case 'very_active_physical':
      activityMultiplier = 1.75;
      break;
  }
  const tdee = Math.round(bmr * activityMultiplier);

  // 4. Target Calories according to goal
  let targetCalories = tdee;
  if (goal === 'fat_loss') {
    targetCalories = Math.round(tdee - 450);
    // Safe minimum floor
    const minCalories = sex === 'male' ? 1500 : 1250;
    if (targetCalories < minCalories) targetCalories = minCalories;
  } else if (goal === 'muscle_gain') {
    targetCalories = Math.round(tdee + 350);
  } else if (goal === 'heart_health') {
    targetCalories = bmi > 25 ? Math.round(tdee - 250) : tdee;
  }

  // 5. Macronutrients
  let proteinRatio = 0.25;
  let fatRatio = 0.28;
  let carbsRatio = 0.47;

  if (profile.dietPreference === 'high_protein' || goal === 'muscle_gain' || goal === 'fat_loss') {
    proteinRatio = 0.30;
    fatRatio = 0.25;
    carbsRatio = 0.45;
  } else if (profile.dietPreference === 'mediterranean') {
    proteinRatio = 0.22;
    fatRatio = 0.35; // Rich in healthy monounsaturated olive oil & omega-3
    carbsRatio = 0.43;
  } else if (profile.dietPreference === 'low_carb') {
    proteinRatio = 0.30;
    fatRatio = 0.50;
    carbsRatio = 0.20;
  } else if (profile.dietPreference === 'vegan' || profile.dietPreference === 'vegetarian') {
    proteinRatio = 0.22;
    fatRatio = 0.28;
    carbsRatio = 0.50;
  }

  const proteinGrams = Math.round((targetCalories * proteinRatio) / 4);
  const fatsGrams = Math.round((targetCalories * fatRatio) / 9);
  const carbsGrams = Math.round((targetCalories * carbsRatio) / 4);
  const fiberGrams = Math.max(28, Math.round((targetCalories / 1000) * 14));

  // 6. Daily Water Intake (35ml per kg bodyweight + 500ml for active routines)
  let waterLiters = (weightKg * 35) / 1000;
  if (routine === 'moderate_active' || routine === 'very_active_physical') {
    waterLiters += 0.6;
  }
  waterLiters = parseFloat(waterLiters.toFixed(1));

  return {
    bmi,
    bmiCategory,
    idealWeightRange: { min: idealMin, max: idealMax },
    bmr,
    tdee,
    targetCalories,
    macros: {
      calories: targetCalories,
      proteinGrams,
      carbsGrams,
      fatsGrams,
      fiberGrams,
      waterLiters,
    },
  };
}

// Generate an evidence-based circadian activity schedule based on wake/bed time and routine
export function generateDailySchedule(profile: UserProfile): ScheduledActivity[] {
  const [wakeH, wakeM] = profile.wakeTime.split(':').map(Number);
  const formatTime = (h: number, m: number) => {
    const hh = (h % 24).toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const schedule: ScheduledActivity[] = [
    {
      id: 'act-1',
      time: formatTime(wakeH, wakeM + 10),
      title: 'Hydration Awakening & Light Exposure',
      category: 'morning_ritual',
      durationMinutes: 15,
      description: 'Drink 400-500ml lukewarm water with a squeeze of lemon and pinch of sea salt. Step outside or face an open window for 5-10 minutes of direct morning sunlight.',
      actionableSteps: [
        'Immediate rehydration after 7-8 hours of nighttime respiration',
        'Sunlight on retina stimulates suprachiasmatic nucleus (circadian clock), releasing natural cortisol for daytime alertness',
        'Postpone heavy caffeine intake until 90 minutes after waking to avoid afternoon crash',
      ],
      scientificBenefit: 'Enhances alertness, initiates digestive peristalsis, and presets the melatonin sleep timer 14-16 hours later.',
      intensity: 'low',
    },
    {
      id: 'act-2',
      time: formatTime(wakeH, wakeM + 30),
      title: 'Morning Mobility & Joint Activation',
      category: 'mobility',
      durationMinutes: 15,
      description: 'Dynamic range-of-motion sequence focusing on thoracic spine, hip flexors, hamstrings, and ankles.',
      actionableSteps: [
        'Cat-Cow flow (10 reps) to decompress lumbar spine',
        'World\'s Greatest Stretch / Low lunge with thoracic rotation (5 each side)',
        'Glute bridges & bodyweight deep squats (12 reps)',
      ],
      scientificBenefit: 'Increases synovial fluid flow in joints, resets postural alignment, and lowers risk of musculoskeletal stiffness.',
      intensity: 'low',
    },
    {
      id: 'act-3',
      time: formatTime(wakeH + 3, wakeM),
      title: 'Desk Worker Ergonomic Reset & 20-20-20 Eye Break',
      category: 'ergonomics',
      durationMinutes: 5,
      description: 'Stand up, stretch pecs against a doorframe, perform chin tucks, and look at an object 20 feet away for 20 seconds.',
      actionableSteps: [
        'Stand and roll shoulders back and down 10 times',
        'Doorway chest stretch to reverse rounded desk shoulders',
        'Refill your water tumbler to hit your hourly hydration goal',
      ],
      scientificBenefit: 'Prevents sustained forward-head strain, restores venous blood return in legs, and relieves digital eye fatigue.',
      intensity: 'low',
    },
    {
      id: 'act-4',
      time: formatTime(wakeH + 6, wakeM + 30),
      title: 'Post-Lunch 15-Minute Digestive Stroll',
      category: 'digestive_walk',
      durationMinutes: 15,
      description: 'Brisk but comfortable outdoor walk immediately following your lunch meal.',
      actionableSteps: [
        'Leave your workstation; walk at a conversational pace',
        'Breathe through your nose to maintain parasympathetic balance',
        'Target ~1,500 - 2,000 steps during this window',
      ],
      scientificBenefit: 'Contracting soleus and quad muscles pulls glucose directly from bloodstream without requiring heavy insulin spikes, blunting the post-meal glucose spike by up to 30%.',
      intensity: 'low',
    },
    {
      id: 'act-5',
      time: formatTime(wakeH + 10, wakeM),
      title: profile.routine === 'desk_sedentary' || profile.routine === 'hybrid_light'
        ? 'Targeted Physical Exercise (Full Body Circuit & Cardio)'
        : 'Focused Strength & Core Session',
      category: 'workout',
      durationMinutes: 35,
      description: profile.goal === 'fat_loss'
        ? 'High-density resistance circuit paired with Zone 2 cardio (walking or cycling)'
        : profile.goal === 'muscle_gain'
        ? 'Hypertrophy resistance session focusing on compound movements'
        : 'Functional strength, balance, and aerobic conditioning',
      actionableSteps: [
        '5-min warmup: jumping jacks, hip openers, arm circles',
        '20-min main set: Dumbbell/bodyweight squats, push-ups, inverted rows or band pull-aparts, lunges, and plank variations (3 sets x 10-12 reps)',
        '10-min steady-state cardio or brisk walk to elevate aerobic base',
      ],
      scientificBenefit: 'Stimulates myofibrillar protein synthesis, upgrades mitochondrial density, and optimizes insulin sensitivity.',
      intensity: 'moderate',
    },
    {
      id: 'act-6',
      time: formatTime(wakeH + 14, wakeM),
      title: 'Evening Digital Sunset & Parasympathetic Wind-Down',
      category: 'sleep_hygiene',
      durationMinutes: 30,
      description: 'Transition into rest mode 45-60 minutes before your planned bedtime.',
      actionableSteps: [
        'Dim bright overhead LED lights; switch to warm, low-level amber illumination',
        'Silence notifications and step away from work screens',
        'Sip magnesium glycinate or chamomile tea',
        '5 minutes of 4-7-8 relaxed box breathing in bed',
      ],
      scientificBenefit: 'Enables endogenous melatonin secretion, lowers heart rate variability (HRV) stress, and deepens slow-wave regenerative sleep.',
      intensity: 'low',
    },
  ];

  return schedule;
}

// Generate 7 distinct days of meal plans tailored to calorie targets, macro ratios, allergies, and diet preferences
export function generateWeeklyDietPlan(profile: UserProfile, metrics: MetricsSummary): DayDietPlan[] {
  const { targetCalories, macros } = metrics;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Distribution across 5 eating windows:
  // Breakfast: 25% | Morning Snack: 10% | Lunch: 35% | Afternoon Snack: 10% | Dinner: 20%
  const bCal = Math.round(targetCalories * 0.25);
  const msCal = Math.round(targetCalories * 0.10);
  const lCal = Math.round(targetCalories * 0.35);
  const asCal = Math.round(targetCalories * 0.10);
  const dCal = Math.round(targetCalories * 0.20);

  const isVeg = profile.dietPreference === 'vegetarian' || profile.dietPreference === 'vegan';
  const isVegan = profile.dietPreference === 'vegan';
  const isKeto = profile.dietPreference === 'low_carb';
  const hasDairyAllergy = profile.allergies.includes('Dairy');
  const hasNutAllergy = profile.allergies.includes('Nuts');
  const hasGlutenAllergy = profile.allergies.includes('Gluten');

  // Helper meal databases adapted for dietary preferences
  const breakfastOptions = [
    {
      name: isVegan
        ? 'Chia Seed & Plant Protein Power Porridge with Berries'
        : isVeg
        ? 'Greek Yogurt Parfait with Mixed Berries, Walnuts & Pumpkin Seeds'
        : isKeto
        ? 'Avocado & Free-Range Egg Scramble with Sautéed Spinach'
        : 'Whole-Grain Sourdough with Poached Eggs, Smashed Avocado & Smoked Salmon',
      prepTimeMinutes: 10,
      ingredients: isVegan
        ? ['Rolled oats (gluten-free)', 'Almond/soy milk', 'Organic chia seeds', 'Plant pea protein scoop', 'Blueberries', 'Ceylon cinnamon']
        : isVeg
        ? ['Greek yogurt 2% (or coconut yogurt)', 'Fresh blueberries & raspberries', 'Crushed walnuts', 'Chia seeds', 'Drizzle of raw honey']
        : isKeto
        ? ['3 pasture-raised eggs', '1/2 medium avocado', 'Baby spinach', 'Extra virgin olive oil', 'Pink Himalayan salt']
        : ['2 slices seeded sourdough', '2 poached eggs', '1/2 avocado', 'Smoked wild salmon (40g)', 'Microgreens & lemon wedge'],
      instructions: [
        'Lightly toast sourdough or prep oat/yogurt bowl',
        'Top with protein source and healthy fats (seeds/avocado)',
        'Finish with antioxidant-rich berries and microgreens',
      ],
      healthBenefit: 'High protein content promotes early morning GLP-1 satiety while healthy fats sustain steady cognitive focus.',
    },
    {
      name: isVegan
        ? 'Tofu Scramble with Turmeric, Kale, Mushrooms & Whole-Grain Toast'
        : isVeg
        ? 'Shakshuka with Bell Peppers, Tomatoes, Feta & Poached Eggs'
        : isKeto
        ? 'Smoked Salmon & Cream Cheese Wrapped Omelette with Chives'
        : 'Spinach & Turkey Bacon Egg White Frittata with Sweet Potato Cubes',
      prepTimeMinutes: 15,
      ingredients: isVegan
        ? ['Organic firm tofu (crumbled)', 'Baby kale & cherry tomatoes', 'Cremini mushrooms', 'Turmeric & black pepper', 'Sprouted grain toast']
        : isVeg
        ? ['2 large eggs', 'Crushed San Marzano tomatoes', 'Red bell pepper & onion', 'Crumbled feta cheese', 'Fresh cilantro']
        : isKeto
        ? ['3 whipped eggs', 'Smoked salmon ribbons', 'Cream cheese or avocado', 'Fresh dill & chives', 'Ghee for pan']
        : ['3 egg whites + 1 whole egg', 'Lean turkey rashers (2 slices)', 'Baby spinach', 'Steamed sweet potato cubes', 'Olive oil'],
      instructions: [
        'Sauté vegetables in olive oil on medium heat until fragrant',
        'Add eggs or tofu with seasoning',
        'Serve warm with your choice of complex carbohydrate or healthy greens',
      ],
      healthBenefit: 'Rich in lutein and choline for brain health, plus antioxidant polyphenols from peppers and greens.',
    },
    {
      name: isVegan
        ? 'Overnight Oats with Cacao, Hemp Hearts, Banana & Peanut Butter'
        : isVeg
        ? 'Cottage Cheese Bowl with Diced Mango, Flaxseeds & Mint'
        : isKeto
        ? 'Keto Nut-Seed Granola Bowl with Coconut Milk & Unsweetened Cacao Nibs'
        : 'Overnight Protein Oats with Whey Isolate, Sliced Banana & Almond Butter',
      prepTimeMinutes: 5,
      ingredients: isVegan
        ? ['Rolled oats', 'Soy/oat milk', 'Raw cacao powder', 'Hemp hearts', '1/2 sliced banana', 'Natural peanut butter']
        : isVeg
        ? ['Low-fat cottage cheese', 'Fresh diced mango or peaches', 'Ground golden flaxseed', 'Mint leaves', 'Pumpkin seeds']
        : isKeto
        ? ['Pecan pieces', 'Pumpkin & chia seeds', 'Unsweetened coconut milk', 'Raw cacao nibs', 'Ceylon cinnamon']
        : ['Rolled oats', 'Whey/casein protein powder', 'Almond milk', '1/2 sliced banana', 'Natural almond butter'],
      instructions: [
        'Mix oats and liquid with protein the night before',
        'Store in airtight glass mason jar in refrigerator',
        'In the morning, top with fresh fruit and crunchy seeds',
      ],
      healthBenefit: 'Resistant starch feeds beneficial gut microbiome while beta-glucan fibers support healthy cholesterol levels.',
    },
  ];

  const morningSnackOptions = [
    {
      name: 'Green Superfood Smoothie with Baby Spinach & Green Apple',
      prepTimeMinutes: 5,
      ingredients: ['1 cup raw baby spinach', '1/2 green granny smith apple', 'Cucumber slices', 'Coconut water or water', 'Splash of lemon'],
      instructions: ['Blend all ingredients until silky smooth', 'Drink fresh within 15 minutes of blending'],
      healthBenefit: 'Delivers chlorophyll, potassium, and hydration without triggering an insulin surge.',
    },
    {
      name: hasNutAllergy ? 'Roasted Edamame & Crisp Apple Slices' : 'Handful of Raw Almonds & Walnuts with Dark Chocolate (85%)',
      prepTimeMinutes: 2,
      ingredients: hasNutAllergy ? ['Dry-roasted organic edamame (30g)', 'Crisp crisp apple slices'] : ['Raw almonds (15g)', 'Walnut halves (15g)', '1 square 85% dark chocolate'],
      instructions: ['Portion into a small glass bowl', 'Eat mindfully away from screens'],
      healthBenefit: 'Magnesium and proanthocyanidins stimulate cerebral blood flow and sharpen mid-morning focus.',
    },
    {
      name: hasDairyAllergy ? 'Carrot & Cucumber Sticks with Roasted Garlic Hummus' : 'Hard-Boiled Pasture Egg with Sea Salt & Celery Sticks',
      prepTimeMinutes: 5,
      ingredients: ['1 large pasture-raised egg', 'Crisp celery sticks', 'Sea salt & cracked black pepper'],
      instructions: ['Boil egg for 8 minutes; peel and season', 'Pair with crunchy hydrating celery'],
      healthBenefit: 'Pure protein anchor that stabilizes blood glucose leading up to lunchtime.',
    },
  ];

  const lunchOptions = [
    {
      name: isVegan
        ? 'Warm Quinoa & Roasted Chickpea Mediterranean Bowl'
        : isVeg
        ? 'Lentil & Halloumi Bowl with Roasted Rainbow Vegetables'
        : isKeto
        ? 'Grilled Lemon Herb Chicken Thighs with Cauliflower Mash & Asparagus'
        : 'Mediterranean Grilled Chicken Breast with Quinoa, Cucumber & Tzatziki',
      prepTimeMinutes: 20,
      ingredients: isVegan
        ? ['Cooked tricolor quinoa (1 cup)', 'Spiced roasted chickpeas', 'Cherry tomatoes & kalamata olives', 'Diced Persian cucumber', 'Tahini lemon dressing']
        : isVeg
        ? ['Puy lentils (1 cup cooked)', 'Grilled halloumi (50g)', 'Roasted zucchini & bell peppers', 'Arugula leaves', 'Balsamic reduction']
        : isKeto
        ? ['Grilled boneless chicken thigh (180g)', 'Steamed cauliflower mashed with butter & garlic', 'Tender asparagus spears', 'Extra virgin olive oil']
        : ['Free-range chicken breast (160g)', 'Quinoa (1/2 cup cooked)', 'Diced cucumber & tomatoes', 'Greek yogurt tzatziki', 'Olive oil & oregano'],
      instructions: [
        'Warm the protein and base grain or greens in a wide bowl',
        'Arrange colorful diced vegetables around the center',
        'Drizzle with extra virgin olive oil and fresh lemon juice',
      ],
      healthBenefit: 'Optimal balance of complete amino acids and low-glycemic fiber preventing the notorious afternoon slump.',
    },
    {
      name: isVegan
        ? 'Tempeh Poke Bowl with Edamame, Pickled Ginger & Brown Jasmine Rice'
        : isVeg
        ? 'Warm Black Bean & Sweet Potato Burrito Bowl with Guacamole'
        : isKeto
        ? 'Seared Atlantic Salmon with Creamy Garlic Spinach & Avocado Salad'
        : 'Pan-Seared Wild Salmon Fillet with Asparagus & Roasted Baby Potatoes',
      prepTimeMinutes: 20,
      ingredients: isVegan
        ? ['Marinated organic tempeh (120g)', 'Shelled edamame', 'Brown jasmine rice or shredded cabbage', 'Pickled ginger & nori flakes', 'Sesame-tamari drizzle']
        : isVeg
        ? ['Organic black beans (1 cup)', 'Roasted cumin-spiced sweet potato', 'Sweet corn & diced peppers', 'Fresh guacamole', 'Cilantro-lime brown rice']
        : isKeto
        ? ['Wild Alaskan salmon (170g)', 'Sautéed baby spinach in ghee', 'Sliced Hass avocado', 'Lemon wedge & dill']
        : ['Wild salmon fillet (160g)', 'Roasted baby potatoes with rosemary', 'Steamed green asparagus', 'Lemon zest and olive oil'],
      instructions: [
        'Sear fish or bake protein until tender and golden',
        'Steam vegetables until vibrant and crisp-tender',
        'Plate with roasted carbs or avocado and garnish with fresh herbs',
      ],
      healthBenefit: 'Packed with bioavailable Omega-3 fatty acids (EPA & DHA) that reduce systemic inflammation and support joint longevity.',
    },
    {
      name: isVegan
        ? 'Hearty Tuscan White Bean & Cavolo Nero Soup with Crusty Sourdough'
        : isVeg
        ? 'Paneer or Tofu Tikka Salad with Mixed Greens & Mint Chutney'
        : isKeto
        ? 'Grass-Fed Beef Burger Patties with Cheddar, Bacon & Crisp Romaine Wraps'
        : 'Grass-Fed Lean Beef Stir-Fry with Broccoli, Snap Peas & Brown Rice',
      prepTimeMinutes: 20,
      ingredients: isVegan
        ? ['Cannellini beans (1 can rinsed)', 'Tuscan kale (cavolo nero)', 'Vegetable mirepoix (onion, carrot, celery)', 'Garlic & rosemary broth', 'Toasted sourdough']
        : isVeg
        ? ['Firm paneer or extra-firm tofu (120g)', 'Spiced tandoori marinade', 'Mixed crisp salad greens', 'Mint & coriander yogurt sauce', 'Sliced red onion']
        : isKeto
        ? ['2 grass-fed beef smash patties (150g)', 'Sharp cheddar cheese slice', 'Crisp romaine lettuce cups', 'Sliced dill pickles & avocado oil mayo']
        : ['Lean flank steak slices (150g)', 'Broccoli florets & snap peas', 'Low-sodium ginger-soy sauce', 'Steamed brown rice (1/2 cup)', 'Toasted sesame seeds'],
      instructions: [
        'Flash-fry beef or paneer/tofu in wok on high heat',
        'Toss in crisp vegetables and aromatics for 3 minutes',
        'Serve steaming hot with complex carbohydrates or crisp lettuce wraps',
      ],
      healthBenefit: 'High heme iron and zinc promote cellular oxygen transport, sustaining high afternoon physical stamina.',
    },
  ];

  const afternoonSnackOptions = [
    {
      name: 'Protein Energy Nibble: High-Protein Greek Yogurt with Cinnamon',
      prepTimeMinutes: 3,
      ingredients: ['Greek yogurt 0% or 2% (150g)', 'Ceylon cinnamon', 'Handful of blueberries'],
      instructions: ['Stir cinnamon into yogurt', 'Top with fresh blueberries'],
      healthBenefit: 'Slow-digesting casein and whey maintain amino acid availability through the late afternoon.',
    },
    {
      name: 'Crisp Bell Pepper Strips with Guacamole & Pumpkin Seeds',
      prepTimeMinutes: 5,
      ingredients: ['1 red bell pepper (sliced)', '1/4 avocado mashed with lime & salt', '1 tbsp raw pumpkin seeds'],
      instructions: ['Slice bell pepper into batons', 'Dip into fresh guacamole'],
      healthBenefit: 'Provides 150% daily Vitamin C to strengthen immune function and collagen synthesis.',
    },
    {
      name: 'Spiced Turmeric Golden Chai with Steamed Almond Milk',
      prepTimeMinutes: 5,
      ingredients: ['Unsweetened almond milk', 'Ground turmeric (1/2 tsp)', 'Fresh grated ginger', 'Black pepper pinch', 'Cardamom & cinnamon'],
      instructions: ['Warm almond milk with spices in saucepan', 'Whisk until frothy and serve warm'],
      healthBenefit: 'Curcumin combined with piperine suppresses evening inflammatory cascades and aids digestion.',
    },
  ];

  const dinnerOptions = [
    {
      name: isVegan
        ? 'Creamy Coconut Lentil Dahl with Wilted Spinach & Basmati'
        : isVeg
        ? 'Stuffed Roasted Portobello Mushrooms with Goat Cheese & Quinoa'
        : isKeto
        ? 'Baked Herb-Crusted Cod Fillet with Zucchini Noodles & Pesto'
        : 'Baked Wild Cod with Lemon-Garlic Herb Crust & Steamed Broccolini',
      prepTimeMinutes: 25,
      ingredients: isVegan
        ? ['Red split lentils (1 cup)', 'Light coconut milk', 'Baby spinach', 'Cumin, coriander & ginger', 'Small portion basmati rice']
        : isVeg
        ? ['2 large portobello mushroom caps', 'Soft goat cheese (30g)', 'Cooked herb quinoa', 'Sun-dried tomatoes', 'Pine nuts']
        : isKeto
        ? ['Pacific cod or sea bass fillet (180g)', 'Fresh basil pesto (2 tbsp)', 'Spiralized zucchini noodles', 'Cherry tomatoes', 'Garlic olive oil']
        : ['Cod or white fish fillet (170g)', 'Panko/almond crumb with parsley & lemon', 'Steamed broccolini spears', 'Roasted baby carrots', 'Olive oil'],
      instructions: [
        'Bake fish or stuffed mushrooms at 190°C (375°F) for 15 minutes',
        'Lightly steam greens to retain vibrant chlorophyll and folate',
        'Plate together and drizzle with extra virgin olive oil',
      ],
      healthBenefit: 'Light on digestive tract for improved restorative sleep; rich in choline, magnesium, and lean proteins.',
    },
    {
      name: isVegan
        ? 'Japanese Miso Tofu Soba Noodle Bowl with Bok Choy & Shiitake'
        : isVeg
        ? 'Vegetable & Ricotta Lasagna Roll-Ups with Fresh Basil Pomodoro'
        : isKeto
        ? 'Grilled Rosemary Lamb Chops with Roasted Cauliflower & Mint Pesto'
        : 'Herb-Roasted Turkey Breast with Mashed Butternut Squash & French Green Beans',
      prepTimeMinutes: 25,
      ingredients: isVegan
        ? ['Buckwheat soba noodles', 'Silken tofu cubes', 'Shiitake mushrooms & baby bok choy', 'Fermented red miso broth', 'Scallions & sesame oil']
        : isVeg
        ? ['Whole-grain lasagna sheets', 'Low-fat ricotta & baby spinach filling', 'San Marzano marinara', 'Grated parmesan', 'Fresh basil']
        : isKeto
        ? ['Pasture lamb cutlets (3 pcs)', 'Fresh rosemary & garlic cloves', 'Roasted cauliflower florets with olive oil', 'Mint pesto']
        : ['Roast turkey breast cutlet (170g)', 'Steamed butternut squash mashed with nutmeg', 'French haricots verts (green beans)', 'Dijon herb drizzle'],
      instructions: [
        'Prepare the protein in oven or skillet',
        'Cook accompanying complex vegetables',
        'Finish with digestive herbs (mint, rosemary, or miso)',
      ],
      healthBenefit: 'High tryptophan content acts as the metabolic precursor to serotonin and nighttime melatonin.',
    },
    {
      name: isVegan
        ? 'Moroccan Vegetable Tagine with Chickpeas, Apricots & Almond Flakes'
        : isVeg
        ? 'Creamy Butternut Squash & Sage Risotto with Toasted Pine Nuts'
        : isKeto
        ? 'Pan-Roasted Free-Range Chicken Thigh with Braised Leeks & Bacon'
        : 'Lean Grass-Fed Sirloin Steak with Roasted Asparagus & Garlic Mushrooms',
      prepTimeMinutes: 25,
      ingredients: isVegan
        ? ['Chickpeas (1 cup)', 'Zucchini, sweet potato, carrots', 'Moroccan ras el hanout spices', 'Diced dried apricots', 'Toasted almond flakes']
        : isVeg
        ? ['Arborio rice', 'Roasted butternut squash puree', 'Vegetable stock & fresh sage', 'Toasted pine nuts', 'Parmigiano-reggiano']
        : isKeto
        ? ['Chicken thigh (180g, skin on)', 'Braised sliced leeks', 'Uncured bacon lardons', 'Chicken bone broth reduction', 'Fresh thyme']
        : ['Grass-fed sirloin steak (150g)', 'Portobello or button mushrooms', 'Fresh asparagus spears', 'Garlic cloves & rosemary sprig', 'Olive oil'],
      instructions: [
        'Sear steak or simmer tagine on gentle heat',
        'Roast vegetables until caramelized on the edges',
        'Let meat rest 5 minutes before slicing to lock in natural juices',
      ],
      healthBenefit: 'Promotes muscle glycogen restoration and deep restorative tissue repair during sleep.',
    },
  ];

  const weeklyPlan: DayDietPlan[] = days.map((dayName, idx) => {
    const b = breakfastOptions[idx % breakfastOptions.length];
    const ms = morningSnackOptions[idx % morningSnackOptions.length];
    const l = lunchOptions[idx % lunchOptions.length];
    const as = afternoonSnackOptions[idx % afternoonSnackOptions.length];
    const d = dinnerOptions[idx % dinnerOptions.length];

    const meals: MealItem[] = [
      {
        id: `d${idx}-m1`,
        category: 'breakfast',
        name: b.name,
        time: '08:00',
        calories: bCal,
        protein: Math.round(macros.proteinGrams * 0.25),
        carbs: Math.round(macros.carbsGrams * 0.28),
        fats: Math.round(macros.fatsGrams * 0.25),
        prepTimeMinutes: b.prepTimeMinutes,
        ingredients: b.ingredients,
        instructions: b.instructions,
        healthBenefit: b.healthBenefit,
      },
      {
        id: `d${idx}-m2`,
        category: 'morning_snack',
        name: ms.name,
        time: '11:00',
        calories: msCal,
        protein: Math.round(macros.proteinGrams * 0.10),
        carbs: Math.round(macros.carbsGrams * 0.12),
        fats: Math.round(macros.fatsGrams * 0.10),
        prepTimeMinutes: ms.prepTimeMinutes,
        ingredients: ms.ingredients,
        instructions: ms.instructions,
        healthBenefit: ms.healthBenefit,
      },
      {
        id: `d${idx}-m3`,
        category: 'lunch',
        name: l.name,
        time: '13:30',
        calories: lCal,
        protein: Math.round(macros.proteinGrams * 0.35),
        carbs: Math.round(macros.carbsGrams * 0.34),
        fats: Math.round(macros.fatsGrams * 0.35),
        prepTimeMinutes: l.prepTimeMinutes,
        ingredients: l.ingredients,
        instructions: l.instructions,
        healthBenefit: l.healthBenefit,
      },
      {
        id: `d${idx}-m4`,
        category: 'afternoon_snack',
        name: as.name,
        time: '16:30',
        calories: asCal,
        protein: Math.round(macros.proteinGrams * 0.10),
        carbs: Math.round(macros.carbsGrams * 0.10),
        fats: Math.round(macros.fatsGrams * 0.10),
        prepTimeMinutes: as.prepTimeMinutes,
        ingredients: as.ingredients,
        instructions: as.instructions,
        healthBenefit: as.healthBenefit,
      },
      {
        id: `d${idx}-m5`,
        category: 'dinner',
        name: d.name,
        time: '19:30',
        calories: dCal,
        protein: Math.round(macros.proteinGrams * 0.20),
        carbs: Math.round(macros.carbsGrams * 0.16),
        fats: Math.round(macros.fatsGrams * 0.20),
        prepTimeMinutes: d.prepTimeMinutes,
        ingredients: d.ingredients,
        instructions: d.instructions,
        healthBenefit: d.healthBenefit,
      },
    ];

    const tips = [
      'Chew slowly: aim for 20-30 chews per bite to trigger satiety leptin signaling before stomach distension.',
      'Prioritize water before meals: drinking 300ml of water 20 minutes prior aids gastric acid balance.',
      'Colors of the rainbow: eating 3 different vegetable colors each day guarantees broad phytonutrient coverage.',
      'Salt quality matters: unrefined sea salt provides trace ionic minerals like magnesium and potassium.',
      'Circadian alignment: finishing dinner at least 2.5 to 3 hours before sleep prevents nocturnal acid reflux.',
      'Fiber first: starting your meal with greens or fiber blunts peak postprandial glucose excursions.',
      'Mindful dining: keep screens away during main meals to prevent unconscious overeating.',
    ];

    return {
      dayIndex: idx + 1,
      dayName,
      totalCalories: targetCalories,
      totalProtein: macros.proteinGrams,
      totalCarbs: macros.carbsGrams,
      totalFats: macros.fatsGrams,
      meals,
      hydrationTargetLiters: macros.waterLiters,
      nutritionTip: tips[idx % tips.length],
    };
  });

  return weeklyPlan;
}

// Generate categorised grocery checklist for the week
export function generateGroceryList(plan: DayDietPlan[]) {
  return [
    {
      category: 'Fresh Produce & Greens',
      items: [
        { name: 'Baby Spinach & Tuscan Kale', amount: '2 large boxes' },
        { name: 'Avocados (Hass)', amount: '4 ripe' },
        { name: 'Blueberries & Raspberries', amount: '3 punnets' },
        { name: 'Persian Cucumbers & Cherry Tomatoes', amount: '1 kg each' },
        { name: 'Broccolini & Green Asparagus', amount: '2 bunches each' },
        { name: 'Sweet Potatoes', amount: '1.5 kg' },
        { name: 'Fresh Lemons & Limes', amount: '6 pieces' },
      ],
    },
    {
      category: 'Clean Proteins & Legumes',
      items: [
        { name: 'Pasture-Raised Eggs', amount: '2 dozen' },
        { name: 'Free-Range Chicken Breast / Thighs', amount: '800g' },
        { name: 'Wild Alaskan Salmon Fillets', amount: '500g' },
        { name: 'Organic Chickpeas & Cannellini Beans', amount: '4 cans' },
        { name: 'Firm Organic Tofu or Paneer', amount: '2 blocks' },
      ],
    },
    {
      category: 'Whole Grains & Pantry Staples',
      items: [
        { name: 'Rolled Oats (Gluten-Free)', amount: '1 bag' },
        { name: 'Tricolor Quinoa', amount: '500g' },
        { name: 'Artisan Seeded Sourdough', amount: '1 loaf' },
        { name: 'Brown Basmati / Jasmine Rice', amount: '1 kg' },
        { name: 'Raw Cacao & Ceylon Cinnamon', amount: '1 small jar each' },
      ],
    },
    {
      category: 'Healthy Fats, Seeds & Dressings',
      items: [
        { name: 'Extra Virgin Cold-Pressed Olive Oil', amount: '1 bottle (750ml)' },
        { name: 'Chia Seeds & Ground Golden Flaxseed', amount: '250g bag' },
        { name: 'Raw Almonds & Walnut Halves', amount: '300g' },
        { name: 'Hulled Tahini', amount: '1 jar' },
        { name: 'Greek Yogurt 2% or Coconut Yogurt', amount: '1 kg tub' },
      ],
    },
  ];
}

// Full health plan builder
export function buildCompleteHealthPlan(profile: UserProfile): FullHealthPlan {
  const metrics = calculateMetrics(profile);
  const weeklyPlan = generateWeeklyDietPlan(profile, metrics);
  const dailySchedule = generateDailySchedule(profile);
  const groceryCategories = generateGroceryList(weeklyPlan);

  const lifestyleHabits = [
    {
      title: 'The 10-Minute Post-Meal Stroll',
      description: 'Step outside immediately after your largest meal of the day. Mild muscle contraction transports blood glucose into muscle cells independently of insulin.',
      impact: 'Reduces blood sugar spikes by 25-35%',
      icon: 'Footprints',
    },
    {
      title: 'Circadian Sunlight Morning Anchor',
      description: 'Get natural photons in your eyes within 45 minutes of rising. This calibrates your cortisol awakening response and sets your evening melatonin timer.',
      impact: 'Deeper stage-4 slow wave sleep',
      icon: 'Sun',
    },
    {
      title: 'The 20-20-20 Ergonomic Eye & Spine Reset',
      description: 'Every 20 minutes of screen work, look at an object 20 feet away for 20 seconds, and do 3 scapular retractions (chest open).',
      impact: 'Prevents cervical spine compression',
      icon: 'Eye',
    },
    {
      title: 'Targeted Hydration Pacing',
      description: `Drink your target ${metrics.macros.waterLiters}L in 250ml intervals between 07:30 and 19:30, tapering 2 hours before bed so nocturnal urination does not fragment sleep.`,
      impact: 'Higher metabolic energy & cellular detox',
      icon: 'Droplets',
    },
  ];

  return {
    user: profile,
    metrics,
    weeklyPlan,
    dailySchedule,
    lifestyleHabits,
    groceryCategories,
    generatedAt: new Date().toISOString(),
  };
}
