-- Create KYC data table
CREATE TABLE IF NOT EXISTS public.kyc_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('cpf', 'cnpj', 'rg', 'passport')),
  document_number TEXT NOT NULL,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kyc_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kyc_data
CREATE POLICY "kyc_data_select_own"
  ON public.kyc_data FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT id FROM public.profiles WHERE user_type = 'admin')
  );

CREATE POLICY "kyc_data_insert_own"
  ON public.kyc_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kyc_data_update_own_or_admin"
  ON public.kyc_data FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT id FROM public.profiles WHERE user_type = 'admin')
  );

-- Indexes
CREATE INDEX idx_kyc_data_user_id ON public.kyc_data(user_id);
CREATE INDEX idx_kyc_data_status ON public.kyc_data(status);

-- Trigger for updated_at
CREATE TRIGGER update_kyc_data_updated_at
  BEFORE UPDATE ON public.kyc_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
