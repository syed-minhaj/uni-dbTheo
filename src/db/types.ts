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
  department?: string | null;
  semester?: number | null;
  branch_id?: string | null;
  role?: string;
  created_at: Date;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category_id?: string | null;
  description?: string | null;
  borrow_count?: number;
  created_at: Date;
};

export type BookWithCategory = Book & {
  category_name?: string;
};

export type BookCopy = {
  id: string;
  book_id: string;
  qr_code: string;
  status: "available" | "issued" | "lost";
  branch_id?: string | null;
  created_at: Date;
};

export type Branch = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  created_at: Date;
};

export type BookCategory = {
  id: string;
  name: string;
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
  status: "active" | "returned" | "archived";
  branch_id?: string | null;
};

export type Fine = {
  id: string;
  transaction_id: string;
  student_id: string;
  days_overdue: number;
  fine_amount: number;
  status: "unpaid" | "paid" | "waived";
  paid_at: Date | null;
  created_at: Date;
};

export type ActivityLog = {
  id: string;
  student_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: Date;
};

export type Fine = {
  id: string;
  transaction_id: string;
  student_id: string;
  days_overdue: number;
  fine_amount: number;
  status: "unpaid" | "paid" | "waived";
  paid_at: Date | null;
  created_at: Date;
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
  fine_amount?: number | null;
  fine_status?: string | null;
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
