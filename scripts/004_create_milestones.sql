-- Create milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- 10-char alphanumeric code
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  order_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'paid')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for milestones
CREATE POLICY "milestones_select_related"
  ON public.milestones FOR SELECT
  USING (
    auth.uid() IN (
      SELECT client_id FROM public.projects WHERE id = project_id
      UNION
      SELECT freelancer_id FROM public.proposals WHERE project_id = milestones.project_id AND status = 'accepted'
    )
  );

CREATE POLICY "milestones_insert_client"
  ON public.milestones FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT client_id FROM public.projects WHERE id = project_id)
  );

CREATE POLICY "milestones_update_related"
  ON public.milestones FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT client_id FROM public.projects WHERE id = project_id
      UNION
      SELECT freelancer_id FROM public.proposals WHERE project_id = milestones.project_id AND status = 'accepted'
    )
  );

-- Indexes
CREATE INDEX idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX idx_milestones_code ON public.milestones(code);
CREATE INDEX idx_milestones_status ON public.milestones(status);

-- Trigger for updated_at
CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
