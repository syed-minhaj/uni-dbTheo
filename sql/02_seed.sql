-- Sample seed data (books and copies only)
-- Student accounts should be created via: npm run seed

INSERT INTO books (title, author, isbn) VALUES
  ('Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848'),
  ('Database System Concepts', 'Abraham Silberschatz', '978-0078022159'),
  ('Clean Code', 'Robert C. Martin', '978-0132350884'),
  ('Computer Networking', 'James F. Kurose', '978-0136681557'),
  ('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0134610993');

INSERT INTO book_copies (book_id, qr_code, status)
SELECT id, 'BC-2024-001-A', 'available' FROM books WHERE isbn = '978-0262033848';

INSERT INTO book_copies (book_id, qr_code, status)
SELECT id, 'BC-2024-001-B', 'available' FROM books WHERE isbn = '978-0262033848';

INSERT INTO book_copies (book_id, qr_code, status)
SELECT id, 'BC-2024-002-A', 'available' FROM books WHERE isbn = '978-0078022159';

INSERT INTO book_copies (book_id, qr_code, status)
SELECT id, 'BC-2024-003-A', 'available' FROM books WHERE isbn = '978-0132350884';

INSERT INTO book_copies (book_id, qr_code, status)
SELECT id, 'BC-2024-003-B', 'available' FROM books WHERE isbn = '978-0132350884';

INSERT INTO book_copies (book_id, qr_code, status)
SELECT id, 'BC-2024-004-A', 'available' FROM books WHERE isbn = '978-0136681557';

INSERT INTO book_copies (book_id, qr_code, status)
SELECT id, 'BC-2024-005-A', 'available' FROM books WHERE isbn = '978-0134610993';

INSERT INTO book_copies (book_id, qr_code, status)
SELECT id, 'BC-2024-005-B', 'available' FROM books WHERE isbn = '978-0134610993';
