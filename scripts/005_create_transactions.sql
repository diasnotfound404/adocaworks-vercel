-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- 10-char alphanumeric code
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  payer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('escrow', 'release', 'refund', 'payout')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,
  payment_method TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "transactions_select_related"
  ON public.transactions FOR SELECT
  USING (
    auth.uid() = payer_id OR 
    auth.uid() = payee_id OR
    auth.uid() IN (SELECT client_id FROM public.projects WHERE id = project_id)
  );

CREATE POLICY "transactions_insert_payer"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = payer_id);

-- Indexes
CREATE INDEX idx_transactions_project_id ON public.transactions(project_id);
CREATE INDEX idx_transactions_milestone_id ON public.transactions(milestone_id);
CREATE INDEX idx_transactions_payer_id ON public.transactions(payer_id);
CREATE INDEX idx_transactions_payee_id ON public.transactions(payee_id);
CREATE INDEX idx_transactions_code ON public.transactions(code);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_mercadopago_payment_id ON public.transactions(mercadopago_payment_id);

-- Trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
