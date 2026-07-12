CREATE TABLE otp_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  session_id UUID REFERENCES sessions(id),
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_otp_store_identifier_session ON otp_store(identifier, session_id);
