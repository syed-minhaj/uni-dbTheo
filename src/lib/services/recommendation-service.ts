import { getStudentContext, getAllBooksForRecommendation, getPopularBooksInDepartment } from "@/db/queries/recommendations";

type BookInfo = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category_name: string;
  description: string;
  borrow_count: number;
};

export async function getRecommendations(studentId: string) {
  const student = await getStudentContext(studentId);
  const rows = await getAllBooksForRecommendation();
  const allBooks: BookInfo[] = rows as BookInfo[];

  const recommendations = await getAiRecommendations(student, allBooks);

  if (recommendations && recommendations.length > 0) {
    return recommendations;
  }

  return getFallbackRecommendations(student?.department);
}

function buildPrompt(student: {
  department: string;
  semester: number;
  borrowed_titles: string;
  borrowed_categories: string;
} | null, books: BookInfo[]) {
  const bookCatalog = books
    .map((b) => `${b.id}|${b.title}|${b.author}|${b.category_name}|borrowed ${b.borrow_count} times`)
    .join("\n");

  return `You are a university library recommendation system. A ${student?.department ?? "unknown"} department student in semester ${student?.semester ?? "unknown"} has borrowed: ${student?.borrowed_titles || "nothing yet"} (categories: ${student?.borrowed_categories || "none"}).

From the catalog below, recommend exactly 5 books this student would find useful. Return ONLY a JSON array of objects with keys "id" (the book's ID) and "reason" (why it suits them).

Catalog:
${bookCatalog}`;
}

async function getAiRecommendations(
  student: { department: string; semester: number; borrowed_titles: string; borrowed_categories: string } | null,
  books: BookInfo[]
) {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = buildPrompt(student, books);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as Array<{ id: string; reason: string }>;
    if (!Array.isArray(parsed)) return null;

    return parsed
      .map((rec) => {
        const book = books.find((b) => b.id === rec.id);
        if (!book) return null;
        return { book, reason: rec.reason };
      })
      .filter(Boolean);
  } catch (err) {
    console.error("Gemini API error:", err);
    return null;
  }
}

async function getFallbackRecommendations(department?: string | null) {
  const popular = await getPopularBooksInDepartment(department ?? "Computer Science", 5);
  return popular.map((book) => ({
    book,
    reason: "Popular book in your area of study",
  }));
}
