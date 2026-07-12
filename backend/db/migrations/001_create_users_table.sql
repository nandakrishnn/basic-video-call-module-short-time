CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'physio', 'patient')),
  password_hash VARCHAR(255),
  date_of_birth DATE,
  specialization VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT chk_identifier_present CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX idx_users_role ON users(role);
