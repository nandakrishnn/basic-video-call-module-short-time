-- The patient's presenting complaint ("Neck pain", "Post surgery rehab"), captured
-- when the patient is added and shown against each of their appointments.
-- Nullable so every existing patient stays valid without a backfill.
ALTER TABLE users ADD COLUMN IF NOT EXISTS issue VARCHAR(255);
