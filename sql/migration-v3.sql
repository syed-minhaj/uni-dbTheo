-- Assignment 3: Intelligent Digital Library Ecosystem

DO $$ BEGIN
  ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'archived';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_logs_student_idx ON activity_logs(student_id);
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON activity_logs(action);
CREATE INDEX IF NOT EXISTS activity_logs_created_idx ON activity_logs(created_at);

DO $$ BEGIN
  ALTER TABLE students ADD COLUMN IF NOT EXISTS department TEXT;
  ALTER TABLE students ADD COLUMN IF NOT EXISTS semester INTEGER;
  ALTER TABLE students ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE book_copies ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE books ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES book_categories(id);
  ALTER TABLE books ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE books ADD COLUMN IF NOT EXISTS borrow_count INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
