export type User = {
  id: string;
  name: string;
  email: string;
  hashed_password: string | null;
  email_verified: boolean;
  image: string | null;
  university_id: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Session = {
  id: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
};

export type SessionWithUser = Session & {
  email: string;
  name: string;
  image: string | null;
};

export type Student = {
  id: string;
  user_id: string;
  university_id: string;
  full_name: string;
  status: "active" | "inactive";
  created_at: Date;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  created_at: Date;
};

export type BookCopy = {
  id: string;
  book_id: string;
  qr_code: string;
  status: "available" | "issued" | "lost";
  created_at: Date;
};

export type Transaction = {
  id: string;
  transaction_id: string;
  student_id: string;
  book_copy_id: string;
  issued_at: Date;
  due_date: Date;
  returned_at: Date | null;
  status: "active" | "returned";
};

export type ActiveBookRow = {
  transaction_id: string;
  issued_at: Date;
  due_date: Date;
  returned_at: Date | null;
  status: string;
  title: string;
  author: string;
  isbn: string;
};

export type ActiveBook = ActiveBookRow & {
  isOverdue: boolean;
};

export type IssueResult = {
  transactionId: string;
  issuedAt: Date;
  dueDate: Date;
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
  };
};
