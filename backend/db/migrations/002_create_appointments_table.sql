CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id),
  physio_id UUID NOT NULL REFERENCES users(id),
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('initial', 'followup', 'review', 'discharge')),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  session_id UUID,
  internal_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_physio ON appointments(physio_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
