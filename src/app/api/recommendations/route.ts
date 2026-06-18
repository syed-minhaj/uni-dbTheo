import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/session";
import { getRecommendations } from "@/lib/services/recommendation-service";

export async function GET() {
  const authResult = await requireStudent();

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const recommendations = await getRecommendations(authResult.student.id);
    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error("Recommendation error:", err);
    return NextResponse.json(
      { error: "Failed to get recommendations." },
      { status: 500 }
    );
  }
}
