CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  blood_group TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  blood_group TEXT,
  sleep_hours NUMERIC,
  stress_level INTEGER,
  exercise_minutes INTEGER,
  water_liters NUMERIC,
  smoking TEXT,
  alcohol TEXT,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  medical_history TEXT[] NOT NULL DEFAULT '{}',
  family_history TEXT[] NOT NULL DEFAULT '{}',
  bmi NUMERIC,
  health_score INTEGER,
  risk_level TEXT,
  breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_logs TO authenticated;
GRANT ALL ON public.health_logs TO service_role;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own health logs" ON public.health_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX health_logs_user_date_idx ON public.health_logs (user_id, log_date DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER health_logs_set_updated_at BEFORE UPDATE ON public.health_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();