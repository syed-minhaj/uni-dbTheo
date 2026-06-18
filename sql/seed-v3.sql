-- Seed branches
INSERT INTO branches (name, code, address) VALUES
  ('Main Campus Library', 'MAIN', 'Sir Syed University, Main Campus, Karachi'),
  ('CS & IT Department Library', 'CSIT', 'CS & IT Department, Block B');

-- Seed book categories
INSERT INTO book_categories (name) VALUES
  ('Computer Science'),
  ('Database'),
  ('Software Engineering'),
  ('Networking'),
  ('Artificial Intelligence');

-- Seed student departments
UPDATE students SET department = 'Computer Science', semester = 4
WHERE university_id = '2024F-BCS-185';

UPDATE students SET department = 'Computer Science', semester = 2
WHERE university_id = '2025F-BCNS-084';

UPDATE students SET department = 'Computer Science', semester = 6
WHERE university_id = '2023F-BCS-021';

-- Assign categories to books
UPDATE books SET category_id = (SELECT id FROM book_categories WHERE name = 'Computer Science')
WHERE isbn = '978-0262033848';

UPDATE books SET category_id = (SELECT id FROM book_categories WHERE name = 'Database')
WHERE isbn = '978-0078022159';

UPDATE books SET category_id = (SELECT id FROM book_categories WHERE name = 'Software Engineering')
WHERE isbn = '978-0132350884';

UPDATE books SET category_id = (SELECT id FROM book_categories WHERE name = 'Networking')
WHERE isbn = '978-0136681557';

UPDATE books SET category_id = (SELECT id FROM book_categories WHERE name = 'Artificial Intelligence')
WHERE isbn = '978-0134610993';

-- Assign branches to book copies
UPDATE book_copies SET branch_id = (SELECT id FROM branches WHERE code = 'MAIN');
UPDATE book_copies SET branch_id = (SELECT id FROM branches WHERE code = 'CSIT')
WHERE qr_code IN ('BC-2024-001-B', 'BC-2024-003-B', 'BC-2024-005-B');

-- Assign main branch to students (default)
UPDATE students SET branch_id = (SELECT id FROM branches WHERE code = 'MAIN');

-- Increment borrow count on existing transactions for popularity data
UPDATE books SET borrow_count = (
  SELECT COUNT(*) FROM transactions t
  INNER JOIN book_copies bc ON t.book_copy_id = bc.id
  WHERE bc.book_id = books.id
);
