export interface AssessmentInput {
  age?: number | null;
  gender?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  blood_group?: string | null;
  sleep_hours?: number | null;
  stress_level?: number | null;
  exercise_minutes?: number | null;
  water_liters?: number | null;
  smoking?: string | null;
  alcohol?: string | null;
  symptoms: string[];
  medical_history: string[];
  family_history: string[];
}

export interface ScoreFactor {
  label: string;
  points: number;
  detail: string;
  category: "Body" | "Sleep" | "Activity" | "Hydration" | "Mind" | "Habits" | "History" | "Symptoms";
}

export type RiskLevel = "Low" | "Moderate" | "Elevated" | "High";

export interface Recommendation {
  category: "Diet" | "Exercise" | "Hydration" | "Sleep" | "Mental Wellness" | "Preventive Checkups";
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
}

export interface HealthAnalysis {
  score: number;
  riskLevel: RiskLevel;
  bmi: number | null;
  bmiLabel: string;
  breakdown: ScoreFactor[];
  strengths: ScoreFactor[];
  improvements: ScoreFactor[];
  recommendations: Recommendation[];
  futureRisks: { label: string; level: RiskLevel; reason: string }[];
  emergency: boolean;
  summary: string;
}

export interface HealthLog extends AssessmentInput {
  id: string;
  user_id: string;
  log_date: string;
  bmi: number | null;
  health_score: number | null;
  risk_level: string | null;
  breakdown: ScoreFactor[];
  recommendations: Recommendation[];
  created_at: string;
  updated_at: string;
  synced?: number;
}
