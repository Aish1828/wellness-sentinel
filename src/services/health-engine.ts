import type {
  AssessmentInput,
  HealthAnalysis,
  Recommendation,
  RiskLevel,
  ScoreFactor,
} from "@/types/health";
import { EMERGENCY_MESSAGE } from "@/utils/constants";

const CRITICAL_SYMPTOMS = ["Chest pain", "Slurred speech", "Numbness on one side"];
const SERIOUS_SYMPTOMS = [
  "Shortness of breath",
  "Blurred vision",
  "Palpitations",
  "Dizziness",
  "Unexplained weight loss",
];

export function calculateBmi(heightCm?: number | null, weightKg?: number | null): number | null {
  if (!heightCm || !weightKg || heightCm <= 0) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function bmiLabel(bmi: number | null): string {
  if (bmi === null) return "Not available";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Overweight";
  return "Obese range";
}

export function riskFromScore(score: number): RiskLevel {
  if (score >= 80) return "Low";
  if (score >= 65) return "Moderate";
  if (score >= 45) return "Elevated";
  return "High";
}

export function detectEmergency(symptoms: string[]): boolean {
  const critical = symptoms.filter((s) => CRITICAL_SYMPTOMS.includes(s)).length;
  const serious = symptoms.filter((s) => SERIOUS_SYMPTOMS.includes(s)).length;
  if (critical >= 1 && serious >= 1) return true;
  if (critical >= 2) return true;
  if (symptoms.includes("Chest pain") && symptoms.includes("Shortness of breath")) return true;
  return serious >= 3;
}

export const EMERGENCY_TEXT = EMERGENCY_MESSAGE;

export function analyzeHealth(input: AssessmentInput): HealthAnalysis {
  const factors: ScoreFactor[] = [];
  const bmi = calculateBmi(input.height_cm, input.weight_kg);

  if (bmi !== null) {
    if (bmi >= 18.5 && bmi < 25)
      factors.push({ label: "Healthy BMI", points: 12, detail: `BMI ${bmi} sits in the healthy range.`, category: "Body" });
    else if (bmi >= 25 && bmi < 30)
      factors.push({ label: "Elevated BMI", points: -4, detail: `BMI ${bmi} is above the healthy range.`, category: "Body" });
    else if (bmi >= 30)
      factors.push({ label: "High BMI", points: -10, detail: `BMI ${bmi} increases metabolic strain.`, category: "Body" });
    else
      factors.push({ label: "Low BMI", points: -6, detail: `BMI ${bmi} is below the healthy range.`, category: "Body" });
  }

  const sleep = input.sleep_hours ?? null;
  if (sleep !== null) {
    if (sleep >= 7 && sleep <= 9)
      factors.push({ label: "Restorative sleep", points: 10, detail: `${sleep}h of sleep supports recovery.`, category: "Sleep" });
    else if (sleep >= 6)
      factors.push({ label: "Slightly short sleep", points: 2, detail: `${sleep}h is a little under the ideal 7–9h.`, category: "Sleep" });
    else if (sleep > 9)
      factors.push({ label: "Excess sleep", points: -3, detail: `${sleep}h can signal low energy or poor sleep quality.`, category: "Sleep" });
    else
      factors.push({ label: "Poor sleep", points: -8, detail: `${sleep}h is well below the recommended 7–9h.`, category: "Sleep" });
  }

  const exercise = input.exercise_minutes ?? null;
  if (exercise !== null) {
    if (exercise >= 45)
      factors.push({ label: "Strong activity", points: 10, detail: `${exercise} active minutes daily.`, category: "Activity" });
    else if (exercise >= 30)
      factors.push({ label: "Good activity", points: 7, detail: `${exercise} active minutes meets guidelines.`, category: "Activity" });
    else if (exercise >= 15)
      factors.push({ label: "Light activity", points: 3, detail: `${exercise} active minutes is a start.`, category: "Activity" });
    else
      factors.push({ label: "Low activity", points: -7, detail: `${exercise} active minutes is below guidelines.`, category: "Activity" });
  }

  const water = input.water_liters ?? null;
  if (water !== null) {
    if (water >= 2.5)
      factors.push({ label: "Excellent hydration", points: 6, detail: `${water}L per day.`, category: "Hydration" });
    else if (water >= 1.5)
      factors.push({ label: "Hydration", points: 4, detail: `${water}L per day is close to target.`, category: "Hydration" });
    else
      factors.push({ label: "Low hydration", points: -5, detail: `${water}L per day is below the 2–3L target.`, category: "Hydration" });
  }

  const stress = input.stress_level ?? null;
  if (stress !== null) {
    if (stress <= 3)
      factors.push({ label: "Calm stress levels", points: 7, detail: `Stress rated ${stress}/10.`, category: "Mind" });
    else if (stress <= 6)
      factors.push({ label: "Moderate stress", points: -2, detail: `Stress rated ${stress}/10.`, category: "Mind" });
    else
      factors.push({ label: "High stress", points: -9, detail: `Stress rated ${stress}/10 affects sleep, heart and immunity.`, category: "Mind" });
  }

  switch (input.smoking) {
    case "Never":
      factors.push({ label: "Smoke free", points: 5, detail: "No tobacco exposure.", category: "Habits" });
      break;
    case "Former":
      factors.push({ label: "Former smoker", points: 1, detail: "Risk keeps falling the longer you stay smoke free.", category: "Habits" });
      break;
    case "Occasional":
      factors.push({ label: "Occasional smoking", points: -7, detail: "Even light smoking raises cardiovascular risk.", category: "Habits" });
      break;
    case "Regular":
      factors.push({ label: "Regular smoking", points: -13, detail: "The single largest modifiable risk factor here.", category: "Habits" });
      break;
  }

  switch (input.alcohol) {
    case "None":
      factors.push({ label: "No alcohol", points: 4, detail: "No alcohol-related liver or heart load.", category: "Habits" });
      break;
    case "Occasional":
      factors.push({ label: "Occasional alcohol", points: -1, detail: "Low but non-zero impact.", category: "Habits" });
      break;
    case "Frequent":
      factors.push({ label: "Frequent alcohol", points: -8, detail: "Frequent intake affects liver, sleep and blood pressure.", category: "Habits" });
      break;
  }

  const age = input.age ?? null;
  if (age !== null) {
    if (age >= 65) factors.push({ label: "Age factor", points: -6, detail: "Preventive screening becomes more important after 65.", category: "History" });
    else if (age >= 50) factors.push({ label: "Age factor", points: -3, detail: "Screening frequency should increase after 50.", category: "History" });
  }

  if (input.symptoms.length) {
    const pts = Math.max(-12, -2.5 * input.symptoms.length);
    factors.push({
      label: `${input.symptoms.length} reported symptom${input.symptoms.length > 1 ? "s" : ""}`,
      points: Math.round(pts),
      detail: input.symptoms.join(", "),
      category: "Symptoms",
    });
  }

  if (input.medical_history.length) {
    const pts = Math.max(-10, -3 * input.medical_history.length);
    factors.push({
      label: "Existing conditions",
      points: pts,
      detail: input.medical_history.join(", "),
      category: "History",
    });
  }

  if (input.family_history.length) {
    const pts = Math.max(-6, -1.5 * input.family_history.length);
    factors.push({
      label: "Family history",
      points: Math.round(pts),
      detail: input.family_history.join(", "),
      category: "History",
    });
  }

  const base = 58;
  const raw = factors.reduce((sum, f) => sum + f.points, base);
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const riskLevel = riskFromScore(score);

  const strengths = factors.filter((f) => f.points > 0).sort((a, b) => b.points - a.points);
  const improvements = factors.filter((f) => f.points < 0).sort((a, b) => a.points - b.points);

  return {
    score,
    riskLevel,
    bmi,
    bmiLabel: bmiLabel(bmi),
    breakdown: factors.sort((a, b) => b.points - a.points),
    strengths,
    improvements,
    recommendations: buildRecommendations(input, bmi),
    futureRisks: buildFutureRisks(input, bmi, score),
    emergency: detectEmergency(input.symptoms),
    summary: buildSummary(score, riskLevel, strengths, improvements),
  };
}

function buildSummary(score: number, risk: RiskLevel, strengths: ScoreFactor[], improvements: ScoreFactor[]) {
  const top = strengths[0]?.label.toLowerCase() ?? "your consistency";
  const weak = improvements[0]?.label.toLowerCase() ?? "no major weak spot";
  return `Your health score is ${score}/100, which places you in the ${risk.toLowerCase()} risk band. ${
    strengths.length ? `The strongest contributor is ${top}.` : ""
  } ${improvements.length ? `The biggest opportunity right now is ${weak}.` : "Keep maintaining your current routine."}`.trim();
}

function buildRecommendations(input: AssessmentInput, bmi: number | null): Recommendation[] {
  const recs: Recommendation[] = [];

  if (bmi !== null && bmi >= 25) {
    recs.push({
      category: "Diet",
      title: "Shift to a higher-protein, lower-refined-carb plate",
      detail: "Aim for half vegetables, a quarter lean protein and a quarter whole grains. A 300–400 kcal daily deficit is enough for steady change.",
      priority: bmi >= 30 ? "high" : "medium",
    });
  } else {
    recs.push({
      category: "Diet",
      title: "Keep your balanced eating pattern",
      detail: "Continue with whole foods, 25–30g fibre and two servings of fruit each day to protect your metabolic health.",
      priority: "low",
    });
  }

  const ex = input.exercise_minutes ?? 0;
  recs.push({
    category: "Exercise",
    title: ex >= 30 ? "Add two strength sessions weekly" : "Build to 30 active minutes a day",
    detail:
      ex >= 30
        ? "Cardio is covered. Resistance training twice a week protects bone density and insulin sensitivity."
        : "Start with a 15-minute brisk walk after meals and grow by 5 minutes each week until you reach 150 minutes weekly.",
    priority: ex >= 30 ? "low" : "high",
  });

  const water = input.water_liters ?? 0;
  recs.push({
    category: "Hydration",
    title: water >= 2.5 ? "Maintain your hydration rhythm" : "Raise daily water intake toward 2.5L",
    detail:
      water >= 2.5
        ? "Your intake supports circulation and kidney function. Keep a bottle within reach on active days."
        : "Anchor water to habits you already have: one glass on waking, one before each meal and one after any activity.",
    priority: water >= 2.5 ? "low" : "medium",
  });

  const sleep = input.sleep_hours ?? 0;
  recs.push({
    category: "Sleep",
    title: sleep >= 7 ? "Protect your sleep window" : "Recover 60–90 minutes of nightly sleep",
    detail:
      sleep >= 7
        ? "Consistent timing matters as much as duration. Keep wake time stable, even on weekends."
        : "Move bedtime earlier in 20-minute steps, dim screens an hour before bed and keep the room cool and dark.",
    priority: sleep >= 7 ? "low" : "high",
  });

  const stress = input.stress_level ?? 0;
  recs.push({
    category: "Mental Wellness",
    title: stress >= 7 ? "Add a daily downshift ritual" : "Keep your stress regulation habits",
    detail:
      stress >= 7
        ? "Ten minutes of slow breathing, a short walk without your phone, or journaling reduces cortisol measurably within two weeks."
        : "Short daily pauses keep your nervous system resilient. Protect one screen-free block each day.",
    priority: stress >= 7 ? "high" : "low",
  });

  const needsScreening =
    (input.age ?? 0) >= 40 || input.medical_history.length > 0 || input.family_history.length > 0;
  recs.push({
    category: "Preventive Checkups",
    title: needsScreening ? "Book a preventive screening panel" : "Schedule a yearly baseline check",
    detail: needsScreening
      ? "A lipid profile, fasting glucose/HbA1c and blood pressure reading give you early signal on the risks in your history."
      : "An annual baseline makes future trends meaningful — bring your HealthGuard timeline to the appointment.",
    priority: needsScreening ? "high" : "medium",
  });

  if (input.smoking === "Regular" || input.smoking === "Occasional") {
    recs.unshift({
      category: "Preventive Checkups",
      title: "Start a structured quit plan",
      detail: "Stopping tobacco improves circulation within weeks and is the highest-impact change available to you today.",
      priority: "high",
    });
  }

  return recs;
}

function buildFutureRisks(input: AssessmentInput, bmi: number | null, score: number) {
  const risks: { label: string; level: RiskLevel; reason: string }[] = [];
  const family = input.family_history;

  const cardioSignals =
    (bmi !== null && bmi >= 27 ? 1 : 0) +
    (input.smoking === "Regular" || input.smoking === "Occasional" ? 1 : 0) +
    ((input.exercise_minutes ?? 0) < 20 ? 1 : 0) +
    (family.includes("Heart disease") || family.includes("Hypertension") ? 1 : 0);
  risks.push({
    label: "Cardiovascular strain",
    level: cardioSignals >= 3 ? "High" : cardioSignals === 2 ? "Elevated" : cardioSignals === 1 ? "Moderate" : "Low",
    reason: "Based on BMI, activity level, tobacco use and family heart history.",
  });

  const metabolicSignals =
    (bmi !== null && bmi >= 27 ? 1 : 0) +
    (family.includes("Diabetes") ? 1 : 0) +
    ((input.exercise_minutes ?? 0) < 20 ? 1 : 0) +
    (input.symptoms.includes("Excessive thirst") || input.symptoms.includes("Frequent urination") ? 1 : 0);
  risks.push({
    label: "Metabolic / blood sugar risk",
    level: metabolicSignals >= 3 ? "High" : metabolicSignals === 2 ? "Elevated" : metabolicSignals === 1 ? "Moderate" : "Low",
    reason: "Based on body composition, movement, family history and reported symptoms.",
  });

  const burnoutSignals =
    ((input.stress_level ?? 0) >= 7 ? 1 : 0) +
    ((input.sleep_hours ?? 8) < 6.5 ? 1 : 0) +
    (input.symptoms.includes("Fatigue") || input.symptoms.includes("Low mood") || input.symptoms.includes("Anxiety") ? 1 : 0);
  risks.push({
    label: "Burnout & mental fatigue",
    level: burnoutSignals >= 3 ? "High" : burnoutSignals === 2 ? "Elevated" : burnoutSignals === 1 ? "Moderate" : "Low",
    reason: "Based on stress rating, sleep duration and mood-related symptoms.",
  });

  if (score < 50) {
    risks.push({
      label: "Overall decline without intervention",
      level: "High",
      reason: "Several lifestyle factors are pulling in the same direction. Small consistent changes reverse this fastest.",
    });
  }

  return risks;
}
