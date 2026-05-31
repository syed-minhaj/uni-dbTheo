-- Demonstration queries for assignment report

-- Active borrows for a student (replace university ID)
SELECT s.university_id, s.full_name, t.transaction_id, b.title, t.due_date, t.status
FROM students s
JOIN transactions t ON t.student_id = s.id
JOIN book_copies bc ON bc.id = t.book_copy_id
JOIN books b ON b.id = bc.book_id
WHERE s.university_id = '2024F-BCS-185'
  AND t.status = 'active'
ORDER BY t.issued_at DESC;

-- Count active borrows (borrowing limit validation)
SELECT s.university_id, COUNT(*) AS active_borrows
FROM students s
JOIN transactions t ON t.student_id = s.id
WHERE s.university_id = '2024F-BCS-185'
  AND t.status = 'active'
GROUP BY s.university_id;

-- Check copy availability before issue
SELECT bc.qr_code, bc.status, b.title
FROM book_copies bc
JOIN books b ON b.id = bc.book_id
WHERE bc.qr_code = 'BC-2024-001-A';

-- Permanent transaction history (never deleted)
SELECT t.transaction_id, s.university_id, b.title, t.issued_at, t.returned_at, t.status
FROM transactions t
JOIN students s ON s.id = t.student_id
JOIN book_copies bc ON bc.id = t.book_copy_id
JOIN books b ON b.id = bc.book_id
ORDER BY t.issued_at DESC;

-- Students blocked from issuing (inactive status)
SELECT university_id, full_name, status
FROM students
WHERE status = 'inactive';
