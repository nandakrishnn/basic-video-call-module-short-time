CREATE TABLE session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  physio_id UUID NOT NULL REFERENCES users(id),
  raw_notes TEXT NOT NULL,
  enhanced_notes TEXT,
  is_sent_to_patient BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_notes_session ON session_notes(session_id);
