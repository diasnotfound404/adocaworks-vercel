-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- 10-char alphanumeric code
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  raised_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Admin who resolved
  resolved_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disputes
CREATE POLICY "disputes_select_related"
  ON public.disputes FOR SELECT
  USING (
    auth.uid() = raised_by OR
    auth.uid() IN (SELECT client_id FROM public.projects WHERE id = project_id) OR
    auth.uid() IN (SELECT freelancer_id FROM public.proposals WHERE project_id = disputes.project_id AND status = 'accepted') OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE user_type = 'admin')
  );

CREATE POLICY "disputes_insert_related"
  ON public.disputes FOR INSERT
  WITH CHECK (
    auth.uid() = raised_by AND (
      auth.uid() IN (SELECT client_id FROM public.projects WHERE id = project_id) OR
      auth.uid() IN (SELECT freelancer_id FROM public.proposals WHERE project_id = disputes.project_id AND status = 'accepted')
    )
  );

CREATE POLICY "disputes_update_admin"
  ON public.disputes FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE user_type = 'admin'));

-- Indexes
CREATE INDEX idx_disputes_project_id ON public.disputes(project_id);
CREATE INDEX idx_disputes_milestone_id ON public.disputes(milestone_id);
CREATE INDEX idx_disputes_raised_by ON public.disputes(raised_by);
CREATE INDEX idx_disputes_code ON public.disputes(code);
CREATE INDEX idx_disputes_status ON public.disputes(status);

-- Trigger for updated_at
CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
