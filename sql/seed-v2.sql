-- Add librarian role to an existing student
UPDATE students SET role = 'librarian'
WHERE university_id = '2024F-BCS-185';

-- Mark one book copy as issued to test overdue
UPDATE book_copies SET status = 'issued'
WHERE qr_code = 'BC-2024-004-A';

-- Create an overdue transaction for testing fines
INSERT INTO transactions (transaction_id, student_id, book_copy_id, issued_at, due_date, status)
SELECT
  'TXN-OVERDUE-001',
  s.id,
  bc.id,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '16 days',
  'active'
FROM students s, book_copies bc
WHERE s.university_id = '2024F-BCS-185'
  AND bc.qr_code = 'BC-2024-004-A';

-- Create a returned overdue transaction with a fine
INSERT INTO transactions (transaction_id, student_id, book_copy_id, issued_at, due_date, returned_at, status)
SELECT
  'TXN-FINE-001',
  s.id,
  bc.id,
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '46 days',
  NOW() - INTERVAL '30 days',
  'returned'
FROM students s, book_copies bc
WHERE s.university_id = '2024F-BCS-185'
  AND bc.qr_code = 'BC-2024-002-A';

-- Record the fine for the returned overdue transaction
INSERT INTO fines (transaction_id, student_id, days_overdue, fine_amount)
VALUES ('TXN-FINE-001', (SELECT id FROM students WHERE university_id = '2024F-BCS-185'), 16, 800.00);
