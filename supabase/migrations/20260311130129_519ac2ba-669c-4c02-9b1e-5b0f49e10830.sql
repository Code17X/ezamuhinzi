
-- Farm activities table for tracking planting, fertilizing, harvesting, expenses
CREATE TABLE public.farm_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL DEFAULT 'planting',
  title TEXT NOT NULL,
  description TEXT,
  crop_name TEXT,
  field_name TEXT,
  scheduled_date DATE,
  completed_date DATE,
  is_completed BOOLEAN DEFAULT false,
  cost NUMERIC DEFAULT 0,
  quantity TEXT,
  unit TEXT,
  notes TEXT,
  reminder_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farm_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own activities" ON public.farm_activities
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activities" ON public.farm_activities
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON public.farm_activities
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON public.farm_activities
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
