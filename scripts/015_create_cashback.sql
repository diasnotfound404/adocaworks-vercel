-- NEW FEATURE - Cashback System
-- Add cashback balance to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS cashback_balance NUMERIC DEFAULT 0 CHECK (cashback_balance >= 0);

-- Create cashback transactions table
CREATE TABLE IF NOT EXISTS cashback_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'used')),
  source_transaction_id UUID REFERENCES transactions(id),
  project_id UUID REFERENCES projects(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_user ON cashback_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_type ON cashback_transactions(type);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_created ON cashback_transactions(created_at);

-- Function to award cashback (2% of transaction amount)
CREATE OR REPLACE FUNCTION award_cashback_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id UUID;
  v_cashback_amount NUMERIC;
BEGIN
  -- Only process when transaction is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get client from project
    SELECT client_id INTO v_client_id
    FROM projects
    WHERE id = NEW.project_id;
    
    IF v_client_id IS NOT NULL AND NEW.payer_id = v_client_id THEN
      -- Calculate 2% cashback
      v_cashback_amount := NEW.amount * 0.02;
      
      -- Add cashback to client's balance
      UPDATE profiles
      SET cashback_balance = cashback_balance + v_cashback_amount
      WHERE id = v_client_id;
      
      -- Record cashback transaction
      INSERT INTO cashback_transactions (
        user_id,
        amount,
        type,
        source_transaction_id,
        project_id,
        description
      ) VALUES (
        v_client_id,
        v_cashback_amount,
        'earned',
        NEW.id,
        NEW.project_id,
        'Cashback de 2% no pagamento'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cashback on payments
DROP TRIGGER IF EXISTS trigger_award_cashback ON transactions;
CREATE TRIGGER trigger_award_cashback
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION award_cashback_on_payment();

-- Function to use cashback
CREATE OR REPLACE FUNCTION use_cashback(
  p_user_id UUID,
  p_amount NUMERIC,
  p_project_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT cashback_balance INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id;
  
  -- Check if user has enough balance
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct from balance
  UPDATE profiles
  SET cashback_balance = cashback_balance - p_amount
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO cashback_transactions (
    user_id,
    amount,
    type,
    project_id,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    'used',
    p_project_id,
    'Cashback utilizado no pagamento'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
