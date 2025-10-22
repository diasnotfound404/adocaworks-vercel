-- Create proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- 10-char alphanumeric code
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  delivery_days INTEGER NOT NULL,
  cover_letter TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proposals
CREATE POLICY "proposals_select_related"
  ON public.proposals FOR SELECT
  USING (
    auth.uid() = freelancer_id OR 
    auth.uid() IN (SELECT client_id FROM public.projects WHERE id = project_id)
  );

CREATE POLICY "proposals_insert_freelancer"
  ON public.proposals FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "proposals_update_own"
  ON public.proposals FOR UPDATE
  USING (auth.uid() = freelancer_id);

-- Indexes
CREATE INDEX idx_proposals_project_id ON public.proposals(project_id);
CREATE INDEX idx_proposals_freelancer_id ON public.proposals(freelancer_id);
CREATE INDEX idx_proposals_code ON public.proposals(code);

-- Trigger for updated_at
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key to projects table
ALTER TABLE public.projects 
  ADD CONSTRAINT fk_selected_proposal 
  FOREIGN KEY (selected_proposal_id) 
  REFERENCES public.proposals(id) 
  ON DELETE SET NULL;
