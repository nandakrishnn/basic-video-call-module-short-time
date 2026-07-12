CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('physio', 'patient')),
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  otp_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE UNIQUE INDEX idx_session_participants_unique ON session_participants(session_id, user_id);
