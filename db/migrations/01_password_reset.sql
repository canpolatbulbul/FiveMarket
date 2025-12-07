-- Password Reset Tokens Table
-- Stores temporary tokens for password reset functionality

CREATE TABLE IF NOT EXISTS password_reset_token (
  token_id BIGSERIAL PRIMARY KEY,
  "userID" BIGINT NOT NULL REFERENCES "user"("userID") ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT token_not_expired CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token_user ON password_reset_token("userID");
CREATE INDEX IF NOT EXISTS idx_password_reset_token_token ON password_reset_token(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_token_expires ON password_reset_token(expires_at);
