-- NEW FEATURE - Internal Chat System
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  participant_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, participant_1_id, participant_2_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating last message time
DROP TRIGGER IF EXISTS trigger_update_last_message ON messages;
CREATE TRIGGER trigger_update_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Function to get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_project_id UUID,
  p_user1_id UUID,
  p_user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_participant1 UUID;
  v_participant2 UUID;
BEGIN
  -- Ensure consistent ordering of participants
  IF p_user1_id < p_user2_id THEN
    v_participant1 := p_user1_id;
    v_participant2 := p_user2_id;
  ELSE
    v_participant1 := p_user2_id;
    v_participant2 := p_user1_id;
  END IF;
  
  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE project_id = p_project_id
    AND participant_1_id = v_participant1
    AND participant_2_id = v_participant2;
  
  -- Create if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (project_id, participant_1_id, participant_2_id)
    VALUES (p_project_id, v_participant1, v_participant2)
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;
