-- Add service status columns
ALTER TABLE service 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- Create withdrawal_request table
CREATE TABLE IF NOT EXISTS withdrawal_request (
  withdrawal_id BIGSERIAL PRIMARY KEY,
  freelancer_id BIGINT NOT NULL REFERENCES freelancer("userID") ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_freelancer ON withdrawal_request(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON withdrawal_request(status);

-- Update existing services to be active
UPDATE service SET is_active = TRUE WHERE is_active IS NULL;
