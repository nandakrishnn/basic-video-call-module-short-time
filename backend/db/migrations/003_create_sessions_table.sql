CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id),
  physio_id UUID NOT NULL REFERENCES users(id),
  appointment_id UUID REFERENCES appointments(id),
  room_name VARCHAR(255) UNIQUE NOT NULL,
  room_link VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_patient ON sessions(patient_id);
CREATE INDEX idx_sessions_physio ON sessions(physio_id);
CREATE INDEX idx_sessions_status ON sessions(status);

ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_session FOREIGN KEY (session_id) REFERENCES sessions(id);
