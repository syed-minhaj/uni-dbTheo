-- Assignment 2: Fines, Admin Role, and Reporting

DO $$ BEGIN
  ALTER TABLE students ADD COLUMN role TEXT NOT NULL DEFAULT 'student';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fine_status AS ENUM ('unpaid', 'paid', 'waived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL REFERENCES transactions(transaction_id),
  student_id UUID NOT NULL REFERENCES students(id),
  days_overdue INTEGER NOT NULL,
  fine_amount DECIMAL(10, 2) NOT NULL,
  status fine_status NOT NULL DEFAULT 'unpaid',
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fines_student_status_idx ON fines(student_id, status);
CREATE INDEX IF NOT EXISTS fines_status_idx ON fines(status);
