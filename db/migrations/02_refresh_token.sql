-- Refresh Token Table
-- Stores long-lived refresh tokens for "Remember Me" functionality

CREATE TABLE IF NOT EXISTS refresh_token (
  token_id BIGSERIAL PRIMARY KEY,
  "userID" BIGINT NOT NULL REFERENCES "user"("userID") ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address VARCHAR(45),
  CONSTRAINT token_not_expired CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_refresh_token_user ON refresh_token("userID");
CREATE INDEX IF NOT EXISTS idx_refresh_token_token ON refresh_token(token);
CREATE INDEX IF NOT EXISTS idx_refresh_token_expires ON refresh_token(expires_at);
